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

export const updateProduct = async (req, res) => {
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

    const productId = req.params.id;

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

    // Parse array fields if necessary
    const colorArray = typeof colors === "string" ? JSON.parse(colors) : colors;
    const highlightArray =
      typeof highlights === "string" ? JSON.parse(highlights) : highlights;

    const imagePaths = req.files
      ? req.files.map((file) => file.path.replace(/\\/g, "/"))
      : [];

    // Build the update object
    const updateData = {
      ...(productName && { productName }),
      ...(rating && { rating }),
      ...(colors && { colors: colorArray }),
      ...(highlights && { highlights: highlightArray }),
      ...(finalProductPrice && { finalProductPrice }),
      ...(productPrice && { productPrice }),
      ...(productBrand && { productBrand }),
      ...(category && { category }),
    };

    if (imagePaths.length) {
      updateData.productImages = imagePaths;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: "Product not found.",
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
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
        message: message.productView,
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
      message: message.productView,
    });
  } catch (error) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingProducts,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await ProductModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: "Product not found.",
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.productDeleted,
      data: deletedProduct,
    });
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.INTERNAL_SERVER_ERROR,
    });
  }
};
