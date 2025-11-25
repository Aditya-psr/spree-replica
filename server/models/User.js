import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fullName: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  phone: String,
  defaultDelivery: { type: Boolean, default: false },
  defaultBilling: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  addresses: [addressSchema],

  // 👇 New field to differentiate users and admins
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

export default mongoose.model("User", userSchema);
