require("dotenv").config();
const axios = require("axios");
const ChatHistory = require("../models/Chatbot");
const Book = require("../models/Book");
const Document = require("../models/Document");
const Review = require("../models/Review");

const CHATBOT_SYSTEM = `
Bạn là trợ lý ảo thư viện, trả lời các câu hỏi của người dùng về sách và tài liệu.
Nếu người dùng yêu cầu chi tiết hơn (ví dụ: "chi tiết hơn", "giới thiệu chi tiết", "cuốn đó") hoặc hỏi về câu hỏi trước (ví dụ: "tôi vừa hỏi gì"), hãy ưu tiên cuốn sách hoặc tài liệu được đề cập trong câu trả lời gần nhất của lịch sử trò chuyện và trả lời đúng ngữ cảnh.
Khi người dùng yêu cầu "tài liệu", chỉ sử dụng danh sách tài liệu (Document). Khi yêu cầu "sách" hoặc không chỉ định rõ, ưu tiên danh sách sách (Book).
Cung cấp thông tin chi tiết bao gồm: mô tả, tác giả, năm xuất bản, danh mục, giá, số lượng còn lại, và các đánh giá nếu có. Nếu số lượng âm, thông báo là "Hết hàng". Nếu nhận xét đánh giá không rõ ràng (ví dụ: chỉ chứa ký tự ngẫu nhiên), thông báo "Không có nhận xét chi tiết".
Nếu không có thông tin cụ thể, thông báo rõ ràng: "Hiện không có thông tin chi tiết cho mục này."
Luôn trả lời bằng tiếng Việt, ngắn gọn và rõ ràng, không sử dụng định dạng Markdown.
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
     const recentHistory = await ChatHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
      const historyContext = recentHistory
        .map((h, index) => `Câu hỏi ${index + 1}: ${h.question}\nCâu trả lời: ${h.response}`)
        .join("\n");

      const books = await Book.find({}).populate('category').lean().limit(50);
      const docs = await Document.find({ status: "approved" }).populate("uploadedBy", "username").lean().limit(50);
      const reviews = await Review.find({})
        .sort({ createdAt: -1 })
        .limit(50)
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
       `Lịch sử trò chuyện gần nhất:\n${historyContext || "Không có lịch sử trò chuyện."}`,
       `Danh sách sách:\n${books
          .map(
            (b) =>
              `- Tên: ${b.title}\n  Tác giả: ${b.author}\n  Năm: ${b.publishedYear}\n  Mô tả: ${b.description || "Không có"}\n  Giá: ${b.price || "Không rõ"} VND\n  Còn lại: ${b.quantity} cuốn\n  Danh mục: ${b.category?.name || "Không có"}`
          )
          .join("\n")}`,
        `Danh sách tài liệu:\n${docs.map((d) => `- Tên: ${d.title}\n  Mô tả: ${d.description || "Không có"}\n  Người đăng: ${d.uploadedBy?.username || "Không rõ"}`)
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
