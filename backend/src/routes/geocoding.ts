import express from 'express';
import { getClientIp } from '../tools';

const router = express.Router();
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY as string;
if (!GEOAPIFY_API_KEY) throw new Error('GEOAPIFY_API_KEY is required');
const isProd = process.env.NODE_ENV === "production";



router.get("/geocoding/coordinates/query", async (req, res) => {
    const query = req.query.query;
    if (!query || typeof query !== "string") {
        return res.status(400).json({ message: 'invalid types', timestamp: new Date().toISOString() });
    }
    const q = query.trim();
    try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 5000);
        const url = new URL('https://api.geoapify.com/v1/geocode/search');
        url.search = new URLSearchParams({ text: q, apiKey: GEOAPIFY_API_KEY }).toString();
        const geores = await fetch(url, { method: "GET", signal: controller.signal });
        clearTimeout(t);
        if (!geores.ok) {
            return res.status(geores.status).json({ message: 'geocoder_error', timestamp: new Date().toISOString() });
        }
        const geodata = await geores.json();
        if (geodata.features.length === 0) {
            return res.status(200).json({});
        }
        const { lat, lon }: { lat: number, lon: number } = geodata.features[0].properties;
        return res.status(200).json({ lat: lat, lon: lon });
    } catch (error) {
        return res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

router.get("/geocoding/coordinates/ip", async (req, res) => {
    const ip = getClientIp(req);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    try {
        const geores = await fetch(`https://api.geoapify.com/v1/ipinfo?${isProd ? "ip=" + ip : ""}&apiKey=${GEOAPIFY_API_KEY}`, {
            method: "GET",
            signal: controller.signal
        })
        clearTimeout(t);
        const geodata = await geores.json();
        const { latitude, longitude }: { latitude: number, longitude: number } = geodata.location;
        res.status(200).json({ lat: latitude, lon: longitude });
    } catch (error) {
        res.status(500).json({ message: 'internal_error', timestamp: new Date().toISOString() });
    }
});

export default router;