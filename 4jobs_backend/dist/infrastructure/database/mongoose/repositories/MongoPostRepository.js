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
exports.MongoPostRepository = void 0;
const inversify_1 = require("inversify");
const PostModel_1 = __importDefault(require("../models/PostModel"));
const S3Service_1 = require("../../../services/S3Service");
const types_1 = __importDefault(require("../../../../types"));
let MongoPostRepository = class MongoPostRepository {
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    create(postData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, content, image, video } = postData;
            let imageUrl, videoUrl;
            if (image) {
                imageUrl = yield this.s3Service.uploadFile(image);
            }
            if (video) {
                videoUrl = yield this.s3Service.uploadFile(video);
            }
            const post = new PostModel_1.default({
                userId,
                content,
                imageUrl,
                videoUrl,
                likes: [],
                comments: [],
            });
            yield post.save();
            return this.populateUserInfo(post);
        });
    }
    findAll(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const totalCount = yield PostModel_1.default.countDocuments({ status: "active" });
            const totalPages = Math.ceil(totalCount / limit);
            const posts = yield PostModel_1.default.find({ status: "active" })
                .populate("userId", "name email profileImage bio")
                .populate({
                path: "comments.userId",
                select: "name profileImage",
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return {
                posts: posts.map((post) => this.populateUserInfo(post)),
                totalPages,
                currentPage: page,
            };
        });
    }
    findAllAdmin(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const totalCount = yield PostModel_1.default.countDocuments();
            const totalPages = Math.ceil(totalCount / limit);
            const posts = yield PostModel_1.default.find()
                .populate("userId", "name email profileImage bio _id")
                .populate({
                path: "comments.userId",
                select: "name profileImage _id",
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return {
                posts: posts.map((post) => this.populateUserInfo(post)),
                totalPages,
                currentPage: page,
            };
        });
    }
    findByUserId(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const totalCount = yield PostModel_1.default.countDocuments({ userId });
            const totalPages = Math.ceil(totalCount / limit);
            const posts = yield PostModel_1.default.find({ userId })
                .populate("userId", "name profileImage bio")
                .populate({
                path: "comments.userId",
                select: "name profileImage",
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return {
                posts: posts.map((post) => this.populateUserInfo(post)),
                totalPages,
                currentPage: page,
            };
        });
    }
    deletePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedPost = yield PostModel_1.default.findByIdAndDelete(id);
            return !!deletedPost;
        });
    }
    editPost(postId, userId, updatedPostData) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findOne({ _id: postId, userId }).populate("userId", "name profileImage bio");
            if (!post) {
                throw new Error("Post not found or user not authorized to edit this post");
            }
            Object.assign(post, updatedPostData);
            yield post.save();
            return this.populateUserInfo(post);
        });
    }
    toggleBlockStatus(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findById(postId).populate("userId", "name email profileImage bio");
            if (!post) {
                throw new Error("Post not found");
            }
            post.status = post.status === "active" ? "blocked" : "active";
            yield post.save();
            return this.populateUserInfo(post);
        });
    }
    populateUserInfo(post) {
        const postObj = post.toObject();
        return Object.assign(Object.assign({}, postObj), { user: post.userId
                ? {
                    _id: post.userId._id,
                    name: post.userId.name,
                    email: post.userId.email,
                    profileImage: post.userId.profileImage,
                    bio: post.userId.bio,
                }
                : undefined, comments: postObj.comments.map((comment) => (Object.assign(Object.assign({}, comment), { user: comment.userId
                    ? {
                        name: comment.userId.name,
                        profileImage: comment.userId.profileImage,
                    }
                    : undefined }))) });
    }
    findAllForAdmin(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const totalCount = yield PostModel_1.default.countDocuments();
            const totalPages = Math.ceil(totalCount / limit);
            const posts = yield PostModel_1.default.find()
                .populate("userId", "name email profileImage bio")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return {
                posts: posts.map((post) => this.populateUserInfo(post)),
                totalPages,
                currentPage: page,
            };
        });
    }
    addLike(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true }).populate("userId", "name email profileImage bio");
            return post ? this.populateUserInfo(post) : null;
        });
    }
    removeLike(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true }).populate("userId", "name email profileImage bio");
            return post ? this.populateUserInfo(post) : null;
        });
    }
    addComment(postId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findByIdAndUpdate(postId, { $push: { comments: comment } }, { new: true }).populate("userId", "name email profileImage bio");
            return post ? this.populateUserInfo(post) : null;
        });
    }
    deleteComment(postId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findByIdAndUpdate(postId, { $pull: { comments: { _id: commentId } } }, { new: true }).populate("userId", "name email profileImage bio");
            return post ? this.populateUserInfo(post) : null;
        });
    }
};
exports.MongoPostRepository = MongoPostRepository;
exports.MongoPostRepository = MongoPostRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.S3Service)),
    __metadata("design:paramtypes", [S3Service_1.S3Service])
], MongoPostRepository);
