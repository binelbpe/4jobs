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
exports.MessageController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const MessageUseCase_1 = require("../../../application/usecases/user/MessageUseCase");
let MessageController = class MessageController {
    constructor(messageUseCase) {
        this.messageUseCase = messageUseCase;
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, recipientId, content } = req.body;
                const message = yield this.messageUseCase.sendMessage(senderId, recipientId, content);
                res.status(201).json(message);
            }
            catch (error) {
                console.error("Error sending message:", error);
                res.status(500).json({ error: "An error occurred while sending the message" });
            }
        });
    }
    getConversation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId1, userId2 } = req.params;
                const messages = yield this.messageUseCase.getConversation(userId1, userId2);
                res.status(200).json(messages);
            }
            catch (error) {
                console.error("Error fetching conversation:", error);
                res.status(500).json({ error: "An error occurred while fetching the conversation" });
            }
        });
    }
    markMessageAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                yield this.messageUseCase.markMessageAsRead(messageId);
                res.status(200).json({ message: "Message marked as read" });
            }
            catch (error) {
                console.error("Error marking message as read:", error);
                res.status(500).json({ error: "An error occurred while marking the message as read" });
            }
        });
    }
    getUnreadMessageCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const count = yield this.messageUseCase.getUnreadMessageCount(userId);
                res.status(200).json({ count });
            }
            catch (error) {
                console.error("Error getting unread message count:", error);
                res.status(500).json({ error: "An error occurred while getting the unread message count" });
            }
        });
    }
    searchMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { query } = req.query;
                if (typeof query !== 'string') {
                    throw new Error('Invalid query parameter');
                }
                const messages = yield this.messageUseCase.searchMessages(userId, query);
                res.status(200).json(messages);
            }
            catch (error) {
                console.error("Error searching messages:", error);
                res.status(500).json({ error: "An error occurred while searching messages" });
            }
        });
    }
};
exports.MessageController = MessageController;
exports.MessageController = MessageController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.MessageUseCase)),
    __metadata("design:paramtypes", [MessageUseCase_1.MessageUseCase])
], MessageController);
