"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = exports.userManager = exports.io = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const container_1 = require("./infrastructure/container");
const socketServer_1 = require("./infrastructure/services/socketServer");
// Import routers
const authRoutes_1 = require("./presentation/routes/authRoutes");
const adminRoutes_1 = require("./presentation/routes/adminRoutes");
const RecruiterRoutes_1 = require("./presentation/routes/RecruiterRoutes");
// Import middleware
const validateRequest_1 = require("./presentation/middlewares/validateRequest");
const errorHandler_1 = require("./presentation/middlewares/errorHandler");
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const { io, userManager, eventEmitter } = (0, socketServer_1.setupSocketServer)(server, container_1.container);
exports.io = io;
exports.userManager = userManager;
exports.eventEmitter = eventEmitter;
// Middleware setup
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: 'Content-Type,Authorization',
}));
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes setup
app.use('/', authRoutes_1.authRouter);
app.use('/admin', adminRoutes_1.adminRouter);
app.use('/recruiter', RecruiterRoutes_1.recruiterRouter);
// Validation and error handling middleware
app.use(validateRequest_1.validateRequest);
app.use(errorHandler_1.errorHandler);
app.use((req, res, next) => {
    req.container = container_1.container;
    next();
});
// Connect to MongoDB
mongoose_1.default.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
