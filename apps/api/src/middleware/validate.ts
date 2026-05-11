import type { ZodTypeAny } from 'zod';
import type { Request, Response, NextFunction } from 'express';

type RequestTarget = 'body' | 'params' | 'query';

export const validate =
  (schema: ZodTypeAny, target: RequestTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(result.error); // ZodError — formatted centrally in errorHandler
      return;
    }

    // Write coerced/defaulted values back so controllers see clean data.
    // Object.defineProperty is required in Express 5 where req.query and
    // req.params are getter-only on the prototype; defining an own property
    // shadows the prototype getter without triggering the setter restriction.
    Object.defineProperty(req, target, {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    next();
  };
