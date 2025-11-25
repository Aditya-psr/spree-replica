import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";

const PAGE_SIZE = 3;

function getUniqueTypes(products) {
  const seen = {};
  return products
    .filter((p) => !!p.type)
    .reduce((acc, p) => {
      const key = `${p.category}_${p.subcategory}_${p.type}`;
      if (!seen[key]) {
        seen[key] = true;
        acc.push({
          label: p.type.charAt(0).toUpperCase() + p.type.slice(1),
          path: `/${p.category}/${p.subcategory}/${p.type}`,
        });
      }
      return acc;
    }, []);
}

export default function SearchBar({ defaultExpanded = false, onClose }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isSmallScreen, setIsSmallScreen] = useState(false); // < 1024px
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activePath, setActivePath] = useState(null);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const inputRef = useRef(null);

  // detect small screen
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateScreen = () => setIsSmallScreen(window.innerWidth < 1024);
    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  // auto-expand on small screens so user doesn’t need second click
  useEffect(() => {
    if (isSmallScreen) setExpanded(true);
  }, [isSmallScreen]);

  // respect defaultExpanded prop
  useEffect(() => {
    if (defaultExpanded) setExpanded(true);
  }, [defaultExpanded]);

  // focus input when overlay open
  useEffect(() => {
    if (expanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [expanded]);

  useEffect(() => {
    if (!query.trim()) {
      fetch("/api/suggestions")
        .then((res) => res.json())
        .then((data) => setSuggestions(data || []))
        .catch(() => setSuggestions([]));
      setResults(null);
      setActivePath(null);
      setPage(0);
    }
  }, [query]);

  const handleSearch = async (value) => {
    setQuery(value);
    setPage(0);
    setActivePath(null);
    if (!value.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/search?query=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRefreshing(true);
    setQuery("");
    setResults(null);
    setActivePath(null);
    setPage(0);
    setTimeout(() => setRefreshing(false), 700);
    if (inputRef.current) inputRef.current.focus();
  };

  const categoryTypes = results?.products
    ? getUniqueTypes(results.products)
    : [];

  const filteredProducts =
    activePath && results?.products
      ? results.products.filter((p) => {
          const path =
            `/${p.category}/${p.subcategory}/${p.type}`.toLowerCase();
          return path === activePath.toLowerCase();
        })
      : results?.products || [];

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const displayedProducts = filteredProducts.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  const onCategoryClick = (path) => {
    setActivePath(path);
    navigate(path);
    setExpanded(false);
    if (onClose) onClose();
  };

  const closeSearch = () => {
    setExpanded(false);
    setQuery("");
    setResults(null);
    if (onClose) onClose();
  };

  const getSuggestionLabel = (s) => {
    if (!s) return "";
    if (typeof s === "string") return s;
    return s.label || s.name || s.query || "";
  };

  // show grey SEARCH trigger only on larger screens when overlay closed
  const shouldShowTrigger = !expanded && !defaultExpanded && !isSmallScreen;

  return (
    <div className="relative">
      {refreshing && (
        <div className="fixed top-0 left-0 w-screen h-[3px] bg-black z-[9999]" />
      )}

      {shouldShowTrigger && (
        <div
          onClick={() => setExpanded(true)}
          className="flex items-center cursor-pointer mx-auto w-fit min-w-[100px]"
        >
          <span className="text-2xl mr-2 text-gray-600">
            <FiSearch />
          </span>
          <span className="text-[18px] tracking-[0.16em] text-[#b9b9b9]">
            SEARCH
          </span>
        </div>
      )}

      {expanded && (
        <div className="fixed inset-0 z-[1100] bg-white/95 backdrop-blur flex flex-col">

          <div className="sticky top-0 z-10 bg-white/95">
            <div className="flex items-center gap-2 px-2 py-2 md:px-5 md:py-4 max-w-[1400px] w-full mx-auto">
              <button
                onClick={closeSearch}
                className="p-[5px] flex items-center justify-center shrink-0"
              >
                <FiX size={24} color="#000" />
              </button>

              <div
                className="
        flex flex-1 items-center bg-white border-2 border-black
        rounded-[999px] px-2 py-1.5
        sm:px-3 sm:py-2
      "
              >
                <FiSearch size={20} className="mr-2 text-black shrink-0" />

                {/* IMPORTANT: min-w-0 so input can shrink on 320px */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="
          flex-1 min-w-0 border-none outline-none bg-transparent
          text-[14px] sm:text-[15px] font-medium text-black
          placeholder:text-gray-400
          placeholder:tracking-[0.12em] sm:placeholder:tracking-[0.16em]
        "
                />

                {/* ALWAYS render CLEAR to avoid jumping */}
                <button
                  onClick={query ? handleClear : undefined}
                  className={`
          ml-1 sm:ml-2
          text-[11px] sm:text-[12px] font-bold
          whitespace-nowrap
          ${query ? "text-gray-800" : "text-transparent pointer-events-none"}
        `}
                >
                  CLEAR
                </button>
              </div>
            </div>
          </div>

          {/* content */}
          <div className="flex-1 w-full border-t border-gray-200 overflow-y-auto">
            <div className="w-full max-w-[1400px] mx-auto">
              {/* TOP SUGGESTIONS */}
              {suggestions && suggestions.length > 0 && (
                <section className="px-4 py-4 md:px-7 border-b border-gray-200">
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-black mb-3">
                    TOP SUGGESTIONS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, idx) => {
                      const label = getSuggestionLabel(s);
                      if (!label) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSearch(label)}
                          className="px-3 py-1 rounded-full border border-gray-300 text-[12px] text-gray-800 hover:bg-gray-100"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="flex flex-col md:flex-row">
                {/* CATEGORIES – mobile stacked */}
                {categoryTypes.length > 0 && (
                  <section className="md:hidden px-4 py-4 border-b border-gray-200 text-[14px]">
                    <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-black mb-3">
                      CATEGORIES
                    </h3>
                    <ul className="m-0 p-0 list-none">
                      {categoryTypes.map((cat) => (
                        <li
                          key={cat.path}
                          onClick={() => onCategoryClick(cat.path)}
                          className={`flex items-center justify-between py-2.5 border-b border-gray-100 cursor-pointer ${
                            activePath === cat.path
                              ? "text-black font-bold"
                              : "text-gray-700 font-normal"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className="text-[13px]">{">"}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* CATEGORIES – sidebar on tablet+ */}
                {categoryTypes.length > 0 && (
                  <div className="hidden md:block min-w-[250px] border-r border-gray-200 px-5 py-6 text-[14px]">
                    <div className="font-bold uppercase text-[13px] tracking-[0.2em] text-[#222] mb-4">
                      CATEGORIES
                    </div>
                    <ul className="m-0 p-0 list-none">
                      {categoryTypes.map((cat) => (
                        <li
                          key={cat.path}
                          onClick={() => onCategoryClick(cat.path)}
                          className={`flex items-center justify-between py-2.5 border-b border-gray-100 cursor-pointer ${
                            activePath === cat.path
                              ? "text-black font-bold"
                              : "text-gray-600 font-normal"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className="text-[13px]">{">"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* PRODUCTS */}
                <div className="flex-1 px-4 py-5 md:px-7 md:py-7">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-[15px] tracking-[0.16em]">
                      PRODUCTS
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={page === 0}
                        onClick={() => setPage(Math.max(page - 1, 0))}
                        className="text-[18px] px-2 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {"<"}
                      </button>
                      <span className="text-[13px] text-gray-600">
                        {totalPages > 0 ? page + 1 : 0}/{totalPages}
                      </span>
                      <button
                        disabled={
                          (page + 1) * PAGE_SIZE >= filteredProducts.length
                        }
                        onClick={() => setPage(page + 1)}
                        className="text-[18px] px-2 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {">"}
                      </button>
                    </div>
                  </div>

                  {/* mobile: horizontal scroll; md+: grid */}
                  <div className="flex gap-3 sm:gap-4 justify-start flex-nowrap overflow-x-auto md:flex-wrap md:overflow-visible md:justify-start">
                    {displayedProducts.length > 0 ? (
                      displayedProducts.map((product) => (
                        <div
                          key={product._id || Math.random()}
                          className="
                            cursor-pointer 
                            flex-shrink-0 w-[160px]
                            sm:w-[180px]
                            md:flex-shrink md:w-[30%] md:max-w-[240px]
                            lg:w-[22%] lg:max-w-[260px]
                          "
                          onClick={() => {
                            navigate(`/product/${product._id}`);
                            closeSearch();
                          }}
                        >
                          <div
                            className="
                              h-[180px] 
                              sm:h-[190px] 
                              md:h-[210px] 
                              lg:h-[230px] 
                              xl:h-[250px]
                              bg-gray-50 rounded-lg overflow-hidden mb-2.5
                            "
                          >
                            <img
                              src={product.variants?.[0]?.images?.[0] || ""}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-[13px] font-semibold mb-0.5">
                            {product.name}
                          </div>
                          <div className="text-[13px] text-gray-600">
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-5 px-4 text-gray-500 text-center w-full">
                        No products found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
