import { useEffect, useState } from "react";
import ProductCard from "../Components/ProductCard";
import FashionFilterSidebar from "../Components/FilterSidebar";

const fashionMeta = {
  title: "CATEGORY",
  subtitle: "FASHION",
  desc: "This is a sample taxon description used to demonstrate how category-level content can be displayed on your storefront. Use taxon descriptions in Spree Commerce to enhance SEO, and to better inform your customers about product offerings.",
};

function filterProducts(products, filters) {
  return products.filter((product) => {
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
    if (product.price < filters.price[0] || product.price > filters.price[1]) {
      return false;
    }
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.subcategory)
    ) {
      return false;
    }
    if (filters.colors.length > 0) {
      const hasColor = product.variants?.some((v) =>
        filters.colors.includes(v.color)
      );
      if (!hasColor) return false;
    }
    if (filters.sizes.length > 0) {
      const hasSize = product.variants?.some((v) =>
        v.sizes.some((sz) => filters.sizes.includes(sz.size))
      );
      if (!hasSize) return false;
    }
    return true;
  });
}

function sortProducts(products, method) {
  switch (method) {
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

export default function FashionPage() {
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
  const [sort, setSort] = useState("price-desc");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/products?category=fashion")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = filterProducts(products, filters);
    filtered = sortProducts(filtered, sort);
    setFilteredProducts(filtered);
  }, [products, filters, sort]);

  return (
    <div className="w-full">
      <FashionFilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        state={filters}
        setState={setFilters}
        onApply={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col lg:flex-row justify-between items-start px-4 md:px-[4vw] py-8 lg:py-[60px] pb-8 lg:pb-[32px] gap-8">
        <div className="w-full lg:max-w-[600px]">
          <h4 className="tracking-[2px] text-sm font-semibold text-gray-600">
            {fashionMeta.title}
          </h4>
          <h1 className="font-bold text-3xl lg:text-[40px] mt-1 lg:mt-1">
            {fashionMeta.subtitle}
          </h1>
          <p className="mt-2.5 font-semibold text-base lg:text-lg max-w-full lg:max-w-[520px] leading-relaxed">
            {fashionMeta.desc}
          </p>
          <a
            href="#readmore"
            className="font-bold underline cursor-pointer mt-2 inline-block"
          >
            Read more
          </a>
        </div>
        <div className="w-full lg:w-auto flex justify-center lg:block">
          <img
            src="/Image_3.png"
            alt="Fashion"
            className="w-full max-w-[320px] rounded-[15px] object-cover h-[200px] lg:h-auto"
          />
        </div>
      </div>

      <div className="flex justify-between items-center px-4 md:px-[4vw] py-5 border-t border-b border-[#eee]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-lg font-semibold cursor-pointer border-none bg-none flex items-center hover:text-gray-600 transition-colors"
        >
          <span className="text-xl mr-1.5">≡</span> FILTER
        </button>
        <div className="text-sm sm:text-base">
          <span className="hidden sm:inline">Sort by: </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="font-semibold underline cursor-pointer bg-transparent border-none outline-none text-base"
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
          <p className="text-center text-lg">Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-lg">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
