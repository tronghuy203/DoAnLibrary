const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const middlewareController = require('../controllers/middlewareController');

router.post('/chat', middlewareController.verifyToken, chatbotController.handleChat);
router.post('/history', middlewareController.verifyToken, chatbotController.getChatHistory);

module.exports = router;