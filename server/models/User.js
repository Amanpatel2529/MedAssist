const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // 👈 Import the UUID generator

class User {
  static async create(userData) {
    // 1. Generate the UUID for the 'id' field
    const userId = uuidv4(); 
    
    const { name, email, password, role = 'patient', phone, age, gender } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      // 2. Add 'id' to the list of columns
      'INSERT INTO users (id, name, email, password, role, phone, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      // 3. Pass the generated userId as the first value
      [userId, name, email, hashedPassword, role, phone, age, gender]
    );

    // 4. Return the generated ID instead of result.insertId
    //    (since result.insertId is for AUTO_INCREMENT fields, not UUIDs)
    return userId; 
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll(role = null) {
    let query = 'SELECT id, name, email, role, phone, age, gender, is_active, created_at FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, userData) {
    const { name, phone, age, gender, medical_history, profile_image } = userData;

    const [result] = await pool.query(
      'UPDATE users SET name = ?, phone = ?, age = ?, gender = ?, medical_history = ?, profile_image = ? WHERE id = ?',
      [name, phone, age, gender, medical_history, profile_image, id]
    );

    return result.affectedRows > 0;
  }

  static async updateRole(id, role) {
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query('UPDATE users SET password = ? WHERE id = ?', [
      hashedPassword,
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async toggleActive(id, isActive) {
    const [result] = await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [
      isActive,
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = User;