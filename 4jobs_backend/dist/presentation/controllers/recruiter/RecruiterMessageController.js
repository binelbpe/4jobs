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
exports.RecruiterMessageController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const RecruiterMessageUseCase_1 = require("../../../application/usecases/recruiter/RecruiterMessageUseCase");
let RecruiterMessageController = class RecruiterMessageController {
    constructor(recruiterMessageUseCase, userRepository) {
        this.recruiterMessageUseCase = recruiterMessageUseCase;
        this.userRepository = userRepository;
    }
    getConversations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { recruiterId } = req.params;
                console.log("conversation recruiter>>>>>>>>>>>>>>", recruiterId, req.params);
                if (!recruiterId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const conversations = yield this.recruiterMessageUseCase.getConversations(recruiterId);
                const formattedConversations = yield Promise.all(conversations.map((conv) => __awaiter(this, void 0, void 0, function* () {
                    const user = yield this.userRepository.findById(conv.applicantId);
                    return {
                        id: conv.id,
                        participant: {
                            id: user === null || user === void 0 ? void 0 : user.id,
                            name: user === null || user === void 0 ? void 0 : user.name,
                            profileImage: user === null || user === void 0 ? void 0 : user.profileImage,
                        },
                        lastMessage: conv.lastMessage,
                        lastMessageTimestamp: conv.lastMessageTimestamp.toISOString(),
                    };
                })));
                res.status(200).json({ data: formattedConversations });
            }
            catch (error) {
                console.log("error", error);
                res.status(500).json({ error: 'An error occurred while fetching conversations' });
            }
        });
    }
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId } = req.params;
                const messages = yield this.recruiterMessageUseCase.getMessages(conversationId);
                const formattedMessages = messages.map((msg) => ({
                    id: msg.id,
                    conversationId: msg.conversationId,
                    senderId: msg.senderId,
                    senderType: msg.senderType,
                    content: msg.content,
                    timestamp: msg.timestamp.toISOString(),
                }));
                res.status(200).json({ data: formattedMessages });
            }
            catch (error) {
                res.status(500).json({ error: 'An error occurred while fetching messages' });
            }
        });
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId } = req.params;
                const { content } = req.body;
                if (!conversationId) {
                    res.status(400).json({ error: 'Conversation ID is required' });
                    return;
                }
                const message = yield this.recruiterMessageUseCase.sendMessage(conversationId, content);
                const formattedMessage = {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    senderType: message.senderType,
                    content: message.content,
                    timestamp: message.timestamp.toISOString(),
                };
                res.status(201).json({ data: formattedMessage });
            }
            catch (error) {
                console.error("Error sending message:", error);
                res.status(500).json({ error: 'An error occurred while sending the message' });
            }
        });
    }
    startConversation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("start conversation>>>>>>>>>>>", req.body);
            try {
                const { applicantId, recruiterId } = req.body;
                const conversation = yield this.recruiterMessageUseCase.startConversation(recruiterId, applicantId);
                console.log("conversation start???????????", conversation);
                const user = yield this.userRepository.findById(applicantId);
                const formattedConversation = {
                    id: conversation.id,
                    participant: {
                        id: user === null || user === void 0 ? void 0 : user.id,
                        name: user === null || user === void 0 ? void 0 : user.name,
                        profileImage: user === null || user === void 0 ? void 0 : user.profileImage,
                    },
                    lastMessage: conversation.lastMessage,
                    lastMessageTimestamp: conversation.lastMessageTimestamp.toISOString(),
                };
                res.status(201).json({ data: formattedConversation });
            }
            catch (error) {
                console.error("Error starting conversation:", error);
                res.status(500).json({ error: 'An error occurred while starting the conversation' });
            }
        });
    }
};
exports.RecruiterMessageController = RecruiterMessageController;
exports.RecruiterMessageController = RecruiterMessageController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.RecruiterMessageUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __metadata("design:paramtypes", [RecruiterMessageUseCase_1.RecruiterMessageUseCase, Object])
], RecruiterMessageController);
