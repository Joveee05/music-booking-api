import mongoose, { Document, Schema } from 'mongoose';
import {  EventStatus } from '../dtos/event.dto';
import {Genre} from '../dtos/artist.dto';

interface ILocation {
  address: string,
  city: string,
  state: string,
  country: string,
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  duration: number;
  location: ILocation;
  price: number;
  maxCapacity: number;
  currentBookings: number;
  genres: Genre[];
  imageUrl?: string;
  status: EventStatus;
  artist: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Event duration is required'],
      min: [1, 'Duration must be at least 1 hour'],
      max: [24, 'Duration cannot exceed 24 hours'],
    },
    location: {
      type: Object,
      required: [true, 'Event location is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: [0, 'Price cannot be negative'],
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Event maximum capacity is required'],
      min: [1, 'Maximum capacity must be at least 1'],
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: [0, 'Current bookings cannot be negative'],
    },
    genres: [{
      type: String,
      enum: Object.values(Genre),
      required: [true, 'At least one genre is required'],
    }],
    imageUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: 'Artist',
      required: [true, 'Event must belong to an artist'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
eventSchema.index({ title: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ artist: 1 });
eventSchema.index({ genres: 1 });
eventSchema.index({ status: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function(this: IEvent) {
  return this.currentBookings >= this.maxCapacity;
});

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function(this: IEvent) {
  return this.date < new Date();
});

export const Event = mongoose.model<IEvent>('Event', eventSchema); 