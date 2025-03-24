const User = require("../models/User");
const bcrypt = require("bcrypt");

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ admin: true });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const admin = new User({
                username: "myadmin",
                email: "admin@gmail.com",
                password: hashedPassword,
                admin: true,
            });
            await admin.save();
            console.log("Admin user created successfully!");
        } else {
            console.log("Admin user already exists.");
        }
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
};

module.exports = { createAdmin };
