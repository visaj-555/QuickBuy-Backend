import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    profileImage: {
      type: String,
      default: "",
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
