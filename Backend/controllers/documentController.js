const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu file vào thư mục uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file
  },
});

const upload = multer({ storage });

const documentController = {
  // Tải lên tài liệu mới
  uploadDocument: async (req, res) => {
    try {

      const { title, description } = req.body;
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";
      
      const newDocument = new Document({
        title,
        description,
        fileUrl,
        uploadedBy: req.user.id, // Lấy ID user từ JWT
      });

      const savedDocument = await newDocument.save();
      res.status(201).json(savedDocument);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tải tài liệu!", error: err.message });
    }
  },

  // Lấy tất cả tài liệu
  getAllDocuments: async (req, res) => {
    try {
      const documents = await Document.find().populate("uploadedBy", "username");
      res.status(200).json(documents);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy tài liệu theo ID
  getDocumentById: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).json("Không tìm thấy tài liệu");
      }
      res.status(200).json(document);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Xem tài liệu online
  viewDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: "Tài liệu không tồn tại" });

      res.sendFile(path.join(__dirname, "../uploads", path.basename(document.fileUrl)));
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi mở tài liệu", error: err });
    }
  },

  // Tải tài liệu xuống
  downloadDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: "Tài liệu không tồn tại" });

      res.download(path.join(__dirname, "../uploads", path.basename(document.fileUrl)));
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tải tài liệu", error: err });
    }
  },

  // Xóa tài liệu
  deleteDocument: async (req, res) => {
    try {
      await Document.findByIdAndDelete(req.params.id);
      res.status(200).json("Tài liệu đã được xóa thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = { documentController, upload };
