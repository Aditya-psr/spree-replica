import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful! Please login.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-[430px] mx-auto mt-[60px] px-4 w-full">
      <h2 className="font-semibold text-[28px] mb-8">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label className="text-[18px] mb-[7px] font-medium block">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-[18px] py-[14px] rounded-[9px] border-2 border-[#111] text-[18px] mb-[15px] outline-none focus:ring-1 focus:ring-black"
        />

        <label className="text-[18px] mb-[7px] font-medium block">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-[18px] py-[14px] rounded-[9px] border-2 border-[#ddd] text-[18px] mb-[15px] outline-none focus:border-black transition-colors"
        />

        <label className="text-[18px] mb-[7px] font-medium block">
          Password Confirmation
        </label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-[18px] py-[14px] rounded-[9px] border-2 border-[#ddd] text-[18px] mb-[16px] outline-none focus:border-black transition-colors"
        />

        <button
          type="submit"
          className="w-full py-4 rounded-[30px] bg-[#111] text-white font-bold text-[20px] border-none mb-[22px] cursor-pointer hover:bg-black/90 transition-colors"
        >
          SIGN UP
        </button>
      </form>

      <div className="text-[17px] mt-[9px] pb-5">
        <span
          className="cursor-pointer no-underline text-[#111] hover:underline"
          onClick={() => navigate("/login")}
        >
          Login
        </span>
      </div>
    </div>
  );
};

export default SignUp;
