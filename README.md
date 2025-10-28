# Medical Chat Bot Application

A comprehensive medical chat bot application built with Angular 19 frontend and Node.js backend, powered by Google's Gemini API.

## Features

### For Patients
- **AI Medical Assistant**: Chat with an intelligent medical AI for health advice
- **Chat History**: Keep up to 6 chat conversations (like ChatGPT, Gemini, Claude)
- **Medical Information**: Get information about symptoms, diseases, and treatments
- **Critical Alert System**: Receive alerts for critical health conditions
- **Doctor Referral**: Get referred to specialist doctors when needed

### For Doctors
- **Doctor Registration**: Register as a medical professional
- **Patient Consultations**: Manage patient consultations
- **Patient History**: View complete medical history of patients
- **Referrals**: Create referrals to other specialists
- **Availability Status**: Update your availability status
- **Consultation Management**: Update consultation status, diagnosis, and prescriptions

### For Admins
- **User Management**: Manage all users (patients, doctors, admins)
- **Doctor Approval**: Approve doctor registrations
- **Role Assignment**: Assign roles to users
- **System Statistics**: View system-wide statistics
- **Critical Referrals**: Monitor critical referrals

## Tech Stack

### Frontend
- **Angular 19**: Modern web framework
- **TypeScript**: Type-safe development
- **CSS3**: Responsive styling
- **RxJS**: Reactive programming

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MySQL**: Relational database
- **Google Gemini API**: AI content generation
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Nodemailer**: Email notifications

## Project Structure

```
Medical_Chat_Bot/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── chat/
│   │   │   │   ├── profile/
│   │   │   │   ├── doctor-dashboard/
│   │   │   │   └── admin-dashboard/
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── chat.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── app.routes.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.ts
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   ├── main.ts
│   │   └── index.html
│   ├── package.json
│   └── angular.json
│
└── server/                 # Node.js backend
    ├── config/
    │   ├── database.js
    │   ├── gemini.js
    │   └── initDatabase.js
    ├── controllers/
    │   ├── authController.js
    │   ├── chatController.js
    │   ├── doctorController.js
    │   └── adminController.js
    ├── models/
    │   ├── User.js
    │   ├── Doctor.js
    │   ├── Chat.js
    │   ├── Message.js
    │   ├── Consultation.js
    │   ├── Referral.js
    │   └── MedicalHistory.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   ├── doctorRoutes.js
    │   └── adminRoutes.js
    ├── middleware/
    │   ├── auth.js
    │   ├── errorHandler.js
    │   └── validation.js
    ├── utils/
    │   ├── geminiAI.js
    │   └── emailService.js
    ├── server.js
    ├── .env
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- Google Gemini API Key
- Gmail account (for email notifications)

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env` file and update with your credentials:
   ```bash
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=medical_chatbot_db
   
   # JWT
   JWT_SECRET=your_secret_key
   
   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # Email
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

4. **Initialize database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   # or
   npm start
   ```

The application will be available at `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Chat
- `POST /api/chats` - Create new chat
- `GET /api/chats` - Get chat history
- `GET /api/chats/:chatId` - Get specific chat
- `POST /api/chats/:chatId/messages` - Send message
- `DELETE /api/chats/:chatId` - Delete chat
- `PUT /api/chats/:chatId/title` - Update chat title

### Doctor
- `POST /api/doctors/register` - Register as doctor
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/consultations` - Get consultations
- `PUT /api/doctors/consultations/:id` - Update consultation
- `GET /api/doctors/patients/:patientId/history` - Get patient history
- `POST /api/doctors/referrals` - Create referral
- `GET /api/doctors/available` - Get available doctors

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/toggle-active` - Toggle user active status
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/doctors/pending` - Get pending doctors
- `POST /api/admin/doctors/:userId/approve` - Approve doctor
- `GET /api/admin/referrals/critical` - Get critical referrals
- `GET /api/admin/stats` - Get system statistics

## Database Schema

### Tables
- **users** - User accounts (patients, doctors, admins)
- **doctors** - Doctor profiles and specializations
- **chats** - Chat conversations
- **messages** - Chat messages
- **consultations** - Doctor-patient consultations
- **referrals** - Doctor referrals
- **medical_history** - Patient medical history
- **audit_logs** - System audit logs

## Usage

### Patient Flow
1. Register as a patient
2. Login to dashboard
3. Create a new chat
4. Ask health-related questions to the AI
5. View chat history (up to 6 chats)
6. Get referred to doctors if needed

### Doctor Flow
1. Register as a doctor (requires admin approval)
2. Complete doctor profile with specialization
3. View patient consultations
4. Access patient medical history
5. Update consultation status and prescriptions
6. Create referrals to other specialists

### Admin Flow
1. Login as admin
2. Manage users and roles
3. Approve doctor registrations
4. Monitor critical referrals
5. View system statistics

## Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_chatbot_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@medicalchatbot.com
CORS_ORIGIN=http://localhost:4200
MAX_CHAT_HISTORY=6
CRITICAL_THRESHOLD=high
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- SQL injection prevention
- Email verification for critical actions

## Future Enhancements

- Video consultation support
- Prescription management system
- Appointment scheduling
- Medical report generation
- Multi-language support
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with medical devices
- Telemedicine features

## Support

For issues and questions, please contact the development team.

## License

This project is licensed under the ISC License.

## Contributors

Aman Patel

