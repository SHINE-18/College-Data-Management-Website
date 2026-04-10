# 🎓 VGEC CE Department Portal

A full-stack web application for the **Computer Engineering Department** of Vishwakarma Government Engineering College (VGEC). The platform serves four distinct portals — Public, Faculty, HOD, and Admin — with a dedicated Student section, all backed by a RESTful Node.js/Express API and MongoDB database.

---

## ✨ Features

### 🌐 Public Portal
- Department home page with announcements and events
- Interactive campus map with department hub navigation
- Faculty profiles with publications, achievements & qualifications
- Notice board and event listings
- Circular downloads
- Syllabus archive & academic resources

### 👨‍🏫 Faculty Portal
- Secure login (JWT-based authentication)
- Manage profile, biography, and photo
- Upload publications, achievements, and qualifications
- Post notices and events
- Manage timetables and assignments
- Apply for and track leave requests
- View student submissions

### 🏫 HOD Portal
- All Faculty portal features
- Approve/reject faculty leave requests
- Issue circulars and department-wide notices
- Manage departmental events

### 🛡️ Admin Portal
- User management (faculty & HOD accounts)
- Department management
- Site settings configuration
- Dashboard with key statistics

### 🎒 Student Portal
- Secure student login
- View timetables, notices, and assignments
- Submit assignments
- View academic results and attendance
- Access syllabus documents and resources

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB (via Mongoose) |
| Auth | JWT + bcryptjs |
| File Uploads | Multer |
| Email | Nodemailer |
| Rate Limiting | express-rate-limit |
| Validation | express-validator |

---

## 📁 Project Structure

```
CE_WEBSITE/
├── src/                        # React frontend
│   ├── pages/
│   │   ├── public/             # Public-facing pages
│   │   ├── faculty/            # Faculty portal pages
│   │   ├── hod/                # HOD portal pages
│   │   ├── admin/              # Admin portal pages
│   │   ├── student/            # Student portal pages
│   │   └── auth/               # Login / auth pages
│   ├── components/             # Shared UI components
│   ├── context/                # React context (auth state)
│   ├── utils/                  # API helpers & utilities
│   └── routes/                 # Protected route wrappers
│
└── backend/
    ├── server.js               # Express app entry point
    ├── config/                 # MongoDB connection
    ├── models/                 # Mongoose schemas (19 models)
    ├── routes/                 # API route handlers (17 route files)
    ├── middleware/             # Auth, error handling, rate limiting
    ├── utils/                  # Email & helper utilities
    └── uploads/                # Uploaded files (PDFs, images)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/SHINE-18/College-Data-Management-Website.git
cd College-Data-Management-Website
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Optional: Nodemailer config for email features
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 5. Seed the database (optional)

```bash
# Seed department data
node backend/seedDepartments.js

# Seed a default admin user
node backend/seedAdmin.js
```

### 6. Run the development servers

**Backend** (runs on `http://localhost:5000`):
```bash
cd backend
npm run dev
```

**Frontend** (runs on `http://localhost:5173`):
```bash
npm run dev
```

---

## 📡 API Endpoints

| Route | Description |
|---|---|
| `/api/auth` | User authentication (faculty/HOD/admin) |
| `/api/student-auth` | Student authentication |
| `/api/faculty` | Faculty profiles & management |
| `/api/notices` | Notices CRUD |
| `/api/events` | Events CRUD |
| `/api/circulars` | Circulars with PDF upload |
| `/api/timetables` | Timetable uploads |
| `/api/leaves` | Leave request management |
| `/api/publications` | Faculty publications |
| `/api/achievements` | Faculty achievements |
| `/api/qualifications` | Faculty qualifications |
| `/api/academics` | Syllabus & academic resources |
| `/api/departments` | Department management |
| `/api/student` | Student data & submissions |
| `/api/admin` | Admin dashboard & stats |
| `/api/settings` | Site settings |

---

## 🗄️ Data Models

`User`, `Faculty`, `Student`, `Department`, `Notice`, `Event`, `Circular`, `Timetable`, `Leave`, `Publication`, `Achievement`, `Qualification`, `Assignment`, `Submission`, `Attendance`, `Result`, `Syllabus`, `Resource`, `SiteSetting`

---

## 📦 Build for Production

```bash
# Build the React frontend
npm run build

# Start backend in production mode
cd backend
NODE_ENV=production npm start
```

In production mode, Express serves the React build (`dist/`) alongside the API.

---

## 📋 Running Tests

```bash
cd backend
npm test
```

---

## 📄 License

This project is for academic and institutional use by the CE Department, VGEC.

---

<div align="center">
  Made with ❤️ for VGEC — Computer Engineering Department
</div>
