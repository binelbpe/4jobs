import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IRecruiterRepository } from "../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import Razorpay from "razorpay";
import crypto from "crypto";
import { UpdateSubscriptionUseCase } from "../../../application/usecases/recruiter/UpdateSubscriptionUseCase";

@injectable()
export class SubscriptionController {
  private razorpay: Razorpay;

  constructor(
    @inject(TYPES.IRecruiterRepository)
    private recruiterRepository: IRecruiterRepository,
    @inject(TYPES.UpdateSubscriptionUseCase)
    private updateSubscriptionUseCase: UpdateSubscriptionUseCase
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID !,
      key_secret: process.env.RAZORPAY_KEY_SECRET !,
    });
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { amount, currency = "INR" } = req.body;

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `order_${Date.now()}`,
      };

      const order = await this.razorpay.orders.create(options);
      res.status(200).json(order);
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  }

  async verifyPayment(req: Request, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Payment is successful, update the recruiter's subscription
        const { recruiterId, planDuration, amount } = req.body;
        const subscriptionStartDate = new Date(); // Set the start date to now
        const expiryDate = this.calculateExpiryDate(planDuration, subscriptionStartDate);

        const updatedRecruiter = await this.recruiterRepository.updateSubscription(recruiterId, {
          subscribed: true,
          planDuration,
          expiryDate,
          subscriptionAmount: amount,
          subscriptionStartDate, // Add this new field
        });

        if (updatedRecruiter) {
          res.status(200).json({
            message: "Payment successful and subscription updated",
            recruiter: updatedRecruiter,
          });
        } else {
          res.status(404).json({ error: "Recruiter not found" });
        }
      } else {
        res.status(400).json({ error: "Invalid signature" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  }

  private calculateExpiryDate(duration: string, startDate: Date): Date {
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

  async updateSubscription(req: Request, res: Response) {
    try {
      const { recruiterId } = req.params;
      const subscriptionData = req.body;

      const updatedRecruiter = await this.updateSubscriptionUseCase.execute(recruiterId, subscriptionData);

      if (updatedRecruiter) {
        res.status(200).json({
          message: "Subscription updated successfully",
          recruiter: updatedRecruiter,
        });
      } else {
        res.status(404).json({ error: "Recruiter not found" });
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  }
}
