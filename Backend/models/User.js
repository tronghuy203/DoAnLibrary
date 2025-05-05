const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 70,
      unique: true,
    },
    dob: { 
      type: Date, 
      required: false 
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
    },
    phone: { 
      type: String, 
      required: false, 
      minlength: 10,
      maxlength: 15,
    },
    email: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      // required: true,
      minlength: 6,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: { 
      type: String, 
      unique: true, 
      sparse: true },
    avatar: { 
      type: String, 
      default: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
    },
    admin: {
      type: Boolean,
      default: false,
    },
    membership: {
      membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
      userMembershipId: { type: mongoose.Schema.Types.ObjectId, ref: "UserMembership" },
    },
    country: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
