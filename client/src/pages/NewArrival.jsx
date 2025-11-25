import React, { useEffect, useState } from "react";
import ProductCard from "../Components/ProductCard";

const NewArrival = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/products/new")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })

      







      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-lg font-medium">
        Loading new arrivals...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-lg font-medium text-red-500">
        {error}
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
      <div className="font-semibold text-[2rem] mb-7 leading-tight">
        COLLECTION <br /> NEW ARRIVALS
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-9 justify-items-center w-full">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default NewArrival;
