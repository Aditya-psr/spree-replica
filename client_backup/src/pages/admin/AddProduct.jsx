import React, { useState } from "react";
import VariantInput from "../../Components/VariantInput";
import categoryOptions from "../../utils/categoryOptions";
import typeOptions from "../../utils/typeOptions";
import subCategoryOptions from "../../utils/subcategoryOptions";

const defaultVariant = {
  color: "",
  images: [],
  sizes: [{ size: "", inStock: true, quantity: 0, price: 0 }], // <-- price added
};

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    type: "",
    price: "",
    dateAdded: "",
    variants: [structuredClone(defaultVariant)],
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "category") {
      setForm({
        ...form,
        category: value,
        subcategory: "",
        type: "",
      });
    } else if (name === "subcategory") {
      setForm({
        ...form,
        subcategory: value,
        type: "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleVariantChange(idx, data) {
    const updated = [...form.variants];
    updated[idx] = data;
    setForm({ ...form, variants: updated });
  }

  function addVariant() {
    setForm({
      ...form,
      variants: [...form.variants, structuredClone(defaultVariant)],
    });
  }

  function removeVariant(i) {
    setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      variants: form.variants.map((variant) => ({
        ...variant,
        sizes: (variant.sizes || []).map((sizeObj) => ({
          ...sizeObj,
          quantity: Number(sizeObj.quantity || 0),
          price: Number(sizeObj.price || 0),
        })),
      })),
      dateAdded: form.dateAdded || new Date().toISOString().slice(0, 10),
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");
      alert("Product Added!");
      setForm({
        name: "",
        description: "",
        category: "",
        subcategory: "",
        type: "",
        price: "",
        dateAdded: "",
        variants: [structuredClone(defaultVariant)],
      });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const validSubCats = form.category
    ? subCategoryOptions[form.category] || []
    : [];
  const validTypes = form.subcategory
    ? typeOptions[form.subcategory] || []
    : [];

  // Common styles
  const labelClass =
    "font-semibold text-[#333] text-[15.5px] mb-2 ml-[3px] tracking-[.01em] block";
  const inputClass =
    "w-full text-[16.5px] px-4 py-2.5 rounded-lg border-[1.3px] border-[#e1e1e1] text-[#232323] bg-white outline-none font-medium mb-0 mt-0.5 focus:border-black transition-colors disabled:bg-gray-100 disabled:text-gray-400";

  return (
    <div className="max-w-[730px] mx-auto mt-10 bg-white p-6 md:p-9 rounded-[14px] shadow-[0_8px_32px_rgba(60,50,60,0.05)] min-h-[420px]">
      <h2 className="font-bold text-[28px] tracking-[.02em] mb-5">
        Add New Product
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className="flex flex-col md:flex-row gap-[22px] mb-5">
          <div className="flex-1 flex flex-col">
            <label className={labelClass}>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Product name"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className={labelClass}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select Category</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col md:flex-row gap-[22px] mb-5">
          <div className="flex-1 flex flex-col">
            <label className={labelClass}>Subcategory</label>
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              required
              className={inputClass}
              disabled={!form.category}
            >
              <option value="">
                {!form.category
                  ? "Choose Category First"
                  : "Select Subcategory"}
              </option>
              {validSubCats.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <label className={labelClass}>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className={inputClass}
              disabled={!form.subcategory}
            >
              <option value="">
                {!form.subcategory ? "Choose Subcategory First" : "Select Type"}
              </option>
              {validTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col md:flex-row gap-[22px] mb-5">
          <div className="flex-1 flex flex-col">
            <label className={labelClass}>Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className={inputClass}
              min={0}
              step="0.01"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className={labelClass}>Date Added</label>
            <input
              type="date"
              name="dateAdded"
              value={form.dateAdded}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div className="my-6">
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className={`${inputClass} min-h-[72px] font-inherit resize-y`}
            placeholder="Short product description"
          />
        </div>

        <h3 className="mt-10 mb-4 text-[21px] font-bold tracking-[.05em] text-[#181818]">
          Product Variants
        </h3>

        {form.variants.map((variant, idx) => (
          <div
            key={idx}
            className="bg-[#f8f7f2] border-[1.3px] border-[#e8e7e1] rounded-lg mb-5 p-5 pt-6 relative"
          >
            <VariantInput
              data={variant}
              onChange={(data) => handleVariantChange(idx, data)}
              onRemove={() => removeVariant(idx)}
              index={idx}
            />
            {form.variants.length > 1 && (
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="absolute top-3 right-3.5 bg-transparent text-[#ba2222] font-bold text-[18px] border-none p-0 cursor-pointer hover:opacity-70"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="mb-[22px]">
          <button
            type="button"
            onClick={addVariant}
            className="font-semibold text-[16px] bg-[#efede4] text-[#68513e] border-none px-[26px] py-[9px] rounded-[24px] cursor-pointer tracking-[.01em] mb-[7px] hover:bg-[#e5e3d9] transition-colors"
          >
            + Add Variant
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`font-bold bg-[#181818] text-white text-[19px] border-none rounded-[32px] px-[64px] py-[12px] tracking-[.07em] mt-2 shadow-[0_2.5px_9px_#efeded34] transition-all ${
              loading
                ? "cursor-wait opacity-70"
                : "cursor-pointer hover:bg-black"
            }`}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
