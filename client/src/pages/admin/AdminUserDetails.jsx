import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorUser, setErrorUser] = useState("");
  const [errorOrders, setErrorOrders] = useState("");

  useEffect(() => {
    fetchUser();
    fetchOrders();
  }, [id]);

  async function fetchUser() {
    try {
      setLoadingUser(true);
      setErrorUser("");
      const res = await fetch(`/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch user");
      setUser(data.user);
    } catch (err) {
      setErrorUser(err.message);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  async function fetchOrders() {
    try {
      setLoadingOrders(true);
      setErrorOrders("");
      const res = await fetch(`/api/admin/users/${id}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
      setOrders(data.orders || []);
    } catch (err) {
      setErrorOrders(err.message);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString();
  };

  return (
    <div className="flex flex-col max-w-[1440px] mx-auto bg-white min-h-[650px]">
      <header className="border-b border-[#ecebe7] px-4 md:px-10 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[14px] text-[#555] border border-[#ddd] rounded-full px-3 py-[6px] hover:bg-[#f5f5f5] transition"
          >
            ← Back
          </button>
          <h1 className="font-bold text-[22px] tracking-[.04em]">
            USER DETAILS
          </h1>
        </div>
      </header>

      <main className="flex-1 bg-[#f7f6f3] px-4 md:px-10 py-8">
        <div className="max-w-[1100px] mx-auto space-y-10">
          <section className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 md:p-8">
            <h2 className="font-bold text-[20px] mb-4 text-[#212223]">
              Basic Information
            </h2>

            {loadingUser ? (
              <div className="my-10 text-center text-[#888]">
                Loading user details...
              </div>
            ) : errorUser ? (
              <div className="my-10 text-center text-red-600">{errorUser}</div>
            ) : !user ? (
              <div className="my-10 text-center text-[#777]">
                User not found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 text-[15px] text-[#333]">
                <div>
                  <div className="mb-2">
                    <span className="font-semibold">Name: </span>
                    <span>
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${
                            user.lastName || ""
                          }`.trim()
                        : "—"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Email: </span>
                    <span>{user.email || "—"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Phone: </span>
                    <span>{user.phone || "—"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Role: </span>
                    <span className="inline-block rounded-[10px] font-semibold text-[13px] py-[4px] px-[12px] ml-1 bg-[#f3f1e9] text-[#8b705c]">
                      {user.role || "user"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <span className="font-semibold">User ID: </span>
                    <span className="text-[13px] text-[#777]">{user._id}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Created At: </span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Updated At: </span>
                    <span>{formatDate(user.updatedAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 md:p-8">
            <h2 className="font-bold text-[20px] mb-4 text-[#212223]">
              Orders
            </h2>

            {loadingOrders ? (
              <div className="my-10 text-center text-[#888]">
                Loading orders...
              </div>
            ) : errorOrders ? (
              <div className="my-10 text-center text-red-600">
                {errorOrders}
              </div>
            ) : orders.length === 0 ? (
              <div className="my-10 text-center text-[#777]">
                This user has no orders yet.
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-[#ecebe7] rounded-[14px] p-5 bg-[#fcfbf8]"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-3 mb-3">
                      <div>
                        <div className="text-[14px] text-[#777]">Order ID</div>
                        <div className="text-[13px] font-mono">{order._id}</div>
                      </div>
                      <div>
                        <div className="text-[14px] text-[#777]">
                          Created At
                        </div>
                        <div className="text-[14px]">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[14px] text-[#777]">Status</div>
                        <div className="text-[14px] font-semibold">
                          {order.status}
                        </div>
                      </div>
                      <div>
                        <div className="text-[14px] text-[#777]">Payment</div>
                        <div className="text-[14px]">
                          {order.paymentStatus || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#e6e0d0] pt-3 mt-2 flex flex-col md:flex-row justify-between gap-3 text-[14px]">
                      <div>
                        <div className="text-[#777] mb-1">Total</div>
                        <div className="font-semibold">
                          {order.currency?.toUpperCase() || "USD"}{" "}
                          {order.total?.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#777] mb-1">Shipping</div>
                        <div>
                          {order.shippingMethodLabel || "—"}{" "}
                          {order.shippingPrice != null &&
                            `(${order.currency?.toUpperCase() || "USD"} ${
                              order.shippingPrice
                                ? order.shippingPrice.toFixed(2)
                                : "0.00"
                            })`}
                        </div>
                        <div className="text-[13px] text-[#555] mt-[2px]">
                          {order.deliveryEstimateText}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#777] mb-1">Shipping Address</div>
                        {order.shippingAddress ? (
                          <div className="text-[13px] text-[#444] leading-snug">
                            {order.shippingAddress.fullName && (
                              <div>{order.shippingAddress.fullName}</div>
                            )}
                            {order.shippingAddress.street && (
                              <div>{order.shippingAddress.street}</div>
                            )}
                            <div>
                              {order.shippingAddress.city}
                              {order.shippingAddress.city ? "," : ""}{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.postalCode}{" "}
                              {order.shippingAddress.country}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[13px] text-[#999]">—</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#e6e0d0] pt-3">
                      <div className="text-[13px] font-semibold mb-2">
                        Items ({order.items?.length || 0})
                      </div>
                      <div className="space-y-2 text-[13px] text-[#333]">
                        {order.items?.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between gap-3 border-b last:border-b-0 border-[#eee] pb-1"
                          >
                            <span className="truncate">
                              {it.name || it.title || "Item"}
                              {it.size && ` · Size: ${it.size}`}
                              {it.color && ` · Color: ${it.color}`}
                            </span>
                            <span className="whitespace-nowrap">
                              x{it.quantity} · €
                              {(it.price * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
