const Book = require("../models/Book");

const bookController = {
  createBook: async (req, res) => {
    try {
      const newBook = new Book(req.body);
      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAllBooks: async (req, res) => {
    try {
      const books = await Book.find();
      res.status(200).json(books);
    } catch (err) {
      res.status(500).json(err);
    }
  },

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

  updateBook: async (req, res) => {
    try {
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body ,{ new: true });
      res.status(200).json(updatedBook);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteBook: async (req, res) => {
    try {
      await Book.findByIdAndDelete(req.params.id);
      res.status(200).json("Sách đã được xóa thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = bookController;
