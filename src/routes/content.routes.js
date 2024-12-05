import { Router } from "express";
import {
  uploadContent,
  getContent,
  deleteContent,
} from "../controllers/content.controller.js";
import { upload } from "../middlewares/multer.middleweare.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/roleAuth.middleware.js";
import { validateUploadContent } from "../middlewares/validation.middleware.js";

const router = Router();

router.post(
  "/uploadContent",
  verifyJWT,
  upload.single("file"),
  // validateUploadContent,
  uploadContent
);

router.get("/getContent", verifyJWT, getContent);

router.delete("/deleteContent/:id", verifyJWT, deleteContent);

export default router;
