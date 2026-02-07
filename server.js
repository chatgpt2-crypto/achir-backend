const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// ========= إعدادات مهمة =========
const PORT = process.env.PORT || 10000;

// ضع رابط صفحات GitHub Pages عندك هنا (مهم لـ CORS)
// مثال: https://chatgpt2-crypto.github.io
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// كلمة سر Super Admin (ضعها في Render Environment)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin47";

// سر JWT (ضعه في Render Environment)
const JWT_SECRET = process.env.JWT_SECRET || "change_me_super_secret";

// مكان تخزين البيانات (إذا عملت Disk في Render خليها /data)
const DATA_DIR = process.env.DATA_DIR || ".";
const DB_FILE = path.join(DATA_DIR, "orders.json");

// ========= CORS =========
app.use(cors({
  origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN,
  methods: ["GET","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ========= قاعدة بيانات بسيطة JSON =========
function loadDB(){
  try{
    if(!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf-8");
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  }catch(e){
    return [];
  }
}
function saveDB(data){
  try{
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  }catch(e){}
}

// ========= Middleware Auth =========
function auth(req, res, next){
  const h = req.headers.authorization || "";
  if(!h.startsWith("Bearer ")) return res.status(401).json({ error:"missing_token" });
  const token = h.slice(7);
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  }catch(e){
    return res.status(401).json({ error:"invalid_token" });
  }
}

// ========= Health =========
app.get("/api/health", (req,res)=> res.json({ ok:true, service:"achir-backend" }));

// ========= Login (Super Admin) =========
app.post("/api/auth/login", (req,res)=>{
  const { password } = req.body || {};
  if(password !== ADMIN_PASSWORD){
    return res.status(401).json({ error:"wrong_password" });
  }
  const token = jwt.sign({ role:"admin" }, JWT_SECRET, { expiresIn:"7d" });
  res.json({ token });
});

// ========= Orders =========

// إضافة طلب (Public)
app.post("/api/orders", (req,res)=>{
  const { name, phone, city, type, note } = req.body || {};
  if(!name || !phone || !city){
    return res.status(400).json({ error:"missing_fields" });
  }

  const db = loadDB();
  const order = {
    id: uuid(),
    name: String(name),
    phone: String(phone),
    city: String(city),
    type: String(type || "طلب"),
    note: String(note || ""),
    createdAt: new Date().toISOString()
  };
  db.unshift(order);
  saveDB(db);
  res.json(order);
});

// جلب الطلبات (Admin فقط)
app.get("/api/orders", auth, (req,res)=>{
  const db = loadDB();
  res.json(db);
});

// حذف طلب (Admin فقط)
app.delete("/api/orders/:id", auth, (req,res)=>{
  const id = req.params.id;
  const db = loadDB();
  const before = db.length;
  const afterDB = db.filter(o => o.id !== id);
  saveDB(afterDB);
  res.json({ ok:true, deleted: before - afterDB.length });
});

// Root
app.get("/", (req,res)=> res.send("Achir Backend is running"));

app.listen(PORT, ()=> console.log("Server running on port", PORT));
