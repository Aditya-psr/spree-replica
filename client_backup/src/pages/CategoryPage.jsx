import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import FilterSidebar from "../Components/FilterSidebar";
import { Filter } from "lucide-react";

const fashionMeta = {
  title: "CATEGORY",
  subtitle: "FASHION", // Fallback
  desc: "This is a sample taxon description used to demonstrate how category-level content can be displayed on your storefront. Use taxon descriptions in Spree Commerce to enhance SEO, and to better inform your customers about product offerings.",
};

// --- Helper Functions ---

function filterProducts(products, filters) {
  return products.filter((product) => {
    // Availability
    if (filters.availability.length > 0) {
      const inStock = product.variants?.some((v) =>
        v.sizes.some((sz) => sz.inStock)
      );
      const wantInStock = filters.availability.includes("in");
      const wantOutOfStock = filters.availability.includes("out");
      if (!(wantInStock && inStock) && !(wantOutOfStock && !inStock)) {
        return false;
      }
    }
    // Price
    if (product.price < filters.price[0] || product.price > filters.price[1]) {
      return false;
    }
    // Categories
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.subcategory)
    ) {
      return false;
    }
    // Colors
    if (filters.colors.length > 0) {
      const hasColor = product.variants?.some((v) =>
        filters.colors.includes(v.color)
      );
      if (!hasColor) return false;
    }
    // Sizes
    if (filters.sizes.length > 0) {
      const hasSize = product.variants?.some((v) =>
        v.sizes.some((sz) => filters.sizes.includes(sz.size))
      );
      if (!hasSize) return false;
    }
    return true;
  });
}

function sortProducts(products, sortMethod) {
  switch (sortMethod) {
    case "price-asc":
      return [...products].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...products].sort((a, b) => b.price - a.price);
    case "newest":
      return [...products].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    default:
      return products;
  }
}

export default function CategoryPage() {
  const { category, subcategory, type } = useParams();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    availability: [],
    price: [0, 210],
    categories: [],
    colors: [],
    sizes: [],
  });
  const [sortMethod, setSortMethod] = useState("price-desc");

  // Fetch Data
  useEffect(() => {
    if (!category) return;
    setLoading(true);

    let url = `http://localhost:5000/api/products?category=${category}`;
    if (subcategory) {
      url += `&subcategory=${subcategory}`;
    }
    if (type) {
      url += `&type=${type}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [category, subcategory, type]);

  // Apply Filters & Sort
  useEffect(() => {
    let filtered = filterProducts(products, filters);
    filtered = sortProducts(filtered, sortMethod);
    setFilteredProducts(filtered);
  }, [products, filters, sortMethod]);

  // Determine Title based on URL param or fallback to meta
  const displayTitle = category ? category.toUpperCase() : fashionMeta.subtitle;

  return (
    <div className="w-full min-h-screen bg-white">
      <FilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        state={filters}
        setState={setFilters}
        onApply={() => setSidebarOpen(false)}
      />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start px-4 md:px-[4vw] py-8 lg:py-[60px] pb-8 lg:pb-[32px] gap-8">
        <div className="w-full lg:max-w-[600px]">
          <h4 className="tracking-[2px] text-sm font-semibold text-gray-600">
            {fashionMeta.title}
          </h4>
          <h1 className="font-bold text-3xl lg:text-[40px] mt-1 lg:mt-4 text-[#181818]">
            {displayTitle}
          </h1>
          <p className="mt-2.5 font-semibold text-base lg:text-lg max-w-full lg:max-w-[520px] leading-relaxed text-[#181818]">
            {fashionMeta.desc}
          </p>
          <a
            href="#readmore"
            className="font-bold underline cursor-pointer mt-2 inline-block text-[#181818]"
          >
            Read more
          </a>
        </div>
        <div className="w-full lg:w-auto flex justify-center lg:block">
          <img
            src="/Image_3.png"
            alt="Category Banner"
            className="w-full max-w-[320px] rounded-[15px] object-cover h-[200px] lg:h-auto"
          />
        </div>
      </div>

      {/* Filter/Sort Bar */}
      <div className="flex items-center justify-between px-4 md:px-[4vw] py-5 border-t border-b border-[#eee] bg-white sticky top-0 z-20">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 font-semibold text-lg hover:underline text-[#181818] bg-transparent border-none cursor-pointer"
        >
          <Filter className="text-xl mb-[2px]" />
          FILTER
        </button>

        <div className="flex items-center gap-2 text-base sm:text-[1.1rem] text-[#181818]">
          <span className="hidden sm:inline">Sort by:</span>
          <select
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
            className="font-semibold underline bg-transparent cursor-pointer ml-1 outline-none text-[#181818]"
          >
            <option value="price-desc">Price (high-low)</option>
            <option value="price-asc">Price (low-high)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-full px-4 md:px-[4vw] py-10 min-h-[600px]">
        {loading ? (
          <p className="text-center text-lg py-10">Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-lg py-10">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10 justify-items-center">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
