const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS (خليه مفتوح مؤقتاً)
app.use(cors());

// ✅ قراءة JSON
app.use(express.json());

// ✅ Route الطلبات
const ordersRoutes = require("./src/routes/orders");
app.use("/api/orders", ordersRoutes);

// ✅ صفحة صحة السيرفر
app.get("/", (req, res) => {
  res.send("Achir Backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
