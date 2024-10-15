"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const socket_io_client_1 = require("socket.io-client");
const store_1 = __importDefault(require("../redux/store"));
const userMessageSlice_1 = require("../redux/slices/userMessageSlice");
class SocketService {
    constructor() {
        this.userSocket = null;
        this.recruiterSocket = null;
        this.userId = null;
        this.userType = null;
    }
    connect(userId, userType) {
        this.userId = userId;
        this.userType = userType;
        const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
        if (userType === 'user') {
            this.userSocket = (0, socket_io_client_1.io)(`${socketUrl}/user-socket`, {
                transports: ["websocket"],
                auth: { userId, userType }
            });
            this.setupUserSocketListeners();
        }
        else {
            this.recruiterSocket = (0, socket_io_client_1.io)(`${socketUrl}/recruiter-socket`, {
                transports: ["websocket"],
                auth: { userId, userType }
            });
            this.setupRecruiterSocketListeners();
        }
    }
    setupUserSocketListeners() {
        if (!this.userSocket)
            return;
        this.userSocket.on("connect", () => {
            console.log("User socket connected");
        });
        this.userSocket.on("newMessage", (message) => {
            console.log("Received new message:", message);
            store_1.default.dispatch((0, userMessageSlice_1.addMessage)(message));
        });
        this.userSocket.on("userTyping", ({ userId, isTyping }) => {
            console.log("Received typing event:", userId, isTyping);
            store_1.default.dispatch((0, userMessageSlice_1.setTypingStatus)({ userId, isTyping }));
        });
    }
    setupRecruiterSocketListeners() {
        if (!this.recruiterSocket)
            return;
        this.recruiterSocket.on("connect", () => {
            console.log("Recruiter socket connected");
        });
        // Add recruiter-specific event listeners here
    }
    sendMessage(message) {
        if (this.userSocket && this.userType === 'user') {
            this.userSocket.emit("sendMessage", message);
        }
        else if (this.recruiterSocket && this.userType === 'recruiter') {
            this.recruiterSocket.emit("sendRecruiterMessage", message);
        }
    }
    emitTyping(recipientId, isTyping) {
        if (this.userSocket && this.userType === 'user') {
            this.userSocket.emit("typing", { recipientId, isTyping });
        }
    }
    disconnect() {
        if (this.userSocket) {
            this.userSocket.disconnect();
        }
        if (this.recruiterSocket) {
            this.recruiterSocket.disconnect();
        }
    }
}
exports.socketService = new SocketService();
