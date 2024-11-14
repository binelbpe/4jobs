import cors from 'cors';

const corsMiddleware = cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  credentials: true,
  exposedHeaders: ["Content-Length", "Content-Type", "x-csrf-token"],
});

export default corsMiddleware; 