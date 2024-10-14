"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const socketAuthMiddleware = (userManager) => (socket, next) => {
    const userId = socket.handshake.auth.userId;
    const userType = socket.handshake.auth.userType;
    if (!userId || !userType) {
        return next(new Error("Invalid user ID or user type"));
    }
    socket.userId = userId;
    socket.userType = userType;
    userManager.addUser(userId, socket.id, userType);
    next();
};
exports.socketAuthMiddleware = socketAuthMiddleware;
