"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterEventEmitter = exports.recruiterSocketManager = exports.recruiterIo = exports.userEventEmitter = exports.userSocketManager = exports.userIo = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const hpp_1 = __importDefault(require("hpp"));
require("reflect-metadata");
// Import middleware
const helmetConfig_1 = __importDefault(require("./presentation/middlewares/helmetConfig"));
const rateLimiter_1 = __importDefault(require("./presentation/middlewares/rateLimiter"));
const corsMiddleware_1 = __importDefault(require("./presentation/middlewares/corsMiddleware"));
const securityHeaders_1 = __importDefault(require("./presentation/middlewares/securityHeaders"));
const xssMiddleware_1 = require("./presentation/middlewares/xssMiddleware");
const containerMiddleware_1 = __importDefault(require("./presentation/middlewares/containerMiddleware"));
const validateRequest_1 = require("./presentation/middlewares/validateRequest");
const errorHandler_1 = require("./presentation/middlewares/errorHandler");
// Import routes and services
const container_1 = require("./infrastructure/container");
const userSocketServer_1 = require("./infrastructure/services/userSocketServer");
const recruiterUserSocketServer_1 = require("./infrastructure/services/recruiterUserSocketServer");
const authRoutes_1 = require("./presentation/routes/authRoutes");
const adminRoutes_1 = require("./presentation/routes/adminRoutes");
const RecruiterRoutes_1 = require("./presentation/routes/RecruiterRoutes");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Setup Socket Servers
const { io: userIo, userManager: userSocketManager, eventEmitter: userEventEmitter, } = (0, userSocketServer_1.setupUserSocketServer)(server, container_1.container);
exports.userIo = userIo;
exports.userSocketManager = userSocketManager;
exports.userEventEmitter = userEventEmitter;
const { io: recruiterIo, userManager: recruiterSocketManager, eventEmitter: recruiterEventEmitter, } = (0, recruiterUserSocketServer_1.setupSocketServer)(server, container_1.container);
exports.recruiterIo = recruiterIo;
exports.recruiterSocketManager = recruiterSocketManager;
exports.recruiterEventEmitter = recruiterEventEmitter;
// Security Middleware
app.use(helmetConfig_1.default);
app.use(rateLimiter_1.default);
app.use(corsMiddleware_1.default);
app.use(securityHeaders_1.default);
// Body Parsing Middleware
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Security and Sanitization Middleware
app.use((0, hpp_1.default)());
app.use((0, xssMiddleware_1.createXssMiddleware)(container_1.container));
// Static Files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Routes
app.use("/", authRoutes_1.authRouter);
app.use("/admin", adminRoutes_1.adminRouter);
app.use("/recruiter", RecruiterRoutes_1.recruiterRouter);
// Error Handling
app.use(validateRequest_1.validateRequest);
app.use(errorHandler_1.errorHandler);
// Container Injection
app.use((0, containerMiddleware_1.default)(container_1.container));
// Database Connection
mongoose_1.default
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
