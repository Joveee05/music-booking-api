import Joi from 'joi';
import { UserRole } from '../types/custom.types';
import { IUser } from '../models/user.model';

const createUserSchema = Joi.object<IUser>({
  name: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .trim()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required',
    }),
  password: Joi.string().required(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.USER),
})

const loginUserSchema = Joi.object<IUser>({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .trim()
    .required()
    .messages({ 
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required',
    }),
  password: Joi.string().required(),
})


export { createUserSchema, loginUserSchema };