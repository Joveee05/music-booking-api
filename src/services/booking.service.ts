import { BookingRepository, IBookingRepository } from '../repositories/booking.repository';
import eventService  from './event.service';
import { CacheService } from './cache.service';
import { CreateBookingDto, UpdateBookingStatusDto, BookingResponseDto, BookingStatus, PaymentStatus } from '../dtos/booking.dto';
import { AppError } from '../middleware/error.middleware';
import { PaginationParams, PaginatedResponse } from '../interfaces/pagination.interface';
import RootService from './root.service';
import { APIResponse } from '@/types/custom.types';

class BookingService extends RootService{
  private bookingRepository: IBookingRepository;
  private cacheService: CacheService;
  private readonly CACHE_TTL = 3600; // 1 hour

    constructor() {
    super();
    this.bookingRepository = new BookingRepository();
    this.cacheService = new CacheService();
  }

  private async invalidateBookingCache(): Promise<void> {
    await this.cacheService.deletePattern('booking:*');
  }

  async getAllBookings(params: PaginationParams): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response
    const cacheKey = this.cacheService.generateKey('booking', 'all', JSON.stringify(params));
    const cachedBookings = await this.cacheService.get<PaginatedResponse<BookingResponseDto>>(cacheKey);

    if (cachedBookings) {
      response = {
        statusCode: 200,
        message: 'Bookings fetched successfully',
        pagination: cachedBookings.pagination,
        data: cachedBookings.data,
      };
      return this.processResponse(response);
    }

    const {bookings, dbError} = await this.bookingRepository.FindAllBookings(params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    
    await this.cacheService.set(cacheKey, bookings, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Bookings fetched successfully',
      pagination: bookings?.pagination,
      data: bookings?.data,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[getAllBookings]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async getBooking(id: string): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('booking', id);
    const cachedBooking = await this.cacheService.get<BookingResponseDto>(cacheKey);

    if (cachedBooking) {
      response = {
        statusCode: 200,
        message: 'Booking fetched successfully',
        data: cachedBooking,
      };
      return this.processResponse(response);
    }

    const {booking, dbError} = await this.bookingRepository.FindById(id);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    await this.cacheService.set(cacheKey, booking, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Booking fetched successfully',
      data: booking,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[getBooking]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async createBooking(bookingData: CreateBookingDto, userId: string): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response;
    // Check if event exists and is available
    const {data: event} = await eventService.getEventById(bookingData.eventId);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.maxCapacity === event.currentBookings) {
      throw new AppError('Event is fully booked', 400);
    }

    if (event.date < new Date(Date.now())) {
      throw new AppError('Cannot book past events', 400);
    }

  
    const totalAmount = event.price * bookingData.numberOfTickets;

      // Create booking
    const {booking, dbError: bookingDbError} = await this.bookingRepository.CreateBooking({
      ...bookingData,
      totalAmount,
    }, userId);

    if(bookingDbError){
      throw new AppError('Database error occurred', 500);
    }

    // Update event capacity
    await eventService.updateEventCapacity(event.id, bookingData.numberOfTickets);

    await this.invalidateBookingCache();
    response = {
      statusCode: 200,
      message: 'Booking created successfully',
      data: booking,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[createBooking]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async updateBookingStatus(id: string, statusData: UpdateBookingStatusDto): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response;
    const {booking, dbError} = await this.bookingRepository.UpdateBookingStatus(id, statusData);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // If booking is cancelled, update event capacity
    if (statusData.status === BookingStatus.CANCELLED) {
      await eventService.updateEventCapacity(booking.eventId.toString(), -booking.numberOfTickets);
    }

    await this.invalidateBookingCache();
    response = {
      statusCode: 200,
      message: 'Booking updated successfully',
      data: booking,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[updateBookingStatus]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  } 
}

  async cancelBooking(id: string, userId: string, role: string): Promise<APIResponse<boolean>> {
    try{
      let response;
    const {booking, dbError} = await this.bookingRepository.FindById(id);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.userId.toString() !== userId && role !== 'admin') {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    // Update event capacity
    await eventService.updateEventCapacity(booking.eventId.toString(), -booking.numberOfTickets);

    // Update booking status
    const {booking: updatedBooking, dbError: updatedBookingDbError} = await this.bookingRepository.UpdateBookingStatus(id, {
      status: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
    });

    if(updatedBookingDbError){
      throw new AppError('Database error occurred', 500);
    }

    if (!updatedBooking) {
      throw new AppError('Failed to cancel booking', 500);
    }

    await this.invalidateBookingCache();
    response = {
      statusCode: 200,
      message: 'Booking cancelled successfully',
      data: true,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[cancelBooking]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }   
}

  async getUserBookings(userId: string, params: PaginationParams): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('booking', 'user', userId, JSON.stringify(params));
    const cachedBookings = await this.cacheService.get<PaginatedResponse<BookingResponseDto>>(cacheKey);

    if (cachedBookings) {
      response = {
        statusCode: 200,
        message: 'Bookings fetched successfully',
        pagination: cachedBookings.pagination,
        data: cachedBookings.data,
      };
      return this.processResponse(response);
    }

    const {bookings, dbError} = await this.bookingRepository.FindByUserId(userId, params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, bookings, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Bookings fetched successfully',
      pagination: bookings?.pagination,
      data: bookings?.data,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[getUserBookings]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async getEventBookings(eventId: string, params: PaginationParams): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('booking', 'event', eventId, JSON.stringify(params));
    const cachedBookings = await this.cacheService.get<PaginatedResponse<BookingResponseDto>>(cacheKey);

    if (cachedBookings) {
          response = {
            statusCode: 200,
            message: 'Bookings fetched successfully',
            pagination: cachedBookings.pagination,
            data: cachedBookings.data,
          };
          return this.processResponse(response);
    }

    const {bookings, dbError} = await this.bookingRepository.FindByEventId(eventId, params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, bookings, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Bookings fetched successfully',
      pagination: bookings?.pagination,
      data: bookings?.data,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[getEventBookings]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

  async getBookingsByStatus(status: string, params: PaginationParams): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response;
      const cacheKey = this.cacheService.generateKey('booking', 'status', status, JSON.stringify(params));
    const cachedBookings = await this.cacheService.get<PaginatedResponse<BookingResponseDto>>(cacheKey);

    if (cachedBookings) {
          response = {
            statusCode: 200,
            message: 'Bookings fetched successfully',
            pagination: cachedBookings.pagination,
            data: cachedBookings.data,
          };
          return this.processResponse(response);
    }

    const {bookings, dbError} = await this.bookingRepository.FindBookingsByStatus(status, params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, bookings, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Bookings fetched successfully',
      pagination: bookings?.pagination,
      data: bookings?.data,
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[getBookingsByStatus]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

  async getBookingsByPaymentStatus(paymentStatus: string, params: PaginationParams): Promise<APIResponse<BookingResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('booking', 'payment', paymentStatus, JSON.stringify(params));
    const cachedBookings = await this.cacheService.get<PaginatedResponse<BookingResponseDto>>(cacheKey);

    if (cachedBookings) {
      response = {
        statusCode: 200,
        message: 'Bookings fetched successfully',
        pagination: cachedBookings.pagination,
        data: cachedBookings.data,
      };
      return this.processResponse(response);
    }

    const {bookings, dbError} = await this.bookingRepository.FindBookingsByPaymentStatus(paymentStatus, params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, bookings, this.CACHE_TTL);
      response = {
      statusCode: 200,
      message: 'Bookings fetched successfully',
      data: bookings?.data,
      pagination: bookings?.pagination
    };
    return this.processResponse(response);
  }catch(error){
    console.error('BookingService[getBookingsByPaymentStatus]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
    }
  }
} 

const bookingService = new BookingService();
export default bookingService;

