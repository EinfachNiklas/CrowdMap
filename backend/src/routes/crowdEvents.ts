import express, { Request, Response } from 'express';
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
const insertCrowdEventVotings = db.prepare("INSERT INTO crowdEventVotings (userid, crowdEventId, isUpvote) VALUES (?,?,?)");


const handleVoting = (req: Request, res: Response, isUpvote: boolean) => {
    const crowdEventId = req.params.id;
    try {
        const row = selectCrowdEvent.get(uuidParse(crowdEventId)) as CrowdEventBlob;
        if (!row) {
            return res.status(404).json({ message: 'no entry found', timestamp: new Date().toISOString() });
        }
        insertCrowdEventVotings.run(Authentication.getUserId(req), row.crowdEventId, isUpvote ? 1 : 0);
        return res.status(200).json({});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
}

function mapCrowdEvent(crowdEventBlob: CrowdEventBlob): CrowdEvent {
    return {
        crowdEventId: uuidStringify(crowdEventBlob.crowdEventId),
        title: crowdEventBlob.title,
        lat: crowdEventBlob.lat,
        lon: crowdEventBlob.lon,
        createdBy: crowdEventBlob.createdBy
    }
}


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
        const ressource: CrowdEvent = mapCrowdEvent(row);
        return res.status(201).location(`/crowdEvents/${uuidStringify(uuid)}`).json(ressource);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.get("/crowdEvents/:id", (req, res) => {
    console.log("a")
    const crowdEventId = req.params.id;
    try {
        const row = selectCrowdEvent.get(uuidParse(crowdEventId)) as CrowdEventBlob;
        if (!row) {
            return res.status(404).json({ message: 'no entry found', timestamp: new Date().toISOString() });
        }
        const crowdEvent = mapCrowdEvent(row);
        return res.status(200).json(crowdEvent);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.post("/crowdEvents/:id/upvote", (req, res) => {
    handleVoting(req, res, true);
});

router.post("/crowdEvents/:id/downvote", (req, res) => {
    handleVoting(req, res, false);
});

export default router;