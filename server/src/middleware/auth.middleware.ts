import prisma from "@/db";
import { ApiError } from "@/lib/ApiError";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const verifyUserJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized", []);
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;

    if (!decodedToken || typeof decodedToken == "string") {
      throw new ApiError(401, "Invalid access token");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.refreshToken) {
      throw new ApiError(401, "Refresh token session is not valid", []);
    }

    const mappedUser = {
      ...user,
      password: null,
      refreshToken: null,
    };

    req.user = mappedUser;
    next();
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(401, "Unauthorized"));
  }
};

export { verifyUserJWT };
