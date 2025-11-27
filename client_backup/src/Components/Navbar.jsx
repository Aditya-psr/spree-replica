import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import SearchBar from "./Search";
import {
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiSearch, // Added Search Icon
} from "react-icons/fi";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartProvider";
import { CurrencyContext } from "../context/CurrencyContext";

// Available language options
const languages = [
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "French" },
  { code: "es", label: "ES", name: "Spanish" },
  { code: "hi", label: "HI", name: "Hindi" },
];

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { openCartPopup } = useContext(CartContext);
  const [hovered, setHovered] = useState(null);
  const { currency, setCurrency, options } = useContext(CurrencyContext);
  const [lang, setLang] = useState("en");

  // Responsive States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for mobile search toggle
  const [mobileActiveMenu, setMobileActiveMenu] = useState(null);

  const changeCurrency = (e) => setCurrency(e.target.value);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const toggleMobileSubMenu = (index) => {
    if (mobileActiveMenu === index) {
      setMobileActiveMenu(null);
    } else {
      setMobileActiveMenu(index);
    }
  };

  useEffect(() => {
    const widgetDiv = document.getElementById("google_translate_element");
    if (
      window.google &&
      window.google.translate &&
      window.google.translate.TranslateElement &&
      widgetDiv &&
      widgetDiv.innerHTML.trim() === ""
    ) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr,es,hi",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    }
  }, []);

  const FASHION_DROPDOWN = (
    <div className="w-full absolute left-2/4 translate-x-24 top-full bg-white shadow-lg border-b z-30">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-10 p-10">
        <div>
          <h3 className="font-semibold mb-3 pb-3">WOMEN</h3>
          <ul className="space-y-2 text-sm">
            <li className="pb-3">
              <Link to="/fashion/women/tops">Tops</Link>
            </li>
            <li className="pb-3">
              <Link to="/fashion/women/knitwear">Knitwear</Link>
            </li>
            <li className="pb-3">
              <Link to="/fashion/women/sweatshirts">Sweatshirts</Link>
            </li>
            <li className="font-semibold mb-3">
              <Link to="/fashion/women">View All</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 pb-3">MEN</h3>
          <ul className="space-y-2 text-sm">
            <li className="pb-3">
              <Link to="/fashion/men/tshirts">T-Shirts</Link>
            </li>
            <li className="pb-3">
              <Link to="/fashion/men/shirts">Shirts</Link>
            </li>
            <li className="font-semibold mb-3">
              <Link to="/fashion/men">View All</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 pb-3">ACCESSORIES</h3>
          <ul className="space-y-2 text-sm">
            <li className="pb-3">
              <Link to="/fashion/accessories/sunglasses">Sunglasses</Link>
            </li>
            <li className="pb-3">
              <Link to="/fashion/accessories/watches">Watches</Link>
            </li>
            <li className="pb-3">
              <Link to="/fashion/accessories/scarves">Scarves</Link>
            </li>
            <li className="pb-3">
              <Link to="/fashion/accessories/bags">Bags</Link>
            </li>
            <li className="pb-3">
              <Link to="/fashion/accessories/jewelry">Jewelry</Link>
            </li>
            <li className="font-semibold mb-3">
              <Link to="/fashion/accessories">View All</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center">
          <img
            src="/Image_3.png"
            alt="Explore Fashion"
            className="w-[400px] h-[300px] object-cover"
          />
          <p
            className="text-sm font-semibold w-full h-[35px] relative content-center text-left"
            style={{ background: "#f0efe9" }}
          >
            Explore Fashion
          </p>
        </div>
      </div>
    </div>
  );

  const WELLNESS_DROPDOWN = (
    <div className="w-full absolute left-2/4 top-full bg-white shadow-lg border-b z-30">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-10 p-10">
        <div>
          <h3 className="font-semibold mb-3 pb-3">FITNESS</h3>
          <ul className="space-y-2 text-sm">
            <li className="pb-3">
              <Link to="/wellness/fitness/sportswear">Sportswear</Link>
            </li>
            <li className="pb-3">
              <Link to="/wellness/fitness/yoga">Yoga</Link>
            </li>
            <li className="font-semibold mb-3">
              <Link to="/wellness/fitness">View All</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 pb-3">RELAXATION</h3>
          <ul className="space-y-2 text-sm">
            <li className="pb-3">
              <Link to="/wellness/relaxation/aroma-diffusers">
                Aroma Diffusers
              </Link>
            </li>
            <li className="pb-3">
              <Link to="/wellness/relaxation/scented-candles">
                Scented Candles
              </Link>
            </li>
            <li className="pb-3">
              <Link to="/wellness/relaxation/massage">Massage</Link>
            </li>
            <li className="font-semibold mb-3">
              <Link to="/wellness/relaxation">View All</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 pb-3">MENTAL STIMULATION</h3>
          <ul className="space-y-2 text-sm">
            <li className="pb-3">
              <Link to="/wellness/mentallistimulation/puzzles">Puzzles</Link>
            </li>
            <li className="font-semibold mb-3">
              <Link to="/wellness/mentallistimulation">View All</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 pb-3">NUTRITION</h3>
          <ul className="space-y-2 text-sm">
            <li className="pb-3">
              <Link to="/wellness/nutrition/protein">Protein</Link>
            </li>
            <li className="pb-3">
              <Link to="/wellness/nutrition/vitamins">Vitamins</Link>
            </li>
            <li className="font-semibold mb-3">
              <Link to="/wellness/nutrition">View All</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const menuItems = [
    { label: "Shop All", link: "/shopall" },
    { label: "Fashion", link: "/fashion", subMenu: FASHION_DROPDOWN },
    { label: "Wellness", link: "/wellness", subMenu: WELLNESS_DROPDOWN },
    { label: "New Arrivals", link: "/newarrival" },
    { label: "Sale", link: "/sale" },
  ];

  // Helper to render mobile submenus (vertical stack) to avoid duplicating the large JSX above logic
  const MobileFashionMenu = () => (
    <div className="pl-4 space-y-4 text-gray-600">
      <div className="border-l-2 border-gray-200 pl-3">
        <h4 className="font-bold text-xs text-black mb-2">WOMEN</h4>
        <Link
          to="/fashion/women/tops"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Tops
        </Link>
        <Link
          to="/fashion/women/knitwear"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Knitwear
        </Link>
        <Link
          to="/fashion/women/sweatshirts"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Sweatshirts
        </Link>
        <Link
          to="/fashion/women"
          className="block py-1 text-sm font-medium text-black"
          onClick={toggleMobileMenu}
        >
          View All
        </Link>
      </div>
      <div className="border-l-2 border-gray-200 pl-3">
        <h4 className="font-bold text-xs text-black mb-2">MEN</h4>
        <Link
          to="/fashion/men/tshirts"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          T-Shirts
        </Link>
        <Link
          to="/fashion/men/shirts"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Shirts
        </Link>
        <Link
          to="/fashion/men"
          className="block py-1 text-sm font-medium text-black"
          onClick={toggleMobileMenu}
        >
          View All
        </Link>
      </div>
      <div className="border-l-2 border-gray-200 pl-3">
        <h4 className="font-bold text-xs text-black mb-2">ACCESSORIES</h4>
        <Link
          to="/fashion/accessories/sunglasses"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Sunglasses
        </Link>
        <Link
          to="/fashion/accessories/watches"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Watches
        </Link>
        <Link
          to="/fashion/accessories/scarves"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Scarves
        </Link>
        <Link
          to="/fashion/accessories/bags"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Bags
        </Link>
        <Link
          to="/fashion/accessories/jewelry"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Jewelry
        </Link>
        <Link
          to="/fashion/accessories"
          className="block py-1 text-sm font-medium text-black"
          onClick={toggleMobileMenu}
        >
          View All
        </Link>
      </div>
    </div>
  );

  const MobileWellnessMenu = () => (
    <div className="pl-4 space-y-4 text-gray-600">
      <div className="border-l-2 border-gray-200 pl-3">
        <h4 className="font-bold text-xs text-black mb-2">FITNESS</h4>
        <Link
          to="/wellness/fitness/sportswear"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Sportswear
        </Link>
        <Link
          to="/wellness/fitness/yoga"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Yoga
        </Link>
        <Link
          to="/wellness/fitness"
          className="block py-1 text-sm font-medium text-black"
          onClick={toggleMobileMenu}
        >
          View All
        </Link>
      </div>
      <div className="border-l-2 border-gray-200 pl-3">
        <h4 className="font-bold text-xs text-black mb-2">RELAXATION</h4>
        <Link
          to="/wellness/relaxation/aroma-diffusers"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Aroma Diffusers
        </Link>
        <Link
          to="/wellness/relaxation/scented-candles"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Scented Candles
        </Link>
        <Link
          to="/wellness/relaxation/massage"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Massage
        </Link>
        <Link
          to="/wellness/relaxation"
          className="block py-1 text-sm font-medium text-black"
          onClick={toggleMobileMenu}
        >
          View All
        </Link>
      </div>
      <div className="border-l-2 border-gray-200 pl-3">
        <h4 className="font-bold text-xs text-black mb-2">
          MENTAL STIMULATION
        </h4>
        <Link
          to="/wellness/mentallistimulation/puzzles"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Puzzles
        </Link>
        <Link
          to="/wellness/mentallistimulation"
          className="block py-1 text-sm font-medium text-black"
          onClick={toggleMobileMenu}
        >
          View All
        </Link>
      </div>
      <div className="border-l-2 border-gray-200 pl-3">
        <h4 className="font-bold text-xs text-black mb-2">NUTRITION</h4>
        <Link
          to="/wellness/nutrition/protein"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Protein
        </Link>
        <Link
          to="/wellness/nutrition/vitamins"
          className="block py-1 text-sm"
          onClick={toggleMobileMenu}
        >
          Vitamins
        </Link>
        <Link
          to="/wellness/nutrition"
          className="block py-1 text-sm font-medium text-black"
          onClick={toggleMobileMenu}
        >
          View All
        </Link>
      </div>
    </div>
  );

  return (
    <div className="relative border-b bg-white">
      {/* ======================== MOBILE HEADER (< 1024px) ======================== */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3 border-b relative z-50 bg-white min-h-[60px]">
        {/* Left: Hamburger & Search Icon */}
        <div className="flex items-center gap-5">
          <button onClick={toggleMobileMenu} className="text-2xl">
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <button onClick={toggleSearch} className="text-2xl">
            <FiSearch />
          </button>
        </div>

        {/* Center: Logo (Absolutely positioned to be perfectly centered) */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/">
            <img src="LogoFull1.png" alt="Logo" className="h-7 w-auto" />
          </Link>
        </div>

        {/* Right: Wishlist & Cart */}
        <div className="flex items-center gap-5">
          <Link to="/myaccount" state={{ activeTab: "wishlist" }}>
            <FiHeart size={24} />
          </Link>
          <button onClick={openCartPopup} className="relative">
            <FiShoppingCart size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Toggles when search icon is clicked) */}
      {isSearchOpen && (
        <div className="lg:hidden px-4 py-3 border-b bg-gray-50">
          <SearchBar />
        </div>
      )}

      {/* ======================== MOBILE DRAWER MENU ======================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white z-40 border-b shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="p-5 flex flex-col gap-6">
            {/* Login/Profile moved inside Burger Drawer */}
            <div className="border-b border-gray-100 pb-4">
              {user ? (
                <Link
                  to="/myaccount"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 text-lg font-medium text-gray-800"
                >
                  <FiUser size={22} /> My Account
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 text-lg font-medium text-gray-800"
                >
                  <FiUser size={22} /> Login / Sign Up
                </Link>
              )}
            </div>

            <ul className="flex flex-col gap-4">
              {menuItems.map((item, index) => (
                <li key={index} className="border-b border-gray-100 pb-2">
                  <div className="flex justify-between items-center">
                    {item.subMenu ? (
                      <button
                        className="flex justify-between items-center w-full text-left font-medium text-lg"
                        onClick={() => toggleMobileSubMenu(index)}
                      >
                        {item.label}
                        {mobileActiveMenu === index ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.link}
                        className="font-medium text-lg block w-full"
                        onClick={toggleMobileMenu}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>

                  {/* Mobile Submenu Content */}
                  {item.subMenu && mobileActiveMenu === index && (
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                      {item.label === "Fashion" && <MobileFashionMenu />}
                      {item.label === "Wellness" && <MobileWellnessMenu />}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Mobile Currency Select */}
            <div className="mt-2">
              <label className="block text-sm text-gray-500 mb-1">
                Currency
              </label>
              <select
                className="w-full bg-gray-100 border border-gray-300 rounded p-2"
                value={currency}
                onChange={changeCurrency}
              >
                {options.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ======================== DESKTOP HEADER (>= 1024px) ======================== */}
      {/* UPDATED: Adjusted padding (px) and gap to fit Small Laptops (1024px) without breaking layout */}
      <div className="hidden lg:flex flex-col items-center relative z-40 bg-white">
        <div className="flex justify-center pb-2">
          <Link to="/">
            <img src="LogoFull1.png" alt="Logo" className="h-[50px] w-auto" />
          </Link>
        </div>
        {/* Changed: lg:px-4 lg:gap-4 to prevent wrapping on 1024px screens. Scale up on xl */}
        <div className="flex items-center justify-between w-full lg:px-4 xl:px-10">
          <div className="shrink-0">
            <SearchBar />
          </div>

          <ul className="flex lg:gap-4 xl:gap-8 p-2 left-20 relative">
            {menuItems.map((item, i) => (
              <li
                key={i}
                className="relative whitespace-nowrap"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {item.link ? (
                  <Link to={item.link}>{item.label}</Link>
                ) : (
                  <span className="cursor-pointer">{item.label}</span>
                )}
                {item.subMenu && hovered === i && (
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen pt-0"
                    style={{ marginLeft: "calc(-50vw + 50%)" }}
                  >
                    {item.subMenu}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <ul className="flex lg:gap-2 xl:gap-6 items-center text-sm whitespace-nowrap">
            <li>
              <select
                className="bg-transparent border border-gray-300 rounded-sm p-1 cursor-pointer"
                value={currency}
                onChange={changeCurrency}
                style={{ fontWeight: 600, width: 65 }}
              >
                {options.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </li>
            <li>
              <div
                id="google_translate_element"
                style={{
                  display: "inline-block",
                  marginLeft: "10px",
                  verticalAlign: "middle",
                }}
              />
            </li>
            {user ? (
              <Link to="/myaccount" style={{ margin: "0 8px" }}>
                <FiUser size={26} />
              </Link>
            ) : (
              <Link to="/login" style={{ margin: "0 8px" }}>
                <FiUser size={26} />
              </Link>
            )}
            <Link
              to="/myaccount"
              state={{ activeTab: "wishlist" }}
              style={{ margin: "0 8px" }}
            >
              <FiHeart size={26} />
            </Link>
            <button
              onClick={openCartPopup}
              style={{
                margin: "0 8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Open cart"
              title="Open cart"
              type="button"
            >
              <FiShoppingCart size={26} />
            </button>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
