"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruiterMessageUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const RecruiterMessage_1 = require("../../../domain/entities/RecruiterMessage");
const events_1 = require("events");
let RecruiterMessageUseCase = class RecruiterMessageUseCase {
    constructor(recruiterMessageRepository, userRepository, eventEmitter) {
        this.recruiterMessageRepository = recruiterMessageRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
    }
    getConversations(recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.recruiterMessageRepository.getConversations(recruiterId);
        });
    }
    getMessages(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.recruiterMessageRepository.getMessages(conversationId);
        });
    }
    sendMessage(conversationId, content, recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield this.recruiterMessageRepository.getConversationById(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            const message = new RecruiterMessage_1.RecruiterMessage('', conversationId, recruiterId, conversation.applicantId, 'recruiter', content, new Date(), false);
            const savedMessage = yield this.recruiterMessageRepository.saveMessage(message);
            yield this.recruiterMessageRepository.updateConversation(conversationId, content, new Date());
            // Emit an event for real-time updates
            this.eventEmitter.emit('newRecruiterMessage', savedMessage);
            return savedMessage;
        });
    }
    startConversation(recruiterId, applicantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingConversation = yield this.recruiterMessageRepository.getConversationByParticipants(recruiterId, applicantId);
            if (existingConversation) {
                return existingConversation;
            }
            const newConversation = new RecruiterMessage_1.Conversation('', recruiterId, applicantId, '', new Date());
            const savedConversation = yield this.recruiterMessageRepository.saveConversation(newConversation);
            // Emit an event for real-time updates
            this.eventEmitter.emit('newRecruiterConversation', savedConversation);
            return savedConversation;
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.recruiterMessageRepository.getMessageById(messageId);
            if (message && !message.isRead) {
                message.isRead = true;
                yield this.recruiterMessageRepository.updateMessage(message);
                this.eventEmitter.emit('recruiterMessageRead', { messageId, conversationId: message.conversationId });
            }
        });
    }
    getMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.recruiterMessageRepository.getMessageById(messageId);
        });
    }
    updateMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedMessage = yield this.recruiterMessageRepository.updateMessage(message);
            if (updatedMessage.isRead) {
                this.eventEmitter.emit('recruiterMessageRead', { messageId: updatedMessage.id, conversationId: updatedMessage.conversationId });
            }
            return updatedMessage;
        });
    }
};
exports.RecruiterMessageUseCase = RecruiterMessageUseCase;
exports.RecruiterMessageUseCase = RecruiterMessageUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IRecruiterMessageRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.NotificationEventEmitter)),
    __metadata("design:paramtypes", [Object, Object, events_1.EventEmitter])
], RecruiterMessageUseCase);
