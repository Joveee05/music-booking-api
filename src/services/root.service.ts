//import { IPagination } from '../types/custom.types';

export default class RootService {
  processResponse(payload: {
    statusCode: number;
    message: string;
    pagination?: any;
    data?: any;
  }) {
    const { statusCode, message, pagination, data } = payload;
    return { statusCode, message, pagination, data };
  }
}
