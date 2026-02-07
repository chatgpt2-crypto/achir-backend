const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let orders = [];
let currentId = 1;

// اختبار
app.get("/", (req, res) => {
  res.json({ message: "Achir backend working" });
});

// جلب الطلبات
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// إضافة طلب
app.post("/api/orders", (req, res) => {

  const newOrder = {
    id: currentId++,
    name: req.body.name,
    phone: req.body.phone,
    city: req.body.city,
    note: req.body.note || "",
    created_at: new Date().toISOString()
  };

  orders.push(newOrder);

  res.json({
    success: true,
    order: newOrder
  });
});

// حذف طلب
app.delete("/api/orders/:id", (req, res) => {

  const id = parseInt(req.params.id);

  orders = orders.filter(order => order.id !== id);

  res.json({ success: true });

});

// تحديث طلب
app.put("/api/orders/:id", (req, res) => {

  const id = parseInt(req.params.id);

  const order = orders.find(order => order.id === id);

  if (!order) {
    return res.status(404).json({ error: "Not found" });
  }

  order.name = req.body.name;
  order.phone = req.body.phone;
  order.city = req.body.city;
  order.note = req.body.note;

  res.json({ success: true });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
