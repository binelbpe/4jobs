import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import mongoose from "mongoose";
import http from "http";
import hpp from "hpp";
import "reflect-metadata";

// Import middleware
import helmetMiddleware from "./presentation/middlewares/helmetConfig";
import rateLimiter from "./presentation/middlewares/rateLimiter";
import corsMiddleware from "./presentation/middlewares/corsMiddleware";
import securityHeaders from "./presentation/middlewares/securityHeaders";
import { createXssMiddleware } from "./presentation/middlewares/xssMiddleware";
import { attachCsrfToken, doubleCsrfProtection, handleCsrfError } from './presentation/middlewares/csrfMiddleware';
import containerMiddleware from "./presentation/middlewares/containerMiddleware";
import { validateRequest } from "./presentation/middlewares/validateRequest";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { AuthMiddleware } from './presentation/middlewares/authMiddleware';

// Import routes and services
import { container } from "./infrastructure/container";
import { setupUserSocketServer } from "./infrastructure/services/userSocketServer";
import { setupSocketServer } from "./infrastructure/services/recruiterUserSocketServer";
import { authRouter } from "./presentation/routes/authRoutes";
import { adminRouter } from "./presentation/routes/adminRoutes";
import { recruiterRouter } from "./presentation/routes/RecruiterRoutes";

const app = express();
const server = http.createServer(app);

// Setup Socket Servers
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

// Security Middleware
app.use(helmetMiddleware);
app.use(rateLimiter);
app.use(corsMiddleware);
app.use(securityHeaders);

// Body Parsing Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security and Sanitization Middleware
app.use(hpp());
app.use(createXssMiddleware(container));

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// CSRF Protection
app.use(attachCsrfToken);
app.use(doubleCsrfProtection);

// Routes
app.use("/", authRouter);
app.use("/admin", adminRouter);
app.use("/recruiter", recruiterRouter);

// Error Handling
app.use(handleCsrfError);
app.use(validateRequest);
app.use(errorHandler);

// Container Injection
app.use(containerMiddleware(container));

// Database Connection
mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start Server
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