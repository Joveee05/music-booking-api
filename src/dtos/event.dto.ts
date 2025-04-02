import { Genre } from './artist.dto';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: Date;
  duration: number;
  location: string;
  price: number;
  maxCapacity: number;
  genres: Genre[];
  imageUrl?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: Date;
  duration?: number;
  location?: string;
  price?: number;
  maxCapacity?: number;
  genres?: Genre[];
  imageUrl?: string;
  status?: EventStatus;
}

export interface EventResponseDto {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  location: string;
  price: number;
  maxCapacity: number;
  currentBookings: number;
  genres: Genre[];
  imageUrl?: string;
  status: EventStatus;
  artist: {
    id: string;
    name: string;
    bio: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 