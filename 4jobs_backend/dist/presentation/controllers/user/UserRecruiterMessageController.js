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
exports.UserRecruiterMessageController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const UserRecruiterMessageUseCase_1 = require("../../../application/usecases/user/UserRecruiterMessageUseCase");
let UserRecruiterMessageController = class UserRecruiterMessageController {
    constructor(userRecruiterMessageUseCase, recruiterRepository) {
        this.userRecruiterMessageUseCase = userRecruiterMessageUseCase;
        this.recruiterRepository = recruiterRepository;
    }
    getUserConversations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const conversations = yield this.userRecruiterMessageUseCase.getUserConversations(userId);
                const formattedConversations = yield Promise.all(conversations.map((conv) => __awaiter(this, void 0, void 0, function* () {
                    const recruiter = yield this.recruiterRepository.findById(conv.recruiterId);
                    return {
                        id: conv.id,
                        participant: {
                            id: recruiter === null || recruiter === void 0 ? void 0 : recruiter.id,
                            name: recruiter === null || recruiter === void 0 ? void 0 : recruiter.name,
                            companyName: recruiter === null || recruiter === void 0 ? void 0 : recruiter.companyName
                        },
                        lastMessage: conv.lastMessage,
                        lastMessageTimestamp: conv.lastMessageTimestamp.toISOString(),
                    };
                })));
                console.log("formattedConversations getUserConversations", formattedConversations);
                res.status(200).json(formattedConversations);
            }
            catch (error) {
                console.error("Error fetching user conversations:", error);
                res.status(500).json({ error: 'An error occurred while fetching conversations' });
            }
        });
    }
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { conversationId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let messages = yield this.userRecruiterMessageUseCase.getMessages(conversationId);
                const formattedMessages = yield Promise.all(messages.map((msg) => __awaiter(this, void 0, void 0, function* () {
                    if (msg.senderId !== userId && !msg.isRead) {
                        yield this.userRecruiterMessageUseCase.markMessageAsRead(msg.id);
                        msg.isRead = true;
                    }
                    return {
                        id: msg.id,
                        conversationId: msg.conversationId,
                        senderId: msg.senderId,
                        senderType: msg.senderType,
                        content: msg.content,
                        timestamp: msg.timestamp.toISOString(),
                        isRead: msg.isRead,
                    };
                })));
                // Update the messages in the database
                yield Promise.all(messages.map(msg => this.userRecruiterMessageUseCase.updateMessage(msg)));
                res.status(200).json(formattedMessages);
            }
            catch (error) {
                console.error("Error fetching messages:", error);
                res.status(500).json({ error: 'An error occurred while fetching messages' });
            }
        });
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId } = req.params;
                const { content, senderId } = req.body;
                const message = yield this.userRecruiterMessageUseCase.sendMessage(conversationId, content, senderId);
                const formattedMessage = {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    senderType: message.senderType,
                    content: message.content,
                    timestamp: message.timestamp.toISOString(),
                };
                res.status(201).json(formattedMessage);
            }
            catch (error) {
                console.error("Error sending message:", error);
                res.status(500).json({ error: 'An error occurred while sending the message' });
            }
        });
    }
    startConversation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, recruiterId } = req.body;
                const conversation = yield this.userRecruiterMessageUseCase.startConversation(userId, recruiterId);
                const recruiter = yield this.recruiterRepository.findById(recruiterId);
                const formattedConversation = {
                    id: conversation.id,
                    participant: {
                        id: recruiter === null || recruiter === void 0 ? void 0 : recruiter.id,
                        name: recruiter === null || recruiter === void 0 ? void 0 : recruiter.name,
                    },
                    lastMessage: conversation.lastMessage,
                    lastMessageTimestamp: conversation.lastMessageTimestamp.toISOString(),
                };
                res.status(201).json(formattedConversation);
            }
            catch (error) {
                console.error("Error starting conversation:", error);
                res.status(500).json({ error: 'An error occurred while starting the conversation' });
            }
        });
    }
};
exports.UserRecruiterMessageController = UserRecruiterMessageController;
exports.UserRecruiterMessageController = UserRecruiterMessageController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.UserRecruiterMessageUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.IRecruiterRepository)),
    __metadata("design:paramtypes", [UserRecruiterMessageUseCase_1.UserRecruiterMessageUseCase, Object])
], UserRecruiterMessageController);
