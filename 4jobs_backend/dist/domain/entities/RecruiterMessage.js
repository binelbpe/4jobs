"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = exports.RecruiterMessage = void 0;
class RecruiterMessage {
    constructor(id, conversationId, senderId, receiverId, senderType, content, timestamp) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.senderType = senderType;
        this.content = content;
        this.timestamp = timestamp;
    }
}
exports.RecruiterMessage = RecruiterMessage;
class Conversation {
    constructor(id, recruiterId, applicantId, lastMessage = '', // Add a default value here
    lastMessageTimestamp) {
        this.id = id;
        this.recruiterId = recruiterId;
        this.applicantId = applicantId;
        this.lastMessage = lastMessage;
        this.lastMessageTimestamp = lastMessageTimestamp;
    }
}
exports.Conversation = Conversation;
