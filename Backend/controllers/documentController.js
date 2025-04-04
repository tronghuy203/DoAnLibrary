const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });

const documentController = {
  uploadDocument: async (req, res) => {
    try {
      const { title, description } = req.body;
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const newDocument = new Document({
        title,
        description,
        fileUrl,
        uploadedBy: req.user.id,
      });

      const savedDocument = await newDocument.save();
      res.status(201).json(savedDocument);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tải tài liệu!", error: err.message });
    }
  },


  getAllDocuments: async (req, res) => {
    try {
      const documents = await Document.find().populate("uploadedBy", "username");
      res.status(200).json(documents);
    } catch (err) {
      res.status(500).json(err);
    }
  },


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


  viewDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: "Tài liệu không tồn tại" });

      const today = new Date().toISOString().split("T")[0];
      const viewEntry = document.viewHistory.find(
        (v) => v.date.toISOString().split("T")[0] === today
      );
      if (viewEntry) {
        viewEntry.count += 1;
      } else {
        document.viewHistory.push({ date: new Date(), count: 1 });
      }
      document.views += 1;
      await document.save();

      res.sendFile(path.join(__dirname, "../uploads", path.basename(document.fileUrl)));
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi mở tài liệu", error: err });
    }
  },

  downloadDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: "Tài liệu không tồn tại" });

      const today = new Date().toISOString().split("T")[0];
      const downloadEntry = document.downloadHistory.find(
        (d) => d.date.toISOString().split("T")[0] === today
      );
      if (downloadEntry) {
        downloadEntry.count += 1;
      } else {
        document.downloadHistory.push({ date: new Date(), count: 1 });
      }
      document.downloads += 1;
      await document.save();

      res.download(path.join(__dirname, "../uploads", path.basename(document.fileUrl)));
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tải tài liệu", error: err });
    }
  },

  deleteDocument: async (req, res) => {
    try {
      await Document.findByIdAndDelete(req.params.id);
      res.status(200).json("Tài liệu đã được xóa thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getTotalStats: async (req, res) => {
    try {
      const stats = await Document.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalDownloads: { $sum: "$downloads" },
          },
        },
      ]);
      res.status(200).json(stats[0] || { totalViews: 0, totalDownloads: 0 });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê tổng", error: err });
    }
  },

  getDocumentStats: async (req, res) => {
    try {
      const stats = await Document.find({}, "title views downloads");
      res.status(200).json(stats);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê", error: err });
    }
  },
};

module.exports = { documentController, upload };
