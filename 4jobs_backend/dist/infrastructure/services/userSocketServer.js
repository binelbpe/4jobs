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
exports.setupUserSocketServer = setupUserSocketServer;
const socket_io_1 = require("socket.io");
const socketAuthMiddleware_1 = require("../../presentation/middlewares/socketAuthMiddleware");
const types_1 = __importDefault(require("../../types"));
function setupUserSocketServer(server, container) {
    const io = new socket_io_1.Server(server, {
        path: '/user-socket',
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    const userManager = container.get(types_1.default.UserManager);
    const eventEmitter = container.get(types_1.default.NotificationEventEmitter);
    const messageUseCase = container.get(types_1.default.MessageUseCase);
    const userVideoCallUseCase = container.get(types_1.default.UserVideoCallUseCase);
    io.use((0, socketAuthMiddleware_1.socketAuthMiddleware)(userManager));
    io.on('connection', (socket) => {
        console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}`);
        if (!socket.userId) {
            console.error('User not authenticated, closing connection');
            socket.disconnect(true);
            return;
        }
        userManager.addUser(socket.userId, socket.id, 'user');
        socket.join(socket.userId);
        io.emit('userOnlineStatus', { userId: socket.userId, online: true });
        socket.on('sendMessage', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received sendMessage event:', data);
            try {
                if (!socket.userId) {
                    throw new Error('User not authenticated');
                }
                const message = yield messageUseCase.sendMessage(data.senderId, data.recipientId, data.content);
                console.log('Message saved:', message);
                // Emit to sender
                socket.emit('messageSent', message);
                console.log('Emitted messageSent to sender');
                // Emit to recipient
                const recipientSocket = userManager.getUserSocketId(data.recipientId);
                if (recipientSocket) {
                    io.to(recipientSocket).emit('newMessage', message);
                    console.log('Emitted newMessage to recipient');
                }
                else {
                    console.log('Recipient not online, message will be delivered later');
                }
                // Emit notification event
                eventEmitter.emit('sendNotification', {
                    type: 'NEW_MESSAGE',
                    recipient: data.recipientId,
                    sender: data.senderId,
                    content: 'You have a new message'
                });
                console.log('Emitted sendNotification event');
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit('messageError', { error: 'Failed to send message' });
            }
        }));
        socket.on('typing', (data) => {
            const recipientSocket = userManager.getUserSocketId(data.recipientId);
            if (recipientSocket) {
                io.to(recipientSocket).emit('userTyping', { userId: socket.userId, isTyping: data.isTyping });
            }
        });
        socket.on('disconnect', () => {
            if (socket.userId) {
                userManager.removeUser(socket.userId);
                io.emit('userOnlineStatus', { userId: socket.userId, online: false });
            }
        });
        socket.on('userCallOffer', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] User ${socket.userId} is initiating a call to ${data.recipientId}`);
                const call = yield userVideoCallUseCase.initiateCall(socket.userId, data.recipientId);
                console.log(`[VIDEO CALL] Call initiated with ID: ${call.id}`);
                const recipientSocket = userManager.getUserSocketId(data.recipientId);
                if (recipientSocket) {
                    console.log(`[VIDEO CALL] Emitting incomingCall event to recipient ${data.recipientId}`);
                    io.to(recipientSocket).emit('incomingCall', {
                        callId: call.id,
                        callerId: socket.userId,
                        offer: data.offer
                    });
                    console.log(`[VIDEO CALL] incomingCall event emitted successfully`);
                }
                else {
                    console.log(`[VIDEO CALL] Recipient ${data.recipientId} is not online. Call cannot be established.`);
                    socket.emit('callError', { message: 'Recipient is not online' });
                }
            }
            catch (error) {
                console.error('[VIDEO CALL] Error initiating call:', error);
                socket.emit('callError', { message: 'Failed to initiate call. Please try again.' });
            }
        }));
        socket.on('callAnswer', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] Received call answer from ${socket.userId} for caller ${data.callerId}`);
                const call = yield userVideoCallUseCase.getActiveCall(socket.userId);
                if (call) {
                    console.log(`[VIDEO CALL] Active call found with ID: ${call.id}`);
                    yield userVideoCallUseCase.respondToCall(call.id, 'accepted');
                    console.log(`[VIDEO CALL] Call ${call.id} marked as accepted`);
                    const callerSocket = userManager.getUserSocketId(data.callerId);
                    if (callerSocket) {
                        console.log(`[VIDEO CALL] Emitting callAnswered event to caller ${data.callerId}`);
                        io.to(callerSocket).emit('callAnswered', {
                            callId: call.id,
                            answer: data.answer
                        });
                        console.log(`[VIDEO CALL] callAnswered event emitted successfully`);
                    }
                    else {
                        console.log(`[VIDEO CALL] Caller ${data.callerId} is not online. Cannot send call answer.`);
                    }
                }
                else {
                    console.log(`[VIDEO CALL] No active call found for user ${socket.userId}`);
                    socket.emit('callError', { message: 'No active call found' });
                }
            }
            catch (error) {
                console.error('[VIDEO CALL] Error answering call:', error);
                socket.emit('callError', { message: 'Failed to answer call' });
            }
        }));
        socket.on('rejectCall', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] User ${socket.userId} is rejecting call from ${data.callerId}`);
                const call = yield userVideoCallUseCase.getActiveCall(socket.userId);
                if (call) {
                    yield userVideoCallUseCase.respondToCall(call.id, 'rejected');
                    const callerSocket = userManager.getUserSocketId(data.callerId);
                    if (callerSocket) {
                        io.to(callerSocket).emit('callRejected', { callId: call.id });
                    }
                }
            }
            catch (error) {
                console.error('[VIDEO CALL] Error rejecting call:', error);
            }
        }));
        socket.on('userEndCall', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] User ${socket.userId} is ending call with ${data.recipientId}`);
                const call = yield userVideoCallUseCase.getActiveCall(socket.userId);
                if (call) {
                    console.log(`[VIDEO CALL] Active call found with ID: ${call.id}`);
                    yield userVideoCallUseCase.endCall(call.id);
                    console.log(`[VIDEO CALL] Call ${call.id} marked as ended`);
                    const otherUserId = call.callerId === socket.userId ? call.recipientId : call.callerId;
                    const otherUserSocket = userManager.getUserSocketId(otherUserId);
                    if (otherUserSocket) {
                        console.log(`[VIDEO CALL] Emitting userCallEnded event to ${otherUserId}`);
                        io.to(otherUserSocket).emit('userCallEnded', { callId: call.id });
                        console.log(`[VIDEO CALL] userCallEnded event emitted successfully`);
                    }
                    else {
                        console.log(`[VIDEO CALL] Other user ${otherUserId} is not online. Cannot send call end notification.`);
                    }
                }
                else {
                    console.log(`[VIDEO CALL] No active call found for user ${socket.userId}`);
                }
            }
            catch (error) {
                console.error('[VIDEO CALL] Error ending call:', error);
                socket.emit('callError', { message: 'Failed to end call' });
            }
        }));
    });
    return { io, userManager, eventEmitter };
}
