const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid'); // 👈 Import the UUID generator

class Message {
  static async create(messageData) {
    // 1. Generate the UUID for the new message ID
    const messageId = uuidv4(); 
    
    let {
      chat_id,
      sender_id,
      sender_type = 'user',
      message_text,
      message_type = 'text',
      is_critical = false,
    } = messageData;

    if (sender_type === 'ai') {
        sender_id = null; // Set to actual JavaScript null
    }

    const [result] = await pool.query(
      // 2. Add 'id' to the list of columns
      `INSERT INTO messages 
       (id, chat_id, sender_id, sender_type, message_text, message_type, is_critical) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      // 3. Add messageId as the first value
      [messageId, chat_id, sender_id, sender_type, message_text, message_type, is_critical]
    );

    // 4. Return the generated UUID, as result.insertId is for AUTO_INCREMENT
    return messageId; 
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByChatId(chatId, limit = 50) {
    const [rows] = await pool.query(
      `SELECT m.*, u.name as sender_name 
       FROM messages m 
       LEFT JOIN users u ON m.sender_id = u.id 
       WHERE m.chat_id = ? 
       ORDER BY m.created_at ASC 
       LIMIT ?`,
      [chatId, limit]
    );
    return rows;
  }

  static async findCriticalMessages(chatId) {
    const [rows] = await pool.query(
      'SELECT * FROM messages WHERE chat_id = ? AND is_critical = true ORDER BY created_at DESC',
      [chatId]
    );
    return rows;
  }

  static async update(id, messageData) {
    const { message_text, message_type } = messageData;

    const [result] = await pool.query(
      'UPDATE messages SET message_text = ?, message_type = ? WHERE id = ?',
      [message_text, message_type, id]
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async deleteByChat(chatId) {
    const [result] = await pool.query('DELETE FROM messages WHERE chat_id = ?', [chatId]);
    return result.affectedRows;
  }

  static async getConversationHistory(chatId, limit = 10) {
    const [rows] = await pool.query(
      `SELECT m.*, u.name as sender_name 
       FROM messages m 
       LEFT JOIN users u ON m.sender_id = u.id 
       WHERE m.chat_id = ? 
       ORDER BY m.created_at DESC 
       LIMIT ?`,
      [chatId, limit]
    );
    return rows.reverse();
  }
}

module.exports = Message;