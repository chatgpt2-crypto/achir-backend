const db = require("../../db");

function createOrder(order, cb) {
  const {
    name, phone, city,
    equipment, start, end,
    address, note
  } = order;

  db.run(
    `INSERT INTO orders (name, phone, city, equipment, start, end, address, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, phone, city, equipment, start, end, address, note],
    function (err) {
      if (err) return cb(err);
      cb(null, { id: this.lastID });
    }
  );
}

function getOrders(cb) {
  db.all(
    `SELECT id, name, phone, city, equipment, start, end, address, note, created_at
     FROM orders
     ORDER BY id DESC`,
    [],
    (err, rows) => {
      if (err) return cb(err);
      cb(null, rows);
    }
  );
}

function deleteOrder(id, cb) {
  db.run(`DELETE FROM orders WHERE id = ?`, [id], function (err) {
    if (err) return cb(err);
    cb(null, { deleted: this.changes });
  });
}

module.exports = { createOrder, getOrders, deleteOrder };
