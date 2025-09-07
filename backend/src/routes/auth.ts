import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../db/db';
import ms, { StringValue } from 'ms';
import { randomUUID } from 'crypto';


const router = express.Router();
const jwtSecret = process.env.JWT_SECRET as string;
if (!jwtSecret) throw new Error('JWT_SECRET is required');
const isProd = process.env.NODE_ENV === "production";
const authTtl = process.env.AUTH_TOKEN_TTL ?? "10m";
const refreshTtl = process.env.REFRESH_TOKEN_TTL ?? "7d";
const refreshTtlMs = ms(refreshTtl as StringValue);

const saltRounds: number = 12;

const getUserIdAndPwdHashStmt = db.prepare("SELECT id, pwdhash FROM users WHERE email = ?");
const insertRefreshTokenSession = db.prepare("INSERT INTO refreshTokenSessions (userId, jtiHash, expiresAt) VALUES (?,?,?)");
const getRefreshTokenSession = db.prepare("SELECT jtiHash, expiresAt, createdAt FROM refreshTokenSessions WHERE userId = ?");
const deleteRefreshTokenSession = db.prepare("DELETE FROM refreshTokenSessions WHERE userId = ?");


function signAuthToken(sub: string) {
    return jwt.sign({ id: sub }, jwtSecret, { expiresIn: ms(authTtl as StringValue) / 1000 });
}

function signRefreshToken(sub: string, jti: string) {
    return jwt.sign({ id: sub, jti: jti }, jwtSecret, { expiresIn: refreshTtlMs / 1000 });
}

function setRefreshCookie(res: express.Response, token: string) {
    res.cookie("refresh", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: "/api/auth/refresh",
        maxAge: refreshTtlMs,
    });
}

router.post("/auth/login", async (req, res) => {
    const { email, pwd } = req.body ?? {};
    if (typeof email !== 'string' || typeof pwd !== 'string') {
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    const e = email.trim();
    if (!e || !pwd) {
        return res.status(400).json({ message: 'missing fields', timestamp: new Date().toISOString() });
    }
    try {
        const row = getUserIdAndPwdHashStmt.get(e) as { id: number; pwdhash: string } | undefined;
        if (!row) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        if (!(await bcrypt.compare(pwd, row.pwdhash))) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        const jti: string = randomUUID();
        const authToken: string = signAuthToken(row.id.toString());
        const refreshToken: string = signRefreshToken(row.id.toString(), jti);
        deleteRefreshTokenSession.run(row.id);
        const jtiHash = await bcrypt.hash(jti, saltRounds);
        insertRefreshTokenSession.run(row.id, jtiHash, new Date(Date.now() + refreshTtlMs).toISOString());
        setRefreshCookie(res, refreshToken);
        res.set('Cache-Control', 'no-store');
        return res.status(200).json({ authToken: authToken });
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.post("/auth/refresh", async (req, res) => {
    const token = req.cookies?.refresh as string | undefined;
    if (!token) {
        return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
    try {
        const payload = jwt.verify(token, jwtSecret) as { id: string, jti: string };
        const userId = payload.id;
        const row = getRefreshTokenSession.get(userId) as { jtiHash: string, expiresAt: string, createdAt: string };
        if (!row) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        if (!(await bcrypt.compare(payload.jti, row.jtiHash))) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        if (Date.parse(row.expiresAt) < Date.now()) {
            res.clearCookie("refresh", { path: "/auth" });
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        deleteRefreshTokenSession.run(userId);
        const newJti = randomUUID();
        const authToken: string = signAuthToken(userId.toString());
        const refreshToken: string = signRefreshToken(userId, newJti);
        const newJtiHash = await bcrypt.hash(newJti, saltRounds);
        insertRefreshTokenSession.run(userId, newJtiHash, new Date(Date.now() + refreshTtlMs).toISOString());
        setRefreshCookie(res, refreshToken);
        res.set('Cache-Control', 'no-store');
        return res.status(200).json({ authToken: authToken });
    } catch (error) {
        res.clearCookie("refresh", { path: "/auth" });
        return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
});

router.post("/auth/logout", async (req, res) => {
    const token = req.cookies?.refresh as string | undefined;
    if (!token) {
        return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
    try {
        const payload = jwt.verify(token, jwtSecret) as { id: string, jti: string };
        const userId = payload.id;
        const row = getRefreshTokenSession.get(userId) as { jtiHash: string };
        if (!row) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        if (!(await bcrypt.compare(payload.jti, row.jtiHash))) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        deleteRefreshTokenSession.run(userId);
        res.clearCookie("refresh", { path: "/auth" });
        return res.status(200).json({ message: 'logged out successfully', timestamp: new Date().toISOString() });
    } catch (error) {
        return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
});

router.get("/auth/validate", (req, res) => {
    res.set("Cache-Control", "no-store");
    return res.status(200).json({ message: 'valid', timestamp: new Date().toISOString() });
});

export default router;