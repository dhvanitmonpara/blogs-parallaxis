import * as authController from "../controllers/user.controller";
import { Router } from "express";
import { verifyUserJWT } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.post("/register", authController.registerUser);
userRouter.post("/login", authController.loginUser);
userRouter.post("/logout", verifyUserJWT, authController.logoutUser);

export default userRouter;
