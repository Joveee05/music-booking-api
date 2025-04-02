import { Request, Response, NextFunction, RequestHandler } from 'express';
import joi from 'joi';

function validationMiddleware(
  schema: joi.Schema,
  type: 'body' | 'query' | 'params' = 'body'
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
    };

    try {
      let dataToValidate;
      switch (type) {
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      const value = await schema.validateAsync(
        dataToValidate,
        validationOptions
      );

      switch (type) {
        case 'query':
          req.query = value;
          break;
        case 'params':
          req.params = value;
          break;
        default:
          req.body = value;
      }

      next();
    } catch (e: any) {
      const errors: string[] = [];
      e.details.forEach((error: joi.ValidationErrorItem) => {
        errors.push(error.message);
      });
      res.status(400).send({
        success: false,
        message: 'Validation error',
        errors: errors,
      });
    }
  };
}

export default validationMiddleware;
