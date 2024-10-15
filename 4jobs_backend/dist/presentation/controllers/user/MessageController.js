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
const mongoose_1 = __importDefault(require("mongoose"));
const types_1 = __importDefault(require("../../../types"));
const MessageUseCase_1 = require("../../../application/usecases/user/MessageUseCase");
const socket_io_1 = require("socket.io");
const UserManager_1 = require("../../../infrastructure/services/UserManager");
const events_1 = require("events");
let MessageController = class MessageController {
    constructor(messageUseCase, io, userManager, eventEmitter) {
        this.messageUseCase = messageUseCase;
        this.io = io;
        this.userManager = userManager;
        this.eventEmitter = eventEmitter;
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("ivide vrunnund send message");
                const { senderId, recipientId, content } = req.body;
                if (!this.isValidObjectId(senderId) || !this.isValidObjectId(recipientId)) {
                    res.status(400).json({ error: "Invalid sender or recipient ID" });
                    return;
                }
                const message = yield this.messageUseCase.sendMessage(senderId, recipientId, content);
                const senderNotified = this.emitSocketEvent(senderId, 'messageSent', message);
                const recipientNotified = this.emitSocketEvent(recipientId, 'newMessage', message);
                console.log(`Message sent. Sender notified: ${senderNotified}, Recipient notified: ${recipientNotified}`);
                if (!senderNotified || !recipientNotified) {
                    console.warn(`Failed to notify ${!senderNotified ? 'sender' : 'recipient'} via socket for message ${message.id}`);
                }
                this.eventEmitter.emit('sendNotification', {
                    type: 'NEW_MESSAGE',
                    recipient: recipientId,
                    sender: senderId,
                    content: 'You have a new message'
                });
                res.status(201).json(message);
            }
            catch (error) {
                this.handleError(res, error, "Error sending message");
            }
        });
    }
    getConversation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId1, userId2 } = req.params;
                console.log(`Fetching conversation for users: ${userId1}, ${userId2}`);
                if (userId1 === 'unread') {
                    const unreadCount = yield this.messageUseCase.getUnreadMessageCount(userId2);
                    res.status(200).json({ unreadCount });
                    return;
                }
                if (!this.isValidObjectId(userId1) || !this.isValidObjectId(userId2)) {
                    res.status(400).json({ error: "Invalid user ID provided" });
                    return;
                }
                const messages = yield this.messageUseCase.getConversation(userId1, userId2);
                console.log("messages between two userssssssssss", messages);
                res.status(200).json(messages);
            }
            catch (error) {
                this.handleError(res, error, "Error fetching conversation");
            }
        });
    }
    markMessageAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                if (!this.isValidObjectId(messageId)) {
                    res.status(400).json({ error: "Invalid message ID" });
                    return;
                }
                yield this.messageUseCase.markMessageAsRead(messageId);
                const message = yield this.messageUseCase.getMessage(messageId);
                if (message && message.sender) {
                    const senderId = this.getSenderId(message.sender);
                    this.emitSocketEvent(senderId, 'messageRead', { messageId });
                }
                res.status(200).json({ message: "Message marked as read" });
            }
            catch (error) {
                this.handleError(res, error, "Error marking message as read");
            }
        });
    }
    getUnreadMessageCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                if (!this.isValidObjectId(userId)) {
                    res.status(400).json({ error: "Invalid user ID" });
                    return;
                }
                const count = yield this.messageUseCase.getUnreadMessageCount(userId);
                res.status(200).json({ count });
            }
            catch (error) {
                this.handleError(res, error, "Error getting unread message count");
            }
        });
    }
    searchMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { query } = req.query;
                if (!this.isValidObjectId(userId)) {
                    res.status(400).json({ error: "Invalid user ID" });
                    return;
                }
                if (typeof query !== 'string') {
                    res.status(400).json({ error: "Invalid query parameter" });
                    return;
                }
                const messages = yield this.messageUseCase.searchMessages(userId, query);
                res.status(200).json(messages);
            }
            catch (error) {
                this.handleError(res, error, "Error searching messages");
            }
        });
    }
    getMessageConnections(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                if (!this.isValidObjectId(userId)) {
                    res.status(400).json({ error: "Invalid user ID" });
                    return;
                }
                console.log("ivideeee kerunnnundddddddddddddddddddddddddddddddddddddd");
                const connections = yield this.messageUseCase.getMessageConnections(userId);
                res.status(200).json(connections);
            }
            catch (error) {
                this.handleError(res, error, "Error fetching message connections");
            }
        });
    }
    isValidObjectId(id) {
        return mongoose_1.default.Types.ObjectId.isValid(id);
    }
    emitSocketEvent(userId, event, data) {
        const socketId = this.userManager.getUserSocketId(userId);
        if (socketId) {
            try {
                this.io.to(socketId).emit(event, data);
                console.log(`${event} emitted to user ${userId}`);
                return true;
            }
            catch (error) {
                console.error(`Failed to emit ${event} to user ${userId}:`, error);
                return false;
            }
        }
        else {
            console.log(`User ${userId} is not connected. Event ${event} not emitted.`);
            return false;
        }
    }
    getSenderId(sender) {
        return typeof sender === 'string' ? sender : sender.id;
    }
    handleError(res, error, message) {
        console.error(`${message}:`, error);
        res.status(500).json({ error: `${message}. Please try again later.` });
    }
};
exports.MessageController = MessageController;
exports.MessageController = MessageController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.MessageUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.SocketIOServer)),
    __param(2, (0, inversify_1.inject)(types_1.default.UserManager)),
    __param(3, (0, inversify_1.inject)(types_1.default.NotificationEventEmitter)),
    __metadata("design:paramtypes", [MessageUseCase_1.MessageUseCase,
        socket_io_1.Server,
        UserManager_1.UserManager,
        events_1.EventEmitter])
], MessageController);
