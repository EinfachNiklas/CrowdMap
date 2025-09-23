import express from 'express';
import db from '../db/db';
import Authentication from '../authentication';
import { uuidParse, uuidStringify } from '../tools';

interface CrowdEventBlob {
    crowdEventId: Buffer;
    title: string;
    lat: number;
    lon: number;
    createdBy: number;
}

interface CrowdEvent {
    crowdEventId: string;
    title: string;
    lat: number;
    lon: number;
    createdBy: number;
}

const router = express.Router();

const insertCrowdEvent = db.prepare("INSERT INTO crowdEvents (crowdEventId, title, lat, lon, createdBy) VALUES (?,?,?,?,?)");
const selectCrowdEvent = db.prepare("SELECT * FROM crowdEvents WHERE crowdEventId = ?")

router.post("/crowdEvents", (req, res) => {
    const { title, lat, lon } = req.body ?? {};
    if (typeof title !== 'string' || typeof lat !== 'number' || typeof lon !== 'number') {
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    const userid = Authentication.getUserId(req);
    const uuid = uuidParse(crypto.randomUUID());
    try {
        insertCrowdEvent.run(uuid, title, lat, lon, userid);
        const row: CrowdEventBlob = selectCrowdEvent.get(uuid) as CrowdEventBlob;
        const ressource: CrowdEvent = {
            crowdEventId: uuidStringify(row.crowdEventId),
            title: row.title,
            lat: row.lat,
            lon: row.lon,
            createdBy: row.createdBy
        }
        return res.status(201).location(`/crowdEvents/${uuidStringify(uuid)}`).json(ressource);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});