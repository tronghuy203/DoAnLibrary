const mongoose = require("mongoose");

const penaltySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRecord",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "expired"],
      default: "pending",
    },
    dueAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Penalty", penaltySchema);
