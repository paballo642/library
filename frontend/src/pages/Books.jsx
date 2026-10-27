import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function Books() {
  const [books, setBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
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
  }, [navigate]);

  const fetchBooks = () => {
    fetch("http://localhost:5000/books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          genre,
          isbn,
          quantity: Number(quantity),
        }),
      });
      if (response.ok) {
        alert("Book added successfully");
        setTitle("");
        setAuthor("");
        setGenre("");
        setIsbn("");
        setQuantity("");
        fetchBooks();
      }
    } catch (error) {
      alert("Error adding book");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await fetch(`http://localhost:5000/books/${id}`, { method: "DELETE" });
      fetchBooks();
    } catch (error) {
      alert("Error deleting book");
    }
  };

  const handleUpdate = async (book) => {
    const newTitle = prompt("Title:", book.title);
    if (newTitle === null) return;
    const newAuthor = prompt("Author:", book.author);
    if (newAuthor === null) return;
    const newGenre = prompt("Genre:", book.genre);
    if (newGenre === null) return;
    const newIsbn = prompt("ISBN:", book.isbn);
    if (newIsbn === null) return;
    const newQuantity = prompt("Quantity:", book.quantity);
    if (newQuantity === null) return;

    try {
      await fetch(`http://localhost:5000/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor,
          genre: newGenre,
          isbn: newIsbn,
          quantity: Number(newQuantity),
        }),
      });
      fetchBooks();
    } catch (error) {
      alert("Error updating book");
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
          <h2>Book Management</h2>
        </div>

        {currentUser.role === "Admin" && (
          <div className="book-form-card">
            <form onSubmit={handleAddBook}>
              <div className="form-grid">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />

                <label>Author</label>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} required />

                <label>Genre</label>
                <input value={genre} onChange={(e) => setGenre(e.target.value)} required />

                <label>ISBN</label>
                <input value={isbn} onChange={(e) => setIsbn(e.target.value.replace(/[^0-9]/g, ""))} required />

                <label>Initial Quantity</label>
                <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              </div>
              <button type="submit" className="primary-action">Add Book</button>
            </form>
          </div>
        )}

        <div className="content-card books-table-card">
          <h3>Books</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Quantity</th>
                  {currentUser.role === "Admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className={Number(book.quantity) < 2 ? "low-stock" : ""}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>
                    {currentUser.role === "Admin" && (
                      <td>
                        <button onClick={() => handleUpdate(book)}>Update</button>
                        <button onClick={() => handleDelete(book.id)}>Delete</button>
                      </td>
                    )}
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

export default Books;