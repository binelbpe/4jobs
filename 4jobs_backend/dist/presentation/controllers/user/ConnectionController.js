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
                const connection = yield this.connectionUseCase.sendConnectionRequest(senderId, recipientId);
                yield this.createAndEmitNotification("connection_request", senderId, recipientId, connection.id);
                res.json({ message: "Connection request sent successfully", connection });
            }
            catch (error) {
                this.handleError(res, error, "Failed to send connection request");
            }
        });
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const notifications = yield NotificationModel_1.NotificationModel.find({
                    recipient: userId,
                    status: { $ne: "read" },
                })
                    .sort({ createdAt: -1 })
                    .limit(20);
                res.json(notifications);
            }
            catch (error) {
                this.handleError(res, error, "Failed to get notifications");
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
                this.handleError(res, error, "Failed to get recommendations");
            }
        });
    }
    getConnectionProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const profile = yield this.connectionUseCase.getConnectionProfile(userId);
                res.json(profile);
            }
            catch (error) {
                this.handleError(res, error, "Failed to get connection profile");
            }
        });
    }
    getConnectionRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const requests = yield this.connectionUseCase.getConnectionRequests(userId);
                res.json(requests);
            }
            catch (error) {
                this.handleError(res, error, "Failed to get connection requests");
            }
        });
    }
    acceptConnectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { connectionId } = req.params;
                const { userId } = req.body;
                const connection = yield this.connectionUseCase.acceptConnectionRequest(connectionId);
                yield this.createAndEmitNotification("connection_accepted", userId, connection.requesterId, connection.id);
                res.json({
                    message: "Connection request accepted successfully",
                    connection,
                });
            }
            catch (error) {
                this.handleError(res, error, "Failed to accept connection request");
            }
        });
    }
    rejectConnectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { connectionId } = req.params;
                const { userId } = req.body;
                const connection = yield this.connectionUseCase.rejectConnectionRequest(connectionId);
                res.json({
                    message: "Connection request rejected successfully",
                    connection,
                });
            }
            catch (error) {
                this.handleError(res, error, "Failed to reject connection request");
            }
        });
    }
    createAndEmitNotification(type, senderId, recipientId, relatedItemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sender = yield UserModel_1.UserModel.findById(senderId);
            if (sender) {
                const message = type === "connection_request"
                    ? `${sender.name} sent you a connection request`
                    : `${sender.name} accepted your connection request`;
                const notification = yield NotificationModel_1.NotificationModel.create({
                    type,
                    message,
                    sender: senderId,
                    recipient: recipientId,
                    relatedItem: relatedItemId,
                    status: "unread",
                });
                this.eventEmitter.emit("sendNotification", notification);
            }
        });
    }
    getConnections(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const result = yield this.connectionUseCase.getConnections(userId);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to fetch connections" });
            }
        });
    }
    searchConnections(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const query = req.query.query;
                const result = yield this.connectionUseCase.searchConnections(userId, query);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to search connections" });
            }
        });
    }
    searchMessageConnections(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const query = req.query.query;
                const results = yield this.connectionUseCase.searchMessageConnections(userId, query);
                res.json(results);
            }
            catch (error) {
                this.handleError(res, error, "Failed to search message connections");
            }
        });
    }
    handleError(res, error, message) {
        console.error(`Error: ${message}`, error);
        res.status(500).json({ error: message });
    }
    deleteConnection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, connectionId } = req.params;
                const deletedConnection = yield this.connectionUseCase.deleteConnection(userId, connectionId);
                if (!deletedConnection) {
                    res.status(404).json({ message: 'Connection not found' });
                    return;
                }
                res.json({ message: 'Connection removed successfully', deletedConnection });
            }
            catch (error) {
                this.handleError(res, error, 'Failed to remove connection');
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
