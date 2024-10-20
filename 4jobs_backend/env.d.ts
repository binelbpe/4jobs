declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      EMAIL_FROM: string;
      JWT_SECRET: string;
      DATABASE_URL: string;
      PORT: string;
      GOOGLE_CLIENT_ID: string;
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      S3_BUCKET_NAME: string;
      RAZORPAY_KEY_ID: string;
      RAZORPAY_SECRET: string;
      CLIENT_URL:string;
    }
  }
}

export {};
