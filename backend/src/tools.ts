import { UUID } from 'crypto';
import type { Request } from 'express';

export function getClientIp(req: Request): string {
    const xri = req.headers['x-real-ip'];
    if (typeof xri === 'string' && xri) return xri;

    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff) {
        return xff.split(',')[0].trim();
    }
    const raw = req.socket.remoteAddress || '';
    return raw.startsWith('::ffff:') ? raw.slice(7) : raw;
}

export function uuidStringify(buf: Buffer): string {
  const h = buf.toString("hex");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export function uuidParse(str: string): Buffer {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)) {
    throw new Error("Invalid UUID string");
  }
  return Buffer.from(str.replace(/-/g, ""), "hex");
}
