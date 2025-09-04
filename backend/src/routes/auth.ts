import express from 'express';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcrypt';
import db from '../db/db';
import authentication from '../authentication';


const router = express.Router();
const jwtSecret: string = process.env.JWT_SECRET!;
const authTtl: string = process.env.AUTH_TOKEN_TTL || "10m";
const refreshTtl: string = process.env.REFRESH_TOKEN_TTL || "7d";

const saltRounds: number = 12;

const getUserIdAndPwdHashStmt = db.prepare("SELECT id, pwdhash FROM users WHERE email = ?");
const insertRefreshTokenSession = db.prepare("INSERT INTO refreshTokenSessions (userId, jtiHash, ttl) VALUES (?,?,?)");
const getRefreshTokenSession = db.prepare("SELECT jtiHash FROM refreshTokenSessions WHERE userId = ?");
const deleteRefreshTokenSession = db.prepare("DELETE FROM refreshTokenSessions WHERE userId = ?");


function signAuthToken(sub: string) {
    return jwt.sign({ id: sub }, jwtSecret, { expiresIn: authTtl as StringValue });
}

function signRefreshToken(sub: string, jti: string) {
    return jwt.sign({ id: sub, jti: jti }, jwtSecret, { expiresIn: refreshTtl as StringValue });
}

function setRefreshCookie(res: express.Response, token: string) {
    res.cookie("refresh", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/auth/refresh",
    });
}

router.post("/auth/login", (req, res) => {
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
        if (!bcrypt.compareSync(pwd, row.pwdhash)) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        const jti: string = crypto.randomUUID();
        const authToken: string = signAuthToken(row.id.toString());
        const refreshToken: string = signRefreshToken(row.id.toString(), jti);
        insertRefreshTokenSession.run(row.id, bcrypt.hashSync(jti, saltRounds), refreshTtl);
        setRefreshCookie(res, refreshToken);
        return res.status(200).json({ authToken: authToken });
    } catch (error: any) {
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString(), details: error.message });
    }
});

router.post("/auth/refresh", (req, res) => {
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
        if (!bcrypt.compareSync(payload.jti, row.jtiHash)) {
            return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
        }
        //ToDo: Delete from DB aka invalidate session if refreshToken after TTL
        deleteRefreshTokenSession.run(userId);
        const newJti = crypto.randomUUID();
        const authToken: string = signAuthToken(userId.toString());
        const refreshToken: string = signRefreshToken(userId, newJti);
        insertRefreshTokenSession.run(userId, bcrypt.hashSync(newJti, saltRounds), refreshTtl);
        setRefreshCookie(res, refreshToken);
        return res.status(200).json({ authToken: authToken });
    } catch (error) {
        return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
});

export default router;