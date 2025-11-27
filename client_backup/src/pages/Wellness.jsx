import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import FilterSidebar from "../Components/FilterSidebar";

const wellnessMeta = {
  title: "CATEGORY",
  subtitle: "WELLNESS",
};

function filterProducts(products, filters) {
  let filtered = products;

  if (filters.availability.length) {
    filtered = filtered.filter((prod) =>
      prod.variants?.some((variant) =>
        variant.sizes?.some(
          (sz) =>
            (filters.availability.includes("in") && sz.inStock) ||
            (filters.availability.includes("out") && !sz.inStock)
        )
      )
    );
  }

  // Price
  filtered = filtered.filter(
    (prod) => prod.price >= filters.price[0] && prod.price <= filters.price[1]
  );

  // Categories (wellness subcategories: fitness, relaxation, nutrition, mental-stimulation)
  if (filters.categories.length) {
    filtered = filtered.filter((prod) =>
      filters.categories.includes(prod.subcategory)
    );
  }

  // Colors (checks all variant colors)
  if (filters.colors.length) {
    filtered = filtered.filter((prod) =>
      prod.variants?.some((variant) => filters.colors.includes(variant.color))
    );
  }

  // Sizes (matches any variant/size)
  if (filters.sizes.length) {
    filtered = filtered.filter((prod) =>
      prod.variants?.some((variant) =>
        variant.sizes?.some((sz) => filters.sizes.includes(sz.size))
      )
    );
  }

  return filtered;
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

export default function WellnessPage() {
  const { subcategory, type } = useParams();
  // Always use 'wellness' as category for this page
  const mainCategory = "wellness";

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

  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:5000/api/products?category=${mainCategory}`;
    if (subcategory) url += `&subcategory=${subcategory}`;
    if (type) url += `&type=${type}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [mainCategory, subcategory, type]);

  useEffect(() => {
    let filtered = filterProducts(products, filters);
    filtered = sortProducts(filtered, sortMethod);
    setFilteredProducts(filtered);
  }, [products, filters, sortMethod]);

  return (
    <div className="w-full">
      <FilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        state={filters}
        setState={setFilters}
        onApply={() => setSidebarOpen(false)}
      />

      {/* Category Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start px-4 md:px-[4vw] py-8 lg:py-[60px] pb-8 lg:pb-[32px] gap-8">
        <div className="w-full lg:max-w-[600px]">
          <h4 className="tracking-[2px] text-sm font-semibold text-gray-600">
            {wellnessMeta.title}
          </h4>
          <h1 className="font-bold text-3xl lg:text-[40px] mt-1 lg:mt-4">
            {wellnessMeta.subtitle}
          </h1>
          <p className="mt-2.5 font-semibold text-base lg:text-lg max-w-full lg:max-w-[520px] leading-relaxed">
            {wellnessMeta.desc}
          </p>
        </div>
      </div>

      {/* Filter/Sort Bar */}
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
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
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
