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
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    const userManager = container.get(types_1.default.UserManager);
    const eventEmitter = container.get(types_1.default.NotificationEventEmitter);
    const messageUseCase = container.get(types_1.default.MessageUseCase);
    io.use((0, socketAuthMiddleware_1.socketAuthMiddleware)(userManager));
    io.on('connection', (socket) => {
        console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}`);
        if (!socket.userId) {
            console.error('User not authenticated, closing connection');
            socket.disconnect(true);
            return;
        }
        userManager.addUser(socket.userId, socket.id);
        socket.join(socket.userId);
        console.log(`User ${socket.userId} joined room`);
        socket.emit('authenticated', socket.userId);
        socket.broadcast.emit('userConnected', socket.userId);
        socket.on('sendMessage', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Received sendMessage event from user ${socket.userId}:`, data);
            try {
                if (!socket.userId)
                    throw new Error('User not authenticated');
                const message = yield messageUseCase.sendMessage(socket.userId, data.recipientId, data.content);
                // Emit to sender
                io.to(socket.userId).emit('messageSent', message);
                console.log(`Message sent to sender ${socket.userId}:`, message);
                // Emit to recipient
                io.to(data.recipientId).emit('newMessage', message);
                console.log(`New message sent to recipient ${data.recipientId}:`, message);
                // Emit notification event
                eventEmitter.emit('sendNotification', {
                    type: 'NEW_MESSAGE',
                    recipient: data.recipientId,
                    sender: socket.userId,
                    content: 'You have a new message'
                });
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit('messageError', { error: 'Failed to send message' });
            }
        }));
        socket.on('markMessagesAsRead', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Marking messages as read for user ${socket.userId}:`, data.messageIds);
            try {
                for (const messageId of data.messageIds) {
                    yield messageUseCase.markMessageAsRead(messageId);
                }
                io.to(socket.userId).emit('messagesMarkedAsRead', data.messageIds);
                console.log(`Messages marked as read for user ${socket.userId}:`, data.messageIds);
            }
            catch (error) {
                console.error('Error marking messages as read:', error);
                socket.emit('markReadError', { error: 'Failed to mark messages as read' });
            }
        }));
        socket.on('typing', (data) => {
            console.log(`User ${socket.userId} is typing to ${data.recipientId}`);
            io.to(data.recipientId).emit('userTyping', { userId: socket.userId });
        });
        socket.on('stopTyping', (data) => {
            console.log(`User ${socket.userId} stopped typing to ${data.recipientId}`);
            io.to(data.recipientId).emit('userStoppedTyping', { userId: socket.userId });
        });
        socket.on('joinConversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        });
        socket.on('leaveConversation', (conversationId) => {
            socket.leave(conversationId);
            console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });
        socket.on('markNotificationAsRead', (notificationId) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Marking notification as read for user ${socket.userId}:`, notificationId);
            try {
                yield NotificationModel_1.NotificationModel.findByIdAndUpdate(notificationId, { status: "read" });
                io.to(socket.id).emit('notificationMarkedAsRead', notificationId);
            }
            catch (error) {
                console.error('Error marking notification as read:', error);
                socket.emit('markNotificationError', { error: 'Failed to mark notification as read' });
            }
        }));
        socket.on('ping', () => {
            console.log(`Received ping from client, socket id: ${socket.id}, user id: ${socket.userId}`);
            socket.emit('pong');
        });
        socket.on('disconnect', () => {
            if (socket.userId) {
                userManager.removeUser(socket.userId);
                console.log(`User disconnected, user id: ${socket.userId}`);
                // Notify other users that this user is now offline
                socket.broadcast.emit('userDisconnected', socket.userId);
            }
        });
    });
    eventEmitter.on('sendNotification', (notification) => {
        console.log("Sending notification:", notification);
        const recipientSocketId = userManager.getUserSocketId(notification.recipient.toString());
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('newNotification', notification);
            console.log(`Notification sent to user ${notification.recipient}`);
        }
        else {
            console.log(`User ${notification.recipient} is not currently connected. Notification will be shown on next login.`);
        }
    });
    container.unbind(types_1.default.SocketIOServer);
    container.bind(types_1.default.SocketIOServer).toConstantValue(io);
    return { io, userManager, eventEmitter };
}
