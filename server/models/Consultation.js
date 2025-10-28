const pool = require('../config/database');

class Consultation {
  static async create(consultationData) {
    const {
      patient_id,
      doctor_id,
      chat_id,
      symptoms,
      status = 'pending',
    } = consultationData;

    const [result] = await pool.query(
      `INSERT INTO consultations 
       (patient_id, doctor_id, chat_id, symptoms, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, chat_id, symptoms, status]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, 
              p.name as patient_name, p.email as patient_email,
              d.name as doctor_name, d.email as doctor_email
       FROM consultations c
       JOIN users p ON c.patient_id = p.id
       JOIN users d ON c.doctor_id = d.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByPatientId(patientId) {
    const [rows] = await pool.query(
      `SELECT c.*, 
              d.name as doctor_name, d.email as doctor_email
       FROM consultations c
       JOIN users d ON c.doctor_id = d.id
       WHERE c.patient_id = ?
       ORDER BY c.created_at DESC`,
      [patientId]
    );
    return rows;
  }

  static async findByDoctorId(doctorId) {
    const [rows] = await pool.query(
      `SELECT c.*, 
              p.name as patient_name, p.email as patient_email
       FROM consultations c
       JOIN users p ON c.patient_id = p.id
       WHERE c.doctor_id = ?
       ORDER BY c.created_at DESC`,
      [doctorId]
    );
    return rows;
  }

  static async update(id, consultationData) {
    const { status, diagnosis, prescription, notes } = consultationData;

    const [result] = await pool.query(
      `UPDATE consultations 
       SET status = ?, diagnosis = ?, prescription = ?, notes = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, diagnosis, prescription, notes, id]
    );

    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE consultations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM consultations WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByStatus(status) {
    const [rows] = await pool.query(
      `SELECT c.*, 
              p.name as patient_name, p.email as patient_email,
              d.name as doctor_name, d.email as doctor_email
       FROM consultations c
       JOIN users p ON c.patient_id = p.id
       JOIN users d ON c.doctor_id = d.id
       WHERE c.status = ?
       ORDER BY c.created_at DESC`,
      [status]
    );
    return rows;
  }
}

module.exports = Consultation;

