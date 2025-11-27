import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import VerificationBanner from "../Components/VerificationBanner";

// New Arrivals Section
const NewArrivalsSection = () => {
  const [cardsToShow, setCardsToShow] = useState(4);
  const [products, setProducts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/products/new")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));

    // Responsive Card Count Logic
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1); // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2); // Tablet: 2 cards
      } else {
        setCardsToShow(4); // Desktop: 4 cards
      }
    };

    handleResize(); // Set initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canSlideLeft = slideIndex > 0;
  const canSlideRight = slideIndex + cardsToShow < products.length;
  const visibleProducts = products.slice(slideIndex, slideIndex + cardsToShow);

  return (
    <div className="w-full mt-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mx-4 lg:mx-[4vw] mb-6 gap-4">
        <h2 className="font-bold text-2xl sm:text-[25px]">NEW ARRIVALS</h2>
        <button
          onClick={() => navigate("/newarrival")}
          className="bg-black text-white py-3 px-8 rounded-[22px] font-bold text-[1.04rem] border-none cursor-pointer hover:bg-gray-800 transition-colors"
        >
          EXPLORE COLLECTION
        </button>
      </div>

      {/* Slider Container */}
      <div className="relative max-w-[1200px] mx-auto py-[18px]">
        {/* Flex Container for Buttons + Cards */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-0 px-2 sm:px-4 lg:px-0">
          {/* Left Button (Visible on all screens, smaller on mobile) */}
          <button
            onClick={() => setSlideIndex((i) => Math.max(i - 1, 0))}
            disabled={!canSlideLeft}
            className={`z-10 bg-white border-none rounded-full shadow-[0_0_8px_#ddd] flex items-center justify-center cursor-pointer hover:bg-gray-50 shrink-0
              w-10 h-10 text-[1.5rem] lg:w-11 lg:h-11 lg:text-[2.3rem] lg:absolute lg:-left-11 lg:top-1/2 lg:-translate-y-1/2
              ${!canSlideLeft ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <FiChevronLeft />
          </button>

          {/* Products Grid */}
          <div className="flex-1 flex justify-center gap-10">
            {visibleProducts.length === 0 ? (
              <div>No new arrivals found.</div>
            ) : (
              visibleProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex justify-center w-full sm:w-auto"
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>

          {/* Right Button (Visible on all screens, smaller on mobile) */}
          <button
            onClick={() =>
              setSlideIndex((i) =>
                Math.min(i + 1, products.length - cardsToShow)
              )
            }
            disabled={!canSlideRight}
            className={`z-10 bg-white border-none rounded-full shadow-[0_0_8px_#ddd] flex items-center justify-center cursor-pointer hover:bg-gray-50 shrink-0
              w-10 h-10 text-[1.5rem] lg:w-11 lg:h-11 lg:text-[2.3rem] lg:absolute lg:-right-11 lg:top-1/2 lg:-translate-y-1/2
              ${!canSlideRight ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

// Banner Section
const BannerBelowNewArrivals = () => {
  const navigate = useNavigate();

  return (
    <div
      className="h-[400px] w-full bg-cover bg-center relative text-white mt-14 flex items-center justify-center"
      style={{ backgroundImage: "url('fashion-category.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <div className="relative z-[2] text-center max-w-[600px] px-5">
        <h1 className="font-bold text-3xl sm:text-4xl mb-2">
          Welcome to your website
        </h1>
        <p className="mb-6 text-base sm:text-lg">
          This is the place to tell people about your business and what you do.
        </p>
        <button
          onClick={() => navigate("/shopall")}
          className="bg-white text-black rounded-[22px] py-3 px-8 font-bold cursor-pointer border-none hover:bg-gray-200 transition-colors"
        >
          SHOP ALL
        </button>
      </div>
    </div>
  );
};

const FashionSection = () => {
  const [cardsToShow, setCardsToShow] = useState(3);
  const [products, setProducts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/products?category=fashion")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));

    // Responsive Card Count Logic
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1); // Mobile: 1 card
      } else if (window.innerWidth < 1280) {
        setCardsToShow(2); // Tablet/Small Laptop: 2 cards
      } else {
        setCardsToShow(3); // Desktop: 3 cards
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canSlideLeft = slideIndex > 0;
  const canSlideRight = slideIndex + cardsToShow < products.length;
  const visibleProducts = products.slice(slideIndex, slideIndex + cardsToShow);

  return (
    <div className="bg-white py-10 pb-[60px] max-w-[1650px] mx-auto w-full">
      {/* Header row */}
      <div className="flex flex-col md:flex-row justify-between items-start px-6 md:px-[38px]">
        <div className="max-w-[500px]">
          <h2 className="text-[34px] font-bold m-0">FASHION</h2>
          <p className="font-bold text-lg my-2.5">
            This is a sample taxon description used to demonstrate how
            category-level content can be displayed on your storefront.
          </p>
          <div className="text-base text-[#222] max-w-[560px]">
            Use taxon descriptions in Spree Commerce to enhance SEO, guide
            customers through your catalog, or highlight promotions and featured
            collections.
          </div>
        </div>
        <button
          onClick={() => navigate("/fashion")}
          className="bg-black text-white py-3.5 px-[38px] rounded-3xl font-bold text-[17px] border-none cursor-pointer whitespace-nowrap mt-4 md:mt-3 hover:bg-gray-800"
        >
          EXPLORE CATEGORY
        </button>
      </div>

      {/* Content Row */}
      <div className="flex flex-col lg:flex-row gap-7 items-start px-6 md:px-[38px] pt-8">
        {/* Left big image */}
        <div className="w-full lg:w-[540px] min-w-0 lg:min-w-[340px] h-[300px] sm:h-[400px] lg:h-[500px] bg-[#ededed] flex items-center justify-center overflow-hidden">
          <img
            src="/Image_3.png"
            alt="Fashion Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right product cards section */}
        <div className="flex-1 w-full min-w-0 relative">
          {/* Flex container for buttons + cards */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-[34px]">
            {/* Left Button (always visible logic) */}
            <button
              disabled={!canSlideLeft}
              onClick={() => setSlideIndex((i) => Math.max(i - 1, 0))}
              className={`bg-white rounded-full border-none shadow-[0_0_8px_#ddd] flex items-center justify-center shrink-0
                w-10 h-10 text-[1.5rem] lg:hidden
                ${
                  canSlideLeft
                    ? "text-black cursor-pointer hover:bg-gray-50"
                    : "text-[#ccc] cursor-default opacity-50"
                }`}
            >
              <FiChevronLeft />
            </button>

            {/* Cards Container */}
            <div className="flex flex-1 gap-8 justify-center">
              {visibleProducts.length === 0 ? (
                <div>No products found.</div>
              ) : (
                visibleProducts.map((product) => (
                  <div
                    key={product._id}
                    className="min-w-0 w-full sm:w-auto flex justify-center"
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>

            {/* Right Button (always visible logic on mobile) */}
            <button
              disabled={!canSlideRight}
              onClick={() =>
                setSlideIndex((i) =>
                  Math.min(i + 1, products.length - cardsToShow)
                )
              }
              className={`bg-white rounded-full border-none shadow-[0_0_8px_#ddd] flex items-center justify-center shrink-0
                w-10 h-10 text-[1.5rem] lg:hidden
                ${
                  canSlideRight
                    ? "text-black cursor-pointer hover:bg-gray-50"
                    : "text-[#ccc] cursor-default opacity-50"
                }`}
            >
              <FiChevronRight />
            </button>
          </div>

          {/* Desktop specific controls */}
          <div className="hidden lg:flex justify-end items-center gap-3">
            <button
              disabled={!canSlideLeft}
              onClick={() => setSlideIndex((i) => Math.max(i - 1, 0))}
              className={`bg-white rounded-full border-none shadow-[0_0_8px_#ddd] w-11 h-11 text-[22px] flex items-center justify-center shrink-0 ${
                canSlideLeft
                  ? "text-black cursor-pointer hover:bg-gray-50"
                  : "text-[#ccc] cursor-default"
              }`}
            >
              <FiChevronLeft />
            </button>
            <button
              disabled={!canSlideRight}
              onClick={() =>
                setSlideIndex((i) =>
                  Math.min(i + 1, products.length - cardsToShow)
                )
              }
              className={`bg-white rounded-full border-none shadow-[0_0_8px_#ddd] w-11 h-11 text-[22px] flex items-center justify-center shrink-0 ${
                canSlideRight
                  ? "text-black cursor-pointer hover:bg-gray-50"
                  : "text-[#ccc] cursor-default"
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SaleSection = () => {
  const [cardsToShow, setCardsToShow] = useState(4);
  const [products, setProducts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/products/sale")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));

    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1280) {
        setCardsToShow(2);
      } else {
        setCardsToShow(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canSlideLeft = slideIndex > 0;
  const canSlideRight = slideIndex + cardsToShow < products.length;
  const visibleProducts = products.slice(slideIndex, slideIndex + cardsToShow);

  return (
    <div className="w-full bg-white mt-[54px] pb-7">
      {/* Top Row: text on left, button on right */}
      <div className="flex flex-col lg:flex-row items-start justify-between px-6 lg:px-[5vw] pb-3">
        {/* Left Text Block */}
        <div className="w-full lg:min-w-[410px] lg:max-w-[600px]">
          <div className="font-bold text-[2.25rem] mb-5 text-[#181818] tracking-normal">
            SALE
          </div>
          <div>
            <span className="font-bold text-[1.16rem] text-[#181818] leading-[1.45]">
              This is an automatic taxon that dynamically includes products that
              have been marked down.
            </span>
            <span className="font-normal text-[1.12rem] text-[#181818] inline ml-0.5 leading-[1.5]">
              You can also create your own automatic taxons based on other
              conditions like product tags, availability dates, and vendors.
            </span>
          </div>
        </div>
        {/* Right Button */}
        <button
          onClick={() => navigate("/sale")}
          className="bg-black text-white py-[15px] px-[44px] rounded-[26px] font-bold text-[1.09rem] border-none cursor-pointer mt-[18px] lg:mr-[8vw] whitespace-nowrap hover:bg-gray-800 self-start lg:self-auto"
        >
          EXPLORE SALE
        </button>
      </div>

      {/* Cards Row with perfectly centered chevrons */}
      <div className="flex items-center justify-center mt-2.5 relative px-4">
        {/* Center chevron to card row */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-[52px] w-full justify-center">
          {/* Chevron Left */}
          <button
            className={`bg-white border-none rounded-full shadow-[0_0_7px_#ddd] flex items-center justify-center shrink-0
              w-10 h-10 text-[1.5rem] lg:w-12 lg:h-12 lg:text-[2.25rem]
              ${
                canSlideLeft
                  ? "cursor-pointer opacity-100 hover:bg-gray-50"
                  : "cursor-not-allowed opacity-50 lg:opacity-60"
              }`}
            onClick={() => setSlideIndex((i) => Math.max(i - 1, 0))}
            disabled={!canSlideLeft}
          >
            <FiChevronLeft />
          </button>

          {/* Cards horizontally centered */}
          <div className="flex-1 flex justify-center gap-14 items-center min-h-[350px]">
            {visibleProducts.length === 0 ? (
              <div>No sale products found.</div>
            ) : (
              visibleProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex justify-center w-full sm:w-auto"
                >
                  <ProductCard product={product} showSaleBadge={true} />
                </div>
              ))
            )}
          </div>

          {/* Chevron Right */}
          <button
            className={`bg-white border-none rounded-full shadow-[0_0_7px_#ddd] flex items-center justify-center shrink-0
              w-10 h-10 text-[1.5rem] lg:w-12 lg:h-12 lg:text-[2.25rem]
              ${
                canSlideRight
                  ? "cursor-pointer opacity-100 hover:bg-gray-50"
                  : "cursor-not-allowed opacity-50 lg:opacity-60"
              }`}
            onClick={() =>
              setSlideIndex((i) =>
                Math.min(i + 1, products.length - cardsToShow)
              )
            }
            disabled={!canSlideRight}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

const AboutSection = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-10 py-5 lg:py-10 px-6 lg:px-[4vw] items-center bg-[#f0efe9] text-[#181818] font-inherit">
      {/* Left Image */}
      <div className="flex-1 min-w-[300px] w-full">
        <img
          src="/About_Us.png"
          alt="About Spree Commerce"
          className="w-full max-w-[1024px] h-auto object-cover"
        />
      </div>
      {/* Right Text Content */}
      <div className="flex-1 max-w-full lg:max-w-[650px] p-4 lg:p-[60px]">
        <h2 className="font-bold text-[28px] mb-6">About Section</h2>
        <p className="text-base leading-[1.6em]">
          <strong>
            This is a flexible content section designed to showcase text,
            imagery, and call-to-action buttons on your homepage.
          </strong>{" "}
          There are a variety of pre-built sections to choose from, and all are
          easily editable via Spree's built-in theme editor. These blocks let
          you build dynamic, visually engaging pages - no coding required.
        </p>
        <button
          className="mt-7 py-3 px-7 bg-black text-white rounded-[30px] border-none cursor-pointer font-semibold text-base tracking-[0.3px] hover:bg-gray-800"
          onClick={() => window.open("https://spreecommerce.org", "_blank")}
        >
          LEARN MORE
        </button>
      </div>
    </div>
  );
};

const ThanksSection = () => {
  return (
    <div className="py-10 w-full bg-[#faf9f6] flex justify-center box-border px-4">
      <div className="max-w-[1000px] px-3 text-center">
        <h2 className="text-3xl sm:text-[2.8rem] font-normal mb-4 text-[#181818]">
          Thanks for visiting this Spree Commerce demo
        </h2>
        <p className="text-lg sm:text-[1.15rem] text-[#222] max-w-[1000px] mx-auto">
          Spree is an open-source eCommerce platform that you can customize,
          self-host and fully control. The Enterprise Edition features
          multi-vendor marketplace, multi-tenant and B2B eCommerce capabilities.
          Learn more at{" "}
          <a
            href="https://spreecommerce.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#222]"
          >
            spreecommerce.org
          </a>
          .
        </p>
      </div>
    </div>
  );
};

const Home = () => {
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [bannerColor, setBannerColor] = useState("#00d084");

  useEffect(() => {
    if (location.state?.showBanner) {
      setShowBanner(true);
      setBannerText(
        location.state.bannerText || "YOU UPDATED YOUR ACCOUNT SUCCESSFULLY."
      );
      setBannerColor(location.state.bannerColor || "#00d084");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  return (
    <>
      {showBanner && (
        <div
          className="fixed top-0 left-0 w-screen text-[#111] text-center py-[5px] font-normal text-base z-50"
          style={{ background: bannerColor }}
        >
          {bannerText}
          <button
            className="float-right mr-8 -mt-1 bg-none border-none text-black text-[30px] leading-none cursor-pointer"
            onClick={() => setShowBanner(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
      {/* Main hero/top section and homepage content */}
      <VerificationBanner />

      {/* Hero Section */}
      <div className="flex flex-col-reverse lg:flex-row min-h-[calc(100vh-120px)]">
        <div className="flex-1 flex flex-col justify-center px-6 lg:pl-[4vw] py-10 lg:py-0">
          <h1 className="text-[2rem] md:text-[2.3rem] mb-5 leading-tight">
            Welcome to this Spree Commerce demo website
          </h1>
          <p className="text-[1.13rem] mb-[26px] text-[#222]">
            Spree is an open-source eCommerce platform that you can customize,
            self-host and fully control. Its Enterprise Edition features
            multi-vendor marketplace, multi-tenant and B2B eCommerce
            capabilities. Learn more at spreecommerce.org
          </p>
          <button className="py-3 px-8 bg-black text-white border-none rounded-[22px] text-base cursor-pointer w-fit hover:bg-gray-800">
            SHOP ALL
          </button>
        </div>
        <div className="flex-[1.5] flex items-center justify-center bg-gray-50 lg:bg-transparent">
          <img
            src="/Home_Image.png"
            alt="Demo banner"
            className="max-h-[50vh] lg:max-h-[85vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>

      <NewArrivalsSection />
      <BannerBelowNewArrivals />
      <FashionSection />
      <SaleSection />
      <AboutSection />
      <ThanksSection />
    </>
  );
};

export default Home;
