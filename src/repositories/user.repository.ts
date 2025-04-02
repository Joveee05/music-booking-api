import { User, IUser } from '../models/user.model';

export interface IUserRepository {
  FindByEmail(email: string): Promise<{user?: IUser, dbError?: Error}>;

  FindById(id: string): Promise<{user?: IUser, dbError?: Error}>;

  CreateUser(userData: Partial<IUser>): Promise<{user?: IUser, dbError?: Error}>;

  UpdateUser(id: string, userData: Partial<IUser>): Promise<{user?: IUser, dbError?: Error}>;

  DeleteUser(id: string): Promise<{success?: boolean, dbError?: Error}>;
}

export class UserRepository implements IUserRepository {
  async FindByEmail(email: string): Promise<{user?: IUser, dbError?: Error}> {
    try{
      const user = await User.findOne({ email });
      return {user: user as IUser};
    }catch(error){
      return {dbError: error as Error};
    }
  }

  async FindById(id: string): Promise<{user?: IUser, dbError?: Error}> {
    try{
      const user = await User.findById(id).select('-password');
      return {user: user as IUser};
    }catch(error){
      return {dbError: error as Error};
    }
  }

  async CreateUser(userData: Partial<IUser>): Promise<{user?: IUser, dbError?: Error}> {
    try{
      const user = await User.create(userData);
      return {user: user as IUser};
    }catch(error){
      return {dbError: error as Error};
    }
  }

  async UpdateUser(id: string, userData: Partial<IUser>): Promise<{user?: IUser, dbError?: Error}> {
    try{
      const user = await User.findByIdAndUpdate(id, userData, {
        new: true,
        runValidators: true,
      }).select('-password');
      return {user: user as IUser};
    }catch(error){
      return {dbError: error as Error};
    }
  }

  async DeleteUser(id: string): Promise<{success?: boolean, dbError?: Error}> {
    try{
      const result = await User.findByIdAndDelete(id);
      return {success: !!result};
    }catch(error){
      return {dbError: error as Error};
    }
  }
} 