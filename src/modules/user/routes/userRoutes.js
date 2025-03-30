import express from "express";

import {
  ensureAdmin,
  ensureAuthenticated,
} from "../../../middlewares/authValidator.js";

import {
  deleteUser,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../controller/usercontroller.js";
import {
  userLoginValidate,
  userRegisterValidate,
} from "../validation/userValidator.js";

import { upload, multerErrorHandling } from "../../../middlewares/upload.js";

const Router = express.Router();

// User Authentication Routes
Router.post("/user/login", userLoginValidate, loginUser);
Router.post("/user/logout", ensureAuthenticated, logoutUser);
Router.post("/user/register", userRegisterValidate, registerUser);

// User Profile Routes
Router.get("/user-profile/:id", ensureAuthenticated, getUser);
Router.put(
  "/user-profile/update/:id",
  ensureAuthenticated,
  upload.single("profileImage"),
  multerErrorHandling,
  updateUser
);

// User Management Routes
Router.delete("/user/delete/:id", ensureAuthenticated, deleteUser);

export default Router;
