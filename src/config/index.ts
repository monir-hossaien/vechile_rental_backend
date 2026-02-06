
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  CONNECTION_STRING: process.env.CONNECTION_STRING || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 8000
};