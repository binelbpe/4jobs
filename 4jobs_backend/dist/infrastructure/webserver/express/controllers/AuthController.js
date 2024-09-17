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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const LoginUseCase_1 = require("../../../../core/usecases/auth/LoginUseCase");
const SignupUserUseCase_1 = require("../../../../core/usecases/auth/SignupUserUseCase");
const MongoUserRepository_1 = require("../../../database/mongoose/repositories/MongoUserRepository");
const JwtAuthService_1 = require("../../../services/JwtAuthService");
const OtpService_1 = require("../../../services/OtpService");
const NodemailerEmailService_1 = require("../../../services/NodemailerEmailService");
const GoogleAuthService_1 = require("../../../services/GoogleAuthService");
const jwtSecret = process.env.JWT_SECRET || 'secret_1';
if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
}
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const authService = new JwtAuthService_1.JwtAuthService(jwtSecret);
const emailService = new NodemailerEmailService_1.NodemailerEmailService();
const otpService = new OtpService_1.OtpService(33 * 1000, emailService);
const tempUserStore = {};
const googleAuthService = new GoogleAuthService_1.GoogleAuthService();
class AuthController {
    static sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ error: 'Email is required' });
                }
                const otp = otpService.generateOtp();
                otpService.storeOtp(email, otp);
                yield otpService.sendOtp(email, otp);
                res.status(200).json({ message: 'OTP sent to email.' });
            }
            catch (error) {
                console.error('Error sending OTP:', error);
                res.status(500).json({ error: 'Failed to send OTP' });
            }
        });
    }
    static signupUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name } = req.body;
                // Validate input
                if (!email || !password || !name) {
                    return res.status(400).json({ error: 'Email, password, and name are required' });
                }
                const existingUser = yield userRepository.findByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ error: 'User already exists' });
                }
                tempUserStore[email] = { email, password, name };
                const otp = otpService.generateOtp();
                otpService.storeOtp(email, otp);
                yield otpService.sendOtp(email, otp);
                res.status(200).json({ message: 'OTP sent to email. Please verify OTP to complete signup.' });
            }
            catch (error) {
                console.error('Error during user signup:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    static verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                // Verify OTP
                const isValid = yield otpService.verifyOtp(email, otp);
                if (isValid) {
                    const userData = tempUserStore[email];
                    if (!userData) {
                        return res.status(400).json({ error: 'User data not found. Please sign up again.' });
                    }
                    const signupUseCase = new SignupUserUseCase_1.SignupUserUseCase(userRepository, authService);
                    const result = yield signupUseCase.execute(userData.email, userData.password, userData.name);
                    delete tempUserStore[email];
                    res.status(201).json(result);
                }
                else {
                    res.status(400).json({ error: 'Invalid OTP' });
                }
            }
            catch (error) {
                console.error('Error verifying OTP:', error);
                res.status(500).json({ error: 'Failed to verify OTP' });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }
                const loginUseCase = new LoginUseCase_1.LoginUseCase(userRepository, authService);
                const result = yield loginUseCase.execute(email, password);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error during login:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    static googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Request body:', req.body);
                const tokenId = req.body.googleToken;
                if (!tokenId) {
                    return res.status(400).json({ error: 'ID Token is required' });
                }
                const payload = yield googleAuthService.verifyToken(tokenId);
                const email = payload === null || payload === void 0 ? void 0 : payload.email;
                const name = (payload === null || payload === void 0 ? void 0 : payload.name) || 'Google User';
                if (!email) {
                    return res.status(400).json({ error: 'Google authentication failed. No email found in token.' });
                }
                let user = yield userRepository.findByEmail(email);
                if (user) {
                    const loginUseCase = new LoginUseCase_1.LoginUseCase(userRepository, authService);
                    const result = yield loginUseCase.execute(email, '', true);
                    return res.status(200).json(result);
                }
                else {
                    user = yield userRepository.create({
                        email,
                        password: '',
                        name,
                        role: 'user',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isAdmin: false,
                    });
                    const token = authService.generateToken(user);
                    return res.status(201).json({ user, token });
                }
            }
            catch (error) {
                console.error('Error during Google authentication:', error);
                return res.status(500).json({ error: 'Failed to authenticate with Google' });
            }
        });
    }
}
exports.AuthController = AuthController;
