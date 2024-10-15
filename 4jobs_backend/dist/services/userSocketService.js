"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSocketService = void 0;
const socket_io_client_1 = require("socket.io-client");
class UserSocketService {
    constructor() {
        this.socket = null;
        this.userId = null;
        this.connected = false;
        // ... (rest of the implementation)
    }
    connect(userId) {
        console.log(`Attempting to connect to user socket server for user: ${userId}`);
        this.userId = userId;
        if (this.socket && this.socket.connected) {
            console.log("Socket already connected. Disconnecting before reconnecting.");
            this.socket.disconnect();
        }
        const socketUrl = `${process.env.REACT_APP_SOCKET_URL}/user` || "http://localhost:5000/user";
        console.log(`Connecting to user socket server at: ${socketUrl}`);
        this.socket = (0, socket_io_client_1.io)(socketUrl, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: { userId, userType: 'user' },
        });
        this.setupEventListeners();
    }
}
exports.userSocketService = new UserSocketService();
