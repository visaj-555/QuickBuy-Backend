import express from "express";
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../controller/productController.js";
import { uploadProductImages } from "../../../middlewares/upload.js"; // Import the correct upload middleware

const Router = express.Router();

// Route to add a product with file uploads
Router.post(
  "/product/add",
  uploadProductImages.array("productImages"),
  addProduct
);

Router.patch(
  "/product/update/:id",
  uploadProductImages.array("productImages"),
  updateProduct
);

Router.delete("/product/delete/:id", deleteProduct);

Router.get("/product/view", getProducts);

export default Router;
