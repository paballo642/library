import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function Transactions() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState("");
  const [type, setType] = useState("Borrow Book");
  const [quantity, setQuantity] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
    fetchBooks();
    fetchTransactions();
  }, [navigate]);

  const fetchBooks = () => {
    fetch("http://localhost:5000/books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));
  };

  const fetchTransactions = () => {
    fetch("http://localhost:5000/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error(err));
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!selectedBook) {
      alert("Please select a book");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_title: selectedBook,
          type: type,
          quantity: Number(quantity),
          user_membership_id: currentUser.membership_id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Error recording transaction");
        return;
      }

      alert("Transaction recorded successfully");
      setQuantity("");
      fetchBooks();
      fetchTransactions();
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await fetch(`http://localhost:5000/transactions/${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch (error) {
      alert("Error deleting transaction");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!currentUser) return null;

  return (
    <>
      <header>
        <h1>Community Library Management System</h1>
        <div className="header-user">
          <p>
            {currentUser.name} ({currentUser.role})
          </p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/books">Books</Link>
        <Link to="/transactions">Transactions</Link>
        {currentUser.role === "Admin" && <Link to="/users">Users</Link>}
      </nav>

      <div id="content">
        <div className="page-heading">
          <h2>Transactions</h2>
        </div>

        <div className="content-card">
          <form onSubmit={handleTransaction}>
            <div className="transaction-form-grid">
              <label>Book</label>
              <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} required>
                <option value="">Select a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.title}>
                    {book.title} - Available: {book.quantity}
                  </option>
                ))}
              </select>

              <label>Transaction Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Borrow Book">Borrow Book</option>
                <option value="Add Stock">Add Stock</option>
                <option value="Return Book">Return Book</option>
              </select>

              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary-action">
              Record Transaction
            </button>
          </form>
        </div>

        <div className="content-card transaction-history-card">
          <h3>Transaction History</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Book</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>User</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleString()}</td>
                    <td>{t.book_title}</td>
                    <td>{t.type}</td>
                    <td>{t.quantity}</td>
                    <td>{t.user_membership_id}</td>
                    <td>
                      {(currentUser.role === "Admin" || currentUser.role === "Librarian") ? (
                        <button onClick={() => handleDelete(t.id)}>Delete</button>
                      ) : (
                        "View Only"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Transactions;