import { Schema, model } from "mongoose";

const sizeSchema = new Schema({
  size: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  // per-size price for this color+size
  price: { type: Number, min: 0, default: 0 },
});

const colorVariantSchema = new Schema({
  color: { type: String, required: true },
  images: { type: [String], default: [] },
  sizes: { type: [sizeSchema], default: [] },
});

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    // base price (fallback if size.price is 0)
    price: { type: Number },
    category: { type: String, required: true },
    subcategory: { type: String },
    type: { type: String },
    isSale: { type: Boolean, default: false },
    variants: { type: [colorVariantSchema], default: [] },
  },
  { timestamps: true }
);

export default model("Product", productSchema);
