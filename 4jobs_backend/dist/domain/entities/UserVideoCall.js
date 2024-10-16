"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVideoCall = void 0;
class UserVideoCall {
    constructor(id, callerId, recipientId, status, createdAt, updatedAt) {
        this.id = id;
        this.callerId = callerId;
        this.recipientId = recipientId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.UserVideoCall = UserVideoCall;
