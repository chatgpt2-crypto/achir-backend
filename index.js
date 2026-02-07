const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// middleware
app.use(cors());
app.use(express.json());

// قاعدة بيانات مؤقتة (في الذاكرة)
let orders = [];
let nextId = 1;

// health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Achir backend working",
    ordersCount: orders.length
  });
});

// جلب جميع الطلبات
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// إضافة طلب
app.post("/api/orders", (req, res) => {
  const { name, phone, city, type, note } = req.body;

  if (!name || !phone || !city) {
    return res.status(400).json({
      message: "name, phone, city required"
    });
  }

  const order = {
    id: nextId++,
    name,
    phone,
    city,
    type: type || "",
    note: note || "",
    created_at: new Date().toISOString()
  };

  orders.unshift(order);

  res.json({
    success: true,
    order
  });
});

// تعديل طلب
app.put("/api/orders/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({
      message: "order not found"
    });
  }

  order.name = req.body.name ?? order.name;
  order.phone = req.body.phone ?? order.phone;
  order.city = req.body.city ?? order.city;
  order.type = req.body.type ?? order.type;
  order.note = req.body.note ?? order.note;

  res.json({
    success: true,
    order
  });
});

// حذف طلب
app.delete("/api/orders/:id", (req, res) => {
  const id = parseInt(req.params.id);

  orders = orders.filter(o => o.id !== id);

  res.json({
    success: true
  });
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
