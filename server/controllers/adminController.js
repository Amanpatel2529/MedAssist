const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Referral = require('../models/Referral');
const { sendDoctorApprovalEmail } = require('../utils/emailService');

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const users = await User.findAll(role);

    res.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let doctorInfo = null;
    if (user.role === 'doctor') {
      doctorInfo = await Doctor.findByUserId(userId);
    }

    res.json({
      user,
      doctor: doctorInfo,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate role
    const validRoles = ['patient', 'doctor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await User.updateRole(userId, role);

    // Send approval email if promoting to doctor
    if (role === 'doctor') {
      await sendDoctorApprovalEmail(user.email, user.name);
    }

    const updatedUser = await User.findById(userId);

    res.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.toggleActive(userId, isActive);

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({ message: 'Failed to toggle user active', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.delete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

const getPendingDoctors = async (req, res) => {
  try {
    // Get all users with doctor role but not yet approved
    const users = await User.findAll('doctor');

    res.json({
      doctors: users,
      total: users.length,
    });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({ message: 'Failed to get pending doctors', error: error.message });
  }
};

const approveDoctorRegistration = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
    }

    // Send approval email
    await sendDoctorApprovalEmail(user.email, user.name);

    res.json({
      message: 'Doctor approved successfully',
      user,
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({ message: 'Failed to approve doctor', error: error.message });
  }
};

const getCriticalReferrals = async (req, res) => {
  try {
    const referrals = await Referral.findCriticalReferrals();

    res.json({
      referrals,
      total: referrals.length,
    });
  } catch (error) {
    console.error('Get critical referrals error:', error);
    res.status(500).json({ message: 'Failed to get critical referrals', error: error.message });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const allUsers = await User.findAll();
    const patients = await User.findAll('patient');
    const doctors = await User.findAll('doctor');
    const admins = await User.findAll('admin');
    const criticalReferrals = await Referral.findCriticalReferrals();

    res.json({
      stats: {
        totalUsers: allUsers.length,
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalAdmins: admins.length,
        criticalReferrals: criticalReferrals.length,
      },
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Failed to get system stats', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  getPendingDoctors,
  approveDoctorRegistration,
  getCriticalReferrals,
  getSystemStats,
};

