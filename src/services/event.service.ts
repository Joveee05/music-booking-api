import { EventRepository, IEventRepository } from '../repositories/event.repository';
import { CacheService } from './cache.service';
import { CreateEventDto, UpdateEventDto, EventResponseDto, EventStatus } from '../dtos/event.dto';
import { AppError } from '../middleware/error.middleware';
import { PaginationParams, PaginatedResponse } from '../interfaces/pagination.interface';
import RootService from './root.service';
import { APIResponse } from '@/types/custom.types';
import { IUser } from '@/models/user.model';
class EventService extends RootService{
  private eventRepository: IEventRepository;
  private cacheService: CacheService;
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor() {
    super();
    this.eventRepository = new EventRepository();
    this.cacheService = new CacheService();
  }

  private async invalidateEventCache(): Promise<void> {
    await this.cacheService.deletePattern('event:*');
  }

  public async createEvent(eventData: CreateEventDto, artistId: string): Promise<APIResponse<EventResponseDto>> {
    try{
      const {event, dbError} = await this.eventRepository.CreateEvent(eventData, artistId);

      if(dbError){
        throw new AppError('Database error occurred', 500);
      }
      
      await this.invalidateEventCache();

      return this.processResponse({
        statusCode: 201,
        message: 'Event created successfully',
        data: event,
      });
    }catch(error){
    console.error('EventService[createEvent]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

  public async getEventById(id: string): Promise<APIResponse<EventResponseDto>> {
    try{
      const {event, dbError} = await this.eventRepository.FindById(id);

      if(dbError){
        throw new AppError('Database error occurred', 500);
      }

      return this.processResponse({
        statusCode: 200,
        message: 'Event fetched successfully',
        data: event,
      });
    }catch(error){
      console.error('EventService[getEventById]: ', error);
      return this.processResponse({
        statusCode: error instanceof AppError ? error.statusCode : 500,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        data: null,
      });
    }
  }

  public async getAllEvents(params: PaginationParams): Promise<PaginatedResponse<EventResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('event', 'all', JSON.stringify(params));
    const cachedEvents = await this.cacheService.get<PaginatedResponse<EventResponseDto>>(cacheKey);

    if (cachedEvents) {
      response = {
        statusCode: 200,
        message: 'Events fetched successfully',
        data: cachedEvents,
        pagination: params
      };
      return this.processResponse(response);
    }

    const {events, dbError} = await this.eventRepository.FindAllEvents(params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, events, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Events fetched successfully',
      data: events,
      pagination: params
    };
    return this.processResponse(response);
  }catch(error){
    console.error('EventService[getAllEvents]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  public async getEventsByArtistId(artistId: string, params: PaginationParams): Promise<PaginatedResponse<EventResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('event', 'artist', artistId, JSON.stringify(params));
      const cachedEvents = await this.cacheService.get<PaginatedResponse<EventResponseDto>>(cacheKey);

    if (cachedEvents) {
      response = {
        statusCode: 200,
        message: 'Events fetched successfully',
        data: cachedEvents,
        pagination: params
      };
      return this.processResponse(response);  
    }

      const {events, dbError} = await this.eventRepository.FindByArtistId(artistId, params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, events, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Events fetched successfully',
      data: events,
      pagination: params
    };
    return this.processResponse(response);
  }catch(error){
    console.error('EventService[getEventsByArtistId]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  public async getEventsByGenre(genre: string, params: PaginationParams): Promise<PaginatedResponse<EventResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('event', 'genre', genre, JSON.stringify(params));
    const cachedEvents = await this.cacheService.get<PaginatedResponse<EventResponseDto>>(cacheKey);

    if (cachedEvents) {
      response = {
        statusCode: 200,
        message: 'Events fetched successfully',
        data: cachedEvents,
        pagination: params
      };
      return this.processResponse(response);
    }

    const {events, dbError} = await this.eventRepository.FindEventsByGenre(genre, params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, events, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Events fetched successfully',
      data: events,
      pagination: params
    };
    return this.processResponse(response);
  }catch(error){
    console.error('EventService[getEventsByGenre]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

  public async getUpcomingEvents(params: PaginationParams): Promise<PaginatedResponse<EventResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('event', 'upcoming', JSON.stringify(params));
    const cachedEvents = await this.cacheService.get<PaginatedResponse<EventResponseDto>>(cacheKey);

    if (cachedEvents) {
      return cachedEvents;
    }

      const {events, dbError} = await this.eventRepository.FindUpcomingEvents(params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, events, this.CACHE_TTL);
    response = {
      statusCode: 200,
      message: 'Events fetched successfully',
      data: events,
      pagination: params  
    };
    return this.processResponse(response);
  }catch(error){
    console.error('EventService[getUpcomingEvents]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

public async updateEvent(id: string, eventData: UpdateEventDto, user: any): Promise<APIResponse<EventResponseDto>> {
  try{
    const {event, dbError} = await this.eventRepository.UpdateEvent(id, eventData);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }
    if (
      event?.artist?.toString() !== user._id &&
      user.role !== 'admin'
    ) {
      throw new AppError('You can only update your own events', 403);
    }
    
    await this.invalidateEventCache();

    return this.processResponse({
      statusCode: 200,
      message: 'Event updated successfully',
      data: event,
    });
  }catch(error){
    console.error('EventService[updateEvent]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
    }   
}

public async deleteEvent(id: string): Promise<APIResponse<boolean>> {
  try{
    const {success, dbError} = await this.eventRepository.DeleteEvent(id);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }
    
    await this.invalidateEventCache();

    return this.processResponse({
      statusCode: 200,
      message: 'Event deleted successfully',
      data: success,
    });
  }catch(error){
    console.error('EventService[deleteEvent]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
} 

public async updateEventCapacity(id: string, increment: number): Promise<APIResponse<EventResponseDto>> {
  try{
      const {event, dbError} = await this.eventRepository.UpdateEventCapacity(id, increment);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }
    
    await  this.invalidateEventCache();

    return this.processResponse({
      statusCode: 200,
      message: 'Event capacity updated successfully',
      data: event,
    });
  }catch(error){
    console.error('EventService[updateEventCapacity]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }   
}
}

const eventService = new EventService();
export default eventService;
