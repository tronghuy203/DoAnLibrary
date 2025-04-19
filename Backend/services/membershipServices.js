const Membership = require("../models/Membership");

const createMemberships = async () => {
  try {
    const membershipCount = await Membership.countDocuments();
    if (membershipCount === 0) {
      const memberships = [
        {
          name: "Free",
          viewLimit: 5,
          downloadLimit: 2,
          price: 0,
          duration: 30,
        },
        {
          name: "Basic",
          viewLimit: 20,
          downloadLimit: 10,
          price: 50000,
          duration: 30,
        },
        {
          name: "Premium",
          viewLimit: 100,
          downloadLimit: 50,
          price: 150000,
          duration: 30,
        },
      ];

      await Membership.insertMany(memberships);
      console.log("Membership packages created successfully!");
    } else {
      console.log("Membership packages already exist.");
    }
  } catch (error) {
    console.error("Error creating membership packages:", error);
  }
};

module.exports = { createMemberships };