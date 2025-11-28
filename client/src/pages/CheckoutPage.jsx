// client/src/pages/CheckoutPage.jsx
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartProvider";
import { AuthContext } from "../context/AuthProvider";
import AddressModal from "../Components/AddressModal";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ========== PAYMENT FORM (Stripe) ==========
// amountMajor = total in major currency (e.g. 19.99)
function PaymentForm({
  amountMajor,
  currency,
  shippingAddress,
  cart,
  subtotal,
  shippingPrice,
  shippingMethodId,
  shippingMethodLabel,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Build the customer payload from shipping address
  const customerPayload = useMemo(() => {
    if (!shippingAddress) return null;

    const name =
      `${shippingAddress.firstName || ""} ${
        shippingAddress.lastName || ""
      }`.trim() ||
      shippingAddress.fullName ||
      "";

    return {
      name: name || "Test Customer",
      address: {
        line1: shippingAddress.street || "",
        line2: shippingAddress.apt || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode || "",
        country: (shippingAddress.country || "IN").toUpperCase(),
      },
    };
  }, [shippingAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!stripe || !elements) return;
    if (!customerPayload) {
      setErrorMessage(
        "Shipping address is missing. Please go back and select an address."
      );
      return;
    }

    setProcessing(true);

    try {
      const amountMinor = Math.round(amountMajor * 100); // -> cents

      // 1) Ask backend to create PaymentIntent with customer name + address
      const res = await fetch(
        "http://localhost:5000/api/payments/create-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            amount: amountMinor,
            currency,
            customer: customerPayload,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to start payment");
      }

      const { clientSecret } = await res.json();

      // 2) Confirm card payment on Stripe.js side
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: customerPayload.name,
            address: {
              line1: customerPayload.address.line1,
              line2: customerPayload.address.line2 || undefined,
              city: customerPayload.address.city,
              state: customerPayload.address.state,
              postal_code: customerPayload.address.postalCode,
              country: customerPayload.address.country,
            },
          },
        },
      });

      if (result.error) {
        if (
          result.error.message &&
          result.error.message.includes(
            "export transactions require a customer name and address"
          )
        ) {
          setErrorMessage(
            "Stripe needs customer name and full address for international payments. Please check your address and try again."
          );
        } else {
          setErrorMessage(result.error.message || "Payment failed");
        }
      } else if (result.paymentIntent?.status === "succeeded") {
        setSuccessMessage("Payment successful! 🎉");

        // 3) Create order in our backend
        try {
          const orderRes = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({
              items: cart,
              subtotal,
              shippingPrice,
              currency,
              shippingMethodId,
              shippingMethodLabel,
              shippingAddress: {
                ...shippingAddress,
                fullName:
                  shippingAddress.fullName ||
                  `${shippingAddress.firstName || ""} ${
                    shippingAddress.lastName || ""
                  }`.trim(),
              },
              paymentIntentId: result.paymentIntent.id,
            }),
          });

          if (!orderRes.ok) {
            console.error("Failed to create order");
          }

          // 4) Redirect to My Account > Orders
          navigate("/myaccount", {
            state: {
              activeTab: "orders",
              orderPlaced: true,
            },
          });
        } catch (err) {
          console.error("Error saving order:", err);
          navigate("/myaccount", {
            state: { activeTab: "orders" },
          });
        }
      } else {
        setErrorMessage("Payment did not complete. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-[460px] space-y-4">
      {/* Tabs row: only Card is enabled */}
      <div className="flex gap-3 mb-2 text-sm">
        <button
          type="button"
          className="px-4 py-2 rounded-md border border-black bg-white font-semibold"
        >
          Card
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-md border border-gray-200 text-gray-400 cursor-not-allowed"
        >
          Wallet (coming soon)
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-md border border-gray-200 text-gray-400 cursor-not-allowed"
        >
          Other (coming soon)
        </button>
      </div>

      <div className="text-[13px] text-[#444] mb-1">
        All transactions are secure and encrypted.
      </div>

      <div className="border border-[#ddd] rounded-[10px] p-3 bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "15px",
                color: "#111",
                "::placeholder": { color: "#999" },
              },
              invalid: {
                color: "#e5424d",
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="text-[13px] text-red-600">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="text-[13px] text-green-600">{successMessage}</div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full rounded-full bg-black text-white text-[15px] font-semibold py-3 hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? "Processing..." : `Pay now €${amountMajor.toFixed(2)}`}
      </button>
    </form>
  );
}

// ========== MAIN CHECKOUT PAGE ==========
export default function CheckoutPage() {
  const { cart, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("address"); // "address" | "delivery" | "payment"

  const [addresses, setAddresses] = useState([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // NEW: which address is selected for checkout
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [shippingPrice, setShippingPrice] = useState(5); // default

  const total = getCartTotal();

  const shippingOptions = [
    {
      id: "standard",
      label: "Standard",
      desc: "Delivery in 3–5 business days",
      price: 5,
    },
    {
      id: "premium",
      label: "Premium",
      desc: "Delivery in 2–3 business days",
      price: 10,
    },
    {
      id: "nextday",
      label: "Next Day",
      desc: "Delivery in 1–2 business days",
      price: 15,
    },
  ];

  const grandTotal = useMemo(
    () => total + (step === "address" ? 0 : shippingPrice),
    [total, shippingPrice, step]
  );

  // Fetch addresses and set default selected address
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/addresses", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();
      const list = data.addresses || [];
      setAddresses(list);

      if (list.length > 0) {
        // Keep previous selection if it still exists, otherwise pick defaultDelivery or first
        setSelectedAddressId((prev) => {
          if (prev && list.some((a) => a._id === prev)) return prev;
          const def = list.find((a) => a.defaultDelivery) || list[0];
          return def?._id || null;
        });
      } else {
        setSelectedAddressId(null);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setAddressesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddressesLoaded(true);
    }
  }, [user, fetchAddresses]);

  const handleAddOrUpdateAddress = async (newAddress) => {
    const token = localStorage.getItem("token");
    try {
      if (editingAddress) {
        await fetch(
          `http://localhost:5000/api/auth/addresses/${editingAddress._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(newAddress),
          }
        );
      } else {
        await fetch("http://localhost:5000/api/auth/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(newAddress),
        });
      }
      setAddressModalOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      console.error("Failed to save address", err);
    }
  };

  const hasSavedAddress = !!user && addresses.length > 0;

  // Now: primaryAddress = the *selected* address
  const primaryAddress = useMemo(() => {
    if (!hasSavedAddress || !selectedAddressId) return null;
    return (
      addresses.find((a) => a._id === selectedAddressId) ||
      addresses.find((a) => a.defaultDelivery) ||
      addresses[0]
    );
  }, [hasSavedAddress, selectedAddressId, addresses]);

  const fullName =
    primaryAddress &&
    (primaryAddress.firstName || primaryAddress.lastName
      ? `${primaryAddress.firstName || ""} ${
          primaryAddress.lastName || ""
        }`.trim()
      : primaryAddress.fullName || "");

  useEffect(() => {
    const selected = shippingOptions.find((s) => s.id === selectedShipping);
    setShippingPrice(selected ? selected.price : 5);
  }, [selectedShipping]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="bg-white rounded-xl shadow-md px-8 py-10 max-w-md text-center">
          <h1 className="text-[22px] font-semibold mb-3">Please log in</h1>
          <p className="text-[14px] text-[#555] mb-6">
            You need to be logged in to continue with checkout.
          </p>
          <button
            onClick={() => navigate("/login", { state: { from: "/checkout" } })}
            className="inline-flex items-center justify-center rounded-full bg-black text-white text-[15px] font-semibold px-8 py-3 hover:bg-black/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[24px] font-semibold">
          <Link to="/">
            <img
              src="/LogoFull1.png"
              alt="Spree logo"
              className="h-[40px] md:h-[48px] w-auto mr-2 object-contain"
            />
          </Link>
        </div>
      </div>

      <div className="text-xs text-[#777] mb-5">
        <span
          className={
            step === "address" ? "font-semibold text-[#111]" : "text-[#999]"
          }
        >
          Cart
        </span>
        <span className="mx-1"> &gt; </span>
        <span
          className={
            step === "address" ? "font-semibold text-[#111]" : "text-[#999]"
          }
        >
          Address
        </span>
        <span className="mx-1"> &gt; </span>
        <span
          className={
            step === "delivery" ? "font-semibold text-[#111]" : "text-[#999]"
          }
        >
          Delivery
        </span>
        <span className="mx-1"> &gt; </span>
        <span
          className={
            step === "payment" ? "font-semibold text-[#111]" : "text-[#999]"
          }
        >
          Payment
        </span>
      </div>
    </>
  );

  // Left side content by step
  const renderLeft = () => {
    if (step === "address") {
      return (
        <>
          {renderHeader()}

          {/* Account info */}
          {user && hasSavedAddress && (
            <div className="border border-[#e3e3e3] rounded-[10px] px-5 py-4 mb-5 bg-white">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#777] mb-2">
                Account
              </div>
              <div className="text-[15px] font-semibold mb-1">
                {user.firstName || user.lastName
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : user.email}
              </div>
              <div className="text-[13px] text-[#555]">{user.email}</div>
            </div>
          )}

          {/* Pay with Link button (demo) */}
          <button
            type="button"
            className="w-full bg-[#00d66b] text-[#111] rounded-full text-[16px] font-semibold py-[14px] mb-5 cursor-pointer flex items-center justify-center hover:bg-[#00c561] transition-colors"
          >
            <span className="mr-2 text-[15px]">Pay with</span>
            <span className="flex items-center">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#111] mr-1">
                <svg viewBox="0 0 12 12" className="w-[10px] h-[10px]">
                  <path
                    d="M4 2l4 4-4 4"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[15px] font-bold leading-none">link</span>
            </span>
          </button>

          <div className="flex items-center justify-between text-xs text-[#999] mb-6">
            <span className="flex-1 border-t border-[#e3e3e3] mr-3" />
            <span>or continue below</span>
            <span className="flex-1 border-t border-[#e3e3e3] ml-3" />
          </div>

          {!addressesLoaded ? (
            <div className="text-sm text-gray-500">Loading your addresses…</div>
          ) : !hasSavedAddress ? (
            <>
              <h2 className="text-[15px] font-semibold mb-3">
                Shipping Address
              </h2>
              <div className="border border-[#e3e3e3] rounded-[10px] px-5 py-6 mb-6 bg-white text-[13px] text-[#555]">
                You haven't added any address yet.
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressModalOpen(true);
                  }}
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-black text-white text-[13px] font-semibold px-6 py-2 hover:bg-black/90 transition-colors"
                >
                  Add address
                </button>
              </div>
              <div className="mt-10 text-center text-[11px] text-[#999]">
                Terms and Conditions
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[15px] font-semibold mb-3">
                Shipping Address
              </h2>

              {/* 🔹 SHOW ALL USER ADDRESSES HERE */}
              <div className="border border-[#e3e3e3] rounded-[10px] overflow-hidden mb-6 bg-white">
                {addresses.map((addr, idx) => {
                  const isSelected = addr._id === selectedAddressId;
                  const name =
                    addr.firstName || addr.lastName
                      ? `${addr.firstName || ""} ${addr.lastName || ""}`.trim()
                      : addr.fullName || "";

                  return (
                    <div
                      key={addr._id}
                      className={`px-5 py-4 text-[13px] text-[#444] flex items-start gap-3 ${
                        idx !== addresses.length - 1
                          ? "border-b border-[#e9e9e9]"
                          : ""
                      }`}
                    >
                      {/* Radio */}
                      <button
                        type="button"
                        className="mt-[3px]"
                        onClick={() => setSelectedAddressId(addr._id)}
                      >
                        <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full border border-[#111]">
                          {isSelected && (
                            <span className="w-[8px] h-[8px] rounded-full bg-[#111]" />
                          )}
                        </span>
                      </button>

                      {/* Address details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-[14px] font-semibold mb-1">
                              {name}
                            </div>
                            <div className="text-[13px] text-[#444] leading-relaxed">
                              {addr.street && <div>{addr.street}</div>}
                              <div>
                                {addr.city}
                                {addr.city ? "," : ""} {addr.state}{" "}
                                {addr.postalCode} {addr.country}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {addr.defaultDelivery && (
                                <span className="inline-flex items-center rounded-full bg-[#f3f1e9] text-[11px] font-medium px-3 py-1 text-[#333]">
                                  Default delivery
                                </span>
                              )}
                              {addr.defaultBilling && (
                                <span className="inline-flex items-center rounded-full bg-[#f3f1e9] text-[11px] font-medium px-3 py-1 text-[#333]">
                                  Default billing
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddress(addr);
                              setAddressModalOpen(true);
                            }}
                            className="text-[12px] text-[#2d6cdf] font-medium hover:underline whitespace-nowrap"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* New address row */}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#fafafa]"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressModalOpen(true);
                  }}
                >
                  <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full border border-[#bbb]" />
                  <span className="text-[13px] text-[#444]">New address</span>
                </button>
              </div>

              <div className="w-full flex justify-end">
                <button
                  onClick={() => {
                    if (!selectedAddressId) return;
                    setStep("delivery");
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-black text-white text-[15px] font-semibold px-10 py-3 shadow-[0_1px_0_rgba(0,0,0,0.18)] hover:bg-black/90 transition-colors disabled:opacity-60"
                  disabled={!selectedAddressId}
                >
                  Save and Continue
                </button>
              </div>

              <div className="mt-10 text-center text-[11px] text-[#999]">
                Terms and Conditions
              </div>
            </>
          )}
        </>
      );
    }

    if (step === "delivery") {
      return (
        <>
          {renderHeader()}

          <div className="border border-[#e3e3e3] rounded-[10px] px-5 py-4 mb-5 bg-white">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[#777] mb-2">
              Account
            </div>
            <div className="text-[15px] font-semibold mb-1">
              {fullName || user.email}
            </div>
            <div className="text-[12px] text-[#555]">
              Ship Address{" "}
              {primaryAddress
                ? `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postalCode}, ${primaryAddress.country}`
                : ""}
              <button
                className="ml-2 text-[12px] text-[#2d6cdf] hover:underline"
                onClick={() => setStep("address")}
              >
                Edit
              </button>
            </div>
          </div>

          <h2 className="text-[15px] font-semibold mb-3">
            Delivery method from{" "}
            <span className="font-bold">Shop location</span>
          </h2>

          <div className="border border-[#e3e3e3] rounded-[10px] overflow-hidden mb-6 bg-white">
            {shippingOptions.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                className={`w-full flex items-center text-left px-5 py-4 text-[13px] ${
                  idx !== shippingOptions.length - 1
                    ? "border-b border-[#e9e9e9]"
                    : ""
                } hover:bg-[#fafafa]`}
                onClick={() => setSelectedShipping(opt.id)}
              >
                <span className="mr-4 mt-[1px]">
                  <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full border border-[#111]">
                    {selectedShipping === opt.id && (
                      <span className="w-[8px] h-[8px] rounded-full bg-[#111]" />
                    )}
                  </span>
                </span>
                <span className="flex-1">
                  <div className="font-medium text-[14px]">{opt.label}</div>
                  <div className="text-[12px] text-[#777]">{opt.desc}</div>
                </span>
                <span className="text-[13px] font-medium">
                  €{opt.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full flex justify-end">
            <button
              onClick={() => setStep("payment")}
              className="inline-flex items-center justify-center rounded-full bg-black text-white text-[15px] font-semibold px-10 py-3 shadow-[0_1px_0_rgba(0,0,0,0.18)] hover:bg-black/90 transition-colors"
            >
              Save and Continue
            </button>
          </div>

          <div className="mt-10 text-center text-[11px] text-[#999]">
            Terms and Conditions
          </div>
        </>
      );
    }

    // PAYMENT STEP
    const selectedMethod = shippingOptions.find(
      (s) => s.id === selectedShipping
    );

    return (
      <>
        {renderHeader()}

        <div className="border border-[#e3e3e3] rounded-[10px] px-5 py-4 mb-5 bg-white">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#777] mb-2">
            Billing Address
          </div>
          <label className="flex items-center gap-2 text-[13px] text-[#333]">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            Use shipping address
          </label>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            amountMajor={grandTotal}
            currency="usd"
            shippingAddress={primaryAddress}
            cart={cart}
            subtotal={total}
            shippingPrice={shippingPrice}
            shippingMethodId={selectedShipping}
            shippingMethodLabel={selectedMethod?.label || "Standard"}
          />
        </Elements>

        <div className="mt-10 text-center text-[11px] text-[#999]">
          Terms and Conditions
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <div className="max-w-[1180px] mx-auto flex flex-col lg:flex-row bg-white lg:bg-transparent">
        {/* LEFT: Steps */}
        <div className="flex-[3] bg-white px-6 md:px-10 lg:px-14 py-10">
          {renderLeft()}
        </div>

        {/* RIGHT: Order summary */}
        <aside className="flex-[2] bg-[#f3efe4] border-t lg:border-t-0 lg:border-l border-[#e0d9ca] px-6 md:px-7 lg:px-8 py-8">
          {cart.map((item, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-md object-cover border border-[#ded6c6]"
                />
                <span className="absolute -top-2 -right-2 bg-black text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold leading-tight">
                  {item.name}
                </div>
                <div className="text-[11px] text-[#777] mt-[2px]">
                  Color: {item.colorName || item.color}, Size: {item.size}
                </div>
              </div>
              <div className="text-sm font-semibold">
                €{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="mt-4 mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Add promo code"
              className="flex-1 border border-[#d0ccc1] rounded-[6px] px-3 py-2.5 text-sm bg-white"
            />
            <button className="px-4 py-2 text-sm font-semibold rounded-[999px] bg-[#7f7a72] text-white hover:bg-[#6b665f] transition-colors">
              Apply
            </button>
          </div>

          <div className="border-t border-[#d7d2c7] pt-4 text-sm space-y-1 mb-6">
            <div className="flex justify-between">
              <span className="text-[#555]">Subtotal</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Shipping</span>
              <span>
                {step === "address"
                  ? "Calculated at next step"
                  : `€${shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-2">
              <span>Total</span>
              <span>€{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-[12px] text-[#444] leading-relaxed">
            <h3 className="font-semibold mb-1">Checkout Guide</h3>
            <p className="mb-2">
              This uses{" "}
              <span className="font-semibold">Stripe test payments.</span>
            </p>
            <p className="mb-1">
              Use card <code>4242 4242 4242 4242</code>, any future expiry and
              any 3-digit CVC.
            </p>
            <p className="mt-2 text-[11px] text-[#777]">
              You will not be charged – this is test mode only.
            </p>
          </div>
        </aside>
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleAddOrUpdateAddress}
        initialData={editingAddress}
      />
    </div>
  );
}
