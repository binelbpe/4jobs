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
exports.PostController = void 0;
const inversify_1 = require("inversify");
const CreatePostUseCase_1 = require("../../../application/usecases/user/post/CreatePostUseCase");
const GetAllPostsUseCase_1 = require("../../../application/usecases/user/post/GetAllPostsUseCase");
const GetUserPostsUseCase_1 = require("../../../application/usecases/user/post/GetUserPostsUseCase");
const DeletePostUseCase_1 = require("../../../application/usecases/user/post/DeletePostUseCase");
const EditPostUseCase_1 = require("../../../application/usecases/user/post/EditPostUseCase");
const LikePostUseCase_1 = require("../../../application/usecases/user/post/LikePostUseCase");
const DislikePostUseCase_1 = require("../../../application/usecases/user/post/DislikePostUseCase");
const CommentOnPostUseCase_1 = require("../../../application/usecases/user/post/CommentOnPostUseCase");
const types_1 = __importDefault(require("../../../types"));
let PostController = class PostController {
    constructor(createPostUseCase, getAllPostsUseCase, getUserPostsUseCase, deletePostUseCase, EditPostUseCase, likePostUseCase, dislikePostUseCase, commentOnPostUseCase) {
        this.createPostUseCase = createPostUseCase;
        this.getAllPostsUseCase = getAllPostsUseCase;
        this.getUserPostsUseCase = getUserPostsUseCase;
        this.deletePostUseCase = deletePostUseCase;
        this.EditPostUseCase = EditPostUseCase;
        this.likePostUseCase = likePostUseCase;
        this.dislikePostUseCase = dislikePostUseCase;
        this.commentOnPostUseCase = commentOnPostUseCase;
    }
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const { userId } = req.params;
                const { content } = req.body;
                const image = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a["image"]) === null || _b === void 0 ? void 0 : _b[0];
                const video = (_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c["video"]) === null || _d === void 0 ? void 0 : _d[0];
                const post = yield this.createPostUseCase.execute({
                    userId,
                    content,
                    image,
                    video,
                });
                res.status(201).json(post);
            }
            catch (error) {
                console.error("Error creating post:", error);
                res
                    .status(500)
                    .json({ error: "An error occurred while creating the post" });
            }
        });
    }
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const posts = yield this.getAllPostsUseCase.execute(page, limit);
                res.status(200).json(posts);
            }
            catch (error) {
                console.error("Error fetching posts:", error);
                res.status(500).json({ error: "An error occurred while fetching posts" });
            }
        });
    }
    getPostsForUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const posts = yield this.getUserPostsUseCase.findByUserIdPosts(userId, page, limit);
                res.status(200).json(posts);
            }
            catch (error) {
                console.error("Error fetching posts:", error);
                res.status(500).json({ error: "An error occurred while fetching posts" });
            }
        });
    }
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const posts = yield this.deletePostUseCase.execute(userId);
                res.status(200).json({ message: "success" });
            }
            catch (error) {
                console.error("Error deleting post:", error);
                res.status(500).json({ error: "An error occurred while deleting post" });
            }
        });
    }
    editPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = req.params.postId;
                const userId = req.params.userId;
                const updatedPostData = req.body;
                const updatedPost = yield this.EditPostUseCase.editPost(postId, userId, updatedPostData);
                res.status(200).json(updatedPost);
            }
            catch (error) {
                console.error("Error editing post:", error);
                res
                    .status(500)
                    .json({ error: "An error occurred while editing the post" });
            }
        });
    }
    likePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.params;
                const { userId } = req.body;
                const updatedPost = yield this.likePostUseCase.execute(postId, userId);
                res.status(200).json(updatedPost);
            }
            catch (error) {
                console.error("Error liking post:", error);
                res
                    .status(500)
                    .json({ error: "An error occurred while liking the post" });
            }
        });
    }
    dislikePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.params;
                const { userId } = req.body;
                const updatedPost = yield this.dislikePostUseCase.execute(postId, userId);
                res.status(200).json(updatedPost);
            }
            catch (error) {
                console.error("Error disliking post:", error);
                res
                    .status(500)
                    .json({ error: "An error occurred while disliking the post" });
            }
        });
    }
    commentOnPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.params;
                const { userId, content } = req.body;
                const updatedPost = yield this.commentOnPostUseCase.execute(postId, userId, content);
                res.status(200).json(updatedPost);
            }
            catch (error) {
                console.error("Error commenting on post:", error);
                res
                    .status(500)
                    .json({ error: "An error occurred while commenting on the post" });
            }
        });
    }
    deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId, commentId } = req.params;
                const updatedPost = yield this.commentOnPostUseCase.deleteComment(postId, commentId);
                if (updatedPost) {
                    res.status(200).json(updatedPost);
                }
                else {
                    res.status(404).json({ error: "Post or comment not found" });
                }
            }
            catch (error) {
                console.error("Error deleting comment:", error);
                res
                    .status(500)
                    .json({ error: "An error occurred while deleting the comment" });
            }
        });
    }
};
exports.PostController = PostController;
exports.PostController = PostController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.CreatePostUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.GetAllPostsUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.default.GetUserPostsUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.default.DeletePostUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.default.EditPostUseCase)),
    __param(5, (0, inversify_1.inject)(types_1.default.LikePostUseCase)),
    __param(6, (0, inversify_1.inject)(types_1.default.DislikePostUseCase)),
    __param(7, (0, inversify_1.inject)(types_1.default.CommentOnPostUseCase)),
    __metadata("design:paramtypes", [CreatePostUseCase_1.CreatePostUseCase,
        GetAllPostsUseCase_1.GetAllPostsUseCase,
        GetUserPostsUseCase_1.GetUserPostsUseCase,
        DeletePostUseCase_1.DeletePostUseCase,
        EditPostUseCase_1.EditPostUseCase,
        LikePostUseCase_1.LikePostUseCase,
        DislikePostUseCase_1.DislikePostUseCase,
        CommentOnPostUseCase_1.CommentOnPostUseCase])
], PostController);
