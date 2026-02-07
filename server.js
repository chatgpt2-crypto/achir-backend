require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/auth");
const orderRoutes = require("./src/routes/orders");
const publicRoutes = require("./src/routes/public");

const app = express();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, cb){
    // allow same-origin / curl / server-to-server
    if(!origin) return cb(null, true);
    // allow github pages + your domains
    if(ALLOWED_ORIGINS.length === 0) return cb(null, true);
    if(ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  }
}));

app.use(express.json());

app.get("/", (req,res)=> res.send("Achir Backend is running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(()=>{
    console.log("MongoDB connected");
    app.listen(PORT, ()=> console.log("Server running on", PORT));
  })
  .catch(err=>{
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });
