const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { generateMedicalResponse, detectCriticalCondition } = require('../utils/geminiAI');

const createChat = async (req, res) => {
  try {
    const { title, chat_type = 'patient' } = req.body;

    // Delete old chats if user has more than 6
    await Chat.deleteOldChats(req.user.id, parseInt(process.env.MAX_CHAT_HISTORY || 6));

    const chatId = await Chat.create({
      user_id: req.user.id,
      title: title || `Chat - ${new Date().toLocaleDateString()}`,
      chat_type,
    });

    const chat = await Chat.findById(chatId);

    res.status(201).json({
      message: 'Chat created successfully',
      chat,
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Failed to create chat', error: error.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.findByUserId(req.user.id, parseInt(process.env.MAX_CHAT_HISTORY || 6));

    res.json({
      chats,
      total: chats.length,
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Failed to get chat history', error: error.message });
  }
};

const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify ownership
    if (chat.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await Message.findByChatId(chatId);

    res.json({
      chat,
      messages,
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Failed to get chat', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message_text } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify ownership
    if (chat.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Save user message
    const userMessageId = await Message.create({
      chat_id: chatId,
      sender_id: req.user.id,
      sender_type: 'user',
      message_text,
      message_type: 'text',
    });

    // Get conversation history for context
    const conversationHistory = await Message.getConversationHistory(chatId, 5);

    // Generate AI response
    const aiResponse = await generateMedicalResponse(message_text, conversationHistory);

    if (!aiResponse.success) {
      return res.status(500).json({ message: 'Failed to generate response', error: aiResponse.error });
    }

    // Save AI response
    const aiMessageId = await Message.create({
      chat_id: chatId,
      sender_id: 1, // System AI user (you may want to create a dedicated AI user)
      sender_type: 'ai',
      message_text: aiResponse.response,
      message_type: 'text',
      is_critical: aiResponse.isCritical,
    });

    // Update chat timestamp
    await Chat.updateTimestamp(chatId);

    res.json({
      userMessage: {
        id: userMessageId,
        message_text,
        sender_type: 'user',
      },
      aiMessage: {
        id: aiMessageId,
        message_text: aiResponse.response,
        sender_type: 'ai',
        is_critical: aiResponse.isCritical,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify ownership
    if (chat.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete messages first
    await Message.deleteByChat(chatId);

    // Delete chat
    await Chat.delete(chatId);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Failed to delete chat', error: error.message });
  }
};

const updateChatTitle = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify ownership
    if (chat.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Chat.update(chatId, { title });

    res.json({ message: 'Chat title updated successfully' });
  } catch (error) {
    console.error('Update chat title error:', error);
    res.status(500).json({ message: 'Failed to update chat title', error: error.message });
  }
};

module.exports = {
  createChat,
  getChatHistory,
  getChat,
  sendMessage,
  deleteChat,
  updateChatTitle,
};

