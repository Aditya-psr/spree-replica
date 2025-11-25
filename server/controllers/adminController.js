import User from "../models/User.js";
import Product from "../models/productModel.js";

// Get all users for the admin panel
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Get all products for the admin panel
export async function getAllProducts(req, res) {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Add a new product
export async function addNewProduct(req, res) {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Update product by id
export async function updateProduct(req, res) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Delete product by id
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
