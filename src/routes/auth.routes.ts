import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import { createUserSchema, loginUserSchema } from '../validations/user.validation';

const router = express.Router();

router.post(
  '/register',
  validationMiddleware(createUserSchema, 'body'),
  register
);

router.post(
  '/login',
  validationMiddleware(loginUserSchema, 'body'),
  login
);

router.get('/profile', protect, getProfile);

export const authRoutes = router; 