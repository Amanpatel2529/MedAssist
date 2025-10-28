const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail(email, 'Password Reset Request', htmlContent);
};

const sendDoctorApprovalEmail = async (email, doctorName) => {
  const htmlContent = `
    <h2>Doctor Account Approved</h2>
    <p>Dear ${doctorName},</p>
    <p>Your doctor account has been approved by the admin. You can now log in and start consulting patients.</p>
    <p>Best regards,<br>Medical Chat Bot Team</p>
  `;

  return sendEmail(email, 'Doctor Account Approved', htmlContent);
};

const sendReferralEmail = async (doctorEmail, patientName, reason, urgency) => {
  const htmlContent = `
    <h2>New Patient Referral</h2>
    <p>You have received a new patient referral:</p>
    <p><strong>Patient Name:</strong> ${patientName}</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p><strong>Urgency:</strong> <span style="color: ${urgency === 'critical' ? 'red' : 'orange'}">${urgency.toUpperCase()}</span></p>
    <p>Please log in to the Medical Chat Bot to view more details and respond to the referral.</p>
  `;

  return sendEmail(doctorEmail, 'New Patient Referral', htmlContent);
};

const sendConsultationNotification = async (email, doctorName, consultationDetails) => {
  const htmlContent = `
    <h2>Consultation Scheduled</h2>
    <p>Your consultation with Dr. ${doctorName} has been scheduled.</p>
    <p><strong>Details:</strong></p>
    <p>${consultationDetails}</p>
    <p>Please log in to the Medical Chat Bot to view more information.</p>
  `;

  return sendEmail(email, 'Consultation Scheduled', htmlContent);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendDoctorApprovalEmail,
  sendReferralEmail,
  sendConsultationNotification,
};

