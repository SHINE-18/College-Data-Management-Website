# 🎓 College Data Management Website

A comprehensive, role-based web portal for managing college department data — including faculty profiles, timetables, notices, events, and academic calendars. Built with **React**, **Vite**, and **Tailwind CSS**.

---

## ✨ Features

### 🌐 Public Portal
- **Home Page** — College overview with key highlights and quick navigation
- **Departments** — Browse all departments with detailed individual pages
- **Faculty Directory** — Search and view faculty profiles, qualifications & publications
- **Notice Board** — View important announcements and circulars
- **Timetable Viewer** — Interactive class timetable display
- **Events** — Upcoming and past college events
- **Academic Calendar** — Semester-wise academic schedule

### 👩‍🏫 Faculty Portal *(Login Required)*
- Dashboard with personalized stats
- Profile management
- Qualifications & publications tracking
- Achievements log
- Leave application system
- Workload sheet

### 🧑‍💼 HOD Portal *(Login Required)*
- Department dashboard & analytics
- Faculty management
- Timetable builder
- Leave approvals
- Circular/notice posting
- Department reports with **Recharts** visualizations

### 🔑 Super Admin Portal *(Login Required)*
- System-wide dashboard
- Department management (CRUD)
- Site settings & configuration

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| **Frontend** | React 18, JSX                       |
| **Bundler**  | Vite 5                              |
| **Styling**  | Tailwind CSS 3                      |
| **Routing**  | React Router DOM 6                  |
| **HTTP**     | Axios (with JWT interceptors)       |
| **Charts**   | Recharts                            |
| **Toasts**   | React Hot Toast                     |
| **Auth**     | JWT-based, role-based access control|

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx
│   ├── DepartmentCard.jsx
│   ├── FacultyCard.jsx
│   ├── NoticeCard.jsx
│   ├── StatCard.jsx
│   ├── TimetableGrid.jsx
│   └── ...
├── context/             # React context (AuthContext)
├── pages/
│   ├── public/          # Public-facing pages
│   ├── auth/            # Login page
│   ├── faculty/         # Faculty portal pages
│   ├── hod/             # HOD portal pages
│   └── admin/           # Super Admin pages
├── routes/              # Centralized route definitions
├── utils/               # Axios instance & helpers
├── index.css            # Global styles
└── main.jsx             # App entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/SHINE-18/College-Data-Management-Website.git
cd College-Data-Management-Website

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at **http://localhost:5173**.

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## 🔐 Authentication & Roles

The application uses **JWT-based authentication** with role-based access control. Three roles are supported:

| Role            | Access                                     |
|-----------------|--------------------------------------------|
| `faculty`       | Faculty portal                             |
| `hod`           | Faculty portal + HOD portal                |
| `super_admin`   | Admin portal (full system control)         |

Protected routes automatically redirect unauthenticated users to the login page.

---

## 🔗 API Configuration

The frontend expects a backend API at `/api`. Configure the base URL in `src/utils/axios.js`:

```js
const api = axios.create({
    baseURL: '/api',
});
```

> **Note**: The backend API server is not included in this repository. You will need to set up your own REST API or connect to an existing one.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for academic excellence
</p>
