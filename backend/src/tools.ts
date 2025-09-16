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
