import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRespons } from "../utils/ApiRespons.js";
import { Content } from "../models/content.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const uploadContent = asyncHandler(async (req, res) => {
  const { title, description, type } = req.body;

  // Validate input fields
  if (!title || !description || !type || !req.file) {
    throw new ApiError(400, "All fields and a file upload are required");
  }

  const result = await uploadToCloudinary(req.file.path, "eduLink");

  // Get file path
  //   const fileURL = `/public/temp/${req.file.filename}`;

  // Create content
  const content = await Content.create({
    title,
    description,
    type,
    fileURL: result.url, // Set fileURL field
    duration: result.duration,
    instructorId: req.user.id, // Set createdBy using the user ID from JWT
  });

  res.status(201).json({ success: true, message: "Content uploaded", content });
});

const getContent = asyncHandler(async (req, res) => {
  const {
    type,
    title,
    uploadedBy,
    startDate,
    endDate,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (title) filter.title = { $regex: title, $options: "i" }; // Case-insensitive search
  if (uploadedBy) filter.instructorId = uploadedBy;
  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(Number(limit), 100)); // Maximum limit of 100
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = order === "desc" ? -1 : 1;

  const content = await Content.find(filter)
    .populate("instructorId", "username email")
    .skip(skip)
    .limit(limitNum)
    .sort({ [sortBy]: sortOrder });

  const total = await Content.countDocuments(filter);

  res.status(200).json(
    new ApiRespons(true, "Content retrieved successfully", {
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      content,
    })
  );
});

const deleteContent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid content ID");
  }

  const content = await Content.findById(id);
  if (!content) {
    throw new ApiError(404, "Content not found");
  }

  // Ensure only the creator or admin can delete

  if (
    content.instructorId.toString() !== req.user.id &&
    !["instructor", "admin"].includes(req.user.role)
  ) {
    throw new ApiError(403, "Unauthorized to delete this content");
  }

  await content.deleteOne();
  res
    .status(200)
    .json(new ApiRespons(true, "Content deleted successfully", null));
});

export { uploadContent, getContent, deleteContent };
