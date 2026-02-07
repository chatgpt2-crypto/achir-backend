
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ status: "Achir backend running" });
});

app.get('/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post('/users', (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO users(name) VALUES(?)", [name], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ id: this.lastID, name });
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
