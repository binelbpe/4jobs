"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRecruiterConversation = exports.UserRecruiterMessage = void 0;
class UserRecruiterMessage {
    constructor(id, conversationId, senderId, receiverId, senderType, content, timestamp, isRead = false // Add this field
    ) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.senderType = senderType;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }
}
exports.UserRecruiterMessage = UserRecruiterMessage;
class UserRecruiterConversation {
    constructor(id, userId, recruiterId, lastMessage, lastMessageTimestamp) {
        this.id = id;
        this.userId = userId;
        this.recruiterId = recruiterId;
        this.lastMessage = lastMessage;
        this.lastMessageTimestamp = lastMessageTimestamp;
    }
}
exports.UserRecruiterConversation = UserRecruiterConversation;
