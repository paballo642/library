import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: membershipId,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Save user info
      localStorage.setItem("currentUser", JSON.stringify(data));
      navigate("/dashboard");
    } catch (error) {
      setMessage("Cannot connect to server. Make sure the backend is running.");
    }
  };

  return (
    <div id="loginSection">
      <div className="login-card">
        <h1>Community Library</h1>
        <h2>Library Management System</h2>

        <form onSubmit={handleLogin}>
          <label>Membership ID</label>
          <input
            type="text"
            placeholder="Enter membership ID"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value.replace(/[^0-9]/g, ""))}
            required
          />

          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
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

          <label className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show Password
          </label>

          <button type="submit" className="login-button">
            Login
          </button>

          {message && <p id="loginMessage">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;