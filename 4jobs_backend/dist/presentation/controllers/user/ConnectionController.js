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
exports.ConnectionController = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = __importDefault(require("../../../types"));
const ConnectionUseCase_1 = require("../../../application/usecases/user/ConnectionUseCase");
const UserManager_1 = require("../../../infrastructure/services/UserManager");
const NotificationModel_1 = require("../../../infrastructure/database/mongoose/models/NotificationModel");
const UserModel_1 = require("../../../infrastructure/database/mongoose/models/UserModel");
let ConnectionController = class ConnectionController {
    constructor(connectionUseCase, userManager, eventEmitter) {
        this.connectionUseCase = connectionUseCase;
        this.userManager = userManager;
        this.eventEmitter = eventEmitter;
    }
    sendConnectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, recipientId } = req.body;
                console.log(`Sending connection request from ${senderId} to ${recipientId}`);
                const connection = yield this.connectionUseCase.sendConnectionRequest(senderId, recipientId);
                const sender = yield UserModel_1.UserModel.findById(senderId);
                if (sender) {
                    const notification = yield NotificationModel_1.NotificationModel.create({
                        type: 'connection_request',
                        message: `${sender.name} sent you a connection request`,
                        sender: senderId,
                        recipient: recipientId,
                        relatedItem: connection.id,
                        status: 'unread'
                    });
                    console.log("notification", notification);
                    this.eventEmitter.emit('sendNotification', notification);
                }
                res.json({ message: 'Connection request sent successfully', connection });
            }
            catch (error) {
                console.error("Error sending connection request:", error);
                res.status(500).json({ error: 'Failed to send connection request' });
            }
        });
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const notifications = yield NotificationModel_1.NotificationModel.find({
                    recipient: userId,
                    status: { $ne: "read" }
                })
                    .sort({ createdAt: -1 })
                    .limit(20);
                console.log("Notifications fetched:", notifications);
                res.json(notifications);
            }
            catch (error) {
                console.error("Error fetching notifications:", error);
                res.status(500).json({ error: 'Failed to get notifications' });
            }
        });
    }
    getRecommendations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const recommendations = yield this.connectionUseCase.getRecommendations(userId);
                res.json(recommendations);
            }
            catch (error) {
                console.error("Error fetching recommendations:", error);
                res.status(500).json({ error: 'Failed to get recommendations' });
            }
        });
    }
};
exports.ConnectionController = ConnectionController;
exports.ConnectionController = ConnectionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ConnectionUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.UserManager)),
    __param(2, (0, inversify_1.inject)(types_1.default.NotificationEventEmitter)),
    __metadata("design:paramtypes", [ConnectionUseCase_1.ConnectionUseCase,
        UserManager_1.UserManager,
        events_1.EventEmitter])
], ConnectionController);
