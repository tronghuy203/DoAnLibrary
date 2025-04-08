const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "paid"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("BorrowRequest", borrowRequestSchema);
