"use strict";
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
const express_1 = __importDefault(require("express"));
const inversify_config_1 = require("../inversify.config");
const types_1 = require("../types");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const createPostUseCase = inversify_config_1.container.get(types_1.TYPES.CreatePostUseCase);
        const { userId, content } = req.body;
        const image = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a['image']) === null || _b === void 0 ? void 0 : _b[0];
        const video = (_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c['video']) === null || _d === void 0 ? void 0 : _d[0];
        const post = yield createPostUseCase.execute(userId, content, image, video);
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllPostsUseCase = inversify_config_1.container.get(types_1.TYPES.GetAllPostsUseCase);
        const posts = yield getAllPostsUseCase.execute();
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching posts' });
    }
}));
router.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getUserPostsUseCase = inversify_config_1.container.get(types_1.TYPES.GetUserPostsUseCase);
        const posts = yield getUserPostsUseCase.execute(req.params.userId);
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching user posts' });
    }
}));
router.delete('/:postId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletePostUseCase = inversify_config_1.container.get(types_1.TYPES.DeletePostUseCase);
        const result = yield deletePostUseCase.execute(req.params.postId);
        if (result) {
            res.status(204).send();
        }
        else {
            res.status(404).json({ error: 'Post not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting post' });
    }
}));
router.post('/:postId/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const likePostUseCase = inversify_config_1.container.get(types_1.TYPES.LikePostUseCase);
        const post = yield likePostUseCase.execute(req.params.postId, req.body.userId);
        if (post) {
            res.json(post);
        }
        else {
            res.status(404).json({ error: 'Post not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error liking post' });
    }
}));
router.post('/:postId/unlike', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unlikePostUseCase = inversify_config_1.container.get(types_1.TYPES.UnlikePostUseCase);
        const post = yield unlikePostUseCase.execute(req.params.postId, req.body.userId);
        if (post) {
            res.json(post);
        }
        else {
            res.status(404).json({ error: 'Post not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error unliking post' });
    }
}));
router.post('/:postId/comment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commentOnPostUseCase = inversify_config_1.container.get(types_1.TYPES.CommentOnPostUseCase);
        const post = yield commentOnPostUseCase.execute(req.params.postId, req.body.userId, req.body.content);
        if (post) {
            res.json(post);
        }
        else {
            res.status(404).json({ error: 'Post not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error commenting on post' });
    }
}));
router.delete('/:postId/comment/:commentId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteCommentUseCase = inversify_config_1.container.get(types_1.TYPES.DeleteCommentUseCase);
        const post = yield deleteCommentUseCase.execute(req.params.postId, req.params.commentId);
        if (post) {
            res.json(post);
        }
        else {
            res.status(404).json({ error: 'Post or comment not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting comment' });
    }
}));
exports.default = router;
