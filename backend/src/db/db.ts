import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname,"../../data/app.db"));
db.pragma('journal_mode = WAL');
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        pwdhash VARHCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL

    )
    `);

export default db;1