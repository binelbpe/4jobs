"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterEventEmitter = exports.recruiterSocketManager = exports.recruiterIo = exports.userEventEmitter = exports.userSocketManager = exports.userIo = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const container_1 = require("./infrastructure/container");
const userSocketServer_1 = require("./infrastructure/services/userSocketServer");
const recruiterUserSocketServer_1 = require("./infrastructure/services/recruiterUserSocketServer");
const authRoutes_1 = require("./presentation/routes/authRoutes");
const adminRoutes_1 = require("./presentation/routes/adminRoutes");
const RecruiterRoutes_1 = require("./presentation/routes/RecruiterRoutes");
const validateRequest_1 = require("./presentation/middlewares/validateRequest");
const errorHandler_1 = require("./presentation/middlewares/errorHandler");
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const { io: userIo, userManager: userSocketManager, eventEmitter: userEventEmitter } = (0, userSocketServer_1.setupUserSocketServer)(server, container_1.container);
exports.userIo = userIo;
exports.userSocketManager = userSocketManager;
exports.userEventEmitter = userEventEmitter;
const { io: recruiterIo, userManager: recruiterSocketManager, eventEmitter: recruiterEventEmitter } = (0, recruiterUserSocketServer_1.setupSocketServer)(server, container_1.container);
exports.recruiterIo = recruiterIo;
exports.recruiterSocketManager = recruiterSocketManager;
exports.recruiterEventEmitter = recruiterEventEmitter;
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
app.use('/', authRoutes_1.authRouter);
app.use('/admin', adminRoutes_1.adminRouter);
app.use('/recruiter', RecruiterRoutes_1.recruiterRouter);
app.use(validateRequest_1.validateRequest);
app.use(errorHandler_1.errorHandler);
app.use((req, res, next) => {
    req.container = container_1.container;
    next();
});
mongoose_1.default.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
