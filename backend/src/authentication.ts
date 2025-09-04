import jwt from 'jsonwebtoken';

const jwtSecret: string = process.env.JWT_SECRET!;

export default class authentication {

  static authenticate(req: any, res: any, next: any) {
    if ([
      "/auth/login",
      "/auth/refresh",
      "/users", // ToDo: only post
      ...process.env.NODE_ENV !== "production" ? ["/api-docs/*"] : []
    ].some(path => path === req.path || (path.endsWith("/*") && req.path.startsWith(path.slice(0,-1))))){
      return next();
    }
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    try { jwt.verify(token, jwtSecret); next(); }
    catch { return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() }); }
  }

  static getUserId(req: any) {
    const h = req.get("authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    return jwt.verify(token, jwtSecret);
  }
}
