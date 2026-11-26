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
College-Data-Management-Website/
├── Frontend/src/               # React frontend
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

Use Node.js 24 or newer and npm. From the repository root install both packages.

```sh
npm ci --prefix Frontend
npm ci --prefix backend
```

Create `backend/.env` with local development values.

```dotenv
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/vgec_development
JWT_SECRET=development-only-replace-before-deploying
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Run `npm run dev --prefix backend` and `npm run dev --prefix Frontend` in separate terminals. Open `http://localhost:5173`. Vite forwards API requests and legacy uploads to port 5000. File uploads and password-reset emails require the service settings in the release plan.

To bootstrap a new database, run `node seedDepartments.js` and `node seedAdmin.js` from `backend/`. The admin script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Confirm the target database before running either script.

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

## Production deployment

The Netlify frontend and Express API have separate deployments. The release plan covers host settings, verification, credential rotation and rollback. [Production readiness plan](PRODUCTION.md)

For a single-host deployment, set the production environment on the API host, run `npm run build --prefix Frontend` and start Express with `npm start --prefix backend`. Express serves `Frontend/dist` when it exists.

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
