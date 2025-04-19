const User = require("../models/User");
const Membership = require("../models/Membership");
const UserMembership = require("../models/UserMembership");
const bcrypt = require("bcrypt");

const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ admin: true });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const freeMembership = await Membership.findOne({ name: "Free" });
      if (!freeMembership) {
        throw new Error("Free membership package not found");
      }

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + freeMembership.duration * 24 * 60 * 60 * 1000);
      const userMembership = new UserMembership({
        userId: null,
        membershipId: freeMembership._id,
        startDate,
        endDate,
        viewCount: [{ date: startDate, count: 0 }],
        downloadCount: [{ date: startDate, count: 0 }],
      });

      const admin = new User({
        username: "myadmin",
        email: "admin@gmail.com",
        password: hashedPassword,
        phone: "0123456789",
        admin: true,
        membership: {
          membershipId: freeMembership._id,
          userMembershipId: userMembership._id,
        },
      });

      await admin.save();
      userMembership.userId = admin._id;
      await userMembership.save();

      console.log("Admin user created successfully with Free membership!");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

module.exports = { createAdmin };