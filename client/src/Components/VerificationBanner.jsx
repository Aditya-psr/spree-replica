import { useState, useEffect } from "react";

function VerificationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      setShow(true);
      setTimeout(() => {
        setShow(false);
        window.history.replaceState({}, "", window.location.pathname);
      }, 5000);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#04c35c] text-black font-semibold py-2 sm:py-3 text-center flex justify-between items-center px-4 sm:px-6 tracking-[0.5px]">
      <span className="mx-auto w-full text-sm sm:text-base">
        YOUR EMAIL HAS BEEN VERIFIED!
      </span>
      <button
        className="ml-auto text-2xl px-2 sm:px-4 focus:outline-none cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setShow(false)}
        aria-label="Close banner"
      >
        ×
      </button>
    </div>
  );
}

export default VerificationBanner;
