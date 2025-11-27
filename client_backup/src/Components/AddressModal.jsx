import React, { useState, useEffect, useCallback, useRef } from "react";
import countriesData from "./countries+states+cities.json";

export default function AddressModal({ open, onClose, onSave, initialData }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityInput, setCityInput] = useState("");

  const blankForm = {
    country: "",
    firstName: "",
    lastName: "",
    street: "",
    apt: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    defaultDelivery: false,
    defaultBilling: false,
  };
  const [form, setForm] = useState(blankForm);

  const prefilled = useRef(false);
  const prevCountry = useRef("");

  useEffect(() => {
    if (open) {
      if (initialData && !prefilled.current) {
        setForm({
          country: initialData.country || "",
          firstName: initialData.firstName || "",
          lastName: initialData.lastName || "",
          street: initialData.street || "",
          apt: initialData.apt || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postalCode: initialData.postalCode || "",
          phone: initialData.phone || "",
          defaultDelivery: !!initialData.defaultDelivery,
          defaultBilling: !!initialData.defaultBilling,
        });
        setCityInput(initialData.city || "");
        prefilled.current = true;
        prevCountry.current = initialData.country || "";
      } else if (!initialData && !prefilled.current) {
        setForm(blankForm);
        setCityInput("");
        prefilled.current = true;
        prevCountry.current = "";
      }
    } else {
      prefilled.current = false;
      prevCountry.current = "";
    }
  }, [open, initialData]);

  const idForCountry = (c) => c.iso2;
  const nameForCountry = (c) => c.name;
  const idForRegion = (r) => r.iso2;
  const nameForRegion = (r) => r.name;

  const fetchCountries = useCallback(() => {
    setCountries(countriesData || []);
  }, []);

  useEffect(() => {
    if (!form.country) {
      setStates([]);
      setForm((f) => ({ ...f, state: "", city: "" }));
      return;
    }
    const selectedCountry = countriesData.find(
      (c) => idForCountry(c) === form.country
    );
    setStates(selectedCountry?.states || []);

    if (prevCountry.current !== form.country) {
      setForm((f) => ({ ...f, state: "", city: "" }));
      setCityInput("");
    }
    prevCountry.current = form.country;
    setCities([]);
  }, [form.country]);

  useEffect(() => {
    if (!form.country || !form.state || cityInput.length < 1) {
      setCities([]);
      return;
    }
    const selectedCountry = countriesData.find(
      (c) => idForCountry(c) === form.country
    );
    const selectedState = selectedCountry?.states?.find(
      (s) => idForRegion(s) === form.state
    );
    let filteredCities = [];
    if (selectedState?.cities) {
      filteredCities = selectedState.cities.filter((city) =>
        city.name.toLowerCase().includes(cityInput.toLowerCase())
      );
    }
    setCities(filteredCities.slice(0, 10));
  }, [cityInput, form.country, form.state]);

  const handleField = (name, value) =>
    setForm((f) => ({ ...f, [name]: value }));

  const handleCountrySelect = (code) => {
    if (code !== form.country) {
      handleField("country", code);
    }
  };

  const handleStateSelect = (code) => {
    handleField("state", code);
    handleField("city", "");
    setCityInput("");
  };

  const handleCitySelect = (c) => {
    handleField("city", c.name);
    setCityInput(c.name);
    setCities([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.country ||
      !form.firstName ||
      !form.lastName ||
      !form.street ||
      !form.city ||
      !form.state ||
      !form.postalCode
    ) {
      alert("Please fill all required fields.");
      return;
    }
    if (typeof onSave === "function") onSave(form);
    onClose?.();
  };

  useEffect(() => {
    if (open) fetchCountries();
  }, [open, fetchCountries]);

  if (!open) return null;

  // Reusable Styles
  const labelClass =
    "block text-[#696969] text-[14px] mb-2 ml-[3px] font-medium";
  const inputClass =
    "w-full text-[16px] px-4 py-3 rounded-lg border-[1.5px] border-[#dcdcdc] text-[#222] bg-white outline-none font-medium mt-0 focus:border-black transition-colors";
  const checkboxClass = "w-5 h-5 mr-2 accent-[#222] cursor-pointer";
  const checkboxLabelClass =
    "flex items-center text-[15px] text-[#222] font-medium cursor-pointer";

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/45 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white rounded-xl shadow-[0_18px_46px_rgba(0,0,0,0.15)] p-0 w-full max-w-[400px] max-h-[540px] overflow-hidden relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-5 top-4 text-[26px] border-none bg-transparent cursor-pointer text-[#333] z-[2] hover:opacity-70"
          aria-label="Close"
          tabIndex={0}
        >
          ×
        </button>
        <div className="border-b border-[#f2f2f2] px-6 pt-8 pb-3 shrink-0">
          <h2 className="font-bold text-[24px] leading-none m-0">
            {initialData ? "Edit Address" : "Add Address"}
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-6 overflow-y-auto grow mb-4"
        >
          <div className="mt-5">
            <label className={labelClass}>Country</label>
            <select
              className={inputClass}
              value={form.country}
              onChange={(e) => handleCountrySelect(e.target.value)}
              required
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={idForCountry(c)} value={idForCountry(c)}>
                  {nameForCountry(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3.5 mt-5">
            <div className="flex-1">
              <label className={labelClass}>First name</label>
              <input
                className={inputClass}
                type="text"
                value={form.firstName}
                onChange={(e) => handleField("firstName", e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Last name</label>
              <input
                className={inputClass}
                type="text"
                value={form.lastName}
                onChange={(e) => handleField("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass}>Street and house number</label>
            <input
              className={inputClass}
              type="text"
              value={form.street}
              onChange={(e) => handleField("street", e.target.value)}
              required
            />
          </div>

          <div className="mt-3.5">
            <label className={labelClass}>
              Apartment, suite, etc. (optional)
            </label>
            <input
              className={inputClass}
              type="text"
              value={form.apt}
              onChange={(e) => handleField("apt", e.target.value)}
            />
          </div>

          <div className="flex gap-3.5 mt-5">
            <div className="flex-1 relative">
              <label className={labelClass}>City</label>
              <input
                className={inputClass}
                type="text"
                autoComplete="off"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  handleField("city", e.target.value);
                }}
                placeholder="City..."
                required
              />
              {cities.length > 0 && (
                <div className="absolute z-10 bg-white border border-[#eee] rounded-lg top-full left-0 right-0 max-h-32 overflow-y-auto shadow-md">
                  {cities.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleCitySelect(c)}
                      className="p-2 cursor-pointer border-b border-[#f6f6f6] hover:bg-gray-50 last:border-none text-sm"
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className={labelClass}>State</label>
              <select
                className={inputClass}
                value={form.state}
                onChange={(e) => handleStateSelect(e.target.value)}
                required
                disabled={!states.length}
              >
                <option value="">Select</option>
                {states.map((s) => (
                  <option key={idForRegion(s)} value={idForRegion(s)}>
                    {nameForRegion(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className={labelClass}>ZIP</label>
              <input
                className={inputClass}
                type="text"
                value={form.postalCode}
                onChange={(e) => handleField("postalCode", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass}>Phone (optional)</label>
            <input
              className={inputClass}
              type="text"
              value={form.phone}
              onChange={(e) => handleField("phone", e.target.value)}
            />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={form.defaultDelivery}
                onChange={(e) =>
                  handleField("defaultDelivery", e.target.checked)
                }
                className={checkboxClass}
              />
              Set as default delivery
            </label>
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={form.defaultBilling}
                onChange={(e) =>
                  handleField("defaultBilling", e.target.checked)
                }
                className={checkboxClass}
              />
              Set as default billing
            </label>
          </div>
        </form>

        {/* Buttons Area */}
        <div className="px-6 py-5 border-t border-[#f2f2f2] flex justify-between items-center shrink-0 bg-white gap-3">
          <button
            type="button"
            className="bg-transparent text-[#181818] border-none font-bold text-[16px] cursor-pointer px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#181818] border-none text-white px-8 py-3 rounded-[32px] font-bold text-[16px] tracking-wide cursor-pointer flex-1 max-w-[200px] hover:bg-black/90 transition-colors whitespace-nowrap"
          >
            {initialData ? "UPDATE" : "ADD"}
          </button>
        </div>
      </div>
    </div>
  );
}
