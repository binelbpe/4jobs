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
    }
    addUser(userId, socketId) {
        this.userConnections.set(userId, socketId);
        console.log(`User ${userId} connected with socket ${socketId}`);
        console.log('Current userConnections:', Array.from(this.userConnections.entries()));
    }
    removeUser(userId) {
        this.userConnections.delete(userId);
        console.log(`User ${userId} disconnected`);
        console.log('Current userConnections after disconnect:', Array.from(this.userConnections.entries()));
    }
    getUserSocketId(userId) {
        return this.userConnections.get(userId);
    }
    getAllConnections() {
        return Array.from(this.userConnections.entries());
    }
    isUserOnline(userId) {
        return this.userConnections.has(userId);
    }
};
exports.UserManager = UserManager;
exports.UserManager = UserManager = __decorate([
    (0, inversify_1.injectable)()
], UserManager);
