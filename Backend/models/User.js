const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 20,
      unique: true,
    },
    fullName: { 
      type: String,
      required: false, 
      minlength: 3,
      maxlength: 50,
    },
    dob: { 
      type: Date, 
      required: false 
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
      required: true,
      minlength: 6,
    },
    avatar: { 
      type: String, 
      default: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
    },
    admin: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
