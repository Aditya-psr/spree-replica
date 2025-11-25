import { useEffect, useState } from "react";
import ProductCard from "../Components/ProductCard";
import FilterSidebar from "../Components/FilterSidebar";
import { Filter } from "lucide-react";

const saleMeta = {
  title: "COLLECTION",
  subtitle: "ON SALE",
  desc: (
    <>
      <span className="font-bold">
        This is an automatic taxon that dynamically includes products that have
        been marked down.
      </span>
      <span>
        {" "}
        You can also create your own automatic taxons based on other conditions
        like product tags, availability dates, and vendors.
      </span>
    </>
  ),
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
    case "relevance":
    default:
      return products;
  }
}





export default function SalePage() {
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
  const [sortMethod, setSortMethod] = useState("relevance");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/products/sale")
      .then((res) => res.json())
      .then((data) => {
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList);
        setFilteredProducts(productList);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = filterProducts(products, filters);
    result = sortProducts(result, sortMethod);
    setFilteredProducts(result);
  }, [products, filters, sortMethod]);

  return (
    <div className="bg-[#faf9f6] min-h-screen w-full">
      <div className="w-full py-8 px-4 md:px-[6vw] bg-white border-b border-[#ededed]">
        <div className="max-w-3xl">
          <div className="tracking-[2px] text-[1.05rem] text-[#181818]">
            {saleMeta.title}
          </div>
          <div className="font-semibold text-4xl mt-1 text-[#181818]">
            {saleMeta.subtitle}
          </div>
          <div className="text-lg mt-3.5 text-[#181818] leading-relaxed">
            {saleMeta.desc}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 md:px-[6vw] bg-[#faf9f6] py-4 border-b border-[#ededed] sticky top-0 z-20">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 font-semibold text-lg hover:underline text-[#181818]"
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
            <option value="relevance">Relevance</option>
            <option value="price-desc">Price (high-low)</option>
            <option value="price-asc">Price (low-high)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <FilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        state={filters}
        setState={setFilters}
        onApply={() => setSidebarOpen(false)}
      />

      <div className="w-full px-4 md:px-[6vw] py-10">
        {loading ? (
          <div className="text-center text-lg py-10">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-lg py-10">No products found.</div>
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
