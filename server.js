const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// ✅ عدّل هذا إذا تغيّر رابط موقعك
const ALLOWED_ORIGINS = [
  "https://chatgpt2-crypto.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

app.use(cors({
  origin: function (origin, cb) {
    // السماح لطلبات بدون origin (مثل المتصفح مباشرة)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked for origin: " + origin));
  },
  credentials: false
}));

// ✅ إعدادات الدخول (ضعها في Render ENV)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin47";
const JWT_SECRET = process.env.JWT_SECRET || "change_me_very_secret";

// ✅ قاعدة بيانات بسيطة (ذاكرة)
// ملاحظة: هذا يُصفّر إذا Render أعاد تشغيل السيرفر.
// لو تريد حفظ دائم 100% نقلك لقاعدة MongoDB مجاناً.
let orders = [];
let nextId = 1;

// ✅ Health
app.get("/", (req, res) => {
  res.json({ message: "Achir backend working" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "achir-backend", time: new Date().toISOString() });
});

// ✅ Login: يرجع Token
app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "password_required" });

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "wrong_password" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// ✅ Middleware تحقق من التوكن
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "missing_token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "forbidden" });
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

// ✅ إنشاء طلب (عام)
app.post("/api/orders", (req, res) => {
  const { name, phone, city, note, type } = req.body || {};

  if (!name || !phone || !city) {
    return res.status(400).json({ error: "name_phone_city_required" });
  }

  const item = {
    id: String(nextId++),
    name: String(name).trim(),
    phone: String(phone).trim(),
    city: String(city).trim(),
    type: type ? String(type).trim() : "طلب خدمة",
    note: note ? String(note).trim() : "",
    created_at: new Date().toISOString()
  };

  orders.unshift(item);
  res.json({ ok: true, order: item });
});

// ✅ جلب الطلبات (محمي - Admin فقط)
app.get("/api/orders", requireAdmin, (req, res) => {
  res.json(orders);
});

// ✅ حذف طلب (محمي - Admin فقط)
app.delete("/api/orders/:id", requireAdmin, (req, res) => {
  const id = req.params.id;
  const before = orders.length;
  orders = orders.filter(o => o.id !== id);
  res.json({ ok: true, deleted: before - orders.length });
});

// ✅ تشغيل
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
