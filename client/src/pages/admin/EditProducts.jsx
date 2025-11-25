import React, { useEffect, useState } from "react";
import VariantInput from "../../Components/VariantInput";

// --- Modal Component ---
function EditProductModal({ open, product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    subcategory: "",
    type: "",
    isSale: false,
    variants: [],
  });

  useEffect(() => {
    if (product && open) {
      setForm({
        name: product.name || "",
        price: product.price || "",
        category: product.category || "",
        description: product.description || "",
        subcategory: product.subcategory || "",
        type: product.type || "",
        isSale: !!product.isSale,
        variants: Array.isArray(product.variants)
          ? product.variants.map((v) => ({
              ...v,
              sizes: (v.sizes || []).map((s) => ({
                size: s.size || "",
                inStock: s.inStock ?? true,
                quantity: Number(s.quantity ?? 0),
                price: Number(s.price ?? 0),
              })),
            }))
          : [],
      });
    }
  }, [product, open]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleVariantChange(index, data) {
    const updatedVariants = [...form.variants];
    updatedVariants[index] = data;
    setForm((f) => ({
      ...f,
      variants: updatedVariants,
    }));
  }

  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        {
          color: "",
          images: [],
          sizes: [{ size: "", inStock: true, quantity: 0, price: 0 }],
        },
      ],
    }));
  }

  function removeVariant(index) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const processed = {
      ...form,
      price: Number(form.price || 0),
      isSale: !!form.isSale,
      variants: (form.variants || []).map((v) => ({
        ...v,
        sizes: (v.sizes || []).map((s) => ({
          ...s,
          quantity: Number(s.quantity ?? 0),
          price: Number(s.price ?? 0),
        })),
      })),
    };
    onSave(processed);
  }

  if (!open) return null;

  // Common styles for modal inputs
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-[#d8d8d8] text-base font-medium text-[#232323] outline-none mt-1 focus:border-black transition-colors bg-white";
  const labelClass = "block text-sm font-semibold text-[#333] mb-3";

  return (
    <div className="fixed inset-0 left-0 top-0 w-screen h-screen bg-black/20 z-[9999] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[14px] p-6 md:p-9 w-full max-w-[600px] max-h-[90vh] shadow-[0_8px_32px_#dbdbe8] flex flex-col gap-4 overflow-y-auto"
      >
        <h2 className="text-[22px] font-bold mb-0">Edit Product</h2>

        <label className={labelClass}>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </label>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className={`${labelClass} flex-1`}>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </label>
          <label className={`${labelClass} flex-1`}>
            Subcategory
            <input
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className={`${labelClass} flex-1`}>
            Type
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} flex-1`}>
            Price
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className={inputClass}
              required
              min={0}
              step="0.01"
            />
          </label>
        </div>

        <label className={labelClass}>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={`${inputClass} min-h-[80px] resize-y font-sans`}
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-[#333] cursor-pointer w-fit">
          <input
            name="isSale"
            type="checkbox"
            checked={form.isSale}
            onChange={handleChange}
            className="w-4 h-4 accent-black"
          />
          Mark product as On Sale
        </label>

        <h3 className="mt-4 text-lg font-bold">Product Variants</h3>
        <div className="space-y-4">
          {form.variants.map((variant, idx) => (
            <div
              key={idx}
              className="bg-[#f8f7f2] border border-[#e8e7e1] rounded-lg p-4 relative"
            >
              <VariantInput
                data={variant}
                onChange={(data) => handleVariantChange(idx, data)}
                onRemove={() => removeVariant(idx)}
                index={idx}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="font-semibold text-[16px] bg-[#efede4] text-[#68513e] border-none px-6 py-2.5 rounded-full cursor-pointer tracking-wide mb-1 w-fit hover:bg-[#e5e3d9] transition-colors"
        >
          + Add Variant
        </button>

        <div className="flex gap-4 mt-3">
          <button
            type="submit"
            className="flex-1 bg-[#232323] text-white font-semibold py-2.5 rounded-lg border-none text-[17px] cursor-pointer hover:bg-black transition-colors"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="flex-1 bg-[#f8f5f5] text-[#aa2b2b] font-semibold py-2.5 rounded-lg border-none text-[17px] cursor-pointer hover:bg-[#f0e4e4] transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Main Component ---
export default function EditProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch products");

      const list = Array.isArray(data) ? data : data.products || [];
      setProducts(list);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete product.");
      }
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveEdit(updatedProduct) {
    const processed = {
      ...updatedProduct,
      price: Number(updatedProduct.price || 0),
      isSale: !!updatedProduct.isSale,
      variants: (updatedProduct.variants || []).map((v) => ({
        ...v,
        sizes: (v.sizes || []).map((s) => ({
          ...s,
          quantity: Number(s.quantity ?? 0),
          price: Number(s.price ?? 0),
        })),
      })),
    };

    console.log("PUT processed product:", JSON.stringify(processed, null, 2));

    try {
      const res = await fetch(`/api/products/${editProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(processed),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update product.");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p._id === editProduct._id ? { ...p, ...processed } : p
        )
      );
      setModalOpen(false);
      setEditProduct(null);
    } catch (err) {
      alert(err.message);
    }
  }

  // Table Header Style
  const thClass =
    "font-semibold bg-[#faf9f7] text-[#202123] py-3.5 px-4 text-[16px] text-left border-b-[2.3px] border-[#ecebe7] whitespace-nowrap";

  // Table Data Style
  const tdClass =
    "py-3 px-4 text-[15.3px] text-[#232323] align-middle border-b border-[#f0f0f0]";

  return (
    <div className="bg-white rounded-xl p-6 md:p-9 max-w-[1100px] mx-auto min-h-[480px] shadow-[0_2.5px_20px_rgba(60,50,60,0.03)]">
      <h2 className="font-bold text-[27px] tracking-[.03em] mb-7 text-black">
        Edit Products
      </h2>
      {loading ? (
        <div className="mt-20 text-center text-[#888]">Loading products...</div>
      ) : error ? (
        <div className="mt-20 text-center text-red-600">{error}</div>
      ) : products.length === 0 ? (
        <div className="mt-20 text-center text-[#777]">No products found.</div>
      ) : (
        // max-w-full allows the div to be no wider than the parent container
        // overflow-x-auto enables horizontal scrolling
        <div className="w-full max-w-full overflow-x-auto rounded-[11px] shadow-[0px_1px_8px_#ecebeee7]">
          <table className="w-full border-separate border-spacing-0 bg-white min-w-[800px]">
            <thead>
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>On Sale</th>
                <th className={thClass}>Colors</th>
                <th className={thClass}>Sizes</th>
                <th className={thClass}>Stock</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p._id}
                  className={`${
                    i % 2 ? "bg-[#f7f6f3]" : "bg-white"
                  } hover:bg-gray-50 transition-colors`}
                >
                  <td className={tdClass}>{p.name}</td>
                  <td className={tdClass}>{p.category}</td>
                  <td className={tdClass}>€{p.price}</td>
                  <td className={tdClass}>
                    {p.isSale ? (
                      <span className="bg-[#eee8e7] rounded-xl py-0.5 px-3 text-[#b02e13] text-sm font-medium">
                        On Sale
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className={tdClass}>
                    {Array.isArray(p.variants)
                      ? p.variants.map((v) => v.color).join(", ")
                      : "-"}
                  </td>
                  <td className={tdClass}>
                    {Array.isArray(p.variants)
                      ? p.variants
                          .flatMap((v) =>
                            v.sizes && Array.isArray(v.sizes)
                              ? v.sizes.map((s) => s.size)
                              : []
                          )
                          .join(", ")
                      : "-"}
                  </td>
                  <td className={tdClass}>
                    {Array.isArray(p.variants)
                      ? p.variants
                          .flatMap((v) =>
                            v.sizes && Array.isArray(v.sizes)
                              ? v.sizes.map((s) => s.quantity)
                              : []
                          )
                          .join(", ")
                      : "-"}
                  </td>
                  <td className={tdClass}>
                    <div className="flex gap-2">
                      <button
                        className="bg-[#f5f2e4] text-[#954a12] border-none rounded-lg font-semibold py-2 px-4 text-[15px] cursor-pointer hover:bg-[#ebe6d1] transition-colors"
                        onClick={() => {
                          setEditProduct(p);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-[#fae6e6] text-[#ba2222] border-none rounded-lg font-semibold py-2 px-4 text-[15px] cursor-pointer hover:bg-[#f2dcdc] transition-colors disabled:opacity-50 disabled:cursor-wait"
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                      >
                        {deletingId === p._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <EditProductModal
        open={modalOpen}
        product={editProduct}
        onClose={() => {
          setModalOpen(false);
          setEditProduct(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
