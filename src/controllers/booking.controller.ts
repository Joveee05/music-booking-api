import { Request, Response, NextFunction } from 'express';
import bookingService from '../services/booking.service';


export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await bookingService.getAllBookings({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await bookingService.getBooking(req.params.id);
    res.status(<number>booking.statusCode).json(booking);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user._id);
    res.status(<number>booking.statusCode).json(booking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body);
    res.status(<number>booking.statusCode).json(booking);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {id} = req.params;
    const userId = req.user._id;
    const role = req.user.role;
      const booking = await bookingService.cancelBooking(id, userId, role);
    res.status(<number>booking.statusCode).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction  
) => {
  try {
    const bookings = await bookingService.getUserBookings(req.params.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getEventBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await bookingService.getEventBookings(req.params.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingsByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await bookingService.getBookingsByStatus(req.params.status, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingsByPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await bookingService.getBookingsByPaymentStatus(req.params.paymentStatus, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};
