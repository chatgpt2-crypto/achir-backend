const express = require("express");
const router = express.Router();

const db = require("../models/Order");

// التحقق من التوكن
function checkToken(req, res, next) {

const auth = req.headers.authorization;

if (!auth) {
return res.status(401).json({ error: "missing_token" });
}

const token = auth.split(" ")[1];

if (token !== "achir_super_admin_2026") {
return res.status(403).json({ error: "invalid_token" });
}

next();

}

// إضافة طلب
router.post("/", checkToken, (req, res) => {

const { name, phone, city, service, note } = req.body;

if (!name || !phone || !city) {
return res.status(400).json({ error: "missing_fields" });
}

db.run(

`INSERT INTO orders (name, phone, city, service, note)
VALUES (?, ?, ?, ?, ?)`,

[name, phone, city, service || "كراء معدات", note || ""],

function(err) {

if (err) {
return res.status(500).json({ error: err.message });
}

res.json({

success: true,

id: this.lastID

});

}

);

});

// جلب الطلبات
router.get("/", checkToken, (req, res) => {

db.all(

"SELECT * FROM orders ORDER BY id DESC",

[],

(err, rows) => {

if (err) {
return res.status(500).json({ error: err.message });
}

res.json(rows);

}

);

});

// حذف طلب
router.delete("/:id", checkToken, (req, res) => {

const id = req.params.id;

db.run(

"DELETE FROM orders WHERE id = ?",

[id],

function(err) {

if (err) {
return res.status(500).json({ error: err.message });
}

res.json({

success: true

});

}

);

});

module.exports = router;
