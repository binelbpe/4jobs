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
exports.NodemailerEmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class NodemailerEmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'binelbijupe@gmail.com',
                pass: process.env.SMTP_PASS || "slgg epir pxjq fojv",
            },
            logger: true,
            debug: true,
        });
    }
    sendWelcomeEmail(to, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.sendMail({
                    from: process.env.EMAIL_FROM || 'binelbijupe@gmail.com',
                    to,
                    subject: 'Welcome to 4JOBS',
                    text: `Hello ${name},\n\nWelcome to 4JOBS! We're excited to have you on board.`,
                    html: `<h1>Welcome, ${name}!</h1><p>We're excited to have you on board.</p>`,
                });
            }
            catch (error) {
                console.error('Error sending welcome email:', error);
                throw new Error('Could not send welcome email');
            }
        });
    }
    sendPasswordResetEmail(to, resetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to,
                    subject: 'Password Reset Request',
                    text: `Please use the following token to reset your password: ${resetToken}`,
                    html: `<p>Please use the following token to reset your password: <strong>${resetToken}</strong></p>`,
                });
            }
            catch (error) {
                console.error('Error sending password reset email:', error);
                throw new Error('Could not send password reset email');
            }
        });
    }
}
exports.NodemailerEmailService = NodemailerEmailService;
