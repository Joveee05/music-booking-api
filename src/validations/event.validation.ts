import Joi from 'joi';
import { IEvent } from '../models/event.model';

const createEventSchema = Joi.object<IEvent>({
  title: Joi.string().required(),
  description: Joi.string().required(),
  date: Joi.date().required(),
  duration: Joi.number().required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),        
  price: Joi.number().required(),
  artist: Joi.string().required(),
  maxCapacity: Joi.number().required(),
  status: Joi.string().optional(),
  imageUrl: Joi.string().optional(),
  genres: Joi.array().items(Joi.string()).required(),
});

const updateEventSchema = Joi.object<IEvent>({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  date: Joi.date().optional(),
  duration: Joi.number().optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
  }).required(),
  price: Joi.number().optional(),
  artist: Joi.string().optional(),
  maxCapacity: Joi.number().optional(),
  status: Joi.string().optional(),
  imageUrl: Joi.string().optional(),
  genres: Joi.array().items(Joi.string()).optional(),
}); 

export { createEventSchema, updateEventSchema };
