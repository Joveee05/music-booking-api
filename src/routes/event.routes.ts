import express from 'express';
import {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import { createEventSchema, updateEventSchema } from '../validations/event.validation';
import { UserRole } from '../types/custom.types';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEvent);

// Protected routes
router.use(protect);

router.post(
  '/',
  restrictTo(UserRole.ARTIST, UserRole.ADMIN),
  validationMiddleware(createEventSchema, 'body'),
  createEvent
);

router.patch(
  '/:id',
  restrictTo(UserRole.ARTIST, UserRole.ADMIN),
  validationMiddleware(updateEventSchema, 'body'),
  updateEvent
);

router.delete('/:id', restrictTo(UserRole.ARTIST, UserRole.ADMIN), deleteEvent);

export const eventRoutes = router; 