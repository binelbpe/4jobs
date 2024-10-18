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
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String },
    name: { type: String, required: true },
    phone: { type: Number },
    role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },
    isAdmin: { type: Boolean, default: false },
    bio: { type: String },
    about: { type: String },
    experiences: [{
            id: { type: String, required: true },
            title: { type: String, required: true },
            company: { type: String, required: true },
            startDate: { type: String, required: true },
            endDate: { type: String },
            currentlyWorking: { type: Boolean, default: false },
            description: { type: String },
        }],
    projects: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            description: { type: String, required: true },
            link: { type: String },
            imageUrl: { type: String },
        }],
    certificates: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            issuingOrganization: { type: String, required: true },
            dateOfIssue: { type: Date, required: true },
            imageUrl: { type: String },
        }],
    skills: [{ type: String }],
    profileImage: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    resume: { type: String },
    appliedJobs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'JobPost' }],
    isBlocked: { type: Boolean, default: false },
}, {
    timestamps: true
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
