import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (location.state?.showResetBanner) {
      setShowBanner(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Save auth data
        localStorage.setItem("token", data.token);
        // IMPORTANT: store userId for per-user cart / wishlist
        localStorage.setItem("userId", data.user._id);
        setUser(data.user);

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin/dashboard", { state: { loginSuccess: true } });
        } else {
          navigate("/myaccount", { state: { loginSuccess: true } });
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-[430px] mx-auto mt-[60px] px-4 w-full">
      {showBanner && (
        <div className="fixed top-0 left-0 w-screen bg-[#17cb5c] text-black text-center p-[5px] font-normal text-base z-50">
          YOU WILL RECEIVE AN EMAIL WITH INSTRUCTIONS ABOUT HOW TO RESET YOUR
          PASSWORD IN A FEW MINUTES.
          <button
            className="float-right mr-8 -mt-1 bg-none border-none text-black text-[30px] leading-none cursor-pointer"
            onClick={() => setShowBanner(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      <h2 className="font-semibold text-[28px] mb-8">Login</h2>
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
          className="w-full px-[18px] py-[14px] rounded-[9px] border-2 border-[#ddd] text-[18px] mb-[16px] outline-none focus:border-black transition-colors"
        />

        <div className="flex items-center mb-[22px]">
          <input
            type="checkbox"
            checked={rememberMe}
            id="rememberMe"
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 mr-[10px] accent-black cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-[16px] cursor-pointer">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-[30px] bg-[#111] text-white font-bold text-[20px] border-none mb-[22px] cursor-pointer hover:bg-black/90 transition-colors"
        >
          LOGIN
        </button>
      </form>

      <div className="text-[17px] mt-[9px]">
        <span
          className="cursor-pointer no-underline text-[#111] hover:underline"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </div>

      <div className="text-[17px] mt-[8px] pb-5">
        <span
          className="text-[#222] no-underline cursor-pointer hover:underline"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </span>
      </div>
    </div>
  );
};

export default Login;
