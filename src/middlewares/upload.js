import multer from "multer";
import path from "path";
import { statusCode, message } from "../utils/api.response.js";

// =========================
// Profile Image Upload (Existing)
// =========================
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile_images");
  },

  filename: function (req, file, cb) {
    const firstName = req.body.firstName;
    if (firstName) {
      cb(null, `${firstName}_${Date.now()}${path.extname(file.originalname)}`);
    } else {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  },
});

export const upload = multer({
  storage: storage,

  fileFilter: function (req, file, cb) {
    const filetypes =
      /jpeg|jpg|png|gif|bmp|webp|svg|tiff|ico|raw|heic|webp|avif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      req.fileValidationError = "Only .jpeg, .jpg, and .png files are allowed!";
      return cb(
        null,
        false,
        new Error("Only .jpeg, .jpg, and .png files are allowed!")
      );
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =========================
// Product Image Upload (New)
// =========================
export const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/product_images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const uploadProductImages = multer({
  storage: productStorage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      req.fileValidationError = "Only .jpeg, .jpg, and .png files are allowed!";
      return cb(
        null,
        false,
        new Error("Only .jpeg, .jpg, and .png files are allowed!")
      );
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =========================
// Error Handler
// =========================
export function multerErrorHandling(err, req, res, next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    req.fileSizeLimitError = true;
    return res
      .status(statusCode.BAD_REQUEST)
      .json({ message: message.validImageError });
  }
  next(err);
}
