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
        path: "/user-socket",
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });
    const userManager = container.get(types_1.default.UserManager);
    const eventEmitter = container.get(types_1.default.NotificationEventEmitter);
    const messageUseCase = container.get(types_1.default.MessageUseCase);
    const userVideoCallUseCase = container.get(types_1.default.UserVideoCallUseCase);
    io.use((0, socketAuthMiddleware_1.socketAuthMiddleware)(userManager));
    io.on("connection", (socket) => {
        console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}`);
        if (!socket.userId) {
            console.error("User not authenticated, closing connection");
            socket.disconnect(true);
            return;
        }
        userManager.addUser(socket.userId, socket.id, "user");
        socket.join(socket.userId);
        io.emit("userOnlineStatus", { userId: socket.userId, online: true });
        socket.on("sendMessage", (data) => __awaiter(this, void 0, void 0, function* () {
            console.log("Received sendMessage event:", data);
            try {
                if (!socket.userId) {
                    throw new Error("User not authenticated");
                }
                const message = yield messageUseCase.sendMessage(data.senderId, data.recipientId, data.content);
                console.log("Message saved:", message);
                // Emit to sender
                socket.emit("messageSent", message);
                console.log("Emitted messageSent to sender");
                // Emit to recipient
                const recipientSocket = userManager.getUserSocketId(data.recipientId);
                if (recipientSocket) {
                    io.to(recipientSocket).emit("newMessage", message);
                    console.log("Emitted newMessage to recipient");
                }
                else {
                    console.log("Recipient not online, message will be delivered later");
                }
                // Emit notification event
                eventEmitter.emit("sendNotification", {
                    type: "NEW_MESSAGE",
                    recipient: data.recipientId,
                    sender: data.senderId,
                    content: "You have a new message",
                });
                console.log("Emitted sendNotification event");
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("messageError", { error: "Failed to send message" });
            }
        }));
        socket.on("typing", (data) => {
            const recipientSocket = userManager.getUserSocketId(data.recipientId);
            if (recipientSocket) {
                io.to(recipientSocket).emit("userTyping", {
                    userId: socket.userId,
                    isTyping: data.isTyping,
                });
            }
        });
        socket.on("disconnect", () => {
            if (socket.userId) {
                userManager.removeUser(socket.userId);
                io.emit("userOnlineStatus", { userId: socket.userId, online: false });
            }
        });
        socket.on("userCallOffer", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] User ${socket.userId} is initiating a call to ${data.recipientId}`);
                if (!socket.userId) {
                    throw new Error("User not authenticated");
                }
                const call = yield userVideoCallUseCase.initiateCall(socket.userId, data.recipientId);
                const recipientSocket = userManager.getUserSocketId(data.recipientId);
                if (recipientSocket) {
                    console.log(`[VIDEO CALL] Sending incoming call to ${data.recipientId}`);
                    io.to(recipientSocket).emit("incomingCall", {
                        callId: call.id,
                        callerId: socket.userId,
                        offer: data.offer,
                    });
                    socket.emit("callRinging", {
                        callId: call.id,
                        recipientId: data.recipientId,
                    });
                }
                else {
                    socket.emit("callError", {
                        message: "Recipient is not online",
                        callId: call.id,
                    });
                    yield userVideoCallUseCase.endCall(call.id);
                }
            }
            catch (error) {
                console.error("[VIDEO CALL] Error initiating call:", error);
                socket.emit("callError", { message: "Failed to initiate call" });
            }
        }));
        socket.on("callAccepted", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] Call accepted by ${socket.userId} for caller ${data.callerId}`);
                const call = yield userVideoCallUseCase.getActiveCall(socket.userId);
                if (call) {
                    yield userVideoCallUseCase.respondToCall(call.id, "accepted");
                    const callerSocket = userManager.getUserSocketId(data.callerId);
                    if (callerSocket) {
                        io.to(callerSocket).emit("callAccepted", {
                            callId: call.id,
                            recipientId: socket.userId,
                        });
                    }
                }
            }
            catch (error) {
                console.error("[VIDEO CALL] Error accepting call:", error);
            }
        }));
        socket.on("callAnswer", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] Received call answer from ${socket.userId}`);
                const call = yield userVideoCallUseCase.getActiveCall(socket.userId);
                if (call) {
                    const callerSocket = userManager.getUserSocketId(data.callerId);
                    if (callerSocket) {
                        io.to(callerSocket).emit("userCallAnswer", {
                            answerBase64: data.answer,
                            callId: call.id,
                        });
                    }
                }
            }
            catch (error) {
                console.error("[VIDEO CALL] Error handling call answer:", error);
                socket.emit("callError", {
                    message: "Failed to process call answer",
                });
            }
        }));
        socket.on("iceCandidate", (data) => {
            try {
                if (!data.candidate)
                    return;
                const recipientSocket = userManager.getUserSocketId(data.recipientId);
                if (recipientSocket) {
                    io.to(recipientSocket).emit("iceCandidate", {
                        candidate: {
                            candidate: data.candidate.candidate,
                            sdpMid: data.candidate.sdpMid,
                            sdpMLineIndex: data.candidate.sdpMLineIndex,
                            usernameFragment: data.candidate.usernameFragment,
                        },
                        callerId: socket.userId,
                    });
                }
            }
            catch (error) {
                console.error("[VIDEO CALL] Error handling ICE candidate:", error);
            }
        });
        socket.on("rejectCall", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] User ${socket.userId} is rejecting call from ${data.callerId}`);
                const call = yield userVideoCallUseCase.getActiveCall(socket.userId);
                if (call) {
                    yield userVideoCallUseCase.respondToCall(call.id, "rejected");
                    const callerSocket = userManager.getUserSocketId(data.callerId);
                    if (callerSocket) {
                        io.to(callerSocket).emit("callRejected", { callId: call.id });
                    }
                }
            }
            catch (error) {
                console.error("[VIDEO CALL] Error rejecting call:", error);
            }
        }));
        socket.on("userEndCall", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[VIDEO CALL] User ${socket.userId} is ending call with ${data.recipientId}`);
                const call = yield userVideoCallUseCase.getActiveCall(socket.userId);
                if (call) {
                    yield userVideoCallUseCase.endCall(call.id);
                    const recipientSocket = userManager.getUserSocketId(data.recipientId);
                    if (recipientSocket) {
                        io.to(recipientSocket).emit("userCallEnded", {
                            callId: call.id,
                            callerId: socket.userId,
                        });
                    }
                }
            }
            catch (error) {
                console.error("[VIDEO CALL] Error ending call:", error);
            }
        }));
    });
    return { io, userManager, eventEmitter };
}
