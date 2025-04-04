import express from "express";
import { addProduct, getProducts } from "../controller/productController";

const Router = express.Router();

Router.post("/product/add", addProduct);
Router.get("/product/view", getProducts);

export default Router;
