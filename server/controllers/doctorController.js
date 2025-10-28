const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Referral = require('../models/Referral');
const MedicalHistory = require('../models/MedicalHistory');
const { sendReferralEmail, sendConsultationNotification } = require('../utils/emailService');

const registerDoctor = async (req, res) => {
  try {
    const {
      specialization,
      license_number,
      experience_years,
      clinic_address,
      clinic_phone,
      clinic_email,
    } = req.body;

    // Check if doctor already registered
    const existingDoctor = await Doctor.findByUserId(req.user.id);
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    const doctorId = await Doctor.create({
      user_id: req.user.id,
      specialization,
      license_number,
      experience_years,
      clinic_address,
      clinic_phone,
      clinic_email,
    });

    const doctor = await Doctor.findById(doctorId);

    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor,
    });
  } catch (error) {
    console.error('Register doctor error:', error);
    res.status(500).json({ message: 'Failed to register doctor', error: error.message });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ message: 'Failed to get doctor profile', error: error.message });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience_years, clinic_address, clinic_phone, clinic_email } = req.body;

    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    await Doctor.update(doctor.id, {
      specialization,
      experience_years,
      clinic_address,
      clinic_phone,
      clinic_email,
    });

    const updatedDoctor = await Doctor.findById(doctor.id);

    res.json({
      message: 'Doctor profile updated successfully',
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ message: 'Failed to update doctor profile', error: error.message });
  }
};

const getPatientConsultations = async (req, res) => {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const consultations = await Consultation.findByDoctorId(req.user.id);

    res.json({
      consultations,
      total: consultations.length,
    });
  } catch (error) {
    console.error('Get patient consultations error:', error);
    res.status(500).json({ message: 'Failed to get consultations', error: error.message });
  }
};

const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const medicalHistory = await MedicalHistory.findByPatientId(patientId);

    res.json({
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        medical_history: patient.medical_history,
      },
      medicalHistory,
    });
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({ message: 'Failed to get patient history', error: error.message });
  }
};

const updateConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { status, diagnosis, prescription, notes } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify doctor ownership
    if (consultation.doctor_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Consultation.update(consultationId, {
      status,
      diagnosis,
      prescription,
      notes,
    });

    const updatedConsultation = await Consultation.findById(consultationId);

    res.json({
      message: 'Consultation updated successfully',
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ message: 'Failed to update consultation', error: error.message });
  }
};

const createReferral = async (req, res) => {
  try {
    const { patientId, referred_doctor_id, reason, urgency = 'medium' } = req.body;

    const referralId = await Referral.create({
      patient_id: patientId,
      referred_doctor_id,
      reason,
      urgency,
    });

    const referral = await Referral.findById(referralId);

    // Send email notification
    if (referral.doctor_email) {
      await sendReferralEmail(referral.doctor_email, referral.patient_name, reason, urgency);
    }

    res.status(201).json({
      message: 'Referral created successfully',
      referral,
    });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ message: 'Failed to create referral', error: error.message });
  }
};

const getAvailableDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;

    const doctors = await Doctor.findAll(specialization);

    res.json({
      doctors,
      total: doctors.length,
    });
  } catch (error) {
    console.error('Get available doctors error:', error);
    res.status(500).json({ message: 'Failed to get doctors', error: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { status } = req.body;

    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    await Doctor.updateAvailability(doctor.id, status);

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Failed to update availability', error: error.message });
  }
};

module.exports = {
  registerDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  getPatientConsultations,
  getPatientHistory,
  updateConsultation,
  createReferral,
  getAvailableDoctors,
  updateAvailability,
};

