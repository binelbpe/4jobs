"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TwilioController_1 = require("../controllers/TwilioController");
const rateLimit_1 = require("../middlewares/rateLimit");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = express_1.default.Router();
router.get("/twilio-token", rateLimit_1.twilioRateLimit, TwilioController_1.getTwilioToken);
router.post("/rooms/:roomSid/end", rateLimit_1.twilioRateLimit, TwilioController_1.endRoom);
router.use(errorHandler_1.errorHandler);
exports.default = router;
