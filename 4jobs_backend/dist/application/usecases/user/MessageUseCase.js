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
exports.MessageUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const UserManager_1 = require("../../../infrastructure/services/UserManager");
let MessageUseCase = class MessageUseCase {
    constructor(messageRepository, userRepository, userManager) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.userManager = userManager;
    }
    sendMessage(senderId, recipientId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const sender = yield this.userRepository.findById(senderId);
            const recipient = yield this.userRepository.findById(recipientId);
            if (!sender || !recipient) {
                console.error('Sender or recipient not found', { senderId, recipientId });
                throw new Error('Sender or recipient not found');
            }
            const message = {
                sender: Object.assign(Object.assign({}, sender), { id: sender.id || '' }),
                recipient: Object.assign(Object.assign({}, recipient), { id: recipient.id || '' }),
                content,
                createdAt: new Date(),
                isRead: false,
                status: this.userManager.isUserOnline(recipientId) ? 'delivered' : 'sent'
            };
            const savedMessage = yield this.messageRepository.create(message);
            return savedMessage;
        });
    }
    getConversation(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.messageRepository.findByUsers(userId1, userId2);
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageRepository.markAsRead(messageId);
        });
    }
    getUnreadMessageCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.messageRepository.getUnreadCount(userId);
        });
    }
    searchMessages(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.messageRepository.searchMessages(userId, query);
        });
    }
    getMessageConnections(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connections = yield this.messageRepository.getMessageConnections(userId);
            const userIds = connections.map((c) => c.user);
            const users = yield this.userRepository.findUsersByIds(userIds);
            const resp = connections.map((conn) => {
                const user = users.find((u) => u.id === conn.user);
                return {
                    user,
                    lastMessage: conn.lastMessage,
                    isOnline: this.userManager.isUserOnline(user.id || '')
                };
            });
            return resp;
        });
    }
    getMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.messageRepository.findById(messageId);
        });
    }
};
exports.MessageUseCase = MessageUseCase;
exports.MessageUseCase = MessageUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IMessageRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.UserManager)),
    __metadata("design:paramtypes", [Object, Object, UserManager_1.UserManager])
], MessageUseCase);
