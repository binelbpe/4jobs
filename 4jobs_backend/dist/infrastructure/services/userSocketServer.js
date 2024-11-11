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
    });
    return { io, userManager, eventEmitter };
}
