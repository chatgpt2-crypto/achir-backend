const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "achir_super_admin_2026";

// ✅ حماية فقط للأدمن
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "missing_token" });
  if (token !== ADMIN_TOKEN) return res.status(403).json({ error: "invalid_token" });
  next();
}

// ✅ 1) إنشاء طلب (بدون توكن) — للزبون
router.post("/", (req, res) => {
  const body = req.body || {};

  // أقل شيء مطلوب
  if (!body.name || !body.phone || !body.city) {
    return res.status(400).json({ error: "missing_fields" });
  }

  Order.createOrder(body, (err, result) => {
    if (err) return res.status(500).json({ error: "db_error", details: err.message });
    res.json({ ok: true, id: result.id });
  });
});

// ✅ 2) جلب الطلبات (توكن) — للأدمن فقط
router.get("/", requireAdmin, (req, res) => {
  Order.getOrders((err, rows) => {
    if (err) return res.status(500).json({ error: "db_error", details: err.message });
    res.json(rows);
  });
});

// ✅ 3) حذف طلب (توكن) — للأدمن فقط
router.delete("/:id", requireAdmin, (req, res) => {
  Order.deleteOrder(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: "db_error", details: err.message });
    res.json({ ok: true, ...result });
  });
});

module.exports = router;
