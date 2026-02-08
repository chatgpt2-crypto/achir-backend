const express = require("express");
const cors = require("cors");
require("./db"); // ينشئ قاعدة البيانات والجدول

const ordersRouter = require("./src/routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

// Health
app.get("/", (req, res) => {
  res.send("Achir Backend is running");
});

app.use("/api/orders", ordersRouter);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
