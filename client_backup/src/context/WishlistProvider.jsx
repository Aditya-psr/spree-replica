import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const userId = user?._id || null;

  const [wishlist, setWishlist] = useState([]);

  // Load wishlist when user changes
  useEffect(() => {
    if (!userId) {
      setWishlist([]);
      return;
    }

    const stored = localStorage.getItem(`wishlist_${userId}`);
    try {
      setWishlist(stored ? JSON.parse(stored) : []);
    } catch {
      setWishlist([]);
    }
  }, [userId]);

  // Save wishlist per user
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
  }, [wishlist, userId]);

  function toggleWishlist(product) {
    if (!userId) {
      alert("Please log in to use wishlist.");
      return;
    }

    setWishlist((prev) => {
      if (prev.find((item) => item._id === product._id)) {
        return prev.filter((item) => item._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
