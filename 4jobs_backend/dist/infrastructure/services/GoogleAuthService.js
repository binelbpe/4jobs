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
exports.GoogleAuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
class GoogleAuthService {
    constructor() {
        this.client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');
    }
    verifyToken(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tokenId) {
                throw new Error('ID Token is required');
            }
            try {
                const ticket = yield this.client.verifyIdToken({
                    idToken: tokenId,
                    audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
                });
                const payload = ticket.getPayload();
                console.log('Payload:', payload);
                return payload;
            }
            catch (error) {
                console.error('Error verifying ID Token:', error);
                throw new Error('Invalid ID Token');
            }
        });
    }
}
exports.GoogleAuthService = GoogleAuthService;
