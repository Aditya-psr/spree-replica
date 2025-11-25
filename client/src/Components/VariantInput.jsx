import React, { useState, useEffect } from "react";
import { nameToColor } from "../utils/colorUtils";

export default function VariantInput({ data, onChange, onRemove, index }) {
  const [variant, setVariant] = useState(() => ({
    color: "",
    sizes: [],
    images: [],
    ...data,
    sizes: (data?.sizes || []).map((s) => ({
      size: s.size || "",
      inStock: s.inStock ?? true,
      quantity: Number(s.quantity ?? 0),
      price: Number(s.price ?? 0),
    })),
  }));

  // Sync local state when parent data changes
  useEffect(() => {
    setVariant((prev) => ({
      ...prev,
      ...data,
      sizes: (data?.sizes || []).map((s) => ({
        size: s.size || "",
        inStock: s.inStock ?? true,
        quantity: Number(s.quantity ?? 0),
        price: Number(s.price ?? 0),
      })),
    }));
  }, [data]);

  function updateVariant(updated) {
    setVariant(updated);
    onChange(updated);
  }

  function handleColorChange(e) {
    const updated = { ...variant, color: e.target.value };
    updateVariant(updated);
  }

  function handleAddSize() {
    const updatedSizes = [
      ...(variant.sizes || []),
      {
        size: "",
        inStock: true,
        quantity: 0,
        price: 0,
      },
    ];
    const updated = { ...variant, sizes: updatedSizes };
    updateVariant(updated);
  }

  function handleSizeChange(idx, field, value) {
    const updatedSizes = (variant.sizes || []).map((sizeObj, i) => {
      if (i !== idx) return sizeObj;
      if (field === "quantity" || field === "price") {
        return { ...sizeObj, [field]: Number(value || 0) };
      }
      if (field === "inStock") {
        return { ...sizeObj, inStock: !!value };
      }
      return { ...sizeObj, [field]: value };
    });
    const updated = { ...variant, sizes: updatedSizes };
    updateVariant(updated);
  }

  function handleRemoveSize(idx) {
    const updatedSizes = (variant.sizes || []).filter((_, i) => i !== idx);
    const updated = { ...variant, sizes: updatedSizes };
    updateVariant(updated);
  }

  function handleImagesChange(e) {
    const imagesArray = e.target.value
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
    const updated = { ...variant, images: imagesArray };
    updateVariant(updated);
  }

  const displayColor = nameToColor(variant.color || "");

  // Reusable Tailwind Classes
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border-[1.1px] border-[#d8d8d8] text-base font-medium text-[#232323] outline-none mt-1 focus:border-black transition-colors bg-white";

  return (
    <div className="flex flex-col w-full">
      {/* Color Input Row */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor={`variant-color-${index}`}
            className="font-medium text-[15px] text-[#333]"
          >
            Color
          </label>
          <input
            id={`variant-color-${index}`}
            type="text"
            value={variant.color || ""}
            onChange={handleColorChange}
            placeholder="e.g. #FFF2C6, teal, sky blue"
            className={inputClass}
            required
          />
        </div>

        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-full border-2 border-[#e1e1e1] shadow-sm"
            style={{ backgroundColor: displayColor || "transparent" }}
            title={variant.color || "No color"}
          />
          {/* Note: Parent component handles the "Remove Variant" button logic/display, 
              but we keep a spot here if you wanted inline controls */}
        </div>
      </div>

      {/* Images Input */}
      <label className="block mb-4 font-medium text-[15px] text-[#333]">
        Images (comma separated URLs)
        <input
          type="text"
          value={variant.images ? variant.images.join(", ") : ""}
          onChange={handleImagesChange}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          className={inputClass}
        />
      </label>

      {/* Sizes Section */}
      <div>
        <strong className="block mb-2 text-[15px] text-[#333]">Sizes</strong>
        {variant.sizes && variant.sizes.length > 0 ? (
          <div className="space-y-2">
            {variant.sizes.map((sizeObj, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg border border-gray-100"
              >
                {/* Size Name */}
                <input
                  type="text"
                  placeholder="Size (e.g. S, M, L)"
                  value={sizeObj.size}
                  onChange={(e) =>
                    handleSizeChange(idx, "size", e.target.value)
                  }
                  className={`${inputClass} !mt-0 flex-1 min-w-[80px]`}
                  required
                />

                {/* Price */}
                <div className="w-[100px]">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      sizeObj.price !== undefined && sizeObj.price !== null
                        ? sizeObj.price
                        : ""
                    }
                    onChange={(e) =>
                      handleSizeChange(idx, "price", e.target.value)
                    }
                    className={`${inputClass} !mt-0`}
                    placeholder="Price"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="w-[80px]">
                  <input
                    type="number"
                    min="0"
                    value={sizeObj.quantity ?? 0}
                    onChange={(e) =>
                      handleSizeChange(idx, "quantity", e.target.value)
                    }
                    className={`${inputClass} !mt-0`}
                    placeholder="Qty"
                    required
                  />
                </div>

                {/* In Stock Checkbox */}
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!sizeObj.inStock}
                    onChange={(e) =>
                      handleSizeChange(idx, "inStock", e.target.checked)
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <span className="hidden sm:inline">In Stock</span>
                </label>

                {/* Remove Size Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveSize(idx)}
                  className="bg-[#fae6e6] text-[#ba2222] border-none rounded-lg px-3 h-[42px] flex items-center justify-center cursor-pointer hover:bg-[#f5d0d0] transition-colors"
                  aria-label="Remove size"
                  title="Remove size"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm mb-2">
            No sizes added yet
          </p>
        )}

        <button
          type="button"
          onClick={handleAddSize}
          className="mt-2 bg-[#efede4] text-[#68513e] border-none px-5 py-2 rounded-full font-semibold text-sm tracking-wide cursor-pointer hover:bg-[#e5e3d9] transition-colors"
        >
          + Add Size
        </button>
      </div>
    </div>
  );
}
