import React, { useEffect, useState, useMemo } from "react";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [isFiltering, setIsFiltering] = useState(false);

  const hasFilters = useMemo(
    () =>
      status !== "all" ||
      !!category.trim() ||
      !!fromDate.trim() ||
      !!toDate.trim(),
    [status, category, fromDate, toDate]
  );

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (status && status !== "all") params.append("status", status);
      if (category.trim()) params.append("category", category.trim());
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const qs = params.toString();
      const url = `/api/admin/orders${qs ? `?${qs}` : ""}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function handleApplyFilters(e) {
    e.preventDefault();
    setIsFiltering(true);
    fetchOrders();
  }

  function handleClearFilters() {
    setStatus("all");
    setCategory("");
    setFromDate("");
    setToDate("");
    setIsFiltering(true);
    fetchOrders();
  }

  return (
    <div className="bg-[#f7f6f3] py-9 min-h-[450px]">
      <div className="max-w-[1120px] mx-auto px-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <h2 className="font-bold text-[27px] tracking-[.03em] text-[#212223]">
            ORDERS
          </h2>

          <form
            onSubmit={handleApplyFilters}
            className="bg-white rounded-[14px] shadow-sm px-5 py-4 flex flex-wrap gap-4 items-end"
          >
            <div className="flex flex-col text-[13px]">
              <label className="mb-1.5 text-[#666] font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-[#ddd] rounded-[8px] px-3 py-2 text-[13px] min-w-[130px] outline-none focus:border-black transition-colors"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col text-[13px]">
              <label className="mb-1.5 text-[#666] font-medium">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. fashion"
                className="border border-[#ddd] rounded-[8px] px-3 py-2 text-[13px] min-w-[140px] outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="flex flex-col text-[13px]">
              <label className="mb-1.5 text-[#666] font-medium">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-[#ddd] rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="flex flex-col text-[13px]">
              <label className="mb-1.5 text-[#666] font-medium">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-[#ddd] rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="flex gap-2 ml-auto lg:ml-0">
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#111] text-white text-[13px] font-semibold hover:bg-black/90 transition-colors shadow-sm"
              >
                {isFiltering ? "Filtering…" : "Apply"}
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-full border border-[#ddd] text-[13px] text-[#444] bg-white hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <div className="my-20 text-center text-[#888]">Loading orders...</div>
        ) : error ? (
          <div className="my-20 text-center text-red-600 font-medium">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="my-20 text-center text-[#777]">
            No orders found for the selected filters.
          </div>
        ) : (
          <div className="bg-white rounded-[16px] shadow-[0_2px_18px_rgba(40,32,18,0.06)] overflow-hidden">
            <div className="hidden md:grid grid-cols-[170px,1fr,120px,140px,140px] text-[13px] font-semibold text-[#555] bg-[#f4f3ee] px-6 py-4 border-b border-[#ebe8dd]">
              <span>Order</span>
              <span>Customer / Items</span>
              <span>Total</span>
              <span>Status</span>
              <span>Placed</span>
            </div>

            <div className="divide-y divide-[#f1eee4]">
              {orders.map((o) => {
                const user = o.user || {};
                const totalAmount = o.total ?? o.subtotal ?? 0;
                const date = new Date(o.createdAt);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const firstItem = o.items?.[0];
                const itemSummary = firstItem
                  ? `${firstItem.name || "Item"}${
                      o.items.length > 1 ? ` + ${o.items.length - 1} more` : ""
                    }`
                  : "No items";

                return (
                  <div
                    key={o._id}
                    className="px-6 py-5 flex flex-col md:grid md:grid-cols-[170px,1fr,120px,140px,140px] gap-4 md:gap-0 text-[13px] hover:bg-[#faf9f6] transition-colors"
                  >
                    <div className="flex flex-col justify-center">
                      <div className="font-bold text-[#222] text-[14px]">
                        #{String(o._id).slice(-8).toUpperCase()}
                      </div>
                      <div className="text-[11px] text-[#999] font-medium mt-0.5">
                        {o.currency?.toUpperCase() || "USD"} Order
                      </div>
                    </div>

                    <div className="flex flex-col justify-center pr-4">
                      <div className="font-semibold text-[#222] text-[14px]">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim()
                          : user.email || "Guest User"}
                      </div>
                      <div className="text-[12px] text-[#777] truncate mb-1">
                        {user.email}
                      </div>
                      <div className="text-[12px] text-[#555] bg-[#f5f5f5] px-2 py-1 rounded w-fit max-w-full truncate">
                        {itemSummary}
                      </div>
                      {o.deliveryEstimateText && (
                        <div className="text-[11px] text-[#4b7a33] mt-1 font-medium">
                          {o.deliveryEstimateText}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center font-bold text-[#222] text-[14px]">
                      €{Number(totalAmount).toFixed(2)}
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                          o.status === "delivered"
                            ? "bg-[#e4f4e5] text-[#1c7c3a]"
                            : o.status === "shipped"
                            ? "bg-[#e5f0fb] text-[#1b61a8]"
                            : o.status === "cancelled"
                            ? "bg-[#fce5e5] text-[#b33434]"
                            : "bg-[#f7f2e6] text-[#7b5b2f]"
                        }`}
                      >
                        {o.status || "processing"}
                      </span>
                    </div>

                    <div className="text-[12px] text-[#555] flex flex-col justify-center">
                      <span className="font-medium">{formattedDate}</span>
                      <span className="text-[#888] text-[11px]">
                        {formattedTime}
                      </span>
                      {o.shippingMethodLabel && (
                        <span className="text-[10px] text-[#999] mt-1">
                          {o.shippingMethodLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
