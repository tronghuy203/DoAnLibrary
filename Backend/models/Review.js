const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    type: {
      type: String,
      enum: ["book", "document"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemTitle: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
