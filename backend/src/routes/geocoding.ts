import express from 'express';
import { getClientIp } from '../tools';

const router = express.Router();
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY as string;
if (!GEOAPIFY_API_KEY) throw new Error('GEOAPIFY_API_KEY is required');



router.get("/geocoding/coordinates/query", async (req, res) => {
    const { query }: { query: string } = req.body ?? {};
    if (!query) {
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    const q = query.trim();
    try {
        const geores = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${q}&apiKey=${GEOAPIFY_API_KEY}`, {
            method: "GET"
        })
        const geodata = await geores.json();
        const { lat, lon }: { lat: number, lon: number } = geodata.features[0].properties;
        res.status(200).json({ lat: lat, lon: lon });
    } catch (error) {
        res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.get("/geocoding/coordinates/ip", async (req, res) => {
    const ip = getClientIp(req);
    try {
        const geores = await fetch(`https://api.geoapify.com/v1/ipinfo?ip=${ip}&apiKey=${GEOAPIFY_API_KEY}`, {
            method: "GET"
        })
        const geodata = await geores.json();
        const { latitude, longitude }: { latitude: number, longitude: number } = geodata.location;
        res.status(200).json({ lat: latitude, lon: longitude });
    } catch (error) {
        res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

export default router;