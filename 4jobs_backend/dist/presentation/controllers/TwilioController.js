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
exports.endRoom = exports.getTwilioToken = void 0;
const twilio_1 = __importDefault(require("twilio"));
const uuid_1 = require("uuid");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
const getTwilioToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!accountSid || !authToken) {
            console.error('Missing Twilio credentials');
            return res.status(500).json({ error: 'Twilio configuration error' });
        }
        // Add rate limiting check here
        const roomName = `room-${(0, uuid_1.v4)()}`;
        const AccessToken = twilio_1.default.jwt.AccessToken;
        const VideoGrant = AccessToken.VideoGrant;
        const videoGrant = new VideoGrant({ room: roomName });
        const token = new AccessToken(accountSid, process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, {
            identity: req.query.identity || 'user',
            ttl: 14400 // 4 hours token expiry
        });
        token.addGrant(videoGrant);
        // Get Network Traversal Service token with longer TTL
        const ntsToken = yield client.tokens.create({
            ttl: 14400 // 4 hours
        });
        // Format ICE servers with both TURN and STUN
        const iceServers = ((_a = ntsToken.iceServers) === null || _a === void 0 ? void 0 : _a.map(server => ({
            urls: server.urls,
            username: server.username || '',
            credential: server.credential || ''
        }))) || [];
        // Add additional STUN servers for redundancy
        iceServers.push({
            urls: 'stun:global.stun.twilio.com:3478',
            username: '',
            credential: ''
        }, {
            urls: 'stun:stun1.l.google.com:19302',
            username: '',
            credential: ''
        });
        res.json({
            username: ntsToken.username,
            ice_servers: iceServers,
            ttl: ntsToken.ttl.toString(),
            token: token.toJwt(),
            roomName: roomName
        });
    }
    catch (error) {
        console.error('Error generating Twilio token:', error);
        res.status(500).json({
            error: 'Failed to generate token',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getTwilioToken = getTwilioToken;
const endRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomSid } = req.params;
        yield client.video.v1.rooms(roomSid).update({ status: "completed" });
        res.json({ message: "Room ended successfully" });
    }
    catch (error) {
        console.error("Error ending room:", error);
        res.status(500).json({ error: "Failed to end room" });
    }
});
exports.endRoom = endRoom;
