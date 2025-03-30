import logger from "../service/logger.service.js";
import bcrypt from "bcrypt";
import UserModel from "../modules/user/model/userModel.js";

export const insertAdminUser = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await UserModel.findOne({ email: adminEmail });

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash("Test@123", 10);
    const adminUser = new UserModel({
      userId: "admin",
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: hashedPassword,
      is_admin: true,
    });

    await adminUser.save();
    logger.info("Admin user seeded successfully.");
  } catch (err) {
    logger.error(`Error inserting admin user: ${err.message}`);
  }
};

export const seedDatabase = async () => {
  try {
    await insertAdminUser();
  } catch (err) {
    logger.error(`Error during seeding: ${err.message}`);
  }
};

export default seedDatabase;
