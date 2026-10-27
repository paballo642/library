const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// ===================== BOOKS =====================

// Get all books
app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a book
app.post("/books", (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  const sql = "INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [title, author, genre, isbn, quantity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, title, author, genre, isbn, quantity });
  });
});

// Update a book
app.put("/books/:id", (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  const sql = "UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?";
  db.query(sql, [title, author, genre, isbn, quantity, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Book updated successfully" });
  });
});

// Delete a book
app.delete("/books/:id", (req, res) => {
  db.query("DELETE FROM books WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Book deleted successfully" });
  });
});

// ===================== USERS =====================

// Get all users
app.get("/users", (req, res) => {
  db.query("SELECT id, name, membership_id, role FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Login
app.post("/login", (req, res) => {
  const { membership_id, password, role } = req.body;
  const sql = "SELECT * FROM users WHERE membership_id = ? AND password = ? AND role = ?";
  db.query(sql, [membership_id, password, role], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid Membership ID, Password or Role" });
    }
    const user = results[0];
    res.json({
      id: user.id,
      name: user.name,
      membership_id: user.membership_id,
      role: user.role,
    });
  });
});

// Add a user
app.post("/users", (req, res) => {
  const { name, membership_id, password, role } = req.body;
  const sql = "INSERT INTO users (name, membership_id, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, membership_id, password, role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, membership_id, role });
  });
});

// Update a user
app.put("/users/:id", (req, res) => {
  const { name, membership_id, password, role } = req.body;
  const sql = "UPDATE users SET name=?, membership_id=?, password=?, role=? WHERE id=?";
  db.query(sql, [name, membership_id, password, role, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User updated successfully" });
  });
});

// Delete a user
app.delete("/users/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});

// ===================== TRANSACTIONS =====================

// Get all transactions
app.get("/transactions", (req, res) => {
  db.query("SELECT * FROM transactions ORDER BY date DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a transaction (Borrow / Add Stock / Return)
app.post("/transactions", (req, res) => {
  const { book_title, type, quantity, user_membership_id } = req.body;

  // First update the book quantity
  let updateSql = "";
  if (type === "Borrow Book") {
    updateSql = "UPDATE books SET quantity = quantity - ? WHERE title = ? AND quantity >= ?";
  } else if (type === "Add Stock" || type === "Return Book") {
    updateSql = "UPDATE books SET quantity = quantity + ? WHERE title = ?";
  }

  db.query(updateSql, type === "Borrow Book" ? [quantity, book_title, quantity] : [quantity, book_title], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (type === "Borrow Book" && result.affectedRows === 0) {
      return res.status(400).json({ message: "Not enough copies available" });
    }

    // Then insert the transaction
    const insertSql = "INSERT INTO transactions (book_title, type, quantity, user_membership_id) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [book_title, type, quantity, user_membership_id], (err2, result2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Transaction recorded successfully", id: result2.insertId });
    });
  });
});

// Delete a transaction
app.delete("/transactions/:id", (req, res) => {
  db.query("DELETE FROM transactions WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Transaction deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});