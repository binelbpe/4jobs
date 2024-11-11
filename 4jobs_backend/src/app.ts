import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import "reflect-metadata";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { container } from "./infrastructure/container";
import TYPES from "./types";
import { setupUserSocketServer } from "./infrastructure/services/userSocketServer";
import { setupSocketServer } from "./infrastructure/services/recruiterUserSocketServer";

import { authRouter } from "./presentation/routes/authRoutes";
import { adminRouter } from "./presentation/routes/adminRoutes";
import { recruiterRouter } from "./presentation/routes/RecruiterRoutes";
<<<<<<< HEAD
=======

>>>>>>> 5646faeae94f569770d6f702b5e7cfc66980d7e7

import { validateRequest } from "./presentation/middlewares/validateRequest";
import { errorHandler } from "./presentation/middlewares/errorHandler";

console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log(
  "AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Not set"
);
console.log("S3_BUCKET_NAME:", process.env.S3_BUCKET_NAME);
console.log("url client", process.env.CLIENT_URL);

const app = express();
const server = http.createServer(app);

const {
  io: userIo,
  userManager: userSocketManager,
  eventEmitter: userEventEmitter,
} = setupUserSocketServer(server, container);
const {
  io: recruiterIo,
  userManager: recruiterSocketManager,
  eventEmitter: recruiterEventEmitter,
} = setupSocketServer(server, container);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Length", "Content-Type"],
  })
);

// Add WebRTC-specific headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/", authRouter);
app.use("/admin", adminRouter);
app.use("/recruiter", recruiterRouter);

app.use(validateRequest);
app.use(errorHandler);

app.use((req: any, res, next) => {
  req.container = container;
  next();
});

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export {
  userIo,
  userSocketManager,
  userEventEmitter,
  recruiterIo,
  recruiterSocketManager,
  recruiterEventEmitter,
};
