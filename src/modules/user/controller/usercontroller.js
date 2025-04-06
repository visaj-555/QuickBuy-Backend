import UserModel from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import TokenModel from "../model/tokenModel.js";
import { statusCode, message } from "../../../utils/api.response.js";
import logger from "../../../service/logger.service.js";
import mongoose from "mongoose";

//====================== REGISTER USER ======================//

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.userExists,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      fullName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.userCreated,
      data: { ...savedUser.toObject(), password: undefined },
    });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorRegisteringUser,
    });
  }
};

//====================== LOGIN USER ======================//

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (mongoose.connection.readyState !== 1) {
    logger.error("Database connection state:", mongoose.connection.readyState);
    return res.status(500).json({
      message: "Database is not connected. Please try again later.",
    });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password.",
      });
    }

    await TokenModel.findOneAndDelete({ userId: user._id });

    const token = jwt.sign({ id: user._id }, process.env.SECRET);

    const tokenDoc = new TokenModel({ token, userId: user._id });
    await tokenDoc.save();

    return res.status(200).json({
      statusCode: statusCode.OK,
      message: "Login successful",
      data: {
        token,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNo: user.phoneNo,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error(`Error logging in user: ${error.message}`);
    return res.status(500).json({
      message: "An error occurred during login.",
    });
  }
};

//====================== VIEW USER ======================//

export const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id, { password: 0 });
    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.userNotFound,
      });
    }
    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.userView,
      data: user,
    });
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorLogin,
      error,
    });
  }
};

//====================== UPDATE USER ======================//

export const updateUser = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "Please upload a valid image file",
      });
    }

    if (req.fileSizeLimitError) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "File size should be less than 5 MB.",
      });
    }

    const { firstName, lastName, phoneNo, email } = req.body;
    const profileImage = req.file ? req.file.path : null;

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.userNotFound,
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNo = phoneNo || user.phoneNo;
    user.email = email || user.email;
    if (profileImage) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.userProfileUpdated,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNo: user.phoneNo,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUserProfile,
    });
  }
};
//====================== DELETE USER ======================//

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.deleteAuth,
      });
    }

    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.userNotFound,
      });
    }

    res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.userDeleted });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.deleteUserError,
    });
  }
};

//====================== LOGOUT USER ======================//

export const logoutUser = async (req, res) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.authHeaderError,
      });
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.tokenMissing,
      });
    }

    const tokenExists = await TokenModel.findOneAndDelete({ token });
    if (!tokenExists) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.tokenNotFound,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.userLoggedOut,
    });
  } catch (error) {
    logger.error(`Error logging out user: ${error.message}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorLogout,
    });
  }
};
