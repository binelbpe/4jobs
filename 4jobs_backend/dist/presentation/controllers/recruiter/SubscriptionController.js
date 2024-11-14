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
exports.SubscriptionController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const UpdateSubscriptionUseCase_1 = require("../../../application/usecases/recruiter/UpdateSubscriptionUseCase");
let SubscriptionController = class SubscriptionController {
    constructor(recruiterRepository, updateSubscriptionUseCase) {
        this.recruiterRepository = recruiterRepository;
        this.updateSubscriptionUseCase = updateSubscriptionUseCase;
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, currency = "INR" } = req.body;
                const options = {
                    amount: amount * 100,
                    currency,
                    receipt: `order_${Date.now()}`,
                };
                const order = yield this.razorpay.orders.create(options);
                res.status(200).json(order);
            }
            catch (error) {
                console.error("Error creating Razorpay order:", error);
                res.status(500).json({ error: "Failed to create order" });
            }
        });
    }
    verifyPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
                const body = razorpay_order_id + "|" + razorpay_payment_id;
                const expectedSignature = crypto_1.default
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                    .update(body.toString())
                    .digest("hex");
                const isAuthentic = expectedSignature === razorpay_signature;
                if (isAuthentic) {
                    const { recruiterId, planDuration, amount } = req.body;
                    const subscriptionStartDate = new Date();
                    const expiryDate = this.calculateExpiryDate(planDuration, subscriptionStartDate);
                    const updatedRecruiter = yield this.recruiterRepository.updateSubscription(recruiterId, {
                        subscribed: true,
                        planDuration,
                        expiryDate,
                        subscriptionAmount: amount,
                        subscriptionStartDate,
                    });
                    if (updatedRecruiter) {
                        res.status(200).json({
                            message: "Payment successful and subscription updated",
                            recruiter: updatedRecruiter,
                        });
                    }
                    else {
                        res.status(404).json({ error: "Recruiter not found" });
                    }
                }
                else {
                    res.status(400).json({ error: "Invalid signature" });
                }
            }
            catch (error) {
                console.error("Error verifying payment:", error);
                res.status(500).json({ error: "Failed to verify payment" });
            }
        });
    }
    calculateExpiryDate(duration, startDate) {
        const expiryDate = new Date(startDate);
        switch (duration) {
            case "1 month":
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                break;
            case "3 months":
                expiryDate.setMonth(expiryDate.getMonth() + 3);
                break;
            case "1 year":
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                break;
        }
        return expiryDate;
    }
    updateSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { recruiterId } = req.params;
                const subscriptionData = req.body;
                const updatedRecruiter = yield this.updateSubscriptionUseCase.execute(recruiterId, subscriptionData);
                if (updatedRecruiter) {
                    res.status(200).json({
                        message: "Subscription updated successfully",
                        recruiter: updatedRecruiter,
                    });
                }
                else {
                    res.status(404).json({ error: "Recruiter not found" });
                }
            }
            catch (error) {
                console.error("Error updating subscription:", error);
                res.status(500).json({ error: "Failed to update subscription" });
            }
        });
    }
};
exports.SubscriptionController = SubscriptionController;
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IRecruiterRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.UpdateSubscriptionUseCase)),
    __metadata("design:paramtypes", [Object, UpdateSubscriptionUseCase_1.UpdateSubscriptionUseCase])
], SubscriptionController);
