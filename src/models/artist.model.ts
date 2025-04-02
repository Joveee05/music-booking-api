import mongoose, { Document, Schema } from 'mongoose';
import { Genre } from '../dtos/artist.dto';

export interface IArtist extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  bio: string;
  genres: string[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  website: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
}

const artistSchema = new Schema<IArtist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artist must belong to a user'],
    },
    name: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'Artist bio is required'],
      trim: true,
    },
    genres: [{
      type: String,
      enum: Object.values(Genre),
      required: [true, 'At least one genre is required'],
    }],
    socialMedia: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
artistSchema.index({ name: 1 });
artistSchema.index({ genres: 1 });
artistSchema.index({ user: 1 }, { unique: true });

export const Artist = mongoose.model<IArtist>('Artist', artistSchema); 