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
      const requesterId = req.user.id;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const requester = await User.findById(requesterId);
      const targetUser = await User.findById(userId);
      if (!requester) {
        return res.status(404).json({ message: "Requester not found" });
      }
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      let adminId, normalUserId;
      if (requester.admin) {
        if (targetUser.admin) {
          return res.status(403).json({ message: "Admin cannot chat with another admin" });
        }
        adminId = requesterId;
        normalUserId = userId;
      } else {
        if (!targetUser.admin) {
          return res.status(403).json({ message: "Users can only chat with admins" });
        }
        adminId = userId;
        normalUserId = requesterId;
      }

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