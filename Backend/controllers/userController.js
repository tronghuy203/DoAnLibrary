const User = require("../models/User");
const BorrowRecord = require("../models/BorrowRecord");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const multer = require("multer");

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

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách người dùng",
        error: err.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      if (req.user.id === req.params.id || req.user.admin) {
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true, runValidators: true }
        ).select("-password");
        if (!updatedUser) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json(updatedUser);
      } else {
        return res
          .status(403)
          .json({ message: "Bạn chỉ có thể cập nhật thông tin của mình!" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi cập nhật người dùng", error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      if (req.user.id === req.params.id || req.user.admin) {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        await BorrowRecord.deleteMany({ userId: req.params.id });
        return res.status(200).json({
          message:
            req.user.id === req.params.id
              ? "Tài khoản của bạn đã được xóa"
              : "Người dùng đã được xóa bởi admin",
          selfDeleted: req.user.id === req.params.id,
        });
      } else {
        return res
          .status(403)
          .json({ message: "Bạn chỉ có thể xóa tài khoản của mình!" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi xóa người dùng", error: err.message });
    }
  },

  uploadAvatar: async (req, res) => {
    try {
      console.log("req.file:", req.file);
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng chọn file ảnh" });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "avatars", resource_type: "image" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary error:", error);
                return reject(error);
              }
              resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      console.log("Cloudinary result:", result);
      res.status(200).json({ avatar: result.secure_url });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res
        .status(500)
        .json({ message: "Lỗi khi upload ảnh", error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      if (!req.user || req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Bạn chỉ có thể cập nhật hồ sơ của mình!" });
      }

      const updateData = {};
      const fields = ["username", "avatar", "gender", "email", "country", "city"];
      fields.forEach((field) => {
        if (req.body[field]) updateData[field] = req.body[field];
      });

      if (req.body.phone) {
        const phone = req.body.phone;
        if (!/^[0-9]{10,11}$/.test(phone)) {
          return res.status(400).json({ message: "Số điện thoại phải là số và có độ dài từ 10 hoặc 11 số" });
        }
        updateData.phone = phone;
      }

      if (req.body.dob) {
        const dob = new Date(req.body.dob);
        if (isNaN(dob.getTime())) {
          return res.status(400).json({ message: "Ngày sinh không hợp lệ" });
        }
        updateData.dob = dob;
      }

      if (!Object.keys(updateData).length) {
        return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.status(200).json(updatedUser);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ message: `${field} đã tồn tại` });
      }
      res.status(500).json({ message: "Lỗi khi cập nhật hồ sơ", error: err.message });
    }
  },

  getBorrowHistory: async (req, res) => {
    try {
      if (req.user.id !== req.params.userId && !req.user.admin) {
        return res
          .status(403)
          .json({ message: "Bạn chỉ có thể xem lịch sử mượn sách của mình!" });
      }
      const borrowHistory = await BorrowRecord.find({
        userId: req.params.userId,
      })
        .populate("bookId", "title author")
        .sort({ borrowDate: -1 });
      res.status(200).json(borrowHistory);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi lấy lịch sử mượn sách", error: err.message });
    }
  },

  getAdmin: async (req, res) => {
    try {
      const admin = await User.findOne({ admin: true });
      if (!admin) {
        return res.status(404).json({ message: "Không tìm thấy admin" });
      }
      res.status(200).json({ _id: admin._id, username: admin.username });
    } catch (error) {
      console.error("Lỗi trong getAdmin:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
};

module.exports = { userController, upload };