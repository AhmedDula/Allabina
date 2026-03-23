import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

// Memory storage for multer
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedAttachments = ["application/pdf", "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  const allAllowed = [...allowedImages, ...allowedAttachments];

  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};
// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Max 10 files
  },
});

// Upload to Cloudinary helper
export const uploadToCloudinary = async (buffer, folder = "allabina/projects", publicId ,resourceType = "image") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        public_id: publicId,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

export default upload;
