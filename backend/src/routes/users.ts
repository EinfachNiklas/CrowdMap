import express from 'express';
import db from '../db/db';
import bcrypt from 'bcrypt';

const router = express.Router();
const insert = db.prepare("INSERT INTO users (username, email, pwdhash) VALUES (?,?,?)");
const selectByID = db.prepare("SELECT id, username, email, createdAt FROM users WHERE id = ?");
const selectBySearch = db.prepare("SELECT id, username, email, createdAt FROM users WHERE username = ? OR email = ?");

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
    const pwdhash = bcrypt.hashSync(pwd, saltRounds);

    try {
        const info = insert.run(u, e, pwdhash);
        const id = Number(info.lastInsertRowid);
        return res
            .status(201)
            .location(`/users/search/${id}`)
            .json({ id, username: u, email: e, createdAt: new Date().toISOString() });
    } catch (e: any) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'username or email already exists', timestamp: new Date().toISOString() });
        }
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString(), details: e.message });
    }
});

router.get("/users/search/:id",(req, res)=>{
    const id = parseInt(req.params.id);
    if(isNaN(id)){
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    try {
        const row = selectByID.get(id);
        if(row){
            return res.status(200).json(row);
        }else{
            return res.status(404).json({ message: 'no entry found', timestamp: new Date().toISOString() });
        }
    } catch (e: any) {
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString(), details: e.message });
    }
 
});

router.get("/users/search",(req, res)=>{
    let { username, email } = req.query ?? {};
    const u = username ? (username as string).trim() : null;
    const e = email ? (email as string).trim() : null;
    if (!u && !e) {
        return res.status(400).json({ message: 'no query provided', timestamp: new Date().toISOString() });
    }
    try {
        const rows = selectBySearch.all(u,e);
        if(rows.length){
            return res.status(200).json(rows);
        }else{
            return res.status(404).json({ message: 'no entries found', timestamp: new Date().toISOString() });
        }
    } catch (e: any) {
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString(), details: e.message });
    }
 
});



export default router;