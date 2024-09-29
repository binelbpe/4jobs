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
const index_1 = require("../../config/index");
let S3Service = class S3Service {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: index_1.config.aws.region,
            credentials: {
                accessKeyId: index_1.config.aws.accessKeyId,
                secretAccessKey: index_1.config.aws.secretAccessKey,
            },
        });
    }
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: index_1.config.aws.s3BucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            });
            yield this.s3Client.send(command);
            return `https://${index_1.config.aws.s3BucketName}.s3.${index_1.config.aws.region}.amazonaws.com/${fileName}`;
        });
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
