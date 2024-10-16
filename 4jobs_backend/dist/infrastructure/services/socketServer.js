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
    const initiateVideoCallUseCase = container.get(types_1.default.InitiateVideoCallUseCase);
    const respondToVideoCallUseCase = container.get(types_1.default.RespondToVideoCallUseCase);
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
        // Existing message handling code...
        socket.on('callOffer', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (socket.userType !== 'recruiter' || !socket.userId) {
                    throw new Error('Unauthorized');
                }
                const videoCall = yield initiateVideoCallUseCase.execute(socket.userId, data.recipientId);
                const recipientSocket = userManager.getUserSocketId(data.recipientId);
                if (recipientSocket) {
                    io.to(recipientSocket).emit('incomingCall', { callerId: socket.userId, offer: data.offer });
                }
            }
            catch (error) {
                console.error('Error initiating video call:', error);
                socket.emit('videoCallError', { error: 'Failed to initiate video call' });
            }
        }));
        socket.on('callAnswer', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (socket.userType !== 'user' || !socket.userId) {
                    throw new Error('Unauthorized');
                }
                const videoCall = yield respondToVideoCallUseCase.execute(data.callerId, true);
                const callerSocket = userManager.getUserSocketId(data.callerId);
                if (callerSocket) {
                    io.to(callerSocket).emit('callAnswer', { answer: data.answer });
                }
            }
            catch (error) {
                console.error('Error responding to video call:', error);
                socket.emit('videoCallError', { error: 'Failed to respond to video call' });
            }
        }));
        socket.on('callRejected', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (socket.userType !== 'user' || !socket.userId) {
                    throw new Error('Unauthorized');
                }
                yield respondToVideoCallUseCase.execute(data.callerId, false);
                const callerSocket = userManager.getUserSocketId(data.callerId);
                if (callerSocket) {
                    io.to(callerSocket).emit('callRejected');
                }
            }
            catch (error) {
                console.error('Error rejecting video call:', error);
                socket.emit('videoCallError', { error: 'Failed to reject video call' });
            }
        }));
        socket.on('endCall', (data) => __awaiter(this, void 0, void 0, function* () {
            const recipientSocket = userManager.getUserSocketId(data.recipientId);
            if (recipientSocket) {
                io.to(recipientSocket).emit('callEnded');
            }
        }));
        // Existing disconnect handling...
    });
    // Existing event listeners...
    return { io, userManager, eventEmitter };
}
