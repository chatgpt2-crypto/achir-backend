const db = require("../../db");


// إنشاء جدول الطلبات إذا غير موجود
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


// إضافة طلب
function createOrder(name, phone, city, note) {

  return new Promise((resolve, reject) => {

    const sql = `
      INSERT INTO orders (name, phone, city, note)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [name, phone, city, note], function(err) {

      if (err) reject(err);

      else resolve({
        id: this.lastID,
        name,
        phone,
        city,
        note
      });

    });

  });

}


// جلب كل الطلبات
function getOrders() {

  return new Promise((resolve, reject) => {

    db.all(
      "SELECT * FROM orders ORDER BY id DESC",
      [],
      (err, rows) => {

        if (err) reject(err);

        else resolve(rows);

      }
    );

  });

}


// حذف طلب
function deleteOrder(id) {

  return new Promise((resolve, reject) => {

    db.run(
      "DELETE FROM orders WHERE id=?",
      [id],
      function(err) {

        if (err) reject(err);

        else resolve(true);

      }
    );

  });

}


// تصدير
module.exports = {
  createOrder,
  getOrders,
  deleteOrder
};
