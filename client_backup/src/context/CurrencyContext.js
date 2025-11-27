import React, { createContext, useState, useEffect, useCallback } from "react";

export const CurrencyContext = createContext();

const CURRENCY_OPTIONS = [
  { label: "USD", symbol: "$" },
  { label: "EUR", symbol: "€" },
  { label: "INR", symbol: "₹" },
];

const API_KEY = "3b871c8b211686ecc785fbea";
const BASE_CURRENCY = "USD";

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0].label);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRates() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`
        );
        const data = await res.json();
        if (data.result === "success") {
          setRates(data.conversion_rates);
        }
      } catch (err) {
      }
      setLoading(false);
    }
    fetchRates();
    const interval = setInterval(fetchRates, 21600000);
    return () => clearInterval(interval);
  }, []);

  const convertPrice = useCallback(
    (amount, base = BASE_CURRENCY) => {
      if (!rates[currency]) return amount;
      if (base === currency) return amount;
      const usdAmount =
        base === BASE_CURRENCY ? amount : amount / (rates[base] || 1);
      return usdAmount * rates[currency];
    },
    [rates, currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol:
          CURRENCY_OPTIONS.find((opt) => opt.label === currency)?.symbol || "$",
        options: CURRENCY_OPTIONS,
        convertPrice,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
