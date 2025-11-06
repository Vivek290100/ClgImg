// middlewares/multer.js
import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single("file"); // field name in register/update

export const multipleUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
}).array("media", 10); // field name: "media", max 10 files