const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All doctor routes require authentication
router.use(authMiddleware);

// Doctor profile
router.post('/register', doctorController.registerDoctor);
router.get('/profile', doctorController.getDoctorProfile);
router.put('/profile', doctorController.updateDoctorProfile);
router.put('/availability', doctorController.updateAvailability);

// Doctor consultations
router.get('/consultations', doctorController.getPatientConsultations);
router.put('/consultations/:consultationId', doctorController.updateConsultation);

// Patient history
router.get('/patients/:patientId/history', doctorController.getPatientHistory);

// Referrals
router.post('/referrals', doctorController.createReferral);

// Available doctors (public for patients)
router.get('/available', doctorController.getAvailableDoctors);

module.exports = router;

