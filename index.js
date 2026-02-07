const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// database مؤقت
let orders = [];
let nextId = 1;


// health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Achir backend working",
    orders: orders.length
  });
});


// get orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});


// add order
app.post("/api/orders", (req, res) => {

  const order = {
    id: nextId++,
    name: req.body.name,
    phone: req.body.phone,
    city: req.body.city,
    type: req.body.type || "",
    note: req.body.note || "",
    created_at: new Date().toISOString()
  };

  orders.unshift(order);

  res.json({
    success: true,
    order
  });

});


// delete order
app.delete("/api/orders/:id", (req, res) => {

  const id = parseInt(req.params.id);

  orders = orders.filter(o => o.id !== id);

  res.json({
    success: true
  });

});


app.listen(PORT, () => {
  console.log("Achir backend running on port", PORT);
});
