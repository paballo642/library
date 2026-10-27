import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/");
      return;
    }
    setCurrentUser(JSON.parse(user));

    // Fetch books from backend
    fetch("http://localhost:5000/books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  let available = 0;
  let low = 0;
  books.forEach((book) => {
    available += Number(book.quantity);
    if (Number(book.quantity) < 2) low++;
  });

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
          <h2>Dashboard</h2>
        </div>

        <div id="statistics">
          <div className="stat-card">
            <h3>Total Books</h3>
            <p>{books.length}</p>
          </div>
          <div className="stat-card">
            <h3>Available Copies</h3>
            <p>{available}</p>
          </div>
          <div className="stat-card">
            <h3>Low Stock</h3>
            <p>{low}</p>
          </div>
        </div>

        <div className="content-card">
          <h3>Book Availability</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className={Number(book.quantity) < 2 ? "low-stock" : ""}
                  >
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>
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

export default Dashboard;