const User = require("../models/User");
const BorrowRecord = require("../models/BorrowRecord"); // Sử dụng BorrowRecord thay vì Borrow

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng", error: err.message });
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
        return res.status(403).json({ message: "Bạn chỉ có thể cập nhật thông tin của mình!" });
      }
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật người dùng", error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      if (req.user.id === req.params.id || req.user.admin) {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        // Xóa các bản ghi mượn sách liên quan
        await BorrowRecord.deleteMany({ userId: req.params.id });
        return res.status(200).json({
          message: req.user.id === req.params.id ? "Tài khoản của bạn đã được xóa" : "Người dùng đã được xóa bởi admin",
          selfDeleted: req.user.id === req.params.id,
        });
      } else {
        return res.status(403).json({ message: "Bạn chỉ có thể xóa tài khoản của mình!" });
      }
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa người dùng", error: err.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Bạn chỉ có thể cập nhật hồ sơ của mình!" });
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            fullName: req.body.fullName,
            dob: req.body.dob,
            gender: req.body.gender,
            phone: req.body.phone,
            avatar: req.body.avatar,
          },
        },
        { new: true, runValidators: true }
      ).select("-password");
      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi cập nhật hồ sơ", error: err.message });
    }
  },

  getBorrowHistory: async (req, res) => {
    try {
      if (req.user.id !== req.params.userId && !req.user.admin) {
        return res.status(403).json({ message: "Bạn chỉ có thể xem lịch sử mượn sách của mình!" });
      }
      const borrowHistory = await BorrowRecord.find({ userId: req.params.userId })
        .populate("bookId", "title author") // Lấy title và author của sách
        .sort({ borrowDate: -1 }); // Sắp xếp theo ngày mượn mới nhất
      res.status(200).json(borrowHistory);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy lịch sử mượn sách", error: err.message });
    }
  },
};

module.exports = userController;