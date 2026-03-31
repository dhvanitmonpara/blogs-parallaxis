import fs from "node:fs/promises";
import path from "node:path";
import prisma from "@/db"
import { ApiError } from "@/lib/ApiError"

const getBaseUrl = (req) =>
  process.env.PUBLIC_SERVER_URL ||
  `${req.protocol}://${req.get("host")}`;

const buildImageUrl = (req, filename: string) =>
  `${getBaseUrl(req)}/uploads/blogs/${filename}`;

const getUploadedImageUrl = (req) =>
  req.file ? buildImageUrl(req, req.file.filename) : null;

const removeUploadedFile = async (imageUrl?: string | null) => {
  if (!imageUrl) {
    return;
  }

  const fileName = imageUrl.split("/uploads/blogs/")[1];

  if (!fileName) {
    return;
  }

  const filePath = path.resolve(process.cwd(), "public/uploads/blogs", fileName);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.log(error);
  }
};

const createBlog = async (req, res, next) => {
  try {
    const { title, content, coverImage } = req.body
    const uploadedImageUrl = getUploadedImageUrl(req);
    const image = uploadedImageUrl || coverImage;

    if (!title || !content || !image) {
      throw new ApiError(400, "All fields are required")
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        image,
        authorId: req.user.id,
      }
    })

    return res.status(200).json(blog)
  } catch (error) {
    if (req.file) {
      await removeUploadedFile(buildImageUrl(req, req.file.filename));
    }

    return next(error);
  }
}

const getBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: true,
      }
    })

    return res.status(200).json(blogs)
  } catch (error) {
    return next(error);
  }
}

const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params

    const blog = await prisma.blog.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
      }
    })

    if (!blog) {
      throw new ApiError(404, "Blog does not exists")
    }

    return res.status(200).json(blog)
  } catch (error) {
    return next(error);
  }
}

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params

    const blog = await prisma.blog.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
      }
    })

    if (!blog) {
      throw new ApiError(404, "Blog does not exists")
    }

    if (blog.authorId !== req.user.id) {
      throw new ApiError(403, "You are not authorized to delete this blog")
    }

    await prisma.blog.delete({
      where: {
        id,
      }
    })

    await removeUploadedFile(blog.image);

    return res.status(200).json({ message: "Blog deleted successfully" })
  } catch (error) {
    return next(error);
  }
}

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, content, coverImage } = req.body
    const uploadedImageUrl = getUploadedImageUrl(req);
    const blog = await prisma.blog.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
      }
    })

    if (!blog) {
      throw new ApiError(404, "Blog does not exists")
    }

    if (blog.authorId !== req.user.id) {
      throw new ApiError(403, "You are not authorized to update this blog")
    }
    
    if (!title || !content) {
      throw new ApiError(400, "Title and content are required")
    }

    const nextImage = uploadedImageUrl || coverImage || blog.image;

    const updatedBlog = await prisma.blog.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        image: nextImage,
      }
    })

    if (uploadedImageUrl && blog.image !== nextImage) {
      await removeUploadedFile(blog.image);
    }

    return res.status(200).json(updatedBlog)
  } catch (error) {
    if (req.file) {
      await removeUploadedFile(buildImageUrl(req, req.file.filename));
    }

    return next(error);
  }
}

export { createBlog, getBlogs, getBlogById, deleteBlog, updateBlog }
