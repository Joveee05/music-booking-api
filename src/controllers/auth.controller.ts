import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {email, password, name, role} = req.body;
    const result = await userService.register({email, password, name, role});
    res.status(<number>result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.status(<number>result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userService.getProfile(req.user._id);
    res.status(<number>result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
}; 