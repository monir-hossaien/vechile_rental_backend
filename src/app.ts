

import express, { Application, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import 'dotenv/config';

import cookieParser from 'cookie-parser';

import { rateLimit } from 'express-rate-limit';
import {connectDB} from "./config/db";


// routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import bookingRoutes from "./modules/booking/booking.routes";
import vehicleRoutes from "./modules/vehicle/vehicle.routes";


const app: Application = express();

const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(limiter);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// 1. Security Headers
app.use(cors(corsOptions));


// 3. Prevent HTTP Parameter Pollution
app.use(limiter);


// initiate database
connectDB();

// Routes
app.use('/api/v1', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', bookingRoutes);
app.use('/api/v1', vehicleRoutes);


app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: true,
    message: "Welcome to the HireMe - Job Posting Platform API!"
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: false,
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong!'
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    status: false,
    error: 'Route not found' 
  });
});

export default app;