const pool = require('../config/database');

class Doctor {
  static async create(doctorData) {
    const {
      user_id,
      specialization,
      license_number,
      experience_years,
      clinic_address,
      clinic_phone,
      clinic_email,
    } = doctorData;

    const [result] = await pool.query(
      `INSERT INTO doctors 
       (user_id, specialization, license_number, experience_years, clinic_address, clinic_phone, clinic_email) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, specialization, license_number, experience_years, clinic_address, clinic_phone, clinic_email]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async findAll(specialization = null) {
    let query = `SELECT d.*, u.name, u.email, u.phone 
                 FROM doctors d 
                 JOIN users u ON d.user_id = u.id`;
    const params = [];

    if (specialization) {
      query += ' WHERE d.specialization = ?';
      params.push(specialization);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, doctorData) {
    const {
      specialization,
      experience_years,
      clinic_address,
      clinic_phone,
      clinic_email,
    } = doctorData;

    const [result] = await pool.query(
      `UPDATE doctors 
       SET specialization = ?, experience_years = ?, clinic_address = ?, clinic_phone = ?, clinic_email = ? 
       WHERE id = ?`,
      [specialization, experience_years, clinic_address, clinic_phone, clinic_email, id]
    );

    return result.affectedRows > 0;
  }

  static async updateAvailability(id, status) {
    const [result] = await pool.query(
      'UPDATE doctors SET availability_status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async updateRating(id, newRating) {
    const [result] = await pool.query(
      'UPDATE doctors SET rating = ? WHERE id = ?',
      [newRating, id]
    );
    return result.affectedRows > 0;
  }

  static async incrementConsultations(id) {
    const [result] = await pool.query(
      'UPDATE doctors SET total_consultations = total_consultations + 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Doctor;

