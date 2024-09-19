import crypto from 'crypto';
import { NodemailerEmailService } from './NodemailerEmailService'; 

const otpStore: { [key: string]: string } = {};

export class OtpService {
  private otpExpiry: number;
  private emailService: NodemailerEmailService; 

  constructor(otpExpiry: number, emailService: NodemailerEmailService) {
    this.otpExpiry = otpExpiry;
    this.emailService = emailService;
  }

  generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString(); 
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    try {
      await this.emailService.sendWelcomeEmail(email, `Your OTP: ${otp}`);
      console.log(`Sending OTP ${otp} to email ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP via email');
    }
  }

  storeOtp(email: string, otp: string): void {
    otpStore[email] = otp;
    setTimeout(() => delete otpStore[email], this.otpExpiry); 
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = otpStore[email];
    return storedOtp === otp;
  }
}
