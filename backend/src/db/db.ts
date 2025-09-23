import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
const dbPath = path.join(__dirname, "../../data/app.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        pwdhash VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `);
db.exec(`
    CREATE TABLE IF NOT EXISTS refreshTokenSessions (
        userId INTEGER PRIMARY KEY NOT NULL,
        jtiHash TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
    `);

db.exec(`
    CREATE TABLE IF NOT EXISTS crowdEvents (
        crowdEventId BLOB PRIMARY KEY NOT NULL,
        title VARCHAR(64) NOT NULL,
        lat DECIMAL(8,6) NOT NULL,
        lon DECIMAL(9,6) NOT NULL,
        createdBy INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (lat BETWEEN -90 AND 90),
        CHECK (lon BETWEEN -180 AND 180),
        FOREIGN KEY(createdBy) REFERENCES users(id) ON DELETE CASCADE
    )
    `);

db.exec(`
    CREATE TABLE IF NOT EXISTS crowdEventsVotings (
        userid INTEGER NOT NULL,
        crowdEventId BLOB NOT NULL,
        FOREIGN KEY(userid) REFERENCES users(id) ON DELETE CASCADE
        FOREIGN KEY(crowdEventId) REFERENCES crowdEvents(crowdEventId) ON DELETE CASCADE
    )
    `);

export default db;