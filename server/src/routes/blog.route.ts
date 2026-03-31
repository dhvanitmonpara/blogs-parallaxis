import * as blogController from "../controllers/blog.controller";
import { Router } from "express";
import { verifyUserJWT } from "../middleware/auth.middleware";
import { uploadBlogImage } from "../middleware/upload.middleware";

const blogRouter = Router();

blogRouter.get("/get", blogController.getBlogs);
blogRouter.get("/get/:id", blogController.getBlogById);
blogRouter.post(
  "/create",
  verifyUserJWT,
  uploadBlogImage.single("coverImage"),
  blogController.createBlog
);
blogRouter.patch(
  "/update/:id",
  verifyUserJWT,
  uploadBlogImage.single("coverImage"),
  blogController.updateBlog
);
blogRouter.delete("/delete/:id", verifyUserJWT, blogController.deleteBlog);

export default blogRouter;;
