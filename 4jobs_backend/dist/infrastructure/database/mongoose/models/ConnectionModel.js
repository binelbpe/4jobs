"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConnectionSchema = new mongoose_1.default.Schema({
    requester: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});
exports.ConnectionModel = mongoose_1.default.model('Connection', ConnectionSchema);
