const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

// إنشاء جدول الطلبات
db.serialize(() => {

db.run(`
CREATE TABLE IF NOT EXISTS orders (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT NOT NULL,

phone TEXT NOT NULL,

city TEXT NOT NULL,

service TEXT DEFAULT 'كراء معدات',

note TEXT DEFAULT '',

status TEXT DEFAULT 'pending',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);

});

module.exports = db;
