import ProductModel from "../model/productModel.js";
import { statusCode, message } from "../../../utils/api.response.js";
import logger from "../../../service/logger.service.js";

export const addProduct = async (req, res) => {
  try {
    // Handle image validation
    if (req.fileValidationError) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "Please upload valid image files (jpeg/jpg/png).",
      });
    }

    if (req.fileSizeLimitError) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "Each file size should be less than 5 MB.",
      });
    }

    const {
      productName,
      rating,
      colors,
      highlights,
      finalProductPrice,
      productPrice,
      productBrand,
      category,
    } = req.body;

    // Convert stringified arrays (from form-data) into actual arrays
    const colorArray = typeof colors === "string" ? JSON.parse(colors) : colors;
    const highlightArray =
      typeof highlights === "string" ? JSON.parse(highlights) : highlights;

    const imagePaths = req.files
      ? req.files.map((file) => file.path.replace(/\\/g, "/"))
      : [];

    const newProduct = new ProductModel({
      productName,
      rating,
      colors: colorArray,
      highlights: highlightArray,
      productImages: imagePaths,
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
      message: message.INTERNAL_SERVER_ERROR,
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
