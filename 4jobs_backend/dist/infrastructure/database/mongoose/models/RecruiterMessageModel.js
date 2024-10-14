"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = exports.RecruiterMessageModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RecruiterMessageSchema = new mongoose_1.Schema({
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    senderType: { type: String, enum: ['recruiter', 'user'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }, // Add this field
});
exports.RecruiterMessageModel = mongoose_1.default.model('RecruiterMessage', RecruiterMessageSchema);
const ConversationSchema = new mongoose_1.Schema({
    recruiterId: { type: String, required: true },
    applicantId: { type: String, required: true },
    lastMessage: { type: String, default: '' },
    lastMessageTimestamp: { type: Date, default: Date.now },
});
exports.ConversationModel = mongoose_1.default.model('Conversation', ConversationSchema);
