"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRecruiterMessage = void 0;
const inversify_1 = require("inversify");
const RecruiterMessage_1 = require("../../../../domain/entities/RecruiterMessage");
const RecruiterMessageModel_1 = require("../models/RecruiterMessageModel");
let MongoRecruiterMessage = class MongoRecruiterMessage {
    getConversations(recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversations = yield RecruiterMessageModel_1.ConversationModel.find({ recruiterId }).sort({ lastMessageTimestamp: -1 });
            return conversations.map(this.convertToConversation);
        });
    }
    getMessages(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield RecruiterMessageModel_1.RecruiterMessageModel.find({ conversationId }).sort({ timestamp: 1 });
            return messages.map(this.convertToRecruiterMessage);
        });
    }
    saveMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new RecruiterMessageModel_1.RecruiterMessageModel(message);
            const savedMessage = yield newMessage.save();
            return this.convertToRecruiterMessage(savedMessage);
        });
    }
    getConversationById(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield RecruiterMessageModel_1.ConversationModel.findById(conversationId);
            return conversation ? this.convertToConversation(conversation) : null;
        });
    }
    updateConversation(conversationId, lastMessage, lastMessageTimestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            yield RecruiterMessageModel_1.ConversationModel.findByIdAndUpdate(conversationId, { lastMessage, lastMessageTimestamp });
        });
    }
    getConversationByParticipants(recruiterId, applicantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield RecruiterMessageModel_1.ConversationModel.findOne({ recruiterId, applicantId });
            return conversation ? this.convertToConversation(conversation) : null;
        });
    }
    saveConversation(conversation) {
        return __awaiter(this, void 0, void 0, function* () {
            const newConversation = new RecruiterMessageModel_1.ConversationModel(conversation);
            const savedConversation = yield newConversation.save();
            return this.convertToConversation(savedConversation);
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield RecruiterMessageModel_1.RecruiterMessageModel.findByIdAndUpdate(messageId, { isRead: true });
        });
    }
    convertToConversation(doc) {
        return new RecruiterMessage_1.Conversation(doc.id.toString(), doc.recruiterId, doc.applicantId, doc.lastMessage, doc.lastMessageTimestamp);
    }
    convertToRecruiterMessage(doc) {
        return new RecruiterMessage_1.RecruiterMessage(doc.id.toString(), doc.conversationId, doc.senderId, doc.receiverId, doc.senderType, doc.content, doc.timestamp, doc.isRead);
    }
    getMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield RecruiterMessageModel_1.RecruiterMessageModel.findById(messageId);
            return message ? this.convertToRecruiterMessage(message) : null;
        });
    }
    updateMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedMessage = yield RecruiterMessageModel_1.RecruiterMessageModel.findByIdAndUpdate(message.id, {
                isRead: message.isRead,
            }, { new: true });
            if (!updatedMessage) {
                throw new Error('Message not found');
            }
            return this.convertToRecruiterMessage(updatedMessage);
        });
    }
};
exports.MongoRecruiterMessage = MongoRecruiterMessage;
exports.MongoRecruiterMessage = MongoRecruiterMessage = __decorate([
    (0, inversify_1.injectable)()
], MongoRecruiterMessage);
