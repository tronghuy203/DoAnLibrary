const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    viewLimit: { type: Number, required: true },
    downloadLimit: { type: Number, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", membershipSchema);
