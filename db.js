const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("DB error:", err.message);
  else console.log("Connected to SQLite database.");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      city TEXT,
      equipment TEXT,
      start TEXT,
      end TEXT,
      address TEXT,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
});

module.exports = db;
