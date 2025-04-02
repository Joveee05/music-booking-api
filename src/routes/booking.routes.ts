import express from 'express';
import {
  getAllBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import { createBookingSchema, updateBookingSchema } from '../validations/booking.validation';
import { UserRole } from '../types/custom.types';
const router = express.Router();


router.use(protect);

router.get('/', getAllBookings);
router.get('/:id', getBooking);

router.post(
  '/',
  validationMiddleware(createBookingSchema, 'body'),
  createBooking
);

router.patch(
  '/:id/status',
  restrictTo(UserRole.ADMIN),
  validationMiddleware(updateBookingSchema, 'body'),
  updateBookingStatus
);

router.delete('/:id', cancelBooking);

export const bookingRoutes = router; 