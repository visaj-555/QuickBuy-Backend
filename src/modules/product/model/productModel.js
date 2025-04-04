import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    colors: {
      type: [String],
      required: true,
    },
    highlights: {
      type: [String],
      required: true,
    },
    productImages: {
      type: [String],
      required: true,
    },
    finalProductPrice: {
      type: Number,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productBrand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["mobile", "laptop", "accessory", "smartWatch", "tv", "tablet"],
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
