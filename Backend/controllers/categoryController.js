const Category = require("../models/Category");

const categoryController = {
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      const existing = await Category.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: "Danh mục đã tồn tại!" });
      }

      const newCategory = new Category({ name, description });
      const savedCategory = await newCategory.save();

      res.status(201).json(savedCategory);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tạo danh mục", error: err.message });
    }
  },

  getAllCategory: async (req, res) => {
    try {
      const category = await Category.find();
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy danh mục", error: err.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
      }
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy danh mục", error: err.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: "Danh mục không tồn tại" });
      }

      res.status(200).json(updatedCategory);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi cập nhật danh mục", error: err.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const deleted = await Category.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Danh mục không tồn tại" });
      }

      res.status(200).json({ message: "Xóa danh mục thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa danh mục", error: err.message });
    }
  },
};

module.exports = categoryController;
