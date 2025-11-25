import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    const res = await fetch(
      `http://localhost:5000/api/auth/reset-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      // On success redirect to login page
      navigate("/login");
    } else {
      setError(data.message || "Failed to reset password");
    }
  };

  return (
    <div style={{ maxWidth: 620, margin: "70px auto" }}>
      <h2 style={{ fontWeight: 600, fontSize: 32, marginBottom: 22 }}>
        Change Password
      </h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 19 }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            fontSize: 18,
            padding: "16px 14px",
            border: "2px solid #222",
            borderRadius: 8,
            margin: "14px 0 24px",
          }}
        />
        <label style={{ fontSize: 19 }}>Password Confirmation</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: "100%",
            fontSize: 18,
            padding: "12px 14px",
            border: "2px solid #ddd",
            borderRadius: 8,
            margin: "14px 0 24px",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 30,
            fontWeight: "bold",
            padding: "20px 0",
            fontSize: 19,
            marginBottom: 18,
          }}
        >
          RESET MY PASSWORD
        </button>
        {error && <div style={{ color: "red", marginTop: 20 }}>{error}</div>}
      </form>
      <div style={{ marginTop: 20 }}>
        <span
          style={{
            cursor: "pointer",
            color: "#111",
            marginRight: 18,
            fontSize: 17,
          }}
          onClick={() => navigate("/login")}
        >
          Login
        </span>
        <span
          style={{ cursor: "pointer", color: "#111", fontSize: 17 }}
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </div>
    </div>
  );
};

export default ResetPassword;
