"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
class Connection {
    constructor(id, requesterId, recipientId, status, createdAt) {
        this.id = id;
        this.requesterId = requesterId;
        this.recipientId = recipientId;
        this.status = status;
        this.createdAt = createdAt;
    }
}
exports.Connection = Connection;
