import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Users } from "../models/users.model.js";

export const verifyRole = (allowedRoles) =>
  asyncHandler(async (req, _, next) => {
    try {
      if (!req.user || !req.user.id) {
        throw new ApiError(401, "User not authenticated");
      }

      const user = await Users.findById(req.user.id);
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      if (!allowedRoles.includes(user.role)) {
        throw new ApiError(403, "Access Denied: Insufficient Permissions");
      }
      next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Access Denied");
    }
  });
