import { Router } from "express";
import {
  signUpUser,
  logInUser,
  logOutUser,
  updateAccessToken,
  getCurrentUser,
  adminController,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleweare.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/roleAuth.middleware.js";

const router = Router();

router.route("/signup").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  signUpUser
);

router.route("/login").post(logInUser);

router.route("/logout").post(verifyJWT, logOutUser);

router.route("/updateToken").post(updateAccessToken);

router.route("/getCurrentUser").post(verifyJWT, getCurrentUser);

router
  .route("/dashboard")
  .post(verifyJWT, verifyRole(["instructor", "admin"]), adminController);

export default router;
