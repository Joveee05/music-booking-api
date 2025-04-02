export type APIResponse<T> = {
    statusCode?: number;
    message?: string;
    data?: T;
  };

  export enum UserRole {
    ARTIST = 'artist',
    USER = 'user',
    ADMIN = 'admin',
  }