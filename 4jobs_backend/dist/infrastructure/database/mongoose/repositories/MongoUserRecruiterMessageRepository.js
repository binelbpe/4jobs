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
exports.MongoUserRecruiterMessageRepository = void 0;
const inversify_1 = require("inversify");
const UserRecruitermessage_1 = require("../../../../domain/entities/UserRecruitermessage");
const RecruiterMessageModel_1 = require("../models/RecruiterMessageModel");
let MongoUserRecruiterMessageRepository = class MongoUserRecruiterMessageRepository {
    getUserConversations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversations = yield RecruiterMessageModel_1.ConversationModel.find({ applicantId: userId }).sort({ lastMessageTimestamp: -1 });
            return conversations.map(this.convertToUserRecruiterConversation);
        });
    }
    getMessages(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield RecruiterMessageModel_1.RecruiterMessageModel.find({ conversationId }).sort({ timestamp: 1 });
            return messages.map(this.convertToUserRecruiterMessage);
        });
    }
    saveMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new RecruiterMessageModel_1.RecruiterMessageModel(message);
            const savedMessage = yield newMessage.save();
            return this.convertToUserRecruiterMessage(savedMessage);
        });
    }
    getConversationById(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield RecruiterMessageModel_1.ConversationModel.findById(conversationId);
            return conversation ? this.convertToUserRecruiterConversation(conversation) : null;
        });
    }
    updateConversation(conversationId, lastMessage, lastMessageTimestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedConversation = yield RecruiterMessageModel_1.ConversationModel.findByIdAndUpdate(conversationId, { lastMessage, lastMessageTimestamp }, { new: true });
            if (!updatedConversation) {
                throw new Error('Conversation not found');
            }
            return this.convertToUserRecruiterConversation(updatedConversation);
        });
    }
    getConversationByParticipants(userId, recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield RecruiterMessageModel_1.ConversationModel.findOne({ applicantId: userId, recruiterId });
            return conversation ? this.convertToUserRecruiterConversation(conversation) : null;
        });
    }
    saveConversation(conversation) {
        return __awaiter(this, void 0, void 0, function* () {
            const newConversation = new RecruiterMessageModel_1.ConversationModel({
                recruiterId: conversation.recruiterId,
                applicantId: conversation.userId,
                lastMessage: conversation.lastMessage,
                lastMessageTimestamp: conversation.lastMessageTimestamp
            });
            const savedConversation = yield newConversation.save();
            return this.convertToUserRecruiterConversation(savedConversation);
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield RecruiterMessageModel_1.RecruiterMessageModel.findByIdAndUpdate(messageId, { isRead: true });
        });
    }
    getMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield RecruiterMessageModel_1.RecruiterMessageModel.findById(messageId);
            return message ? this.convertToUserRecruiterMessage(message) : null;
        });
    }
    updateMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedMessage = yield RecruiterMessageModel_1.RecruiterMessageModel.findByIdAndUpdate(message.id, {
                isRead: message.isRead,
                // Add other fields that might need updating
            }, { new: true });
            if (!updatedMessage) {
                throw new Error('Message not found');
            }
            return this.convertToUserRecruiterMessage(updatedMessage);
        });
    }
    convertToUserRecruiterConversation(doc) {
        return new UserRecruitermessage_1.UserRecruiterConversation(doc.id.toString(), doc.applicantId, doc.recruiterId, doc.lastMessage, doc.lastMessageTimestamp);
    }
    convertToUserRecruiterMessage(doc) {
        return new UserRecruitermessage_1.UserRecruiterMessage(doc.id.toString(), doc.conversationId, doc.senderId, doc.receiverId, doc.senderType, doc.content, doc.timestamp);
    }
};
exports.MongoUserRecruiterMessageRepository = MongoUserRecruiterMessageRepository;
exports.MongoUserRecruiterMessageRepository = MongoUserRecruiterMessageRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoUserRecruiterMessageRepository);
