import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

// Routes Import

import userRouter from "./routes/users.routes.js";
import contentRouter from "./routes/content.routes.js";
import courseRouter from "./routes/course.routes.js";

// Routes Decleration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/courses", courseRouter);

export { app };
