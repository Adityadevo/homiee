import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    gender: String,
    jobType: String,
    city: String,
    role: {
      type: String,
      enum: ["find", "provide"], // find = wants, provide = has
      required: true
    },
    propertyType: String, // "room" | "flat"
    budget: Number,
    genderPref: String,
    email: { type: String, unique: true },
    passwordHash: String
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
