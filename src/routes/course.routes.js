import { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudentInCourse,
  addContentToCourse,
} from "../controllers/course.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/roleAuth.middleware.js";
import { upload } from "../middlewares/multer.middleweare.js";

const router = Router();

router.post(
  "/create",
  verifyJWT,
  verifyRole(["instructor", "admin"]),
  createCourse
);

router.get("/", verifyJWT, getCourses);

router.get("/:id", verifyJWT, getCourseById);

router.put(
  "/:id",
  verifyJWT,
  verifyRole(["instructor", "admin"]),
  updateCourse
);

router.delete(
  "/:id",
  verifyJWT,
  verifyRole(["instructor", "admin"]),
  deleteCourse
);

router.post("/:id/enroll", verifyJWT, enrollStudentInCourse);

router.post(
  "/:id/addContent",
  verifyJWT,
  verifyRole(["instructor", "admin"]),
  upload.single("file"),
  addContentToCourse
);

export default router;
