const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Update these values to match your MySQL 8 setup.
// Better: put your password in the MYSQL_PASSWORD environment variable.
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.MYSQL_PASSWORD || "ravi143",
  database: "ravi_product_db",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    console.error("Check MySQL service, password, and run productdb.sql first.");
    return;
  }
  console.log("Connected to MySQL 8 database: ravi_product_db");
});

function query(sql, values, res, successStatus = 200) {
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: err.message });
    }
    res.status(successStatus).json(result);
  });
}

app.get("/api/products", (req, res) => {
  query("SELECT * FROM products ORDER BY product_id DESC", [], res);
});

app.get("/api/products/:id", (req, res) => {
  query("SELECT * FROM products WHERE product_id = ?", [req.params.id], res);
});

app.post("/api/products", (req, res) => {
  const { product_id, product_name, category, price, quantity, reorder_level } = req.body;
  if (!product_id || !product_name || !category || price === "" || quantity === "" || reorder_level === "") {
    return res.status(400).json({ message: "Please fill in all product fields." });
  }
  query(
    "INSERT INTO products (product_id, product_name, category, price, quantity, reorder_level) VALUES (?, ?, ?, ?, ?, ?)",
    [product_id, product_name.trim(), category.trim(), price, quantity, reorder_level],
    res,
    201
  );
});

app.put("/api/products/:id", (req, res) => {
  const { product_name, category, price, quantity, reorder_level } = req.body;
  if (!product_name || !category || price === "" || quantity === "" || reorder_level === "") {
    return res.status(400).json({ message: "Please fill in all product fields." });
  }
  db.query(
    "UPDATE products SET product_name=?, category=?, price=?, quantity=?, reorder_level=? WHERE product_id=?",
    [product_name.trim(), category.trim(), price, quantity, reorder_level, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: "Product ID not found." });
      res.json({ message: "Product updated successfully." });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE product_id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!result.affectedRows) return res.status(404).json({ message: "Product ID not found." });
    res.json({ message: "Product deleted successfully." });
  });
});

app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => {
  console.log(`Ravi Product Management System running at http://localhost:${PORT}`);
});
