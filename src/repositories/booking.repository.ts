import { Booking, IBooking } from '../models/booking.model';
import { CreateBookingDto, UpdateBookingStatusDto } from '../dtos/booking.dto';
import { PaginationParams, PaginatedResponse } from '../interfaces/pagination.interface';

export interface IBookingRepository {
  FindAllBookings(params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}>;

  FindById(id: string): Promise<{booking?: IBooking, dbError?: Error}>;

  FindByUserId(userId: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}>;

  FindByEventId(eventId: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}>;

  CreateBooking(bookingData: CreateBookingDto, userId: string): Promise<{booking?: IBooking, dbError?: Error}>;

  UpdateBookingStatus(id: string, statusData: UpdateBookingStatusDto): Promise<{booking?: IBooking, dbError?: Error}>;

  DeleteBooking(id: string): Promise<{success?: boolean, dbError?: Error}>;

  FindBookingsByStatus(status: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}>;

  FindBookingsByPaymentStatus(paymentStatus: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}>;
  
}

export class BookingRepository implements IBookingRepository {

    async FindAllBookings(params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}  > {
    try{
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find()
        .populate('event', 'title date location price')
        .populate('user', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(),
    ]);

    return {
        bookings: {
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          data: bookings as IBooking[],
        },
    };
  }catch(error){
    return {dbError: error as Error};
  }
  }

    async FindById(id: string): Promise<{booking?: IBooking, dbError?: Error}> {
    try{
      const booking = await Booking.findById(id)
      .populate('event', 'title date location price')
      .populate('user', 'name email');
      return {booking: booking as IBooking};
    }catch(error){
      return {dbError: error as Error};
    }
  }

  async FindByUserId(userId: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
      const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ user: userId })
        .populate('event', 'title date location price')
        .populate('user', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ user: userId }),
    ]);

    return {
      bookings: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: bookings as IBooking[],
      },
    };
  }catch(error){
    return {dbError: error as Error};
  }
  }

  async FindByEventId(eventId: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ event: eventId })
        .populate('event', 'title date location price')
        .populate('user', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ event: eventId }),
    ]);

    return {
      bookings: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: bookings as IBooking[],
      },
    };
  }catch(error){  
    return {dbError: error as Error};
  }
  }

  async CreateBooking(bookingData: CreateBookingDto, userId: string): Promise<{booking?: IBooking, dbError?: Error}> {
    try{
      const booking = await Booking.create({
      ...bookingData,
      user: userId,
      status: 'pending',
      paymentStatus: 'pending',
    });
    return {booking: booking as IBooking};
  }catch(error){
    return {dbError: error as Error};
  }
  }

  async UpdateBookingStatus(id: string, statusData: UpdateBookingStatusDto): Promise<{booking?: IBooking, dbError?: Error}> {
    try{
      const booking = await Booking.findByIdAndUpdate(id, statusData, {
      new: true,
      runValidators: true,
    })
      .populate('event', 'title date location price')
      .populate('user', 'name email');
      return {booking: booking as IBooking};  
    }catch(error){
      return {dbError: error as Error};
    }
  }

  async DeleteBooking(id: string): Promise<{success?: boolean, dbError?: Error}> {
    try{
      const result = await Booking.findByIdAndDelete(id);
      return {success: !!result};
    }catch(error){
      return {dbError: error as Error};
    }
  }

  async FindBookingsByStatus(status: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
      const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ status })
        .populate('event', 'title date location price')
        .populate('user', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ status }),
    ]);

    return {
      bookings: {
        data: bookings as IBooking[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }catch(error){
    return {dbError: error as Error};
  }
  }

  async FindBookingsByPaymentStatus(paymentStatus: string, params: PaginationParams): Promise<{bookings?: PaginatedResponse<IBooking>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ paymentStatus })
        .populate('event', 'title date location price')
        .populate('user', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ paymentStatus }),
    ]);

    return {
      bookings: {
        data: bookings as IBooking[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }catch(error){
    return {dbError: error as Error};
  }
  }
} 

