import React, { useEffect, useState } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove user.");
      }
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-[#f7f6f3] py-9 min-h-[450px]">
      <div className="max-w-[970px] mx-auto px-4">
        <h2 className="font-bold text-[27px] tracking-[.03em] mb-8 text-[#212223]">
          USERS
        </h2>

        {loading ? (
          <div className="my-16 text-center text-[#888]">Loading users...</div>
        ) : error ? (
          <div className="my-16 text-center text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <div className="my-16 text-center text-[#777]">No users found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-start">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(90,76,76,0.07)] min-w-0 w-full p-7 flex flex-col justify-between h-[240px] relative transition-transform hover:-translate-y-1 duration-200"
              >
                <div>
                  <div
                    className="font-bold text-[21px] text-[#232323] min-h-[35px] line-clamp-1"
                    title={`${u.firstName || ""} ${u.lastName || ""}`}
                  >
                    {u.firstName || u.lastName ? (
                      `${u.firstName || ""} ${u.lastName || ""}`.trim()
                    ) : (
                      <span className="text-[#bbb]">Unknown Name</span>
                    )}
                  </div>
                  <div
                    className="text-[#666] text-[16px] font-medium min-h-[28px] mt-1 truncate"
                    title={u.email}
                  >
                    {u.email || <span className="text-[#bbb]">—</span>}
                  </div>
                  <div className="min-h-[32px] mt-1.5">
                    <span
                      className={`inline-block rounded-[10px] font-semibold text-[13.8px] py-[4.5px] px-[18px] tracking-[.02em] ${
                        u.role === "admin"
                          ? "bg-[#ede1ef] text-[#8a206a]"
                          : "bg-[#f3f1e9] text-[#8b705c]"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                  </div>
                  <div className="text-[#a1a1a1] text-[15px] min-h-[26px] mt-2">
                    Phone:{" "}
                    <span className="text-[#383838] font-medium">
                      {u.phone || <span className="text-[#bbb]">-</span>}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteUser(u._id)}
                  disabled={deletingId === u._id}
                  aria-label="Remove User"
                  className={`w-full border-[1.5px] border-[#efdada] rounded-lg mt-[18px] font-bold py-[11px] text-[16px] tracking-[.02em] transition-all duration-150 ${
                    deletingId === u._id
                      ? "bg-[#ebe9e9] text-[#b14a4a] cursor-wait"
                      : "bg-[#f7efef] text-[#b14a4a] cursor-pointer hover:bg-[#f2e4e4]"
                  }`}
                >
                  {deletingId === u._id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
