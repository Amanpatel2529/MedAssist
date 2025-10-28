const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

// All chat routes require authentication
router.use(authMiddleware);

// Chat management
router.post('/', chatController.createChat);
router.get('/', chatController.getChatHistory);
router.get('/:chatId', chatController.getChat);
router.put('/:chatId/title', chatController.updateChatTitle);
router.delete('/:chatId', chatController.deleteChat);

// Messages
router.post('/:chatId/messages', chatController.sendMessage);

module.exports = router;

