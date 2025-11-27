// client/src/pages/MyAccount.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import AddressModal from "../Components/AddressModal";
import { WishlistContext } from "../context/WishlistProvider";
import ProductCard from "../Components/ProductCard";

const sidebarOptions = [
  { key: "orders", label: "Orders & Returns" },
  { key: "addresses", label: "Addresses" },
  { key: "personal", label: "Personal details" },
  { key: "wishlist", label: "Wishlist" },
  { key: "giftcards", label: "Gift Cards" },
  { key: "credits", label: "Store Credits" },
  { key: "newsletter", label: "Newsletter settings" },
  { key: "logout", label: "Log out" },
];

const inputClass =
  "w-full text-[19px] px-[18px] py-[15px] rounded-lg border border-[#e4e4e4] mt-[3px] mb-[13px] bg-[#fafafa] focus:outline-none focus:border-black transition-colors";

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState("orders");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [showOrderBanner, setShowOrderBanner] = useState(
    location.state?.orderPlaced || false
  );

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // Handle navigation state (login success, wishlist tab, order placed)
  useEffect(() => {
    if (location.state?.loginSuccess) {
      setShowLoginBanner(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.activeTab === "wishlist") {
      setActiveTab("wishlist");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.orderPlaced) {
      setActiveTab("orders");
      setShowOrderBanner(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeTab === "personal" && user) {
      let firstName = user.firstName || "";
      let lastName = user.lastName || "";
      let phone = user.phone || "";

      if ((!firstName || !lastName || !phone) && addresses.length > 0) {
        const addr = addresses[0];
        firstName =
          firstName ||
          addr.firstName ||
          (addr.fullName ? addr.fullName.split(" ")[0] : "");
        lastName =
          lastName ||
          addr.lastName ||
          (addr.fullName ? addr.fullName.split(" ").slice(1).join(" ") : "");
        phone = phone || addr.phone || "";
      }

      setForm((f) => ({
        ...f,
        email: user.email,
        firstName,
        lastName,
        phone,
      }));
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage("");
    }
  }, [activeTab, user, addresses]);

  const fetchAddresses = async () => {
    const res = await fetch("http://localhost:5000/api/auth/addresses", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    const data = await res.json();
    setAddresses(data.addresses || []);
  };

  useEffect(() => {
    if ((activeTab === "addresses" || activeTab === "personal") && user) {
      fetchAddresses();
    }
  }, [activeTab, user]);

  // Fetch orders when orders tab active
  const fetchOrders = async () => {
    try {
      setOrdersLoaded(false);
      const res = await fetch("http://localhost:5000/api/orders/my", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setOrders([]);
    } finally {
      setOrdersLoaded(true);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowProfileBanner(true);
      setTimeout(() => setShowProfileBanner(false), 3600);
    } else {
      alert("Profile updated failed!");
    }
  };

  const handleAddAddress = async (newAddress) => {
    const token = localStorage.getItem("token");
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
  };

  const handleDeleteAddress = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/auth/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    fetchAddresses();
  };

  const handlePasswordChangeField = (e) =>
    setPasswordForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    if (
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword ||
      !passwordForm.currentPassword
    ) {
      setPasswordMessage("All fields are required.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    const res = await fetch("http://localhost:5000/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(passwordForm),
    });
    const data = await res.json();
    if (res.ok) {
      navigate("/", {
        state: {
          showBanner: true,
          bannerText: "YOU UPDATED YOUR ACCOUNT SUCCESSFULLY.",
          bannerColor: "#00d084",
        },
      });
    } else {
      setPasswordMessage(data.message || "Password change failed.");
    }
  };

  const handleLogout = () => {
    const userId = localStorage.getItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    logout();
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ====== CONTENT by tab ======
  let content;

  if (activeTab === "orders") {
    content = (
      <div className="max-w-[950px] mx-auto mt-[62px] px-4">
        <h2 className="font-medium text-[23px] tracking-[2px] mb-2.5 uppercase">
          ORDERS
        </h2>
        <div className="w-[58px] mx-auto md:mx-0 mb-6 border-b-[2.3px] border-[#222] opacity-70" />

        {!ordersLoaded ? (
          <div className="mt-14 text-center text-[16px] text-[#666]">
            Loading your orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center mt-[72px]">
            <p className="mx-auto mb-[30px] font-medium text-[21px] text-[#232323]">
              YOU CURRENTLY HAVE NO ORDERS
            </p>
            <p className="text-[#333] text-[16px] mb-[34px]">
              If you place an order, you will find details here.
            </p>
            <button
              onClick={() => navigate("/shopall")}
              className="bg-[#111] text-white py-[14px] px-[49px] rounded-[28px] font-bold text-[19px] border-none tracking-[1px] cursor-pointer hover:bg-black/90 transition-colors"
            >
              SHOP ALL
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-[#ecebe8] rounded-[11px] p-5 bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div>
                    <div className="text-[14px] text-[#777] uppercase tracking-[0.16em]">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-[13px] text-[#666] mt-[2px]">
                      Placed on {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-right md:text-right">
                    <div className="text-[14px] font-semibold text-[#222]">
                      Total: €{order.total?.toFixed(2)}
                    </div>
                    {order.deliveryEstimateText && (
                      <div className="text-[13px] text-[#555] mt-1">
                        {order.deliveryEstimateText}
                      </div>
                    )}
                    <div className="text-[12px] text-[#00aa55] font-medium mt-1">
                      {order.status ? order.status.toUpperCase() : "PROCESSING"}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#f1f1f1] pt-3 mt-2">
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-[13px]"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-md object-cover border border-[#eee]"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-[#222]">
                              {item.name}
                            </div>
                            <div className="text-[#777]">
                              {item.colorName || item.color} • {item.size} • Qty{" "}
                              {item.quantity}
                            </div>
                          </div>
                          <div className="font-medium text-[#222]">
                            €{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else if (activeTab === "addresses") {
    content = (
      <div className="max-w-[850px] mx-auto mt-[62px] px-4">
        <h2 className="font-medium text-[23px] uppercase mb-2 tracking-[1.5px]">
          Addresses
        </h2>
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="border-[1.8px] border-[#ecebe8] rounded-[11px] p-6 md:px-[30px] bg-white flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-4"
          >
            <div>
              <div className="font-semibold text-[18px]">
                {addr.firstName || addr.lastName
                  ? `${addr.firstName || ""} ${addr.lastName || ""}`.trim()
                  : addr.fullName || ""}
              </div>
              <div className="my-0.5">
                {addr.street && <div>{addr.street}</div>}
                <div>
                  {addr.city}
                  {addr.city ? "," : ""} {addr.state} {addr.postalCode}{" "}
                  {addr.country}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3.5">
                {addr.defaultDelivery && (
                  <span className="bg-[#f3f1e9] rounded-[18px] py-2.5 px-6 text-[15.5px] font-medium text-[#222] whitespace-nowrap">
                    This is your default delivery address
                  </span>
                )}
                {addr.defaultBilling && (
                  <span className="bg-[#f3f1e9] rounded-[18px] py-2.5 px-6 text-[15.5px] font-medium text-[#222] whitespace-nowrap">
                    This is your default billing address
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-6 mt-2 md:mt-0">
              <button
                className="bg-none border-none text-[22px] cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => {
                  setEditingAddress(addr);
                  setAddressModalOpen(true);
                }}
              >
                ✏️ EDIT
              </button>
              <button
                className="bg-none border-none text-[22px] cursor-pointer text-[#222] hover:opacity-70 transition-opacity"
                onClick={() => handleDeleteAddress(addr._id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setEditingAddress(null);
            setAddressModalOpen(true);
          }}
          className="bg-[#111] text-white py-[13px] px-[40px] rounded-[32px] font-bold text-[19px] mt-[31px] border-none tracking-[1px] cursor-pointer hover:bg-black/90 transition-colors"
        >
          ADD
        </button>
        <AddressModal
          open={addressModalOpen}
          onClose={() => {
            setAddressModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={handleAddAddress}
          initialData={editingAddress}
        />
      </div>
    );
  } else if (activeTab === "wishlist") {
    content = (
      <div className="max-w-[900px] mx-auto mt-[62px] px-4">
        <h2 className="animate-[slideIn_0.3s_ease-in-out] font-bold text-[23px] uppercase mb-[18px] tracking-[1.2px]">
          WISHLIST
        </h2>
        {wishlist.length === 0 ? (
          <div className="mx-auto mt-16 text-[21px] color-[#777] text-center">
            No items in wishlist.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {wishlist.map((product) => (
              <div key={product._id} className="w-full flex justify-center">
                <ProductCard product={product} isWishlist />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else if (activeTab === "personal") {
    content = showChangePassword ? (
      <div className="max-w-[950px] mx-auto mt-[58px] bg-white px-4 md:px-0">
        <form
          onSubmit={handlePasswordUpdate}
          className="p-8 border md:border-none rounded-lg md:rounded-none border-gray-100"
        >
          <div className="font-bold mb-[22px] text-[25px] uppercase">
            CHANGE PASSWORD
          </div>
          <div className="mb-5">
            <label className="text-[#666] text-[17px] mb-1 block">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              className={inputClass}
              value={passwordForm.currentPassword}
              onChange={handlePasswordChangeField}
              required
            />
          </div>
          <div className="mb-5">
            <label className="text-[#666] text-[17px] mb-1 block">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              className={inputClass}
              value={passwordForm.newPassword}
              onChange={handlePasswordChangeField}
              required
            />
          </div>
          <div className="mb-[27px]">
            <label className="text-[#666] text-[17px] mb-1 block">
              Password Confirmation
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={inputClass}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChangeField}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#111] text-white border-none py-4 font-bold text-[23px] rounded-[38px] tracking-[1px] cursor-pointer hover:bg-black/90 transition-colors"
          >
            UPDATE
          </button>
          {passwordMessage && (
            <div
              className={`mt-[18px] font-medium ${
                passwordMessage.includes("fail")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {passwordMessage}
            </div>
          )}
        </form>
        <button
          className="border-none p-5 bg-none mt-[34px] font-medium text-[#666] text-[17px] cursor-pointer hover:text-black transition-colors"
          onClick={() => setShowChangePassword(false)}
        >
          ← Back to personal details
        </button>
      </div>
    ) : (
      <div className="max-w-[950px] mx-auto mt-[58px] bg-white p-[25px]">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8 md:mb-0">
          <div>
            <div className="font-bold text-[25px] mb-[9px] uppercase">
              Personal details
            </div>
            <div className="text-[19px] font-normal text-[#666] mb-[44px]">
              Please update your contact details
            </div>
          </div>
          <span
            onClick={() => setShowChangePassword(true)}
            className="font-medium text-[19px] text-[#232323] mt-2 cursor-pointer underline hover:text-black"
          >
            Change password
          </span>
        </div>
        <form onSubmit={handleUpdate}>
          {["firstName", "lastName", "phone"].map((field) => (
            <div className="mb-4" key={field}>
              <label className="font-medium text-[15px] text-[#777] block mb-1">
                {field.replace(/^\w/, (c) => c.toUpperCase())}
              </label>
              <input
                name={field}
                type="text"
                placeholder={field}
                value={form[field]}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          ))}
          <div className="mb-[18px]">
            <label className="font-medium text-[15px] text-[#777] block mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              disabled
              className={`${inputClass} bg-[#f0f0f0] cursor-not-allowed`}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#111] text-white border-none py-4 font-bold text-[23px] rounded-[38px] mt-4 tracking-[1px] cursor-pointer hover:bg-black/90 transition-colors"
          >
            UPDATE
          </button>
        </form>
      </div>
    );
  } else if (activeTab === "giftcards") {
    content = (
      <div className="w-full mt-[140px] min-h-[320px] px-4">
        <h2 className="font-bold text-[1.6rem] mb-[18px] text-center tracking-normal">
          Gift Cards
        </h2>
        <div className="text-center mt-[60px] font-medium text-[22px] tracking-[.045em]">
          <span className="text-[#202124]">
            YOU CURRENTLY HAVE NO GIFT CARDS
          </span>
        </div>
      </div>
    );
  } else if (activeTab === "credits") {
    content = (
      <div className="w-full mt-[140px] min-h-[360px] px-4">
        <h2 className="font-semibold text-[29px] mb-[22px] text-center uppercase tracking-[.03em]">
          STORE CREDITS
        </h2>
        <div className="text-[#969ea6] text-[23px] text-center mt-5 font-normal tracking-[.01em]">
          You don't have any store credit.
        </div>
      </div>
    );
  } else if (activeTab === "newsletter") {
    content = (
      <div className="w-full max-w-[700px] mx-auto mt-[100px] min-h-[300px] px-4">
        <h2 className="font-bold text-[27px]">NEWSLETTER SETTINGS</h2>
        <div className="text-[#6a6a6a] my-[13px] mt-[18px] text-[18px] font-normal leading-normal">
          Take control of your settings and tailor your experience according to
          your preferences. Customize your notifications to suit your needs.
        </div>
        <h3 className="font-bold text-[22px] mt-[30px] mb-[12px]">
          NEWSLETTERS
        </h3>
        <div className="text-[#575b5b] text-[20px] mb-[32px]">
          {newsletterSubscribed
            ? "You are currently subscribed to the newsletters."
            : "You are currently not subscribed to the newsletters."}
        </div>
        <button
          onClick={() => setNewsletterSubscribed(!newsletterSubscribed)}
          className="w-full max-w-[370px] mx-auto bg-[#111] text-white font-bold text-[21px] py-4 rounded-[38px] border-none tracking-[1px] cursor-pointer block hover:bg-black/90 transition-colors"
        >
          {newsletterSubscribed ? "UNSUBSCRIBE" : "SUBSCRIBE"}
        </button>
      </div>
    );
  } else if (activeTab === "logout") {
    handleLogout();
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row max-w-[1440px] mx-auto bg-white min-h-[650px]">
      {showLoginBanner && (
        <div className="fixed top-0 left-0 w-screen bg-[#17cb5c] text-black text-center p-[5px] font-normal text-base z-50 tracking-[0.5px]">
          SIGNED IN SUCCESSFULLY.
          <button
            className="float-right mr-8 -mt-1 bg-none border-none text-black text-[30px] leading-none cursor-pointer"
            onClick={() => setShowLoginBanner(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
      {showProfileBanner && (
        <div className="fixed top-0 left-0 w-screen bg-[#17cb5c] text-black text-center p-[5px] font-normal text-base z-50 tracking-[0.5px]">
          ACCOUNT HAS BEEN SUCCESSFULLY UPDATED!
          <button
            className="float-right mr-8 -mt-1 bg-none border-none text-black text-[30px] leading-none cursor-pointer"
            onClick={() => setShowProfileBanner(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
      {showOrderBanner && (
        <div className="fixed top-0 left-0 w-screen bg-[#00d084] text-black text-center p-[5px] font-normal text-base z-50 tracking-[0.5px]">
          YOUR ORDER HAS BEEN PLACED SUCCESSFULLY.
          <button
            className="float-right mr-8 -mt-1 bg-none border-none text-black text-[30px] leading-none cursor-pointer"
            onClick={() => setShowOrderBanner(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      <aside className="w-full md:w-[328px] md:min-w-[328px] border-b md:border-b-0 md:border-r border-[#ecebe7] bg-white pt-7 overflow-x-auto md:overflow-visible">
        <div className="font-bold text-[22px] mb-9 ml-6">MY ACCOUNT</div>
        <ul className="list-none m-0 p-0 flex md:flex-col overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal">
          {sidebarOptions.map((item) => (
            <li
              key={item.key}
              className={`py-[18px] px-6 md:pl-[26px] md:pr-0 font-medium text-[18px] cursor-pointer text-[#232323] transition-colors border-b-[3px] md:border-b-0 md:border-l-[3px] ${
                activeTab === item.key
                  ? "bg-[#f4f3ee] border-[#ebeae4]"
                  : "bg-transparent border-transparent hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex-1 bg-white pb-10">{content}</main>
    </div>
  );
}
