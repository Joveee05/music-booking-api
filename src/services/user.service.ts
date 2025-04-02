import { IUserRepository, UserRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';
import jwt from 'jsonwebtoken';
import RootService from './root.service';
import { APIResponse } from '@/types/custom.types';
export class UserService extends RootService {
  private userRepository: IUserRepository;

  constructor() {
    super();
    this.userRepository = new UserRepository();
  }
  private signToken(id: string): string {
    return jwt.sign({ id }, process.env.JWT_SECRET || '', {
      expiresIn: Number(process.env.JWT_EXPIRES_IN) || '1d',
    });
  }

  async register(userData: Partial<IUser>): Promise<APIResponse<IUser>> {
    try{
      const {user: existingUser, dbError: existingUserDbError} = await this.userRepository.FindByEmail(userData.email!);

    if(existingUserDbError){
      throw new AppError('Database error occurred', 500);
    }

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const {user, dbError} = await this.userRepository.CreateUser(userData);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    if (!user) {
      throw new AppError('User creation failed', 500);
    }

    const token = this.signToken(user._id);

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    return this.processResponse({
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        token: token,
        user: userResponse,
      },
    });
  }catch(error){
    console.error('UserService[register]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async login(email: string, password: string): Promise<APIResponse<IUser>> {
    try{
      const {user: existingUser, dbError: existingUserDbError} = await this.userRepository.FindByEmail(email);

    if(existingUserDbError){
      throw new AppError('Database error occurred', 500);
    }

    if (!existingUser) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.signToken(existingUser._id);

    return this.processResponse({
      statusCode: 200,
      message: 'User logged in successfully',
      data: {
        token,
      },
    });
  }catch(error){
    console.error('UserService[login]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async getProfile(userId: string): Promise<APIResponse<IUser>> {
    try{
      const {user: existingUser, dbError: existingUserDbError} = await this.userRepository.FindById(userId);

    if(existingUserDbError){
      throw new AppError('Database error occurred', 500);
    } 
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
        return this.processResponse({
      statusCode: 200,
      message: 'User profile retrieved successfully',
      data: existingUser,
    });
  }catch(error){
    console.error('UserService[getProfile]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async updateProfile(userId: string, userData: Partial<IUser>): Promise<APIResponse<IUser>> {
    try{
      const {user: updatedUser, dbError: updatedUserDbError} = await this.userRepository.UpdateUser(userId, userData);

    if(updatedUserDbError){
      throw new AppError('Database error occurred', 500);
    }
    if (!updatedUser) { 
      throw new AppError('User not found', 404);
    }
    return this.processResponse({
      statusCode: 200,
      message: 'User profile updated successfully',
      data: updatedUser,
    });
  }catch(error){
    console.error('UserService[updateProfile]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

  async deleteProfile(userId: string): Promise<APIResponse<boolean>> {
    try{
      const {success: deleted, dbError: deletedDbError} = await this.userRepository.DeleteUser(userId);

    if(deletedDbError){
      throw new AppError('Database error occurred', 500);
    }
    if (!deleted) { 
      throw new AppError('User not found', 404);
    }
    return this.processResponse({
      statusCode: 200,
      message: 'User profile deleted successfully',
    });
  }catch(error){
    console.error('UserService[deleteProfile]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }
}