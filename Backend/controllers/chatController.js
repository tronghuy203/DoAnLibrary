const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

const messageController = {
  getUsersForChat: async (req, res) => {
    try {
      const users = await User.find({ admin: false }).select("username _id avatar");
      res.status(200).json(users);
    } catch (error) {
      console.error("Error in getUsersForChat:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getChatHistory: async (req, res) => {
    try {
      const { chatId } = req.params;
      const messages = await Message.find({ chatId })
        .populate("sender", "username avatar")
        .sort({ createdAt: 1 });
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error in getChatHistory:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  createOrGetChat: async (req, res) => {
    try {
      const { userId } = req.body;
      const requesterId = req.user.id; // Lấy id từ token JWT

      // Kiểm tra userId hợp lệ
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      // Kiểm tra requester và target user
      const requester = await User.findById(requesterId);
      const targetUser = await User.findById(userId);
      if (!requester) {
        return res.status(404).json({ message: "Requester not found" });
      }
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // Logic xác định admin và user
      let adminId, normalUserId;
      if (requester.admin) {
        // Nếu requester là admin, userId là user thông thường
        if (targetUser.admin) {
          return res.status(403).json({ message: "Admin cannot chat with another admin" });
        }
        adminId = requesterId;
        normalUserId = userId;
      } else {
        // Nếu requester là user, userId phải là admin
        if (!targetUser.admin) {
          return res.status(403).json({ message: "Users can only chat with admins" });
        }
        adminId = userId;
        normalUserId = requesterId;
      }

      // Tìm hoặc tạo chat
      let chat = await Chat.findOne({
        participants: { $all: [adminId, normalUserId] },
      });

      if (!chat) {
        chat = await Chat.create({ participants: [adminId, normalUserId] });
      }

      res.status(200).json(chat);
    } catch (error) {
      console.error("Error in createOrGetChat:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};

module.exports = messageController;