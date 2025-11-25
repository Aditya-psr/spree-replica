import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { WishlistContext } from "../context/WishlistProvider";
import { CartContext } from "../context/CartProvider";
import { CurrencyContext } from "../context/CurrencyContext";
import { nameToColor, getColorLabel } from "../utils/colorUtils";

const ProductDetail = () => {
  const { id } = useParams();

  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { cart, addToCart, openCartPopup } = useContext(CartContext);
  const { symbol, convertPrice } = useContext(CurrencyContext);

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [alreadyInCart, setAlreadyInCart] = useState(false);

  // Fetch product once
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);

        const firstVariant = data.variants?.[0] || null;
        setSelectedVariant(firstVariant || null);

        const defaultSize =
          firstVariant?.sizes?.find((sz) => sz.inStock)?.size || "";
        setSelectedSize(defaultSize);
      })
      .catch((err) => {
        console.error("Failed to fetch product:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const selectedColor = selectedVariant?.color || "";
  const selectedColorLabel = getColorLabel(selectedColor);

  const activeSizeObj =
    selectedVariant?.sizes?.find((s) => s.size === selectedSize) || null;

  // Detect if this exact product+color+size+variant is already in cart
  useEffect(() => {
    if (!product || !selectedVariant || !selectedSize) {
      setAlreadyInCart(false);
      return;
    }

    const variantId = selectedVariant._id || selectedVariant.color;

    const exists = cart.some(
      (item) =>
        item._id === product._id &&
        item.color === selectedColor &&
        item.size === selectedSize &&
        item.variantId === variantId
    );

    setAlreadyInCart(exists);
  }, [cart, product, selectedVariant, selectedSize, selectedColor]);

  // Still loading product
  if (!product) {
    return <div className="p-[60px] text-center text-lg">Loading...</div>;
  }

  // Images (fallback to product.image if no variant images)
  const images =
    selectedVariant?.images && selectedVariant.images.length
      ? selectedVariant.images
      : [product.image];

  // Base price (in your stored currency, e.g. USD)
  let basePrice = product.price || 0;
  if (
    activeSizeObj &&
    typeof activeSizeObj.price === "number" &&
    !Number.isNaN(activeSizeObj.price) &&
    activeSizeObj.price > 0
  ) {
    basePrice = activeSizeObj.price;
  }

  // Convert for display using CurrencyContext
  const convertedPrice = convertPrice(basePrice);

  const isInWishlist = wishlist.some((item) => item._id === product._id);

  // Handle button click (ADD / GO TO CART)
  const handleCartButtonClick = () => {
    if (!selectedVariant || !selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (alreadyInCart) {
      // Just open the cart drawer
      openCartPopup();
      return;
    }

    // Add to cart with the *base* price; conversion is only for display
    addToCart(
      product,
      selectedColor,
      selectedSize,
      quantity,
      selectedVariant,
      basePrice,
      selectedColorLabel
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-[60px] p-6 md:p-[60px] items-start min-h-[80vh] bg-white">
      {/* Gallery */}
      <div className="w-full lg:w-auto flex flex-col items-center lg:items-start">
        <img
          src={images[0]}
          alt={product.name}
          className="w-full max-w-[400px] lg:w-[350px] h-[450px] object-cover rounded-2xl mb-[18px] shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
        />
        <div className="flex gap-4 overflow-x-auto w-full max-w-[400px] lg:w-[350px] py-2">
          {images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`${product.name} thumb ${idx + 1}`}
              className="w-[75px] h-[80px] object-cover rounded-lg border-2 border-[#eee] cursor-pointer hover:border-gray-300 transition-colors shrink-0"
              onClick={() => {
                const rest = images.filter((i) => i !== imgUrl);
                setSelectedVariant((prev) => ({
                  ...(prev || selectedVariant || {}),
                  images: [imgUrl, ...rest],
                }));
              }}
            />
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="flex-1 w-full max-w-[480px] bg-white rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 md:p-9 self-center lg:self-start">
        <h2 className="text-[32px] font-bold mb-3 leading-tight">
          {product.name}
        </h2>

        <div className="text-[20px] mb-5 text-[#222] font-medium">
          {symbol}
          {Number.isFinite(convertedPrice)
            ? convertedPrice.toFixed(2)
            : basePrice.toFixed(2)}
        </div>

        {product.isSale && (
          <span className="inline-block bg-[#e44] text-white px-3 py-[3px] text-[17px] rounded-[10px] mb-[18px] font-medium">
            SALE
          </span>
        )}

        {/* Color */}
        <div className="font-semibold mb-[7px] text-[15px]">
          COLOR:{" "}
          <span className="font-normal">
            {selectedColorLabel || selectedColor || "—"}
          </span>
        </div>

        {/* Color Swatches */}
        <div className="flex gap-[22px] mb-3 flex-wrap">
          {product.variants.map((variant, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => {
                setSelectedVariant(variant);
                const firstInStock =
                  variant.sizes?.find((sz) => sz.inStock)?.size || "";
                setSelectedSize(firstInStock);
              }}
            >
              <span
                className={`w-8 h-8 rounded-full shadow-[0_1px_6px_#ddd] mb-[7px] transition-all ${
                  variant === selectedVariant
                    ? "border-[3px] border-[#2974fa]"
                    : "border-2 border-[#ddd] group-hover:border-gray-400"
                }`}
                style={{ backgroundColor: nameToColor(variant.color) }}
                title={getColorLabel(variant.color)}
              />
              <span className="text-[13px] text-[#555]">
                {getColorLabel(variant.color)}
              </span>
            </div>
          ))}
        </div>

        {/* Size Selector */}
        {selectedVariant?.sizes && (
          <div className="mb-6">
            <div className="font-semibold mb-[10px] text-[15px] tracking-wide flex items-center">
              SIZE:{" "}
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="py-[6px] px-4 rounded-lg border-[1.2px] border-[#e4e4e4] bg-white font-semibold text-[15px] text-[#111] min-w-[64px] cursor-pointer outline-none shadow-[0_1px_4px_0_rgba(30,30,40,0.05)] h-[34px] ml-[14px]"
              >
                {selectedVariant.sizes.map((sizeObj, idx) => (
                  <option
                    key={idx}
                    value={sizeObj.size}
                    disabled={!sizeObj.inStock}
                  >
                    {sizeObj.size}
                    {!sizeObj.inStock ? " (Out of stock)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center mb-[30px]">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-[7px] border border-[#aaa] bg-[#f7f7f7] font-semibold text-[19px] cursor-pointer flex items-center justify-center hover:bg-[#eee] transition-colors pb-1"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="text-[19px] mx-[18px] min-w-[36px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-7 h-7 rounded-[7px] border border-[#aaa] bg-[#f7f7f7] font-semibold text-[19px] cursor-pointer flex items-center justify-center hover:bg-[#eee] transition-colors pb-1"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Cart & Wishlist Row */}
        <div className="flex items-center gap-[14px] mb-[22px]">
          {/* ADD / GO TO CART button */}
          <button
            onClick={handleCartButtonClick}
            className={`flex-1 flex items-center justify-center gap-[10px] py-[18px] rounded-[30px] text-white text-[17px] font-semibold border-none shadow-[0_3px_18px_0_rgba(48,48,56,0.07)] cursor-pointer h-[52px] transition-colors ${
              alreadyInCart
                ? "bg-[#26d07c] hover:bg-[#20b069]"
                : "bg-[#111] hover:bg-black/90"
            }`}
          >
            {alreadyInCart ? "GO TO CART" : "ADD TO CART"}
          </button>

          {/* Wishlist button */}
          <button
            onClick={() => toggleWishlist(product)}
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
            className={`w-[52px] h-[52px] flex items-center justify-center bg-white border-[1.5px] border-[#e5e5e5] rounded-full cursor-pointer text-[30px] ml-[2px] transition-colors hover:border-gray-300 ${
              isInWishlist ? "text-[#e44]" : "text-[#888]"
            }`}
          >
            ♥
          </button>
        </div>

        {alreadyInCart && (
          <div className="text-[#26d07c] text-[14px] font-semibold mb-[10px] flex items-center gap-1">
            <span>✓</span> This variant is already in your cart
          </div>
        )}

        {/* Description */}
        <div className="text-[15px] text-[#444] mt-6 leading-[1.76]">
          {product.description}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
