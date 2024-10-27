import crypto from 'crypto';
import { NodemailerEmailService } from './NodemailerEmailService'; 

const otpStore: { [key: string]: { otp: string; timestamp: number } } = {}; 

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
      const subject = 'Your OTP for 4JOBS';
      const text = `Your OTP is: ${otp}`;
      const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;
      
      await this.emailService.sendEmail(email, subject, text, html);
      console.log(`Sent OTP ${otp} to email ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP via email');
    }
  }

  storeOtp(email: string, otp: string): void {
    otpStore[email] = { otp, timestamp: Date.now() };
    setTimeout(() => delete otpStore[email], this.otpExpiry); 
  }

  async verifyOtp(email: string, otp: string): Promise<boolean | string> {
    const storedData = otpStore[email];
    if (!storedData) {
      return "OTP has expired or does not exist"; 
    }

    const { otp: storedOtp, timestamp } = storedData;
    const isExpired = Date.now() - timestamp > this.otpExpiry; 

    if (isExpired) {
      delete otpStore[email]; 
      return "OTP has expired"; 
    }

    const isValid = storedOtp === otp;
    if (isValid) {
      delete otpStore[email];
    }
    return isValid; 
  }

  async sendForgotPasswordOtp(email: string, otp: string): Promise<void> {
    const subject = "Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}. This OTP is valid for 30 seconds.`;
    const html = `<p>Your OTP for password reset is: <strong>${otp}</strong>. This OTP is valid for 30 seconds.</p>`;
    
    console.log(`otp: ${otp} email ${email}`);
    await this.emailService.sendEmail(email, subject, text, html);
    
    this.storeOtp(email, otp); 
  }
}
