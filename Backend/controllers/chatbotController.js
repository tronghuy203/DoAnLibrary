require("dotenv").config();
const axios = require("axios");
const ChatHistory = require("../models/Chatbot");
const Book = require("../models/Book");
const Document = require("../models/Document");
const Review = require("../models/Review");

const CHATBOT_SYSTEM = `
Bạn là trợ lý ảo thư viện, trả lời các câu hỏi của người dùng về sách và tài liệu.
Luôn trả lời bằng tiếng Việt, ngắn gọn và rõ ràng.
`;

const chatbotController = {
  handleChat: async (req, res) => {
    const startTime = Date.now();
    try {
      const { message, userId } = req.body;
      if (!message || !message.trim()) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập câu hỏi hợp lệ." });
      }

      const books = await Book.find({}).populate('category').lean().limit(5);
      const docs = await Document.find({ status: "approved" }).lean().limit(5);
      const reviews = await Review.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username")
        .lean();

      const reviewData = await Promise.all(
        reviews.map(async (r) => {
          let itemTitle = "";
          if (r.type === "book") {
            const book = await Book.findById(r.itemId).lean();
            itemTitle = book?.title || "Không rõ";
          } else if (r.type === "document") {
            const doc = await Document.findById(r.itemId).lean();
            itemTitle = doc?.title || "Không rõ";
          }
          return {
            username: r.userId.username,
            comment: r.comment,
            rating: r.rating,
            itemTitle,
            type: r.type,
          };
        })
      );

      const topRated = reviewData.filter((r) => r.rating >= 4);

      const context = [
       `Danh sách sách:\n${books
          .map(
            (b) =>
              `- Tên: ${b.title}\n  Tác giả: ${b.author}\n  Năm: ${b.publishedYear}\n  Mô tả: ${b.description || "Không có"}\n  Giá: ${b.price || "Không rõ"} VND\n  Còn lại: ${b.quantity - b.sold} cuốn\n  Danh mục: ${b.category?.name || "Không có"}`
          )
          .join("\n")}`,
        `Danh sách tài liệu:\n${docs.map((d) => `-Tên ${d.title} \n Mô tả: ${d.description} || "Không có" \n Người đăng: ${d.uploadedBy}`)
          .join("\n")}`,
        `Các đánh giá gần đây:\n${reviewData
          .map(
            (r) =>
              `${r.username} đánh giá ${
                r.type === "book" ? "sách" : "tài liệu"
              } "${r.itemTitle}" ${r.rating} sao: "${r.comment}"`
          )
          .join("\n")}`,
        topRated.length > 0
          ? `${topRated
              .map((r) => `"${r.itemTitle}" (${r.rating} sao)`)
              .join("\n")}`
          : "",
      ].join("\n");
      

      const geminiRes = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: CHATBOT_SYSTEM + "\n" + context + "\n" + message,
                },
              ],
            },
          ],
        },
        {
          params: { key: process.env.GEMINI_API_KEY },
          headers: { "Content-Type": "application/json" },
        }
      );

      let reply = "";
      if (
        geminiRes.data &&
        geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text
      ) {
        reply = geminiRes.data.candidates[0].content.parts[0].text;
      } else {
        console.error(
          "Lỗi: Không tìm thấy câu trả lời trong phản hồi của Gemini:",
          geminiRes.data
        );
        reply = "Có lỗi xảy ra khi nhận câu trả lời.";
      }

      await ChatHistory.create({
        userId,
        question: message,
        response: reply,
        recommendations: {},
      });

      console.log(`Xử lý xong trong ${Date.now() - startTime}ms`);
      return res.status(200).json({ reply });
    } catch (err) {
      console.error("Lỗi chatbot:", err.response?.data || err.message);
      return res.status(500).json({
        message: "Lỗi khi xử lý chatbot",
        error: err.response?.data || err.message,
      });
    }
  },

  getChatHistory: async (req, res) => {
    try {
      const { userId } = req.body;
      const history = await ChatHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      return res.json(history);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
      return res
        .status(500)
        .json({ message: "Lỗi lấy lịch sử", error: err.message });
    }
  },
};

module.exports = chatbotController;
