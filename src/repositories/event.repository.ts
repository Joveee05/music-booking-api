import { Event, IEvent } from '../models/event.model';
import { CreateEventDto, UpdateEventDto } from '../dtos/event.dto';
import { PaginationParams, PaginatedResponse } from '../interfaces/pagination.interface';


export interface IEventRepository {
  FindAllEvents(params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}>;
  
  FindById(id: string): Promise<{event?: IEvent, dbError?: Error}>;

  FindByArtistId(artistId: string, params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}>;

  CreateEvent(eventData: CreateEventDto, artistId: string): Promise<{event?: IEvent, dbError?: Error}>;

  UpdateEvent(id: string, eventData: UpdateEventDto): Promise<{event?: IEvent, dbError?: Error}>;

  DeleteEvent(id: string): Promise<{success?: boolean, dbError?: Error}>;

  FindEventsByGenre(genre: string, params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}>;

  FindUpcomingEvents(params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}>;

  UpdateEventCapacity(id: string, increment: number): Promise<{event?: IEvent, dbError?: Error}>;
  
}

export class EventRepository implements IEventRepository {
    async FindAllEvents(params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find()
        .populate('artist', 'name bio')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(),
    ]);

    return {
      events: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: events as IEvent[],
      }
    };
  }catch(error){
    return {dbError: <Error>error};
  }
  }

  async FindById(id: string): Promise<{event?: IEvent, dbError?: Error}> {
    try{
      const event = await Event.findById(id).populate('artist', 'name bio');
      return {event: event as IEvent};
    }catch(error){
      return {dbError: <Error>error};
    }
  }

  async FindByArtistId(artistId: string, params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc' } = params;
      const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({ artist: artistId })
        .populate('artist', 'name bio')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments({ artist: artistId }),
    ]);

    return {
      events: {
        data: events as IEvent[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    };
  }catch(error){
    return {dbError: <Error>error};
  }
  }

  async CreateEvent(eventData: CreateEventDto, artistId: string): Promise<{event?: IEvent, dbError?: Error}> {
    try{
      const event = await Event.create({
      ...eventData,
      artist: artistId,
      currentBookings: 0,
      status: 'draft',
    });
    return {event: event as IEvent};
  }catch(error){
    return {dbError: <Error>error};
  }
  }

  async UpdateEvent(id: string, eventData: UpdateEventDto): Promise<{event?: IEvent, dbError?: Error}> {
    try{
      const event = await Event.findByIdAndUpdate(id, eventData, {
      new: true,
      runValidators: true,
    }).populate('artist', 'name bio');
    return {event: event as IEvent};
  }catch(error){
    return {dbError: <Error>error};
  }
  }

  async DeleteEvent(id: string): Promise<{success?: boolean, dbError?: Error}> {
    try{
      const result = await Event.findByIdAndDelete(id);
      return {success: !!result};
    }catch(error){
      return {dbError: <Error>error};
    }
  }

  async FindEventsByGenre(genre: string, params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc' } = params;
      const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({ genres: genre })
        .populate('artist', 'name bio')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments({ genres: genre }),
    ]);

    return {
      events: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: events as IEvent[],
      }
    };
  }catch(error){
    return {dbError: <Error>error};
  }
  }

  async FindUpcomingEvents(params: PaginationParams): Promise<{events?: PaginatedResponse<IEvent>, dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({
        date: { $gte: new Date(Date.now()) },
        status: 'published',
      })
        .populate('artist', 'name bio')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments({
        date: { $gte: new Date() },
        status: 'published',
      }),
    ]);

    return {
      events: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: events as IEvent[],
      }
    };
  }catch(error){
    return {dbError: <Error>error};
  }
  }

  async UpdateEventCapacity(id: string, increment: number): Promise<{event?: IEvent, dbError?: Error}> {
    try{
      const event = await Event.findByIdAndUpdate(
      id,
      { $inc: { currentBookings: increment } },
      { new: true }
    ).populate('artist', 'name bio');
    return {event: event as IEvent};
  }catch(error){
    return {dbError: <Error>error};
  }
  }
} 