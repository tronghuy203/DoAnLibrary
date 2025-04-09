const mongoose = require("mongoose");

const penaltySchema = new mongoose.Schema({
  borrowRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BorrowRecord",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "expired"],
    default: "pending",
  },
  dueAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Penalty", penaltySchema);
