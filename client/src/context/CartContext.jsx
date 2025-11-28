import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(
    product,
    color,
    size,
    quantity,
    variant,
    priceOverride,
    colorLabel
  ) {
    setCart((prev) => {
      const variantId = variant?._id || color;
      const variantPrice = variant?.sizes?.find(
        (sz) => sz.size === size
      )?.price;

      const foundIdx = prev.findIndex(
        (item) =>
          item._id === product._id &&
          item.color === color &&
          item.size === size &&
          item.variantId === variantId
      );

      const linePrice =
        typeof priceOverride === "number" && !Number.isNaN(priceOverride)
          ? priceOverride
          : typeof variantPrice === "number" && !Number.isNaN(variantPrice)
          ? variantPrice
          : product.price;

      if (foundIdx >= 0) {
        const updated = [...prev];
        updated[foundIdx].quantity += quantity;
        updated[foundIdx].price = linePrice;
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

  function removeFromCart(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuantity(index, newQty) {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = Math.max(1, newQty);
      return updated;
    });
  }

  function getCartTotal() {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  function openCart() {
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
        closeCartPopup,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
