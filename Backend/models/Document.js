const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: { type: String },
    fileUrl: {
      type: String,
      required: true,
    },
    coverUrl: {
      type: String, 
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    viewHistory: [
      { date: Date, count: Number }
    ],
    downloadHistory: [
      { date: Date, count: Number }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
