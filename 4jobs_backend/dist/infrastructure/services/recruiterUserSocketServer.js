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
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"]
        }
    });
    const userManager = container.get(types_1.default.UserManager);
    const eventEmitter = container.get(types_1.default.NotificationEventEmitter);
    const userRecruiterMessageUseCase = container.get(types_1.default.UserRecruiterMessageUseCase);
    const recruiterMessageUseCase = container.get(types_1.default.RecruiterMessageUseCase);
    io.use((0, socketAuthMiddleware_1.socketAuthMiddleware)(userManager));
    io.on('connection', (socket) => {
        if (!socket.userId || !socket.userType) {
            console.error('User not authenticated, closing connection');
            socket.disconnect(true);
            return;
        }
        userManager.addUser(socket.userId, socket.id, socket.userType);
        socket.join(socket.userId);
        io.emit('userOnlineStatus', { userId: socket.userId, online: true });
        socket.on('sendUserRecruiterMessage', (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId, content, senderId, senderType } = message;
                let savedMessage;
                if (senderType === 'user') {
                    savedMessage = yield userRecruiterMessageUseCase.sendMessage(conversationId, content, senderId);
                }
                else {
                    savedMessage = yield recruiterMessageUseCase.sendMessage(conversationId, content, senderId);
                }
                let newUserRecruiterMessage = io.emit('newUserRecruiterMessage', savedMessage);
                const updatedConversation = yield userRecruiterMessageUseCase.updateConversationLastMessage(conversationId, content, new Date());
                io.emit('conversationUpdated', updatedConversation);
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit('messageSendError', { error: 'Failed to send message' });
            }
        }));
        socket.on('joinConversation', (conversationId) => {
            socket.join(conversationId);
        });
        socket.on('leaveConversation', (conversationId) => {
            socket.leave(conversationId);
        });
        socket.on('userRecruiterTyping', ({ conversationId, recipientId }) => {
            io.to(recipientId).emit('userRecruiterTyping', { senderId: socket.userId, conversationId });
        });
        socket.on('userRecruiterStoppedTyping', ({ conversationId, recipientId }) => {
            io.to(recipientId).emit('userRecruiterStoppedTyping', { senderId: socket.userId, conversationId });
        });
        socket.on('markMessageAsRead', (_a) => __awaiter(this, [_a], void 0, function* ({ messageId, conversationId }) {
            try {
                yield userRecruiterMessageUseCase.markMessageAsRead(messageId);
                io.emit('messageMarkedAsRead', { messageId, conversationId });
            }
            catch (error) {
                console.error('Error marking message as read:', error);
            }
        }));
        socket.on('disconnect', () => {
            if (socket.userId) {
                userManager.removeUser(socket.userId);
                io.emit('userOnlineStatus', { userId: socket.userId, online: false });
            }
            else {
                console.error('User disconnected without userId');
            }
        });
    });
    return { io, userManager, eventEmitter };
}
