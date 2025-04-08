const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["rental_fee", "penalty", "deposit"],
    required: true,
  },
  penaltyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Penalty",
    default: null,
  },
  method: {
    type: String,
    enum: ["momo", "vnpay", "cash", "bank_transfer"],
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success",
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
