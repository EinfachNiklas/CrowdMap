import express from 'express';
import db from '../db/db';
import bcrypt from 'bcrypt';
import Authentication from '../authentication';

const router = express.Router();
const insert = db.prepare("INSERT INTO users (username, email, pwdhash) VALUES (?,?,?)");
const selectByID = db.prepare("SELECT id, username, email, createdAt FROM users WHERE id = ?");
const selectBySearch = db.prepare("SELECT username, email FROM users WHERE username = ? OR email = ?");

router.post("/users/", async (req, res) => {
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
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).{6,}$/.test(pwd)) {
        return res.status(400).json({ message: 'invalid password', timestamp: new Date().toISOString() });
    }

    const saltRounds = 12;
    const pwdhash = await bcrypt.hash(pwd, saltRounds);

    try {
        const info = insert.run(u, e, pwdhash);
        const id = Number(info.lastInsertRowid);
        return res
            .status(201)
            .location(`/users/search/${id}`)
            .json(selectByID.get(id));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'username or email already exists', timestamp: new Date().toISOString() });
        }
        console.error(e);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.get("/users/search/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    if (Number(Authentication.getUserId(req)) !== id) {
        return res.status(401).json({ message: 'unauthorized', timestamp: new Date().toISOString() });
    }
    try {
        const row = selectByID.get(id);
        if (row) {
            return res.status(200).json(row);
        } else {
            return res.status(404).json({ message: 'no entry found', timestamp: new Date().toISOString() });
        }
    } catch (e: unknown) {
        console.error(e);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }

});

router.get("/users/availability", (req, res) => {
    const { username, email } = req.query ?? {};
    const u = username ? (username as string).trim() : null;
    const e = email ? (email as string).trim() : null;
    const responseObject = { username: { available: true }, email: { available: true }, timestamp: "" };
    if (!u && !e) {
        return res.status(400).json({ message: 'no query provided', timestamp: new Date().toISOString() });
    }
    try {
        const rows = selectBySearch.all(u, e) as { username: string, email: string }[];
        rows.forEach(row => {
            if (row.username === u) {
                responseObject.username.available = false;
            }
            if (row.email === e) {
                responseObject.email.available = false;
            }
        });
        responseObject.timestamp = new Date().toISOString();
        return res.status(200).json(responseObject);

    } catch (e: unknown) {
        console.error(e);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }

});



export default router;