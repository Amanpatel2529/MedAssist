const pool = require('../config/database');

class Referral {
  static async create(referralData) {
    const {
      patient_id,
      referred_doctor_id,
      reason,
      urgency = 'medium',
      status = 'pending',
    } = referralData;

    const [result] = await pool.query(
      `INSERT INTO referrals 
       (patient_id, referred_doctor_id, reason, urgency, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, referred_doctor_id, reason, urgency, status]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT r.*, 
              p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
              d.name as doctor_name, d.email as doctor_email, d.clinic_phone, d.clinic_address
       FROM referrals r
       JOIN users p ON r.patient_id = p.id
       LEFT JOIN doctors d ON r.referred_doctor_id = d.user_id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByPatientId(patientId) {
    const [rows] = await pool.query(
      `SELECT r.*, 
              d.name as doctor_name, d.email as doctor_email, d.clinic_phone, d.clinic_address
       FROM referrals r
       LEFT JOIN doctors d ON r.referred_doctor_id = d.user_id
       WHERE r.patient_id = ?
       ORDER BY r.created_at DESC`,
      [patientId]
    );
    return rows;
  }

  static async findByDoctorId(doctorId) {
    const [rows] = await pool.query(
      `SELECT r.*, 
              p.name as patient_name, p.email as patient_email, p.phone as patient_phone
       FROM referrals r
       JOIN users p ON r.patient_id = p.id
       WHERE r.referred_doctor_id = ?
       ORDER BY r.urgency DESC, r.created_at DESC`,
      [doctorId]
    );
    return rows;
  }

  static async update(id, referralData) {
    const { status, reason } = referralData;

    const [result] = await pool.query(
      'UPDATE referrals SET status = ?, reason = ?, updated_at = NOW() WHERE id = ?',
      [status, reason, id]
    );

    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE referrals SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM referrals WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByUrgency(urgency) {
    const [rows] = await pool.query(
      `SELECT r.*, 
              p.name as patient_name, p.email as patient_email,
              d.name as doctor_name, d.email as doctor_email
       FROM referrals r
       JOIN users p ON r.patient_id = p.id
       LEFT JOIN doctors d ON r.referred_doctor_id = d.user_id
       WHERE r.urgency = ?
       ORDER BY r.created_at DESC`,
      [urgency]
    );
    return rows;
  }

  static async findCriticalReferrals() {
    const [rows] = await pool.query(
      `SELECT r.*, 
              p.name as patient_name, p.email as patient_email,
              d.name as doctor_name, d.email as doctor_email
       FROM referrals r
       JOIN users p ON r.patient_id = p.id
       LEFT JOIN doctors d ON r.referred_doctor_id = d.user_id
       WHERE r.urgency IN ('high', 'critical') AND r.status = 'pending'
       ORDER BY r.urgency DESC, r.created_at ASC`
    );
    return rows;
  }
}

module.exports = Referral;

