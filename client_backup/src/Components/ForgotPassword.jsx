import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");












    
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      navigate("/login", {
        state: { showResetBanner: true },
      });
    } else {
      setError(data.message || "No user found.");
    }
  };

  return (
    <div className="max-w-[620px] mx-auto mt-[70px] px-4">
      <h2 className="font-semibold text-[32px] mb-[22px]">Forgot password?</h2>
      <form onSubmit={handleSubmit}>
        <label className="block text-[19px] mb-2 font-medium">Email</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-[18px] px-3.5 py-4 border-2 border-[#222] rounded-lg mb-6 outline-none focus:ring-1 focus:ring-black transition-all"
        />
        <button
          type="submit"
          className="w-full bg-black text-white border-none rounded-[30px] font-bold py-5 text-[19px] mb-[18px] cursor-pointer hover:bg-gray-900 transition-colors"
        >
          RESET MY PASSWORD
        </button>
        {error && (
          <div className="text-red-600 mt-5 text-lg font-medium">{error}</div>
        )}
      </form>
      <div className="mt-5 flex gap-5">
        <span
          className="cursor-pointer text-[#111] text-[17px] hover:underline"
          onClick={() => navigate("/login")}
        >
          Login
        </span>
        <span
          className="cursor-pointer text-[#111] text-[17px] hover:underline"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </div>
    </div>
  );
};

export default ForgotPassword;
