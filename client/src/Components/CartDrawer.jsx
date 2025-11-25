import React, { useContext } from "react";
import { CartContext } from "../context/CartProvider";
import { nameToColor, getColorLabel } from "../utils/colorUtils";

export default function CartDrawer() {
  const {
    cart,
    popupOpen,
    closeCartPopup,
    removeFromCart,
    updateQuantity,
    getCartTotal,
  } = useContext(CartContext);

  if (!popupOpen) return null;

  return (
    // 🔹 FULL-SCREEN OVERLAY
    <div
      className="fixed inset-0 z-[2000] flex justify-end bg-black/20"
      onClick={closeCartPopup}
    >
      {/* 🔹 DRAWER */}
      <div
        className="w-full sm:w-[420px] max-w-[100vw] h-full bg-white shadow-[0_0_44px_rgba(60,60,60,0.16)] flex flex-col border-l border-[#f2f2f2] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center px-8 py-[18px] border-b border-[#eee] relative shrink-0">
          <button
            onClick={closeCartPopup}
            className="absolute left-2.5 top-3 text-[28px] bg-transparent border-none cursor-pointer text-[#333] hover:text-black transition-colors"
            aria-label="Close cart"
          >
            ✕
          </button>
          <span className="flex-1 text-center font-bold text-[22px]">CART</span>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-8 pt-6">
          {cart.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-lg">
              Your cart is empty.
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={idx}
                className="mb-9 border-b border-[#f8f8f8] pb-4 last:border-none"
              >
                <div className="flex items-center gap-5 min-h-[80px]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-[10px] object-cover border-[1.5px] border-[#eee]"
                  />
                  {/* Info */}
                  <div className="flex-1">
                    <div className="font-semibold text-[15px] mb-0.5 text-[#232323]">
                      {item.name}
                    </div>
                    <div className="text-[13px] text-[#555] tracking-[0.5px] mb-1 font-medium">
                      €{item.price?.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Color swatch */}
                      <span
                        className="inline-block w-[19px] h-[19px] rounded-[5px] border border-[#ddd] mr-1"
                        style={{ background: nameToColor(item.color || "") }}
                      />
                      {/* Color name */}
                      <span className="bg-[#f5f5f5] rounded text-[13px] font-medium px-[13px] py-[2.5px] text-[#333]">
                        {item.colorName || getColorLabel(item.color)}
                      </span>
                      {/* Size */}
                      <span className="bg-[#f5f5f5] rounded text-[13px] font-medium px-[14px] py-[2.5px] ml-1.5 text-[#333]">
                        {item.size}
                      </span>
                    </div>
                  </div>
                  {/* Remove */}
                  <button
                    aria-label="Remove item"
                    title="Remove item"
                    onClick={() => removeFromCart(idx)}
                    className="ml-3 text-[#e44] bg-transparent border-none text-xl cursor-pointer p-0 hover:text-red-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Quantity controls */}
                <div className="mt-3 ml-[84px] flex items-center border-[1.5px] border-[#eee] rounded-lg bg-[#fafbfc] h-[38px] w-[85px]">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                    className="border-none bg-transparent w-[30px] h-full text-[22px] font-bold text-[#7a7a7a] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:text-black transition-colors flex items-center justify-center pb-1"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-[17px] w-8 text-center font-medium text-[#333]">
                    {item.quantity}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                    className="border-none bg-transparent w-[30px] h-full text-[21px] font-bold text-[#333] cursor-pointer hover:text-black transition-colors flex items-center justify-center pb-1"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom: totals/checkout */}
        <div className="border-t-[1.5px] border-[#f3f3f3] px-8 pt-[18px] pb-[30px] bg-white shrink-0">
          <div className="flex justify-between items-center text-base mb-2">
            <span className="text-[#888] font-medium tracking-wide">TOTAL</span>
            <span className="font-bold text-[19px] text-[#232323]">
              €{getCartTotal().toFixed(2)}
            </span>
          </div>
          <div className="text-[#8a8a8a] text-[13px] mb-3.5 font-normal">
            Shipping & taxes calculated at checkout
          </div>
          <button
            className="w-full bg-[#26d07c] text-[#111] border-none rounded-[29px] text-[16px] font-bold py-[15px] mb-2.5 cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#20b069] transition-colors"
            onClick={() => alert("Pay with Link Flow (demo)")}
          >
            Pay with
            <svg height={21} viewBox="0 0 33 21" className="mt-px">
              <circle cx={10} cy={10} r={10} fill="#111" />
              <polygon points="8,7 14,10 8,13" fill="#26d07c" />
              <text
                x={18}
                y={15}
                fill="#111"
                fontSize="12"
                fontWeight="bold"
                fontFamily="Arial"
              >
                link
              </text>
            </svg>
          </button>
          <div className="text-center text-[#adadad] text-[15px] mb-2 font-medium">
            or continue below
          </div>
          <button
            className="w-full bg-[#111] text-white border-none rounded-[29px] text-[16px] font-bold py-[15px] mb-1 cursor-pointer hover:bg-black/90 transition-colors tracking-wide"
            onClick={() => alert("Go to checkout (demo)")}
          >
            CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}
