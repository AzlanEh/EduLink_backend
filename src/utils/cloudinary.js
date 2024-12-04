import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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
    fs.unlinkSync(localFilePath);
    // console.log("file is uploded no Cloudinary ", response);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Remove the locally saved file as the uplode opration got failed

    console.error("ERROR --> ", error);
    return null;
  }
};

export { uploadToCloudinary };
