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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const inversify_1 = require("inversify");
const uuid_1 = require("uuid");
let S3Service = class S3Service {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID, "AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
        this.bucketName = process.env.S3_BUCKET_NAME;
        if (!this.bucketName) {
            console.warn("S3_BUCKET_NAME is not set in the process.envuration. Using default value '4jobs'.");
            this.bucketName = '4jobs';
        }
    }
    uploadFile(file, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `uploads/${(0, uuid_1.v4)()}-${file instanceof Buffer ? 'resume.pdf' : file.originalname}`;
            const uploadParams = {
                Bucket: this.bucketName,
                Key: key,
                Body: file instanceof Buffer ? file : file.buffer,
                ContentType: file instanceof Buffer ? (mimeType || 'application/pdf') : file.mimetype,
            };
            try {
                yield this.s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
                return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
            }
            catch (error) {
                console.error("Error uploading file to S3:", error);
                throw new Error("Failed to upload file to S3");
            }
        });
    }
    getFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extract the actual key if a full URL is provided
            const actualKey = key.includes('https://') ? key.split('/').slice(3).join('/') : key;
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: actualKey,
            });
            try {
                const response = yield this.s3Client.send(command);
                return Buffer.from(yield response.Body.transformToByteArray());
            }
            catch (error) {
                console.error("Error getting file from S3:", error);
                throw new Error("Failed to get file from S3");
            }
        });
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
