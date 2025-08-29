import express from 'express';
import db from '../db/db';

const router = express.Router();

router.post("/users/", (req, res) => {
    const insert = db.prepare("INSERT INTO users (username, email, pwdhash, createdAt) VALUES (?,?,?,CURRENT_TIMESTAMP)");

    const { username, email, pwdhash } = req.body ?? {};
    if (!username || !email || !pwdhash) {
        return res.status(400).json({ message: 'missing fields', timestamp: new Date().toISOString() });
    }

    try {
        const info = insert.run(username, email, pwdhash);
        return res.status(201).json({
            id: Number(info.lastInsertRowid),
            username,
            email,
            createdAt: new Date().toISOString()
        });
    } catch (e: any) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'username or email already exists' });
        }
        return res.status(500).json({ message: 'internal_error', details: e.message });
    }
});



export default router;