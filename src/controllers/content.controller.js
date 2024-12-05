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
    instructorId: req.user.id, // Set createdBy using the user ID from JWT
  });

  res.status(201).json({ success: true, message: "Content uploaded", content });
});

const getContent = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;

  const filter = type ? { type } : {};
  const skip = (page - 1) * limit;

  const content = await Content.find(filter)
    .populate("instructorId", "username email")
    .skip(skip)
    .limit(Number(limit));

  const total = await Content.countDocuments(filter);

  res.status(200).json(
    new ApiRespons(true, "Content retrieved successfully", {
      content,
      total,
      page: Number(page),
      limit: Number(limit),
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
