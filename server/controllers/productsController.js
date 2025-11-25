// controllers/productsController.js
import Product from "../models/productModel.js";

// Normalise variants from frontend: ensure numeric quantity & price
function normalizeVariants(variants) {
  if (!Array.isArray(variants)) return [];
  return variants.map((v) => ({
    ...v,
    sizes: Array.isArray(v.sizes)
      ? v.sizes.map((s) => ({
          ...s,
          quantity: Number(s.quantity ?? 0),
          price:
            s.price !== undefined && s.price !== null ? Number(s.price) : 0,
        }))
      : [],
  }));
}

// Get All Products with optional filters
export async function getAllProducts(req, res) {
  try {
    const { category, subcategory, type } = req.query;
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (type) query.type = type;

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// New Arrivals
export async function getNewArrivals(req, res) {
  try {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - THIRTY_DAYS);

    const products = await Product.find({
      createdAt: { $gte: cutoffDate },
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Sale Products
export async function getSaleProducts(req, res) {
  try {
    const products = await Product.find({ isSale: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Single Product
export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Create Product
export async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      type,
      isSale,
      variants,
    } = req.body;

    const newProduct = new Product({
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      category,
      subcategory,
      type,
      isSale: !!isSale,
      variants: normalizeVariants(variants),
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update Product
export async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name,
      description,
      price,
      category,
      subcategory,
      type,
      isSale,
      variants,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (type !== undefined) product.type = type;
    if (isSale !== undefined) product.isSale = !!isSale;
    if (variants !== undefined) product.variants = normalizeVariants(variants);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete Product
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function searchProducts(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ categories: [], products: [] });
    }

    const regex = new RegExp(query, "i");
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { subcategory: regex },
        { type: regex },
      ],
    }).limit(20);

    const categoriesSet = new Set();
    products.forEach((p) => {
      if (p.category) categoriesSet.add(p.category);
      if (p.subcategory) categoriesSet.add(p.subcategory);
      if (p.type) categoriesSet.add(p.type);
    });

    res.json({
      categories: Array.from(categoriesSet),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
