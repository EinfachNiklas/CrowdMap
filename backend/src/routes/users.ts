import express from 'express';
import db from '../db/db';
import bcrypt from 'bcrypt';

const router = express.Router();
const insert = db.prepare("INSERT INTO users (username, email, pwdhash) VALUES (?,?,?)");

router.post("/users/", (req, res) => {

    const { username, email, pwd } = req.body ?? {};
    if (typeof username !== 'string' || typeof email !== 'string' || typeof pwd !== 'string') {
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    const u = username.trim();
    const e = email.trim();
    if (!u || !e || !pwd) {
        return res.status(400).json({ message: 'missing fields', timestamp: new Date().toISOString() });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return res.status(400).json({ message: 'invalid email', timestamp: new Date().toISOString() });
    }

    const saltRounds = 12;
    const pwdhash = bcrypt.hash(pwd, saltRounds);

    try {
        const info = insert.run(u, e, pwdhash);
        const id = Number(info.lastInsertRowid);
        return res
            .status(201)
            .location(`/users/${id}`)
            .json({ id, username: u, email: e, createdAt: new Date().toISOString() });
    } catch (e: any) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'username or email already exists', timestamp: new Date().toISOString() });
        }
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});



export default router;