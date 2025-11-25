import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";
import Category from "./models/categoryModel.js";

dotenv.config();

// Product Data (with shorthand/alphanumeric sizes only)
const products = [
// Fashion - Women
{
name: "Women's Tops",
category: "fashion",
subcategory: "women",
type: "tops",
price: 30.99,
variants: [
{
color: "#E01B1B",
sizes: [
{ size: "S", inStock: true, quantity: 5 },
{ size: "M", inStock: true, quantity: 10 },
{ size: "L", inStock: false, quantity: 0 },
],
images: ["[https://via.placeholder.com/300x400?text=Womens+Tops](https://via.placeholder.com/300x400?text=Womens+Tops)"],
},
{
color: "#239999",
sizes: [
{ size: "S", inStock: true, quantity: 6 },
{ size: "M", inStock: true, quantity: 7 },
{ size: "L", inStock: true, quantity: 8 },
],
images: ["[https://via.placeholder.com/300x400?text=Womens+Tops+Alt](https://via.placeholder.com/300x400?text=Womens+Tops+Alt)"],
},
],
},
{
name: "Women's Knitwear",
category: "fashion",
subcategory: "women",
type: "knitwear",
price: 42.99,
isSale: true,
variants: [
{
color: "#8B4513",
sizes: [
{ size: "S", inStock: true, quantity: 3 },
{ size: "M", inStock: true, quantity: 6 },
{ size: "L", inStock: true, quantity: 6 },
],
images: ["[https://via.placeholder.com/300x400?text=Knitwear](https://via.placeholder.com/300x400?text=Knitwear)"],
},
],
},

// Fashion - Men
{
name: "Men's T-Shirts",
category: "fashion",
subcategory: "men",
type: "tshirts",
price: 25.99,
variants: [
{
color: "#0000FF",
sizes: [
{ size: "M", inStock: true, quantity: 15 },
{ size: "L", inStock: true, quantity: 15 },
{ size: "XL", inStock: true, quantity: 10 },
],
images: ["[https://via.placeholder.com/300x400?text=Mens+TShirts](https://via.placeholder.com/300x400?text=Mens+TShirts)"],
},
],
},
{
name: "Men's Shirts",
category: "fashion",
subcategory: "men",
type: "shirts",
price: 38.99,
isSale: true,
variants: [
{
color: "#666666",
sizes: [
{ size: "S", inStock: true, quantity: 4 },
{ size: "M", inStock: true, quantity: 8 },
{ size: "L", inStock: true, quantity: 5 },
],
images: ["[https://via.placeholder.com/300x400?text=Mens+Shirts](https://via.placeholder.com/300x400?text=Mens+Shirts)"],
},
],
},

// Fashion - Accessories
{
name: "Sunglasses",
category: "fashion",
subcategory: "accessories",
type: "sunglasses",
price: 19.99,
variants: [
{
color: "#FFD700",
sizes: [
{ size: "S", inStock: true, quantity: 10 },
{ size: "M", inStock: true, quantity: 10 },
{ size: "L", inStock: true, quantity: 5 },
],
images: ["[https://via.placeholder.com/300x400?text=Sunglasses](https://via.placeholder.com/300x400?text=Sunglasses)"],
},
],
},
{
name: "Bags",
category: "fashion",
subcategory: "accessories",
type: "bags",
price: 45.5,
isSale: true,
variants: [
{
color: "#2E4A62",
sizes: [
{ size: "S", inStock: true, quantity: 4 },
{ size: "M", inStock: true, quantity: 4 },
{ size: "L", inStock: true, quantity: 2 },
],
images: ["[https://via.placeholder.com/300x400?text=Bags](https://via.placeholder.com/300x400?text=Bags)"],
},
],
},

// Wellness - Fitness
{
name: "Sportswear",
category: "wellness",
subcategory: "fitness",
type: "sportswear",
price: 55.0,
variants: [
{
color: "#FF4500",
sizes: [
{ size: "S", inStock: true, quantity: 4 },
{ size: "M", inStock: true, quantity: 6 },
{ size: "L", inStock: true, quantity: 5 },
],
images: ["[https://via.placeholder.com/300x400?text=Sportswear](https://via.placeholder.com/300x400?text=Sportswear)"],
},
],
},
{
name: "Yoga Pants",
category: "wellness",
subcategory: "fitness",
type: "yoga",
price: 39.0,
variants: [
{
color: "#228B22",
sizes: [
{ size: "S", inStock: true, quantity: 3 },
{ size: "M", inStock: true, quantity: 3 },
{ size: "L", inStock: true, quantity: 2 },
],
images: ["[https://via.placeholder.com/300x400?text=Yoga](https://via.placeholder.com/300x400?text=Yoga)"],
},
],
},

// Wellness - Relaxation
{
name: "Aroma Diffusers",
category: "wellness",
subcategory: "relaxation",
type: "aroma-diffusers",
price: 29.9,
isSale: true,
variants: [
{
color: "#FFD700",
sizes: [
{ size: "XS", inStock: true, quantity: 2 },
{ size: "S", inStock: true, quantity: 2 },
{ size: "M", inStock: true, quantity: 1 },
],
images: ["[https://via.placeholder.com/300x400?text=Aroma+Diffusers](https://via.placeholder.com/300x400?text=Aroma+Diffusers)"],
},
],
},
{
name: "Scented Candles",
category: "wellness",
subcategory: "relaxation",
type: "scented-candles",
price: 19.9,
variants: [
{
color: "#DEB887",
sizes: [
{ size: "S", inStock: false, quantity: 0 },
{ size: "M", inStock: true, quantity: 4 },
],
images: ["[https://via.placeholder.com/300x400?text=Scented+Candles](https://via.placeholder.com/300x400?text=Scented+Candles)"],
},
],
},

// Mental Stimulation
{
name: "Puzzles",
category:"wellness",
subcategory:"mentallistimulation",
type: "puzzles",
price: 15.0,
variants: [
{
color: "#800080",
sizes: [
{ size: "10x10", inStock: true, quantity: 5 },
{ size: "20x20", inStock: true, quantity: 5 },
],
images: ["[https://via.placeholder.com/300x400?text=Puzzles](https://via.placeholder.com/300x400?text=Puzzles)"],
},
],
},

// Nutrition
{
name: "Protein Powder",
category: "wellness",
subcategory: "nutrition",
type: "protein",
price: 45.0,
variants: [
{
color: "#FF6347",
sizes: [
{ size: "500g", inStock: true, quantity: 8 },
{ size: "1kg", inStock: true, quantity: 12 },
],
images: ["[https://via.placeholder.com/300x400?text=Protein](https://via.placeholder.com/300x400?text=Protein)"],
},
],
},
{
name: "Vitamins",
category:"wellness",
subcategory: "nutrition",
type: "vitamins",
price: 35.0,
variants: [
{
color: "#3CB371",
sizes: [
{ size: "60tabs", inStock: true, quantity: 7 },
{ size: "120tabs", inStock: true, quantity: 8 },
],
images: ["[https://via.placeholder.com/300x400?text=Vitamins](https://via.placeholder.com/300x400?text=Vitamins)"],
},
],
},
];

// Seeder function
const seedData = async () => {
try {
await mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
});
console.log("✅ Connected to MongoDB");

// Clear existing collections
await Product.deleteMany();
await Category.deleteMany();

// Seed categories
const categoryNames = [...new Set(products.map((p) => p.category))];
for (let name of categoryNames) {
  await Category.create({ name, description: `${name} products` });
}

// Insert products
await Product.insertMany(products);
console.log("🌱 Database seeded successfully!");
process.exit();


} catch (err) {
console.error("❌ Error seeding data:", err);
process.exit(1);
}
};

seedData();
