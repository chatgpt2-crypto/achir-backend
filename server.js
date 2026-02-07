const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json({ limit: "1mb" }));

// ===== ENV =====
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const DB_PATH = process.env.DB_PATH || "./app.db";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// ===== CORS =====
app.use(cors({
  origin: function(origin, cb){
    if(!origin) return cb(null, true); // requests from curl/postman
    if(ALLOWED_ORIGINS.includes("*")) return cb(null, true);
    if(ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  }
}));

// ===== DB =====
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
  );
`);
const insertOrder = db.prepare(`
  INSERT INTO orders (id,name,phone,city,type,note,created_at)
  VALUES (@id,@name,@phone,@city,@type,@note,@created_at)
`);
const listOrders = db.prepare(`SELECT * FROM orders ORDER BY datetime(created_at) DESC`);
const deleteOrder = db.prepare(`DELETE FROM orders WHERE id = ?`);

// ===== HELPERS =====
function uid(){
  return "ord_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}
function auth(req,res,next){
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if(!token) return res.status(401).json({ error:"missing_token" });
  try{
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  }catch(e){
    return res.status(401).json({ error:"invalid_token" });
  }
}

// ===== ROUTES =====
app.get("/api/health", (req,res)=>{
  res.json({ status:"ok", time: new Date().toISOString() });
});

// Login (Admin)
app.post("/api/login", (req,res)=>{
  const { password } = req.body || {};
  if(!password) return res.status(400).json({ error:"password_required" });
  if(password !== ADMIN_PASSWORD) return res.status(401).json({ error:"wrong_password" });

  const token = jwt.sign({ role:"admin" }, JWT_SECRET, { expiresIn:"7d" });
  res.json({ token });
});

// Create order (PUBLIC)
app.post("/api/orders", (req,res)=>{
  const { name, phone, city, type, note } = req.body || {};
  if(!name || !phone || !city || !type){
    return res.status(400).json({ error:"missing_fields" });
  }
  const order = {
    id: uid(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    city: String(city).trim(),
    type: String(type).trim(),
    note: (note ? String(note).trim() : ""),
    created_at: new Date().toISOString()
  };
  insertOrder.run(order);
  res.json({ ok:true, order });
});

// List orders (PROTECTED)
app.get("/api/orders", auth, (req,res)=>{
  const rows = listOrders.all();
  res.json(rows);
});

// Delete order (PROTECTED)
app.delete("/api/orders/:id", auth, (req,res)=>{
  const id = req.params.id;
  deleteOrder.run(id);
  res.json({ ok:true });
});

// Export Excel (PROTECTED)
app.get("/api/orders/export", auth, async (req,res)=>{
  const rows = listOrders.all();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Orders");

  ws.columns = [
    { header: "ID", key:"id", width: 28 },
    { header: "الاسم", key:"name", width: 18 },
    { header: "الهاتف", key:"phone", width: 16 },
    { header: "المدينة", key:"city", width: 14 },
    { header: "نوع الطلب", key:"type", width: 16 },
    { header: "ملاحظة", key:"note", width: 30 },
    { header: "التاريخ", key:"created_at", width: 22 }
  ];
  ws.addRows(rows);
  ws.getRow(1).font = { bold: true };

  res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition",'attachment; filename="orders.xlsx"');
  await wb.xlsx.write(res);
  res.end();
});

app.use((req,res)=>{
  res.status(404).json({ error:"not_found" });
});

app.listen(PORT, ()=> console.log("Server running on port", PORT));
