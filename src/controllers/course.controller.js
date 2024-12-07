import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRespons } from "../utils/ApiRespons.js";
import { Course } from "../models/course.model.js";
import { Content } from "../models/content.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, content } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const course = await Course.create({
    title,
    description,
    instructor: req.user.id, // Set the instructor from the authenticated user
    content,
  });

  res
    .status(201)
    .json(new ApiRespons(true, "Course created successfully", course));
});

const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("instructor", "username email")
    .populate("content", "title type fileURL");

  res
    .status(200)
    .json(new ApiRespons(true, "Courses retrieved successfully", courses));
});

const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate("instructor", "username email")
    .populate("content", "title type fileURL")
    .populate("studentsEnrolled", "username email");

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  res
    .status(200)
    .json(new ApiRespons(true, "Course retrieved successfully", course));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, content } = req.body;

  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (course.instructor.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized to update this course");
  }

  course.title = title || course.title;
  course.description = description || course.description;
  course.content = content || course.content;

  await course.save();

  res
    .status(200)
    .json(new ApiRespons(true, "Course updated successfully", course));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (course.instructor.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized to delete this course");
  }

  await course.deleteOne();

  res.status(200).json(new ApiRespons(true, "Course deleted successfully"));
});

const enrollStudentInCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;
  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (course.studentsEnrolled.includes(studentId)) {
    throw new ApiError(400, "You are already enrolled in this course");
  }

  course.studentsEnrolled.push(studentId);
  await course.save();

  res.status(200).json(new ApiRespons(true, "Enrolled successfully", course));
});

const addContentToCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { contentId, title, description, type } = req.body;

  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (course.instructor.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized to modify this course");
  }

  let newContent;

  if (req.file) {
    // Upload file to Cloudinary or save locally
    const result = await uploadToCloudinary(req.file.path, "course_content");
    newContent = await Content.create({
      title: title || req.file.originalname,
      description: description || "Uploaded content",
      type: type || "other",
      fileURL: result.url, // Use Cloudinary URL
      duration: result.duration,
      instructorId: req.user.id,
    });
    course.content.push(newContent._id);
  } else if (contentId) {
    // Add existing content by ID
    if (course.content.includes(contentId)) {
      throw new ApiError(400, "Content already exists in the course");
    }
    course.content.push(contentId);
  } else {
    throw new ApiError(400, "Either contentId or a file must be provided");
  }

  await course.save();

  res.status(200).json(
    new ApiRespons(true, "Content added to the course", {
      course,
      addedContent: newContent || contentId,
    })
  );
});

export {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudentInCourse,
  addContentToCourse,
};
