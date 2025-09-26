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

interface CrowdEventVoting {
    userId: number;
    crowdEventId: Buffer;
    isUpvote: boolean;
}

const router = express.Router();

const insertCrowdEvent = db.prepare("INSERT INTO crowdEvents (crowdEventId, title, lat, lon, createdBy) VALUES (?,?,?,?,?)");
const selectCrowdEvent = db.prepare("SELECT * FROM crowdEvents WHERE crowdEventId = ?")
const insertCrowdEventVotings = db.prepare("INSERT INTO crowdEventVotings (userId, crowdEventId, isUpvote) VALUES (?,?,?)");
const selectCrowdEventVotings = db.prepare("SELECT * FROM crowdEventVotings WHERE userId = ? and crowdEventId = ?");
const updateCrowdEventVotings = db.prepare("UPDATE crowdEventVotings SET isUpvote = ? WHERE userId = ? AND crowdEventId = ?");
const deleteCrowdEventVotings = db.prepare("DELETE FROM crowdEventVotings WHERE userId = ? AND crowdEventId = ?");
const selectCrowdEventVotingsCount = db.prepare("SELECT COUNT(*) AS totalCount, SUM(isUpvote = 0) as downvoteCount FROM crowdEventVotings WHERE crowdEventId = ?");

const mapCrowdEvent = (crowdEventBlob: CrowdEventBlob): CrowdEvent => {
    return {
        crowdEventId: uuidStringify(crowdEventBlob.crowdEventId),
        title: crowdEventBlob.title,
        lat: crowdEventBlob.lat,
        lon: crowdEventBlob.lon,
        createdBy: crowdEventBlob.createdBy
    }
}


const handleVoting = (req: Request, res: Response, isUpvote: boolean) => {
    const crowdEventId = req.params.id;
    try {
        const crowdEventIdBuffer = uuidParse(crowdEventId);
        const rowCrowdEvent = selectCrowdEvent.get(crowdEventIdBuffer) as CrowdEventBlob;
        if (!rowCrowdEvent) {
            return res.status(404).json({ message: 'no entry found', timestamp: new Date().toISOString() });
        }
        const userId = Authentication.getUserId(req)
        const rowCrowdEventVoting = selectCrowdEventVotings.get(userId, crowdEventIdBuffer) as CrowdEventVoting;
        if (!rowCrowdEventVoting) {
            insertCrowdEventVotings.run(userId, crowdEventIdBuffer, isUpvote ? 1 : 0);
            return res.status(200).json({});
        }
        if (rowCrowdEventVoting.isUpvote == isUpvote) {
            return res.status(409).json({ message: 'this voting already exists', timestamp: new Date().toISOString() })
        }
        updateCrowdEventVotings.run(isUpvote ? 1 : 0, userId, crowdEventIdBuffer);
        return res.status(200).json({});
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid UUID string') {
            return res.status(400).json({ message: 'invalid crowdEventId', timestamp: new Date().toISOString() });
        }
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
}


router.post("/crowdEvents", (req, res) => {
    const { title, lat, lon } = req.body ?? {};
    if (typeof title !== 'string' || typeof lat !== 'number' || typeof lon !== 'number') {
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    try {
        if (!title.trim() || title.length > 64) {
            return res.status(400).json({ message: 'invalid title', timestamp: new Date().toISOString() });
        }
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return res.status(400).json({ message: 'invalid coordinates', timestamp: new Date().toISOString() });
        }
        const uuid = uuidParse(crypto.randomUUID());
        const userid = Authentication.getUserId(req);
        insertCrowdEvent.run(uuid, title, lat, lon, userid);
        const row: CrowdEventBlob = selectCrowdEvent.get(uuid) as CrowdEventBlob;
        const resource: CrowdEvent = mapCrowdEvent(row);
        return res.status(201).location(`/crowdEvents/${uuidStringify(uuid)}`).json(resource);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.get("/crowdEvents/:id", (req, res) => {
    const crowdEventId = req.params.id;
    try {
        const row = selectCrowdEvent.get(uuidParse(crowdEventId)) as CrowdEventBlob;
        if (!row) {
            return res.status(404).json({ message: 'no entry found', timestamp: new Date().toISOString() });
        }
        const crowdEvent = mapCrowdEvent(row);
        return res.status(200).json(crowdEvent);
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid UUID string') {
            return res.status(400).json({ message: 'invalid crowdEventId', timestamp: new Date().toISOString() });
        }
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.post("/crowdEvents/:id/voting/up", (req, res) => {
    handleVoting(req, res, true);
});

router.post("/crowdEvents/:id/voting/down", (req, res) => {
    handleVoting(req, res, false);
});

router.get("/crowdEvents/:id/voting", (req, res) => {
    const crowdEventId = req.params.id;
    try {
        const votingsCount = selectCrowdEventVotingsCount.get(uuidParse(crowdEventId)) as { totalCount: number, downvoteCount: number };
        return res.status(200).json({ votingsCount: (votingsCount.totalCount - votingsCount.downvoteCount * 2) });
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid UUID string') {
            return res.status(400).json({ message: 'invalid crowdEventId', timestamp: new Date().toISOString() });
        }
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.delete("/crowdEvents/:id/voting", (req, res) => {
    const crowdEventId = req.params.id;
    try {
        const deleteRes = deleteCrowdEventVotings.run(Authentication.getUserId(req), uuidParse(crowdEventId));
        if (deleteRes.changes === 0) {
            return res.status(404).json({ message: 'no entry found', timestamp: new Date().toISOString() });
        }
        return res.status(200).json({});
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid UUID string') {
            return res.status(400).json({ message: 'invalid crowdEventId', timestamp: new Date().toISOString() });
        }
        console.error(error);
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

export default router;