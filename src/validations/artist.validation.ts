import Joi from 'joi';
import { IArtist } from '../models/artist.model';

const createArtistSchema = Joi.object<IArtist>({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  bio: Joi.string().required(),
  genres: Joi.array().items(Joi.string()).required(),
  socialMedia: Joi.string().optional(),
  website: Joi.string().optional(),
});

const updateArtistSchema = Joi.object<IArtist>({
  name: Joi.string().optional(),
  bio: Joi.string().optional(),
  genres: Joi.array().items(Joi.string()).optional(),
  socialMedia: Joi.string().optional(),
  website: Joi.string().optional(),
});
export { createArtistSchema, updateArtistSchema };

