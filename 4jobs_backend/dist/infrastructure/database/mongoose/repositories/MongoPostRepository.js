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
            return post.toObject();
        });
    }
    findAll(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const posts = yield PostModel_1.default.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return posts.map((post) => post.toObject());
        });
    }
    findByUserId(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("mongo limit page", limit, page);
            console.log("userId", userId);
            const skip = (page - 1) * limit;
            const posts = yield PostModel_1.default.find({ userId: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            console.log("posts", posts);
            return posts;
        });
    }
    deletePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedPost = yield PostModel_1.default.findByIdAndDelete(id);
            console.log("deletedPost", deletedPost);
            return deletedPost ? true : false;
        });
    }
    editPost(postId, userId, updatedPostData) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findOne({ _id: postId, userId: userId });
            if (!post) {
                throw new Error('Post not found or user not authorized to edit this post');
            }
            Object.assign(post, updatedPostData);
            yield post.save();
            return post.toObject();
        });
    }
};
exports.MongoPostRepository = MongoPostRepository;
exports.MongoPostRepository = MongoPostRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.S3Service)),
    __metadata("design:paramtypes", [S3Service_1.S3Service])
], MongoPostRepository);
