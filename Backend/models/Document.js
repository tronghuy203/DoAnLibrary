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
    thumbnailUrl: {
      type: String,
      default: "",
    },
    fileType: { 
      type: String, 
      enum: ["pdf", "doc", "docx"], 
      required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    viewHistory: [{ date: Date, count: Number }],
    downloadHistory: [{ date: Date, count: Number }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    cloudinaryFileId: String,
    cloudinaryThumbnailId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
