require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// إنشاء قاعدة البيانات
const db = new sqlite3.Database('./database.db');

// إنشاء جدول الطلبات إذا لم يوجد
db.run(`
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT,
  city TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.json({
    status: "Achir backend يعمل بنجاح"
  });
});

// عرض الطلبات
app.get('/api/orders', (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// إضافة طلب جديد
app.post('/api/orders', (req, res) => {
  const { name, phone, city, note } = req.body;

  db.run(
    "INSERT INTO orders (name, phone, city, note) VALUES (?, ?, ?, ?)",
    [name, phone, city, note],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        orderId: this.lastID
      });
    }
  );
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
