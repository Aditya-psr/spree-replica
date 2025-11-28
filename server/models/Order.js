import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  color: String,
  colorName: String,
  size: String,

  // 🔹 NEW FIELDS so admin can filter by category
  category: { type: String, default: "" },
  categorySlug: { type: String, default: "" },
  categoryName: { type: String, default: "" },
});

const AddressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fullName: String,
  street: String,
  apt: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  phone: String,
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [OrderItemSchema],

    subtotal: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "usd" },

    shippingMethodId: String,
    shippingMethodLabel: String,

    deliveryEstimateText: String,

    shippingAddress: AddressSchema,

    paymentStatus: { type: String, default: "paid" },
    paymentIntentId: String,

    status: { type: String, default: "processing" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
