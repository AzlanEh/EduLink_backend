import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Joi from "joi";

const uploadContentSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid("video", "document", "audio", "other").required(),
});

export const validateUploadContent = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const { error } = uploadContentSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  next();
});
