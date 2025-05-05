const Book = require("../models/Book");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(file.mimetype.toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Chỉ hỗ trợ file ảnh định dạng JPEG hoặc PNG"));
  },
});

const bookController = {
  createBook: async (req, res) => {
    try {
      const { title, author, description, price, category, quantity, publishedYear } = req.body;
      let image = "";
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "books", resource_type: "image" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            )
            .end(req.file.buffer);
        });
        image = result.secure_url;
      }

      const newBook = new Book({
        title,
        author,
        description,
        price,
        image,
        category,
        quantity: Number(quantity) || 1,
        publishedYear,
      });
      const savedBook = await newBook.save();

      res.status(201).json(savedBook);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tạo sách!", error: err.message });
    }
  },

  getAllBooks: async (req, res) => {
    try {
      const books = await Book.find();
      res.status(200).json(books);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách sách", error: err.message });
    }
  },

  getBookById: async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Không tìm thấy sách" });
      }
      res.status(200).json(book);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin sách", error: err.message });
    }
  },

  updateBook: async (req, res) => {
    try {
      const { title, author, description, price, category, quantity, publishedYear } = req.body;
      let image = req.body.image || "";

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "books", resource_type: "image" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            )
            .end(req.file.buffer);
        });
        image = result.secure_url;
      }

      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        {
          title,
          author,
          description,
          price,
          image,
          category,
          quantity: Number(quantity),
          publishedYear,
        },
        { new: true }
      );

      if (!updatedBook) {
        return res.status(404).json({ message: "Không tìm thấy sách" });
      }

      res.status(200).json(updatedBook);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi cập nhật sách", error: err.message });
    }
  },

  deleteBook: async (req, res) => {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Không tìm thấy sách" });
      }
      res.status(200).json({ message: "Sách đã được xóa thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa sách", error: err.message });
    }
  },
};

module.exports = { bookController, upload };