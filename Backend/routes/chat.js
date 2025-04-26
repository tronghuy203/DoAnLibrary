const router = require("express").Router();
const chatController = require("../controllers/chatController");
const middlewareController = require("../controllers/middlewareController");

router.get("/users", middlewareController.verifyToken, chatController.getUsersForChat);
router.get("/history/:chatId", middlewareController.verifyToken, chatController.getChatHistory);
router.post("/create", middlewareController.verifyToken, chatController.createOrGetChat);

module.exports = router;