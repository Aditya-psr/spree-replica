import React, { useEffect, useState } from "react";
import ProductCard from "../Components/ProductCard";

const ShopAll = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-lg font-medium">
        Loading products...
      </div>
    );
  if (products.length === 0)
    return (
      <div className="text-center py-20 text-lg font-medium">
        No products found.
      </div>
    );

  return (
    <div className="w-full py-12 px-4 md:px-[4vw]">
      <h2 className="font-semibold text-[2rem] mb-7 text-center sm:text-left uppercase">
        ALL PRODUCTS
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-9 justify-items-center w-full">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ShopAll;
