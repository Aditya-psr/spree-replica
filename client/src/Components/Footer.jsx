import { useState } from "react";
import { FaTwitter, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setShowBanner(true);
        setEmail("");
        setTimeout(() => setShowBanner(false), 4000);
      }
    } catch {
      console.error("Failed to subscribe to newsletter");
    }
  }

  return (
    <>
      {showBanner && (
        <div
          className="fixed top-0 left-0 w-full z-50 bg-[#04c35c] text-black py-3 text-center font-semibold flex items-center justify-between px-6"
          style={{ letterSpacing: "0.5px" }}
        >
          <span className="w-full block">
            THANK YOU FOR SUBSCRIBING TO OUR NEWSLETTER!
          </span>
          <button
            className="ml-auto text-2xl px-4"
            aria-label="Close"
            onClick={() => setShowBanner(false)}
          >
            ×
          </button>
        </div>
      )}

      <footer className="w-full font-sans text-neutral-900">
        {/* Newsletter Section */}
        <div className="bg-[#e9e7dc] pt-10 pb-10 md:pt-16 md:pb-12 text-center px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Subscribe to our newsletter
          </h2>
          <div className="max-w-2xl mx-auto mb-7 text-base md:text-lg">
            This section lets you capture newsletter sign-ups, with all
            submissions conveniently recorded in the customer management area of
            your admin dashboard for easy access and follow-up.
          </div>
          {/* Responsive Form:
              - Mobile: flex-col (vertical stack), w-full input
              - Tablet/Desktop: flex-row (horizontal), fixed width input
          */}
          <form
            className="flex flex-col md:flex-row justify-center items-center gap-4 w-full max-w-lg md:max-w-none mx-auto"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full md:w-96 py-4 px-6 bg-[#f0efe9] text-gray-600 text-[16px] placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-black text-white text-[15px] font-semibold rounded-xl"
            >
              SUBMIT
            </button>
          </form>
        </div>

        {/* Footer Links */}
        {/* Responsive Grid/Flex Layout:
            - Mobile (<480px): Grid 1 column (gap-8)
            - Tablet (768px): Grid 3 columns
            - Laptop (1024px): Grid 4 or 5 columns
            - Desktop (1280px+): Flex row (gap-20) as per original design
        */}
        <div className="bg-[#faf9f6] py-8 px-6">
          <div className="max-w-[1920px] mx-auto grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:flex xl:justify-center xl:items-start xl:gap-20 gap-y-10 gap-x-4">
            {/* Logo/Shop Column */}
            {/* Mobile: Takes full width or fits in grid. Desktop: Standard flex item */}
            <div className="xs:col-span-2 md:col-span-1 lg:col-span-1 xl:block flex justify-start">
              <Link to="/">
                <img
                  src="/LogoFull1.png"
                  alt="Spree logo"
                  className="h-[40px] md:h-[48px] w-auto mr-2 object-contain"
                />
              </Link>
            </div>

            <div className="flex flex-col min-w-[170px] space-y-2">
              <div className="font-medium">Shop</div>
              <Link to="/shopall">SHOP ALL</Link>
              <Link to="/sale">ON SALE</Link>
              <Link to="/newarrival">NEW ARRIVALS</Link>
            </div>

            {/* Account Column */}
            <div className="flex flex-col min-w-[125px] space-y-2">
              <div className="font-medium">Account</div>
              <Link to="/login">MY ACCOUNT</Link>
              <div>FAVORITES</div>
            </div>

            {/* Company Column */}
            <div className="flex flex-col min-w-[125px] space-y-2">
              <div className="font-medium">Company</div>
              <a
                href="https://spreecommerce.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#222" }}
              >
                <div>SPREE COMMERCE</div>
              </a>
            </div>

            {/* Info Column - hidden empty column in original? Keeping structure. */}
            <div className="flex flex-col min-w-[125px] space-y-2">
              <div className="font-medium">Info</div>
            </div>

            {/* Follow Us Column */}
            <div className="flex flex-col min-w-[125px] space-y-2">
              <div className="font-medium">Follow Us</div>
              <div className="flex space-x-4 text-xl mt-2">
                <FaTwitter />
                <FaYoutube />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-neutral-900 text-white text-center py-4 px-4 text-sm md:text-base">
          © 2025 Spree Commerce DEMO. All Rights Reserved.. Powered by{" "}
          <a href="#" className="underline">
            Spree Commerce
          </a>
        </div>
      </footer>
    </>
  );
}
