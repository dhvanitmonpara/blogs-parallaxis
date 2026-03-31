import { NextFunction, Request, Response } from "express";
import { ApiError } from "@/lib/ApiError";

const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ApiError) {
    console.log(error)
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P1003"
  ) {
    return res.status(500).json({
      message:
        "Database does not exist. Update DATABASE_URL or create the database first.",
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

export { errorHandler };
