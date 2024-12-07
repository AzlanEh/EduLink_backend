import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    await fs.unlink(localFilePath);
    // console.log("file is uploded no Cloudinary ", response);

    return {
      url: response.secure_url,
      public_id: response.public_id,
      duration: response.duration || null, // Duration in seconds for video/audio
      format: response.format, // File format (e.g., mp4, pdf)
      type: response.resource_type, // File type (e.g., video, image)
    };
  } catch (error) {
    await fs.unlink(localFilePath); // Remove the locally saved file as the uplode opration got failed

    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export { uploadToCloudinary };
