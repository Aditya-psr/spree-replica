import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

const COLORS = [
  { name: "Red", code: "#E01B1B" },
  { name: "Green", code: "#239999" },
  { name: "Blue", code: "#0000FF" },
  { name: "Yellow", code: "#FFD700" },
  { name: "Brown", code: "#8B4513" },
  { name: "Dark Blue", code: "#2E4A62" },
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "Small",
  "20x20",
  "1kg",
  "500g",
  "60tabs",
  "120tabs",
  "10x10",
];

export default function FilterSidebar({
  open,
  onClose,
  state,
  setState,
  onApply,
}) {
  const [sections, setSections] = useState({
    availability: true,
    price: true,
    categories: true,
    color: true,
    size: true,
  });

  // ---- Collapsers
  const Section = ({ name, children }) => (
    <div className="mb-5">
      <div
        onClick={() => setSections((s) => ({ ...s, [name]: !s[name] }))}
        className={`font-bold text-[15px] tracking-[1.4px] cursor-pointer flex items-center select-none ${
          sections[name] ? "mb-2" : "mb-0"
        }`}
      >
        {name.toUpperCase()}
        <span
          className={`ml-auto transition-transform duration-200 ${
            sections[name] ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={17} />
        </span>
      </div>
      {sections[name] && children}
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1400] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative w-full sm:w-[390px] h-screen bg-white shadow-[2px_0_24px_#edeceb] flex flex-col z-[1401] animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex justify-between items-center py-7 pl-5 pr-4 border-b border-[#f3f1eb]">
          <span className="font-bold text-2xl">FILTER</span>
          <button
            onClick={onClose}
            className="text-3xl bg-none border-none cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-[18px] pb-[100px]">
          {/* -- Availability -- */}
          <Section name="availability">
            <label className="flex items-center text-base font-medium cursor-pointer mb-[7px]">
              <input
                type="checkbox"
                checked={state.availability.includes("in")}
                onChange={() =>
                  setState((s) => ({
                    ...s,
                    availability: s.availability.includes("in")
                      ? s.availability.filter((v) => v !== "in")
                      : [...s.availability, "in"],
                  }))
                }
                className="w-[18px] h-[18px] mr-3 accent-[#222] cursor-pointer"
              />
              In stock
            </label>
            <label className="flex items-center text-base font-medium cursor-pointer mb-[7px]">
              <input
                type="checkbox"
                checked={state.availability.includes("out")}
                onChange={() =>
                  setState((s) => ({
                    ...s,
                    availability: s.availability.includes("out")
                      ? s.availability.filter((v) => v !== "out")
                      : [...s.availability, "out"],
                  }))
                }
                className="w-[18px] h-[18px] mr-3 accent-[#222] cursor-pointer"
              />
              Out of Stock
            </label>
          </Section>

          {/* -- Price -- */}
          <Section name="price">
            <div className="flex gap-3.5 mb-3">
              <input
                type="number"
                min={0} // Assuming 0 as min base
                max={state.price[1]}
                value={state.price[0]}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    price: [Number(e.target.value), s.price[1]],
                  }))
                }
                className="text-[17px] w-[95px] px-3 py-2 border border-[#e9e6e1] rounded-md focus:outline-none focus:border-black"
              />
              <input
                type="number"
                min={state.price[0]}
                max={1000} // Assuming a max base, adjust as needed or pass as prop
                value={state.price[1]}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    price: [s.price[0], Number(e.target.value)],
                  }))
                }
                className="text-[17px] w-[95px] px-3 py-2 border border-[#e9e6e1] rounded-md focus:outline-none focus:border-black"
              />
            </div>
            {/* Range Sliders */}
            <div className="flex items-center gap-2.5 my-2.5">
              <input
                type="range"
                min={0}
                max={1000} // Adjust max to match your data logic
                value={state.price[0]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setState((s) => ({
                    ...s,
                    price: [Math.min(val, s.price[1]), s.price[1]],
                  }));
                }}
                className="flex-1 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={state.price[1]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setState((s) => ({
                    ...s,
                    price: [s.price[0], Math.max(val, s.price[0])],
                  }));
                }}
                className="flex-1 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </Section>

          {/* -- Categories -- */}
          <Section name="categories">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#f7f6f2] border-none px-4 py-2.5 my-2 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            {["women", "men", "accessories"].map((cat) => (
              <label
                key={cat}
                className="flex items-center text-base font-medium cursor-pointer mb-[7px]"
              >
                <input
                  type="checkbox"
                  checked={state.categories.includes(cat)}
                  onChange={() =>
                    setState((s) => ({
                      ...s,
                      categories: s.categories.includes(cat)
                        ? s.categories.filter((c) => c !== cat)
                        : [...s.categories, cat],
                    }))
                  }
                  className="w-[18px] h-[18px] mr-3 accent-[#222] cursor-pointer"
                />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </label>
            ))}
          </Section>

          {/* -- Color pills -- */}
          <Section name="color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => (
                <button
                  type="button"
                  key={col.name}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      colors: s.colors.includes(col.code)
                        ? s.colors.filter((c) => c !== col.code)
                        : [...s.colors, col.code],
                    }))
                  }
                  className={`flex items-center border rounded-3xl bg-[#fafaf7] px-3.5 py-[7px] font-semibold cursor-pointer text-[15px] mb-1.5 transition-all
                    ${
                      state.colors.includes(col.code)
                        ? "border-black ring-1 ring-black"
                        : "border-[#ddd] hover:border-gray-400"
                    }
                  `}
                >
                  <span
                    className={`w-[17px] h-[17px] rounded-full mr-[7px] ${
                      col.name === "White" ? "border border-[#aaa]" : ""
                    }`}
                    style={{ background: col.code }}
                  />
                  {col.name}
                </button>
              ))}
            </div>
          </Section>

          {/* -- Sizes -- */}
          <Section name="size">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#f7f6f2] border-none px-4 py-2.5 my-2 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            {SIZES.map((sz) => (
              <label
                key={sz}
                className="flex items-center text-base font-medium cursor-pointer mb-[7px]"
              >
                <input
                  type="checkbox"
                  checked={state.sizes.includes(sz)}
                  onChange={() =>
                    setState((s) => ({
                      ...s,
                      sizes: s.sizes.includes(sz)
                        ? s.sizes.filter((s2) => s2 !== sz)
                        : [...s.sizes, sz],
                    }))
                  }
                  className="w-[18px] h-[18px] mr-3 accent-[#222] cursor-pointer"
                />
                {sz}
              </label>
            ))}
            <span className="text-[#4c4c4c] font-semibold text-base cursor-pointer ml-0.5 hover:underline">
              SHOW ALL
            </span>
          </Section>
        </div>

        {/* APPLY BUTTON */}
        <div className="absolute bottom-0 left-0 w-full sm:w-[390px] bg-[#f7f5f1] border-t border-[#edeceb] py-[21px] z-[1005]">
          <button
            onClick={onApply}
            className="w-[87%] mx-auto block bg-black border-none text-white font-semibold text-[21px] rounded-[29px] tracking-[2px] py-[15px] cursor-pointer hover:bg-gray-800 transition-colors"
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  );
}
