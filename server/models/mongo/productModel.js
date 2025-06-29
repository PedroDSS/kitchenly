import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    _id: Number,
    product_title: {
      type: String,
      required: false,
    },
    product_description: {
      type: String,
      required: false,
    },
    product_price: {
      type: Number,
      required: false,
    },
    product_star_rating: {
      type: Number,
      required: false,
    },
    product_url: {
      type: String,
      required: false,
    },
    product_category: {
      type: String,
      required: false,
    },
    is_best_seller: {
      type: Boolean,
      required: false,
    },
    delivery: {
      type: String,
      required: false,
    },
    product_stock: {
      type: Number,
      required: false,
      default: 0,
    },
    active: {
      type: Boolean,
      required: false,
    },
    brand: {
      type: String,
      required: false,
    },
    itemModelNumber: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    powerConsumption: {
      type: String,
      required: false,
    },
    voltage: {
      type: String,
      required: false,
    },
    capacity: {
      type: String,
      required: false,
    },
    dimensions: {
      type: String,
      required: false,
    },
    weight: {
      type: String,
      required: false,
    },
    energyEfficiencyClass: {
      type: String,
      required: false,
    },
    noiseLevel: {
      type: String,
      required: false,
    },
    warranty: {
      type: String,
      required: false,
    },
    material: {
      type: String,
      required: false,
    },
    series: {
      type: String,
      required: false,
    },
    plugType: {
      type: String,
      required: false,
    },
    imageUrls: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
