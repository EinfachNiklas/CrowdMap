import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtSecret: string = process.env.JWT_SECRET as string;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

export default class Authentication {

  static authenticate(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') return next();
    const isPublic =
      (req.path === '/users' && req.method === 'POST') ||
      req.path === '/users/availability' ||
      req.path === '/auth/login' ||
      req.path === '/auth/refresh' ||
      (process.env.NODE_ENV !== 'production' &&
        (req.path === '/api-docs' || req.path.startsWith('/api-docs/'))) ||
      req.path === '/geocoding/coordinates/query' ||
      req.path === '/geocoding/coordinates/ip';

    if (isPublic) return next();
    const h = req.headers.authorization ?? "";
    if (!h.startsWith('Bearer ')) {
      return res
        .status(401)
        .set('WWW-Authenticate', 'Bearer')
        .json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
    const token = h.slice(7);
    try { jwt.verify(token, jwtSecret); next(); }
    catch { return res.status(401).set('WWW-Authenticate', 'Bearer error="invalid_token"').json({ message: 'unauthorized', timestamp: new Date().toISOString() }); }
  }

  static getUserId(req: Request) {
    const h = req.get("authorization") ?? "";
    if (!h.startsWith('Bearer ')) return undefined;
    try {
      const decoded = jwt.verify(h.slice(7), jwtSecret) as JwtPayload | string;
      return typeof decoded === 'string' ? decoded : decoded.sub?.toString();
    } catch {
      return undefined;
    }
  }
}
