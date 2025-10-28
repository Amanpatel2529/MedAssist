const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid'); // Assuming you've added this import for UUIDs

class Chat {
  static async create(chatData) {
    // Assuming 'id' is a UUID (VARCHAR(36)) and must be generated here
    const chatId = uuidv4(); 
    
    const { user_id, title, chat_type = 'patient' } = chatData;

    const [result] = await pool.query(
      // NOTE: Insert 'id' into the query and values array
      'INSERT INTO chats (id, user_id, title, chat_type) VALUES (?, ?, ?, ?)', 
      [chatId, user_id, title, chat_type]
    );

    // Return the generated UUID, since result.insertId is unreliable for UUIDs
    return chatId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM chats WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByUserId(userId, limit = 6) {
    const [rows] = await pool.query(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }

  static async findAll(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return rows;
  }

  static async update(id, chatData) {
    const { title } = chatData;

    const [result] = await pool.query('UPDATE chats SET title = ?, updated_at = NOW() WHERE id = ?', [
      title,
      id,
    ]);

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM chats WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async deleteOldChats(userId, keepCount = 6) {
    // Get chats to delete (keep only the latest 'keepCount' chats)
    // FIX: Replaced LIMIT -1 with a large number (BIGINT MAX) to select all remaining rows after the offset
    const BIGINT_MAX = '18446744073709551615'; 
    
    const [chatsToDelete] = await pool.query(
      `SELECT id FROM chats WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ${BIGINT_MAX} OFFSET ?`, // The fix is applied here
      [userId, keepCount]
    );

    if (chatsToDelete.length > 0) {
      const ids = chatsToDelete.map((chat) => chat.id);
      const placeholders = ids.map(() => '?').join(',');

      await pool.query(`DELETE FROM chats WHERE id IN (${placeholders})`, ids);
    }

    return chatsToDelete.length;
  }

  static async updateTimestamp(id) {
    const [result] = await pool.query('UPDATE chats SET updated_at = NOW() WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Chat;