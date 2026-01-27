import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation Middleware Factory
 * Creates a middleware that validates request data against a Zod schema
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const parsed = schema.parse(data);

      // Replace the request data with parsed (and potentially transformed) data
      req[target] = parsed;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates multiple targets at once
 */
export const validateMultiple = (
  schemas: Partial<Record<ValidationTarget, ZodSchema>>
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodSchema][]) {
        if (schema) {
          const data = req[target];
          const parsed = schema.parse(data);
          req[target] = parsed;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
