import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      const stored = localStorage.getItem(`cart_${user._id}`);
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  function addToCart(
    product,
    color,
    size,
    quantity,
    variant,
    priceOverride,
    colorLabel
  ) {
    if (!user || !user._id) {
      alert("Please log in to add items to your cart.");
      return;
    }

    setCart((prev) => {
      const variantId = variant?._id || color;

      const sizePrice =
        variant?.sizes?.find((sz) => sz.size === size)?.price ?? null;

      let linePrice;
      if (typeof priceOverride === "number" && !Number.isNaN(priceOverride)) {
        linePrice = priceOverride;
      } else if (typeof sizePrice === "number" && !Number.isNaN(sizePrice)) {
        linePrice = sizePrice;
      } else {
        linePrice = product.price;
      }

      const idx = prev.findIndex(
        (item) =>
          item._id === product._id &&
          item.color === color &&
          item.size === size &&
          item.variantId === variantId
      );

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        updated[idx].price = linePrice;
        return updated;
      } else {
        return [
          ...prev,
          {
            _id: product._id,
            name: product.name,
            price: linePrice,
            image:
              variant?.images && variant.images.length
                ? variant.images[0]
                : product.image,
            color,
            size,
            quantity,
            variantId,
            colorName: colorLabel || color,

            category:
              product.category ||
              product.mainCategory ||
              product.categoryName ||
              "",
            categorySlug: product.categorySlug || product.slug || "",
            categoryName:
              product.categoryName ||
              product.category ||
              product.mainCategory ||
              "",
          },
        ];
      }
    });

    setPopupOpen(true);
  }

  function removeFromCart(idx) {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQuantity(idx, newQty) {
    setCart((prev) => {
      const updated = [...prev];
      updated[idx].quantity = Math.max(1, newQty);
      return updated;
    });
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function openCart() {
    setPopupOpen(true);
  }

  function openCartPopup() {
    setPopupOpen(true);
  }

  function closeCartPopup() {
    setPopupOpen(false);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        popupOpen,
        openCart,
        openCartPopup,
        closeCartPopup,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
