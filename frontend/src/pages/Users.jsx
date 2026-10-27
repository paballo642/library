import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "Admin") {
      navigate("/dashboard");
      return;
    }
    setCurrentUser(parsedUser);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = () => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          membership_id: membershipId,
          password,
          role,
        }),
      });
      if (response.ok) {
        alert("User added successfully");
        setName("");
        setMembershipId("");
        setPassword("");
        setRole("Member");
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Error adding user");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await fetch(`http://localhost:5000/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (error) {
      alert("Error deleting user");
    }
  };

  const handleUpdate = async (user) => {
    const newName = prompt("Name:", user.name);
    if (newName === null) return;
    const newMembership = prompt("Membership ID:", user.membership_id);
    if (newMembership === null) return;
    const newPassword = prompt("Password:", "");
    if (newPassword === null) return;
    const newRole = prompt("Role (Member/Librarian/Admin):", user.role);
    if (newRole === null) return;

    try {
      await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          membership_id: newMembership,
          password: newPassword || user.password,
          role: newRole,
        }),
      });
      fetchUsers();
    } catch (error) {
      alert("Error updating user");
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
        <Link to="/users">Users</Link>
      </nav>

      <div id="content">
        <div className="page-heading">
          <h2>User Management</h2>
        </div>

        <div className="content-card">
          <form onSubmit={handleAddUser}>
            <div className="form-grid">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />

              <label>Membership ID</label>
              <input
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value.replace(/[^0-9]/g, ""))}
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Member">Member</option>
                <option value="Librarian">Librarian</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="primary-action">
              Add User
            </button>
          </form>
        </div>

        <div className="content-card user-table-card">
          <h3>Registered Users</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Membership ID</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.membership_id}</td>
                    <td>{user.role}</td>
                    <td>
                      <button onClick={() => handleUpdate(user)}>Update</button>
                      <button onClick={() => handleDelete(user.id)}>Delete</button>
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

export default Users;