import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';

export const sanitizeData = (req: Request, _res: Response, next: NextFunction) => {
  req.body = mongoSanitize.sanitize(req.body);
  req.params = mongoSanitize.sanitize(req.params);
  req.query = mongoSanitize.sanitize(req.query);
  next();
}; 