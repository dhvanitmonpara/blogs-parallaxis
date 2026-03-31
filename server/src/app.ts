import "dotenv/config";
import express from "express";
import helmet from "helmet"
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import blogRouter from "./routes/blog.route";
import userRouter from "./routes/user.route";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

const corsOptions: CorsOptions = {
  origin: process.env.ACCESS_CONTROL_ORIGIN as string,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter);

app.use(errorHandler)

export default app;
