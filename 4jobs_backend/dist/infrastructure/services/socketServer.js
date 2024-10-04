"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketServer = setupSocketServer;
const socket_io_1 = require("socket.io");
const socketAuthMiddleware_1 = require("../../presentation/middlewares/socketAuthMiddleware");
const NotificationModel_1 = require("../database/mongoose/models/NotificationModel");
const types_1 = __importDefault(require("../../types"));
function setupSocketServer(server, container) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    const userManager = container.get(types_1.default.UserManager);
    const eventEmitter = container.get(types_1.default.NotificationEventEmitter);
    io.use((0, socketAuthMiddleware_1.socketAuthMiddleware)(userManager));
    io.on('connection', (socket) => {
        console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}`);
        if (socket.userId) {
            socket.emit('authenticated', socket.userId);
        }
        socket.on('disconnect', () => {
            if (socket.userId) {
                userManager.removeUser(socket.userId);
            }
        });
        socket.on('markNotificationAsRead', (notificationId) => __awaiter(this, void 0, void 0, function* () {
            console.log("Marking notification as read:", notificationId);
            yield NotificationModel_1.NotificationModel.findByIdAndUpdate(notificationId, { status: "read" });
            io.to(socket.id).emit('notificationMarkedAsRead', notificationId);
        }));
    });
    eventEmitter.on('sendNotification', (notification) => {
        console.log("object", notification);
        console.log(" id-----", notification.recipient.toString());
        const recipientSocketId = userManager.getUserSocketId(notification.recipient.toString());
        console.log("recipientSocketId", recipientSocketId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('newNotification', notification);
            console.log(`Notification sent to user ${notification.recipient}`);
        }
        else {
            console.log(`User ${notification.recipientId} is not currently connected. Notification will be shown on next login.`);
        }
    });
    container.unbind(types_1.default.SocketIOServer);
    container.bind(types_1.default.SocketIOServer).toConstantValue(io);
    return { io, userManager, eventEmitter };
}
