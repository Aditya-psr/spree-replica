import React, { useState } from "react";
import { Box, Users, Edit, PackageSearch } from "lucide-react";
import AddProduct from "./AddProduct";
import ManageUsers from "./ManageUsers";
import EditProducts from "./EditProducts";
import AdminOrders from "./AdminOrders";

const menuOptions = [
  { key: "add-product", label: "Add Product", icon: <Box size={22} /> },
  { key: "manage-users", label: "Manage Users", icon: <Users size={22} /> },
  { key: "orders", label: "Orders", icon: <PackageSearch size={22} /> },
  { key: "edit-products", label: "Edit Products", icon: <Edit size={22} /> },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("add-product");

  let content;
  if (activeTab === "add-product") {
    content = <AddProduct />;
  } else if (activeTab === "manage-users") {
    content = <ManageUsers />;
  } else if (activeTab === "orders") {
    content = <AdminOrders />;
  } else if (activeTab === "edit-products") {
    content = <EditProducts />;
  }

  return (
    <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto bg-white min-h-[650px]">
      <aside className="w-full lg:w-[270px] lg:min-w-[270px] border-b lg:border-b-0 lg:border-r border-[#ecebe7] bg-white pt-4 lg:pt-8">
        <div className="font-bold text-[22px] mb-4 lg:mb-[42px] ml-6 lg:ml-[30px] tracking-[.05em] hidden lg:block">
          ADMIN PANEL
        </div>
        <ul className="list-none m-0 p-0 flex lg:flex-col overflow-x-auto lg:overflow-visible whitespace-nowrap lg:whitespace-normal bg-gray-50 lg:bg-transparent no-scrollbar">
          {menuOptions.map((opt) => (
            <li
              key={opt.key}
              className={`py-[18px] px-6 lg:pl-[28px] font-medium text-[18px] cursor-pointer flex items-center gap-[15px] transition-colors border-b-[3px] lg:border-b-0 lg:border-l-[3px] ${
                activeTab === opt.key
                  ? "bg-[#efefef] border-[#222] font-semibold"
                  : "bg-transparent border-transparent hover:bg-gray-100 font-normal"
              }`}
              onClick={() => setActiveTab(opt.key)}
            >
              <span className="text-[#232323]">{opt.icon}</span>
              <span className="text-[#232323]">{opt.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 bg-white p-4 md:p-8 lg:p-[48px] lg:px-[60px] min-w-0 overflow-x-hidden">
        {content}
      </main>
    </div>
  );
}
