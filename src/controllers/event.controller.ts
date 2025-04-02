import { Request, Response, NextFunction } from 'express';
import eventService from '../services/event.service';

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paginationParams = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    };
    const events = await eventService.getAllEvents(paginationParams);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(<number>event.statusCode).json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const event = await eventService.createEvent(req.body, userId);
    res.status(<number>event.statusCode).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const event = await eventService.updateEvent(req.params.id, req.body, user);
    res.status(<number>event.statusCode).json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventService.deleteEvent(req.params.id);
    res.status(<number>event.statusCode).json(event);
  } catch (error) {
    next(error);
  }
}; 