const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId/role', adminController.updateUserRole);
router.put('/users/:userId/toggle-active', adminController.toggleUserActive);
router.delete('/users/:userId', adminController.deleteUser);

// Doctor management
router.get('/doctors/pending', adminController.getPendingDoctors);
router.post('/doctors/:userId/approve', adminController.approveDoctorRegistration);

// Referrals
router.get('/referrals/critical', adminController.getCriticalReferrals);

// System stats
router.get('/stats', adminController.getSystemStats);

module.exports = router;

