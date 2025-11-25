import Category from "../models/categoryModel.js";

export async function getAllCategories(req, res) {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
