export enum Genre {
  POP = 'pop',
  ROCK = 'rock',
  JAZZ = 'jazz',
  CLASSICAL = 'classical',
  ELECTRONIC = 'electronic',
  OTHER = 'other',
}

export interface CreateArtistDto {
  name: string;
  bio: string;
  genres: Genre[];
  socialMedia?: string;
  website?: string;
}

export interface UpdateArtistDto {
  name?: string;
  bio?: string;
  genres?: Genre[];
  socialMedia?: string;
  website?: string;
}

export interface ArtistResponseDto {
  id: string;
  name: string;
  bio: string;
  genres: Genre[];
  socialMedia?: string;
  website?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 