import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistProvider";
import { CurrencyContext } from "../context/CurrencyContext";

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const isInWishlist = wishlist.some((item) => item._id === product._id);
  const navigate = useNavigate();

  const { symbol, convertPrice } = useContext(CurrencyContext);

  useEffect(() => {
    setImageError(false);
  }, [product]);

  const mainImage =
    product.variants && product.variants.length > 0
      ? product.variants[0].images?.[0] || product.image
      : product.image;

  const hoverImage =
    product.variants &&
    product.variants.length > 0 &&
    product.variants[0].images?.[1]
      ? product.variants[0].images[1]
      : mainImage;

  const displayImage = hovered ? hoverImage : mainImage;

  const allColors = [];
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((variant) => {
      if (variant.color) allColors.push(variant.color);
    });
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product._id}`)}
      className="w-[260px] min-w-[260px] h-[450px] bg-[#f8f8f8] rounded-[10px] p-5 box-border shadow-[0_10px_20px_rgb(0_0_0_/_0.045)] transition-shadow duration-300 ease-out cursor-pointer relative flex flex-col hover:shadow-[0_15px_25px_rgb(0_0_0_/_0.08)] shrink-0"
    >
      {!imageError && displayImage ? (
        <img
          src={displayImage}
          alt={product.name}
          onError={() => setImageError(true)}
          className="w-full h-[280px] object-cover rounded-[8px] mb-[14px] transition-opacity duration-400 ease-in-out"
        />
      ) : (
        <div className="w-full h-[280px] bg-gray-200 rounded-[8px] mb-[14px] flex items-center justify-center text-gray-400 text-sm font-medium">
          No Image Available
        </div>
      )}

      {product.isSale && (
        <span className="absolute top-2 left-2 bg-[#e44] text-white py-[2px] px-[9px] text-[14px] rounded-[8px] z-10">
          SALE
        </span>
      )}

      <button
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute right-[18px] top-[18px] text-[24px] bg-none border-none cursor-pointer z-[2] opacity-100 ${
          isInWishlist ? "text-black" : "text-[#222]"
        }`}
      >
        {isInWishlist ? "♥" : "♡"}
      </button>

      <h3 className="font-bold text-[18px] text-[#111] my-[6px] flex-grow line-clamp-2 overflow-hidden">
        {product.name}
      </h3>

      <p className="font-[600] text-[16px] text-[#333] mb-0 mt-auto">
        {symbol}
        {convertPrice(product.price).toFixed(2)}
      </p>

      <div className="flex gap-4 mt-[18px] h-6">
        {allColors.map((color, idx) => (
          <span
            key={idx}
            className="w-6 h-6 rounded-full inline-block border-2 border-[#ddd] shadow-[0_1px_4px_rgb(0_0_0_/_0.18)]"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
