import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { ApiError } from "@/lib/ApiError";

const uploadDirectory = path.resolve(process.cwd(), "public/uploads/blogs");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const safeName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50);

    cb(null, `${Date.now()}-${safeName || "blog-image"}${extension}`);
  },
});

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new ApiError(400, "Only image uploads are allowed"));
    return;
  }

  cb(null, true);
};

const uploadBlogImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export { uploadBlogImage };
