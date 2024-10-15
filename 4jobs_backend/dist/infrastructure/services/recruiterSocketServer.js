"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRecruiterSocketServer = setupRecruiterSocketServer;
const socket_io_1 = require("socket.io");
const socketAuthMiddleware_1 = require("../../presentation/middlewares/socketAuthMiddleware");
const types_1 = __importDefault(require("../../types"));
function setupRecruiterSocketServer(server, container) {
    const io = new socket_io_1.Server(server, {
        path: '/recruiter-socket',
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    const userManager = container.get(types_1.default.UserManager);
    const eventEmitter = container.get(types_1.default.NotificationEventEmitter);
    io.use((0, socketAuthMiddleware_1.socketAuthMiddleware)(userManager));
    io.on('connection', (socket) => {
        console.log(`A recruiter connected, socket id: ${socket.id}, user id: ${socket.userId}`);
        if (!socket.userId) {
            console.error('Recruiter not authenticated, closing connection');
            socket.disconnect(true);
            return;
        }
        userManager.addUser(socket.userId, socket.id, 'recruiter');
        socket.join(socket.userId);
        io.emit('recruiterOnlineStatus', { userId: socket.userId, online: true });
        // Add recruiter-specific event handlers here
        socket.on('disconnect', () => {
            if (socket.userId) {
                userManager.removeUser(socket.userId);
                io.emit('recruiterOnlineStatus', { userId: socket.userId, online: false });
            }
        });
    });
    return { io, userManager, eventEmitter };
}
