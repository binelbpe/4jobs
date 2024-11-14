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
exports.UserRecruiterMessageUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const UserRecruitermessage_1 = require("../../../domain/entities/UserRecruitermessage");
const events_1 = require("events");
let UserRecruiterMessageUseCase = class UserRecruiterMessageUseCase {
    constructor(userRecruiterMessageRepository, recruiterRepository, eventEmitter) {
        this.userRecruiterMessageRepository = userRecruiterMessageRepository;
        this.recruiterRepository = recruiterRepository;
        this.eventEmitter = eventEmitter;
    }
    getUserConversations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRecruiterMessageRepository.getUserConversations(userId);
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRecruiterMessageRepository.markMessageAsRead(messageId);
        });
    }
    getMessages(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRecruiterMessageRepository.getMessages(conversationId);
        });
    }
    sendMessage(conversationId, content, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield this.userRecruiterMessageRepository.getConversationById(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            const message = new UserRecruitermessage_1.UserRecruiterMessage('', conversationId, userId, conversation.recruiterId, 'user', content, new Date(), false);
            const savedMessage = yield this.userRecruiterMessageRepository.saveMessage(message);
            yield this.userRecruiterMessageRepository.updateConversation(conversationId, content, new Date());
            this.eventEmitter.emit('newUserRecruiterMessage', savedMessage);
            return savedMessage;
        });
    }
    startConversation(userId, recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingConversation = yield this.userRecruiterMessageRepository.getConversationByParticipants(userId, recruiterId);
            if (existingConversation) {
                return existingConversation;
            }
            const newConversation = new UserRecruitermessage_1.UserRecruiterConversation('', userId, recruiterId, '', new Date());
            return this.userRecruiterMessageRepository.saveConversation(newConversation);
        });
    }
    getMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRecruiterMessageRepository.getMessageById(messageId);
        });
    }
    updateMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRecruiterMessageRepository.updateMessage(message);
        });
    }
    updateConversationLastMessage(conversationId, lastMessage, lastMessageTimestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRecruiterMessageRepository.updateConversation(conversationId, lastMessage, lastMessageTimestamp);
        });
    }
};
exports.UserRecruiterMessageUseCase = UserRecruiterMessageUseCase;
exports.UserRecruiterMessageUseCase = UserRecruiterMessageUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserRecruiterMessageRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IRecruiterRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.NotificationEventEmitter)),
    __metadata("design:paramtypes", [Object, Object, events_1.EventEmitter])
], UserRecruiterMessageUseCase);
