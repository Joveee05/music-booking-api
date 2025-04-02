import { EventStatus } from './event.dto';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export interface CreateBookingDto {
  eventId: string;
  numberOfTickets: number;
  totalAmount: number;
  specialRequests?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}

export interface BookingResponseDto {
  id: string;
  eventId: string;
  userId: string;
  numberOfTickets: number;
  totalAmount: number;
  specialRequests?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  event: {
    id: string;
    title: string;
    date: Date;
    location: string;
    price: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 