const express = require("express");
const cors = require("cors");

const app = express();


// تفعيل CORS للسماح بالاتصال من GitHub Pages
app.use(cors({
  origin: "*",
  methods: ["GET","POST","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));


app.use(express.json());


// توكن الادمن
const ADMIN_TOKEN = "achir_super_admin_2026";


// قاعدة بيانات مؤقتة
let orders = [];


// اختبار السيرفر
app.get("/", (req,res)=>{
  res.send("Achir Backend is running");
});


// جلب الطلبات
app.get("/api/orders", (req,res)=>{

  const token = req.headers.authorization;

  if(!token || token !== "Bearer "+ADMIN_TOKEN){
    return res.status(401).json({error:"missing_token"});
  }

  res.json(orders);

});


// إضافة طلب
app.post("/api/orders", (req,res)=>{

  const token = req.headers.authorization;

  if(!token || token !== "Bearer "+ADMIN_TOKEN){
    return res.status(401).json({error:"missing_token"});
  }

  const order = {
    id: Date.now().toString(),
    name: req.body.name,
    phone: req.body.phone,
    city: req.body.city
  };

  orders.push(order);

  res.json({success:true});

});


// حذف طلب
app.delete("/api/orders/:id", (req,res)=>{

  const token = req.headers.authorization;

  if(!token || token !== "Bearer "+ADMIN_TOKEN){
    return res.status(401).json({error:"missing_token"});
  }

  orders = orders.filter(o=>o.id !== req.params.id);

  res.json({success:true});

});


// تشغيل السيرفر
const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>{
  console.log("Server running on port "+PORT);
});
