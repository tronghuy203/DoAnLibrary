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
        required: true }, // Lưu URL file PDF
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Ai đã upload?
    createdAt: { 
        type: Date,
        default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
