// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./src/db"); // لازم يكون عندك src/db.js

const app = express();
app.use(express.json());

// ✅ CORS (مهم جدا لـ GitHub Pages)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Achir Backend is running ✅");
});

// =============================
// ✅ Auth Middleware (TOKEN)
// =============================
const ADMIN_TOKEN = "achir_super_admin_2026";

function requireToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) return res.status(401).json({ error: "missing_token" });
  if (token !== ADMIN_TOKEN) return res.status(403).json({ error: "invalid_token" });

  next();
}

// =============================
// ✅ Create table if not exists
// =============================
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT
