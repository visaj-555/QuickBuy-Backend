import ProductModel from "../models/ProductModel.js";
import statusCode from "../constants/statusCode.js";
import message from "../constants/message.js";
import logger from "../utils/logger.js";

export const addProduct = async (req, res) => {
  try {
    const {
      productName,
      rating,
      colors,
      highlights,
      productImages,
      finalProductPrice,
      productPrice,
      productBrand,
      category,
    } = req.body;

    const newProduct = new ProductModel({
      productName,
      rating,
      colors,
      highlights,
      productImages,
      finalProductPrice,
      productPrice,
      productBrand,
      category,
    });

    const savedProduct = await newProduct.save();

    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.productAdded,
      data: savedProduct,
    });
  } catch (error) {
    logger.error(`Error adding product: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorAddingProduct,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { id, brands, rating, offer, sort, category } = req.query;
    let filter = {};

    if (id) {
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(statusCode.NOT_FOUND).json({
          statusCode: statusCode.NOT_FOUND,
          message: message.productNotFound,
        });
      }
      return res.status(statusCode.OK).json({
        statusCode: statusCode.OK,
        data: product,
      });
    }

    if (brands) filter.productBrand = { $in: brands.split(",") };
    if (rating) filter.rating = { $gte: Number(rating) };
    if (category) filter.category = category;

    let products = await ProductModel.find(filter);

    if (sort === "Low to High") {
      products.sort((a, b) => a.finalProductPrice - b.finalProductPrice);
    } else if (sort === "High to Low") {
      products.sort((a, b) => b.finalProductPrice - a.finalProductPrice);
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      data: products,
    });
  } catch (error) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingProducts,
    });
  }
};
