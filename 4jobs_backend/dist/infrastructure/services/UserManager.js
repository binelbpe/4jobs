"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const inversify_1 = require("inversify");
let UserManager = class UserManager {
    constructor() {
        this.userConnections = new Map();
        this.typingUsers = new Map(); // conversationId -> Set of typing user IDs
    }
    addUser(userId, socketId, userType) {
        this.userConnections.set(userId, { socketId, userType });
        console.log(`${userType} ${userId} connected with socket ${socketId}`);
        // Handle video call connections if necessary
        // This can be expanded based on the requirements
        console.log('Current userConnections:', Array.from(this.userConnections.entries()));
    }
    removeUser(userId) {
        this.userConnections.delete(userId);
        console.log(`User ${userId} disconnected`);
        console.log('Current userConnections after disconnect:', Array.from(this.userConnections.entries()));
    }
    getUserSocketId(userId) {
        var _a;
        return (_a = this.userConnections.get(userId)) === null || _a === void 0 ? void 0 : _a.socketId;
    }
    getUserType(userId) {
        var _a;
        return (_a = this.userConnections.get(userId)) === null || _a === void 0 ? void 0 : _a.userType;
    }
    getAllConnections() {
        return Array.from(this.userConnections.entries());
    }
    isUserOnline(userId) {
        return this.userConnections.has(userId);
    }
    setUserTyping(userId, conversationId) {
        if (!this.typingUsers.has(conversationId)) {
            this.typingUsers.set(conversationId, new Set());
        }
        this.typingUsers.get(conversationId).add(userId);
    }
    setUserStoppedTyping(userId, conversationId) {
        if (this.typingUsers.has(conversationId)) {
            this.typingUsers.get(conversationId).delete(userId);
        }
    }
    getTypingUsers(conversationId) {
        return Array.from(this.typingUsers.get(conversationId) || []);
    }
};
exports.UserManager = UserManager;
exports.UserManager = UserManager = __decorate([
    (0, inversify_1.injectable)()
], UserManager);
