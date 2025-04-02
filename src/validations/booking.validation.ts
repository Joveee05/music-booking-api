import Joi from 'joi';
import { IBooking } from '../models/booking.model'
import { BookingStatus, PaymentStatus } from '../dtos/booking.dto';

const createBookingSchema = Joi.object<IBooking>({
  eventId: Joi.string().required(),
  userId: Joi.string().required(),
  numberOfTickets: Joi.number().required(),
  totalAmount: Joi.number().required(),
  status: Joi.string().optional(),
  paymentStatus: Joi.string().optional(),
  specialRequests: Joi.string().optional(),
});    

const updateBookingSchema = Joi.object<IBooking>({
  status: Joi.string().valid(...Object.values(BookingStatus)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
  specialRequests: Joi.string().optional(),
  totalAmount: Joi.number().optional(),
  numberOfTickets: Joi.number().optional(),
});

export { createBookingSchema, updateBookingSchema };
