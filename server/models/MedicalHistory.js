const pool = require('../config/database');

class MedicalHistory {
  static async create(historyData) {
    const {
      patient_id,
      disease_name,
      symptoms,
      diagnosis,
      treatment,
      medications,
      date_diagnosed,
      date_recovered,
      notes,
    } = historyData;

    const [result] = await pool.query(
      `INSERT INTO medical_history 
       (patient_id, disease_name, symptoms, diagnosis, treatment, medications, date_diagnosed, date_recovered, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        disease_name,
        symptoms,
        diagnosis,
        treatment,
        medications,
        date_diagnosed,
        date_recovered,
        notes,
      ]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM medical_history WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByPatientId(patientId) {
    const [rows] = await pool.query(
      'SELECT * FROM medical_history WHERE patient_id = ? ORDER BY date_diagnosed DESC',
      [patientId]
    );
    return rows;
  }

  static async findRecentByPatientId(patientId, limit = 10) {
    const [rows] = await pool.query(
      'SELECT * FROM medical_history WHERE patient_id = ? ORDER BY date_diagnosed DESC LIMIT ?',
      [patientId, limit]
    );
    return rows;
  }

  static async update(id, historyData) {
    const {
      disease_name,
      symptoms,
      diagnosis,
      treatment,
      medications,
      date_diagnosed,
      date_recovered,
      notes,
    } = historyData;

    const [result] = await pool.query(
      `UPDATE medical_history 
       SET disease_name = ?, symptoms = ?, diagnosis = ?, treatment = ?, medications = ?, 
           date_diagnosed = ?, date_recovered = ?, notes = ? 
       WHERE id = ?`,
      [
        disease_name,
        symptoms,
        diagnosis,
        treatment,
        medications,
        date_diagnosed,
        date_recovered,
        notes,
        id,
      ]
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM medical_history WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async deleteByPatientId(patientId) {
    const [result] = await pool.query('DELETE FROM medical_history WHERE patient_id = ?', [
      patientId,
    ]);
    return result.affectedRows;
  }

  static async findByDisease(patientId, diseaseName) {
    const [rows] = await pool.query(
      'SELECT * FROM medical_history WHERE patient_id = ? AND disease_name LIKE ? ORDER BY date_diagnosed DESC',
      [patientId, `%${diseaseName}%`]
    );
    return rows;
  }
}

module.exports = MedicalHistory;

