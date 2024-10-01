import 'reflect-metadata';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { container } from './infrastructure/container';
import TYPES from './types';
import { setupSocketServer } from './infrastructure/services/socketServer';

// Import routers
import { authRouter } from './presentation/routes/authRoutes';
import { adminRouter } from './presentation/routes/adminRoutes';
import { recruiterRouter } from './presentation/routes/RecruiterRoutes';

// Import middleware
import { validateRequest } from './presentation/middlewares/validateRequest';
import { errorHandler } from './presentation/middlewares/errorHandler';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

const { io, userManager, eventEmitter } = setupSocketServer(server, container);

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes setup
app.use('/', authRouter);
app.use('/admin', adminRouter);
app.use('/recruiter', recruiterRouter);

// Validation and error handling middleware
app.use(validateRequest);
app.use(errorHandler);

app.use((req: any, res, next) => {
  req.container = container;
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { io, userManager, eventEmitter };