import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { authRouter } from './infrastructure/webserver/express/routes/authRoutes';
import { adminRouter } from './infrastructure/webserver/express/routes/adminRoutes';
import { recruiterRouter } from './infrastructure/webserver/express/routes/RecruiterRoutes';


import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// dotenv.config(); 

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',
  methods:  ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

// Routes
app.use('/', authRouter);
app.use('/admin', adminRouter);
app.use('/recruiter', recruiterRouter);

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
