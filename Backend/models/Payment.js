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
    enum: ["rental_fee", "penalty","membership"],
    required: true,
  },
  penaltyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Penalty",
    default: null,
  },
  borrowRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "BorrowRecord" },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    default: null,
  },
  method: {
    type: String,
    enum: ["vnpay", "cash", "points"],
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending", "cancelled"],
    default: "success",
  },
  vnpayTxnRef: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
