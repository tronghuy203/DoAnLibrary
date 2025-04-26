const Review = require("../models/Review");
const Reply = require("../models/Reply");
const User = require("../models/User");

const reviewController = {
  getReviews: async (req, res) => {
    try {
      const { type, itemId } = req.params;

      let reviews;
      if (itemId === "all") {
        reviews = await Review.find({ type })
          .populate("userId", "username avatar")
          .lean();
      } else {
        reviews = await Review.find({ type, itemId })
          .populate("userId", "username avatar")
          .lean();
      }

      const reviewIds = reviews.map((r) => r._id);
      const replies = await Reply.find({ reviewId: { $in: reviewIds } })
        .populate("userId", "username avatar")
        .sort({ createdAt: 1 });

      const reviewMap = {};
      reviews.forEach((r) => (reviewMap[r._id] = { ...r, replies: [] }));
      replies.forEach((reply) => {
        const rId = reply.reviewId.toString();
        if (reviewMap[rId]) reviewMap[rId].replies.push(reply);
      });

      res.status(200).json(Object.values(reviewMap));
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy đánh giá", error });
    }
  },

  addReview: async (req, res) => {
    try {
      const { itemId, type, userId, rating, comment } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

      if (!rating || !comment.trim()) {
        return res.status(400).json({ message: "Vui lòng nhập đánh giá hợp lệ." });
      }

      const newReview = new Review({ itemId, type, userId, rating, comment });
      await newReview.save();

      res.status(201).json({
        _id: newReview._id,
        itemId,
        type,
        rating,
        comment,
        createdAt: newReview.createdAt,
        userId: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi thêm đánh giá", error });
    }
  },

  updateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, rating, comment } = req.body;
      const { admin } = req.user;

      const review = await Review.findById(id);
      if (!review) return res.status(404).json({ message: "Đánh giá không tồn tại" });

      if (!admin && review.userId.toString() !== userId) {
        return res.status(403).json({ message: "Không có quyền chỉnh sửa đánh giá này" });
      }

      review.rating = rating ?? review.rating;
      review.comment = comment ?? review.comment;

      await review.save();
      res.status(200).json({ message: "Đã cập nhật đánh giá", review });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật đánh giá", error });
    }
  },

  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, isAdmin } = req.body;
      const { admin } = req.user;

      const review = await Review.findById(id);
      if (!review) return res.status(404).json({ message: "Đánh giá không tồn tại" });

      if (!admin && review.userId.toString() !== userId) {
        return res.status(403).json({ message: "Không có quyền xóa đánh giá này" });
      }

      await Review.findByIdAndDelete(id);
      await Reply.deleteMany({ reviewId: id });

      res.status(200).json({ message: "Đã xóa đánh giá và các phản hồi liên quan" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa đánh giá", error });
    }
  },

  addReply: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { userId, comment } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

      const newReply = new Reply({ reviewId, userId, comment });
      await newReply.save();

      const populated = await newReply.populate("userId", "username avatar");

      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi thêm phản hồi", error });
    }
  },

  updateReply: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, comment, isAdmin } = req.body;
      const { admin } = req.user;

      const reply = await Reply.findById(id);
      if (!reply) return res.status(404).json({ message: "Phản hồi không tồn tại" });

      if (!admin && reply.userId.toString() !== userId) {
        return res.status(403).json({ message: "Không có quyền sửa phản hồi này" });
      }

      reply.comment = comment;
      await reply.save();

      res.status(200).json({ message: "Đã cập nhật phản hồi", reply });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi sửa phản hồi", error });
    }
  },

  deleteReply: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: userId, admin } = req.user
  
      const reply = await Reply.findById(id);
      if (!reply) return res.status(404).json({ message: "Phản hồi không tồn tại" });
  
      console.log("Reply userId:", reply.userId.toString());
      if (!admin && reply.userId.toString() !== userId) {
        return res.status(403).json({ message: "Không có quyền xóa phản hồi này" });
      }
  
      await Reply.findByIdAndDelete(id);
      res.status(200).json({ message: "Đã xóa phản hồi" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa phản hồi", error });
    }
  },
};

module.exports = reviewController;
