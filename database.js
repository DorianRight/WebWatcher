const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        website_id INTEGER,
        status_code INTEGER,
        response_time INTEGER,
        is_up INTEGER,
        checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT,
        FOREIGN KEY (website_id) REFERENCES websites (id)
    )`);
});

module.exports = db;