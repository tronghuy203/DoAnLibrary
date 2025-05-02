const Book = require('../models/Book');
const Document = require('../models/Document');
const Review = require('../models/Review');
const ChatHistory = require('../models/Chatbot');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const chatbotController = {
  handleChat: async (req, res) => {
    try {
      const { message, userId } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập câu hỏi hoặc yêu cầu hợp lệ' });
      }

      const books = await searchBooks(message);
      const documents = await searchDocuments(message, userId);
      const recommendations = await getRecommendations(books, documents);

      let reply = '';
      if (!recommendations.books.length && !recommendations.documents.length) {
        reply = 'Không tìm thấy sách hoặc tài liệu phù hợp với yêu cầu của bạn.';
        await ChatHistory.create({
          userId,
          question: message,
          response: reply,
          recommendations
        });
        return res.status(200).json({ reply, recommendations });
      }

      const prompt = createPrompt(message, recommendations);
      try {
        console.log('Gọi API OpenAI với prompt:', prompt);
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Bạn là một trợ lý thư viện thông minh, giúp người dùng tìm sách và tài liệu. Hãy trả lời bằng tiếng Việt, thân thiện và tự nhiên.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
        });

        reply = response.choices[0].message.content || `Dưới đây là một số sách và tài liệu phù hợp với yêu cầu "${message}":`;

        await ChatHistory.create({
          userId,
          question: message,
          response: reply,
          recommendations
        });

        res.status(200).json({ reply, recommendations });
      } catch (apiErr) {
        console.error('Lỗi OpenAI:', apiErr.message, apiErr.status);
        if (apiErr.status === 429) {
          reply = `Hệ thống OpenAI đang quá tải. Dưới đây là một số sách và tài liệu phù hợp với yêu cầu "${message}":`;
        } else {
          reply = `Có lỗi khi xử lý yêu cầu. Dưới đây là một số sách và tài liệu phù hợp với "${message}":`;
        }
        await ChatHistory.create({
          userId,
          question: message,
          response: reply,
          recommendations
        });
        return res.status(200).json({ reply, recommendations });
      }
    } catch (err) {
      console.error('Lỗi xử lý yêu cầu:', err);
      res.status(500).json({ message: 'Lỗi khi xử lý yêu cầu', error: err.message });
    }
  },

  getChatHistory: async (req, res) => {
    try {
      const { userId } = req.body;
      const history = await ChatHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const sanitizedHistory = history.map(item => ({
        userId: item.userId.toString(),
        question: item.question || "",
        response: item.response || "",
        recommendations: item.recommendations || {},
        createdAt: item.createdAt.toISOString()
      }));

      res.status(200).json(sanitizedHistory);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi lấy lịch sử trò chuyện', error: err.message });
    }
  },
};

async function searchBooks(query) {
  const keywords = query.toLowerCase().split(' ').filter(k => k);
  const categories = await require('../models/Category').find({
    name: { $regex: keywords.join('|'), $options: 'i' },
  });
  const categoryIds = categories.map(c => c._id);

  const queryObj = {
    $or: keywords.map(keyword => ({
      $or: [
        { title: { $regex: escapeRegex(keyword), $options: 'i' } },
        { author: { $regex: escapeRegex(keyword), $options: 'i' } },
        { description: { $regex: escapeRegex(keyword), $options: 'i' } },
        { category: { $in: categoryIds } },
      ],
    })),
  };

  return await Book.find(queryObj).limit(5).lean();
}

async function searchDocuments(query, userId) {
  const keywords = query.toLowerCase().split(' ').filter(k => k);
  const queryObj = {
    $or: keywords.map(keyword => ({
      $or: [
        { title: { $regex: escapeRegex(keyword), $options: 'i' } },
        { description: { $regex: escapeRegex(keyword), $options: 'i' } },
      ],
    })),
  };

  const user = await require('../models/User').findById(userId);
  if (!user || !user.admin) {
    queryObj.status = 'approved';
  }

  return await Document.find(queryObj).limit(5).lean();
}

async function getRecommendations(books, documents) {
  const bookIds = books.map((b) => b._id);
  const documentIds = documents.map((d) => d._id);

  const reviews = await Review.find({
    $or: [
      { itemId: { $in: bookIds }, type: 'book' },
      { itemId: { $in: documentIds }, type: 'document' },
    ],
  }).lean();

  const bookRecommendations = books.map((book) => {
    const bookReviews = reviews.filter((r) => r.itemId.toString() === book._id.toString() && r.type === 'book');
    const avgRating = bookReviews.length
      ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
      : 0;
    return { ...book, avgRating };
  }).sort((a, b) => b.avgRating - a.avgRating);

  const documentRecommendations = documents.map((doc) => {
    const docReviews = reviews.filter((r) => r.itemId.toString() === doc._id.toString() && r.type === 'document');
    const avgRating = docReviews.length
      ? docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length
      : 0;
    return { ...doc, avgRating };
  }).sort((a, b) => b.avgRating - a.avgRating);

  return {
    books: bookRecommendations.slice(0, 3),
    documents: documentRecommendations.slice(0, 3),
  };
}

function createPrompt(message, recommendations) {
  let prompt = `Người dùng hỏi: "${message}"\n\nGợi ý:\n`;
  if (recommendations.books.length) {
    prompt += 'Sách:\n' + recommendations.books.map((b, i) => `${i + 1}. ${b.title} (${b.avgRating.toFixed(1)}/5)`).join('\n') + '\n';
  }
  if (recommendations.documents.length) {
    prompt += 'Tài liệu:\n' + recommendations.documents.map((d, i) => `${i + 1}. ${d.title} (${d.avgRating.toFixed(1)}/5)`).join('\n') + '\n';
  }
  prompt += 'Trả lời ngắn gọn bằng tiếng Việt, sử dụng gợi ý trên, thân thiện.';
  return prompt;
}

module.exports = chatbotController;