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
    const userRecruiterMessageUseCase = container.get(types_1.default.UserRecruiterMessageUseCase);
    const recruiterMessageUseCase = container.get(types_1.default.RecruiterMessageUseCase);
    io.use((0, socketAuthMiddleware_1.socketAuthMiddleware)(userManager));
    io.on('connection', (socket) => {
        console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}, user type: ${socket.userType}`);
        if (!socket.userId || !socket.userType) {
            console.error('User not authenticated, closing connection');
            socket.disconnect(true);
            return;
        }
        userManager.addUser(socket.userId, socket.id, socket.userType);
        socket.join(socket.userId);
        io.emit('userOnlineStatus', { userId: socket.userId, online: true });
        // Handle user-recruiter messaging
        socket.on('sendUserRecruiterMessage', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!socket.userId) {
                    throw new Error('User not authenticated');
                }
                let message;
                let recipientId;
                if (socket.userType === 'user') {
                    message = yield userRecruiterMessageUseCase.sendMessage(data.conversationId, data.content, socket.userId);
                    recipientId = message.receiverId; // Set recipientId to the receiverId from the message
                }
                else {
                    message = yield recruiterMessageUseCase.sendMessage(data.conversationId, data.content, socket.userId);
                    recipientId = message.receiverId; // Set recipientId to the receiverId from the message
                }
                // Emit to sender
                socket.emit('userRecruiterMessageSent', message);
                // Emit to recipient
                const recipientSocket = userManager.getUserSocketId(recipientId);
                if (recipientSocket) {
                    io.to(recipientSocket).emit('newUserRecruiterMessage', message);
                }
                // Emit notification event
                eventEmitter.emit('sendNotification', {
                    type: 'NEW_USER_RECRUITER_MESSAGE',
                    recipient: recipientId,
                    sender: socket.userId,
                    content: 'You have a new message'
                });
            }
            catch (error) {
                console.error('Error sending user-recruiter message:', error);
                socket.emit('userRecruiterMessageError', { error: 'Failed to send message' });
            }
        }));
        socket.on('markUserRecruiterMessageAsRead', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!socket.userId) {
                    throw new Error('User not authenticated');
                }
                if (socket.userType === 'user') {
                    yield userRecruiterMessageUseCase.markMessageAsRead(data.messageId);
                }
                else {
                    yield recruiterMessageUseCase.markMessageAsRead(data.messageId);
                }
                // Emit to sender
                socket.emit('userRecruiterMessageMarkedAsRead', { messageId: data.messageId });
                // Emit to the other participant in the conversation
                const message = socket.userType === 'user'
                    ? yield userRecruiterMessageUseCase.getMessageById(data.messageId)
                    : yield recruiterMessageUseCase.getMessageById(data.messageId);
                if (message) {
                    const recipientId = message.senderId === socket.userId ? message.receiverId : message.senderId;
                    const recipientSocket = userManager.getUserSocketId(recipientId);
                    if (recipientSocket) {
                        io.to(recipientSocket).emit('userRecruiterMessageMarkedAsRead', { messageId: data.messageId });
                    }
                }
                console.log(`Message ${data.messageId} marked as read by ${socket.userType} ${socket.userId}`);
            }
            catch (error) {
                console.error('Error marking user-recruiter message as read:', error);
                socket.emit('markUserRecruiterMessageError', { error: 'Failed to mark message as read' });
            }
        }));
        // Update typing events for user-recruiter messaging
        socket.on('userRecruiterTyping', (data) => {
            console.log(`${socket.userType} ${socket.userId} is typing in conversation ${data.conversationId}`);
            userManager.setUserTyping(socket.userId, data.conversationId);
            socket.to(data.conversationId).emit('userRecruiterTyping', { userId: socket.userId, userType: socket.userType, conversationId: data.conversationId });
        });
        socket.on('userRecruiterStoppedTyping', (data) => {
            console.log(`${socket.userType} ${socket.userId} stopped typing in conversation ${data.conversationId}`);
            userManager.setUserStoppedTyping(socket.userId, data.conversationId);
            socket.to(data.conversationId).emit('userRecruiterStoppedTyping', { userId: socket.userId, userType: socket.userType, conversationId: data.conversationId });
        });
        // Join user-recruiter conversation room
        socket.on('joinUserRecruiterConversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`${socket.userType} ${socket.userId} joined conversation ${conversationId}`);
        });
        // Leave user-recruiter conversation room
        socket.on('leaveUserRecruiterConversation', (conversationId) => {
            socket.leave(conversationId);
            console.log(`${socket.userType} ${socket.userId} left conversation ${conversationId}`);
        });
        socket.on('disconnect', () => {
            if (socket.userId) {
                userManager.removeUser(socket.userId);
                io.emit('userOnlineStatus', { userId: socket.userId, online: false });
            }
        });
        // Handle recruiter message read status
        socket.on('markRecruiterMessageAsRead', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (socket.userType === 'recruiter') {
                    yield recruiterMessageUseCase.markMessageAsRead(data.messageId);
                }
            }
            catch (error) {
                console.error('Error marking recruiter message as read:', error);
            }
        }));
    });
    // Handle notifications
    eventEmitter.on('sendNotification', (notification) => {
        try {
            if (!notification || !notification.recipient) {
                console.error('Invalid notification:', notification);
                return;
            }
            const recipientId = typeof notification.recipient === 'string'
                ? notification.recipient
                : notification.recipient.toString();
            const recipientSocketId = userManager.getUserSocketId(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newNotification', notification);
            }
            else {
                console.log(`User ${recipientId} is not currently connected. Notification will be shown on next login.`);
            }
        }
        catch (error) {
            console.error('Error sending notification:', error);
        }
    });
    // Add these event listeners
    eventEmitter.on('recruiterMessageRead', (data) => {
        const recipientSocketId = userManager.getUserSocketId(data.senderId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('recruiterMessageRead', data);
        }
    });
    eventEmitter.on('recruiterMessagesRead', (data) => {
        const recipientSocketId = userManager.getUserSocketId(data.messages[0].senderId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('recruiterMessagesRead', data);
        }
    });
    return { io, userManager, eventEmitter };
}
