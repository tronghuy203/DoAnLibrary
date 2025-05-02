const mongoose = require('mongoose');

const ChatbotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  response: { type: String, required: true },
  recommendations: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatBot', ChatbotSchema);