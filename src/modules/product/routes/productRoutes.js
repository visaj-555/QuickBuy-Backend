import express from "express";
import { addProduct, getProducts } from "../controller/productController.js";
import { uploadProductImages } from "../../../middlewares/upload.js"; // Import the correct upload middleware

const Router = express.Router();

// Route to add a product with file uploads
Router.post(
  "/product/add",
  uploadProductImages.array("productImages"),
  addProduct
);

// Route to view product(s)
Router.get("/product/view", getProducts);

export default Router;
