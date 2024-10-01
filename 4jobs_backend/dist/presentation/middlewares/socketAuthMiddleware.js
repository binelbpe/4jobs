"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const socketAuthMiddleware = (userManager) => (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
        return next(new Error("Invalid user ID"));
    }
    socket.userId = userId;
    userManager.addUser(userId, socket.id);
    next();
};
exports.socketAuthMiddleware = socketAuthMiddleware;
