import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtSecret: string = process.env.JWT_SECRET as string;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

export default class Authentication {

  static authenticate(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') return next();
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    const votingRe = new RegExp(`^/crowdEvents/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/voting$`);
    const isPublic =
      (req.path === '/users' && req.method === 'POST') ||
      req.path === '/users/availability' ||
      req.path === '/auth/login' ||
      req.path === '/auth/refresh' ||
      (process.env.NODE_ENV !== 'production' && (req.path === '/api-docs' || req.path.startsWith('/api-docs/'))) ||
      req.path === '/geocoding/coordinates/query' ||
      req.path === '/geocoding/coordinates/ip' ||
      (req.method === 'GET' && req.path.startsWith("/crowdEvents/") && !req.path.slice("/crowdEvents/".length).includes("/") && uuidRegex.test(req.path.slice("/crowdEvents/".length))) ||
      ((req.method === 'GET' && votingRe.test(req.path)));
    if (isPublic) return next();
    const h = req.headers.authorization ?? "";
    if (!h.startsWith('Bearer ')) {
      return res
        .status(401)
        .set('WWW-Authenticate', 'Bearer')
        .json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
    const token = h.slice(7);
    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload | string;
      const userid = typeof decoded === 'string' ? decoded : decoded["id"];
      if (userid === undefined) {
        throw new Error("no userid in token");
      }
      next();
    }
    catch {
      return res.status(401).set('WWW-Authenticate', 'Bearer error="invalid_token"').json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
  }

  static getUserId(req: Request) {
    const h = req.get("authorization") ?? "";
    if (!h.startsWith('Bearer ')) return undefined;
    try {
      const decoded = jwt.verify(h.slice(7), jwtSecret) as JwtPayload | string;
      return typeof decoded === 'string' ? decoded : decoded["id"];
    } catch {
      return undefined;
    }
  }
}
