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
exports.NodemailerEmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const inversify_1 = require("inversify");
let NodemailerEmailService = class NodemailerEmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 120000,
            socketTimeout: 120000,
            logger: true,
            debug: process.env.NODE_ENV === 'development',
        });
    }
    sendEmail(to, subject, text, html) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to,
                    subject,
                    text,
                    html,
                });
            }
            catch (error) {
                console.error('Error sending email:', error);
                throw new Error('Could not send email');
            }
        });
    }
    sendWelcomeEmail(to, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = 'Welcome to 4JOBS';
            const text = `Hello ${name},\n\nWelcome to 4JOBS! We're excited to have you on board.`;
            const html = `<h1>Welcome, ${name}!</h1><p>We're excited to have you on board.</p>`;
            yield this.sendEmail(to, subject, text, html);
        });
    }
    sendPasswordResetEmail(to, resetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = 'Password Reset Request';
            const text = `Please use the following token to reset your password: ${resetToken}`;
            const html = `<p>Please use the following token to reset your password: <strong>${resetToken}</strong></p>`;
            yield this.sendEmail(to, subject, text, html);
        });
    }
};
exports.NodemailerEmailService = NodemailerEmailService;
exports.NodemailerEmailService = NodemailerEmailService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], NodemailerEmailService);
