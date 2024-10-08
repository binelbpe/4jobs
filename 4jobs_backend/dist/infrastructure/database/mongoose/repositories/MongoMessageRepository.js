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
exports.MessageRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = __importDefault(require("mongoose"));
const MessageModel_1 = require("../models/MessageModel");
let MessageRepository = class MessageRepository {
    constructor() {
        this.mapToEntity = this.mapToEntity.bind(this);
        this.mapUserToEntity = this.mapUserToEntity.bind(this);
    }
    create(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new MessageModel_1.MessageModel(Object.assign(Object.assign({}, message), { sender: typeof message.sender === "string" ? new mongoose_1.default.Types.ObjectId(message.sender) : message.sender, recipient: typeof message.recipient === "string" ? new mongoose_1.default.Types.ObjectId(message.recipient) : message.recipient, status: message.status || 'sent' }));
            yield newMessage.save();
            return this.mapToEntity(yield newMessage.populate("sender recipient"));
        });
    }
    findById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield MessageModel_1.MessageModel.findById(messageId)
                .populate("sender", "name email profileImage")
                .populate("recipient", "name email profileImage");
            return message ? this.mapToEntity(message) : null;
        });
    }
    findByUsers(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield MessageModel_1.MessageModel.find({
                $or: [
                    { sender: userId1, recipient: userId2 },
                    { sender: userId2, recipient: userId1 },
                ],
            })
                .sort({ createdAt: 1 })
                .populate("sender", "name email profileImage")
                .populate("recipient", "name email profileImage");
            return messages.map(this.mapToEntity);
        });
    }
    markAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield MessageModel_1.MessageModel.findByIdAndUpdate(messageId, { isRead: true, status: 'read' });
        });
    }
    updateStatus(messageId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield MessageModel_1.MessageModel.findByIdAndUpdate(messageId, { status });
        });
    }
    getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (!mongoose.Types.ObjectId.isValid(userId)) {
            //     throw new Error("Invalid user ID format");
            // }
            return MessageModel_1.MessageModel.countDocuments({ recipient: userId, isRead: false });
        });
    }
    searchMessages(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield MessageModel_1.MessageModel.find({
                $or: [{ sender: userId }, { recipient: userId }],
                content: { $regex: query, $options: "i" },
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate("sender", "name email profileImage")
                .populate("recipient", "name email profileImage");
            return messages.map(this.mapToEntity);
        });
    }
    getMessageConnections(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connections = yield MessageModel_1.MessageModel.aggregate([
                {
                    $match: {
                        $or: [
                            { sender: new mongoose_1.default.Types.ObjectId(userId) },
                            { recipient: new mongoose_1.default.Types.ObjectId(userId) },
                        ],
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$sender", new mongoose_1.default.Types.ObjectId(userId)] },
                                "$recipient",
                                "$sender",
                            ],
                        },
                        lastMessage: { $first: "$$ROOT" },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                {
                    $unwind: "$user",
                },
                {
                    $project: {
                        user: {
                            _id: "$user._id",
                            name: "$user.name",
                            email: "$user.email",
                            profileImage: "$user.profileImage",
                        },
                        lastMessage: 1,
                    },
                },
            ]);
            console.log("ivide kweriii", connections);
            return connections.map((conn) => ({
                user: conn.user._id.toString(),
                lastMessage: this.mapToEntity(conn.lastMessage),
            }));
        });
    }
    mapToEntity(message) {
        return {
            id: message._id.toString(),
            sender: message.sender ? this.mapUserToEntity(message.sender) : message.sender,
            recipient: message.recipient ? this.mapUserToEntity(message.recipient) : message.recipient,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            status: message.status,
        };
    }
    mapUserToEntity(user) {
        if (!user) {
            throw new Error("User object is undefined or null");
        }
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            profileImage: user.profileImage,
            password: "",
            role: user.role || "user",
            isAdmin: user.isAdmin || false,
            phone: user.phone,
            appliedJobs: user.appliedJobs || [],
            bio: user.bio,
            about: user.about,
            experiences: user.experiences || [],
            projects: user.projects || [],
            certificates: user.certificates || [],
            skills: user.skills || [],
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            resume: user.resume,
            isBlocked: user.isBlocked || false,
        };
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], MessageRepository);
