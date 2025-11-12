import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("file");

export const multipleUpload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024, files: 5 },
}).array("media", 5);