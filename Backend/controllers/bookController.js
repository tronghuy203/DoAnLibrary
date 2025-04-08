const Book = require("../models/Book");
const multer = require("multer");
const path = require("path");

// Cấu hình lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu ảnh vào thư mục uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file
  },
});

const upload = multer({ storage });

const bookController = {
  // Tạo sách mới
  createBook: async (req, res) => {
    try {
      const { title, author, description, price, category, quantity } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : "";

      const newBook = new Book({ title, author, description, price, image, category,  quantity: Number(quantity) || 1});
      const savedBook = await newBook.save();

      res.status(201).json(savedBook);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tạo sách!", error: err.message });
    }
  },

  // Lấy tất cả sách
  getAllBooks: async (req, res) => {
    try {
      const books = await Book.find();
      res.status(200).json(books);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy sách theo ID
  getBookById: async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json("Không tìm thấy sách");
      }
      res.status(200).json(book);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Cập nhật sách
  updateBook: async (req, res) => {
    try {
      const { title, author, description, price, category, quantity } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        { title, author, description, price, image , category, quantity: Number(quantity)},
        { new: true }
      );

      res.status(200).json(updatedBook);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Xóa sách
  deleteBook: async (req, res) => {
    try {
      await Book.findByIdAndDelete(req.params.id);
      res.status(200).json("Sách đã được xóa thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = { bookController, upload };
