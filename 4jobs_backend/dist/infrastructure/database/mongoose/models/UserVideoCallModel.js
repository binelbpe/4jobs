"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVideoCallModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserVideoCallSchema = new mongoose_1.Schema({
    callerId: { type: String, required: true },
    recipientId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'ended', 'initiating'],
        default: 'pending'
    },
    mediaStatus: {
        audio: { type: Boolean, default: true },
        video: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30000) } // 30 seconds timeout
});
// Add index for active calls cleanup
UserVideoCallSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.UserVideoCallModel = mongoose_1.default.model('UserVideoCall', UserVideoCallSchema);
