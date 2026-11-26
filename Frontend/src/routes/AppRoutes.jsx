import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Public
import Home from '../pages/public/Home';
import Departments from '../pages/public/Departments';
import DepartmentDetail from '../pages/public/DepartmentDetail';
import FacultyDirectory from '../pages/public/FacultyDirectory';
import FacultyProfile from '../pages/public/FacultyProfile';
import NoticeBoard from '../pages/public/NoticeBoard';
import GTUCirculars from '../pages/public/GTUCirculars';
import TimetableViewer from '../pages/public/TimetableViewer';
import Events from '../pages/public/Events';
import AcademicCalendar from '../pages/public/AcademicCalendar';
import SyllabusArchive from '../pages/public/SyllabusArchive';

// Auth
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Common
import NotFound from '../pages/common/NotFound';

// Student
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const AttendanceViewer = lazy(() => import('../pages/student/AttendanceViewer'));
const GradesViewer = lazy(() => import('../pages/student/GradesViewer'));
const AssignmentUploader = lazy(() => import('../pages/student/AssignmentUploader'));
const ResourceLibrary = lazy(() => import('../pages/common/ResourceLibrary'));

// Faculty
const FacultyDashboard = lazy(() => import('../pages/faculty/FacultyDashboard'));
const MyProfile = lazy(() => import('../pages/faculty/MyProfile'));
const Qualifications = lazy(() => import('../pages/faculty/Qualifications'));
const Publications = lazy(() => import('../pages/faculty/Publications'));
const Achievements = lazy(() => import('../pages/faculty/Achievements'));
const LeaveApplication = lazy(() => import('../pages/faculty/LeaveApplication'));
const WorkloadSheet = lazy(() => import('../pages/faculty/WorkloadSheet'));
const AttendanceManager = lazy(() => import('../pages/faculty/AttendanceManager'));
const ResultUploader = lazy(() => import('../pages/faculty/ResultUploader'));
const AssignmentPoster = lazy(() => import('../pages/faculty/AssignmentPoster'));
const AcademicsManager = lazy(() => import('../pages/faculty/AcademicsManager'));
const EventManager = lazy(() => import('../pages/faculty/EventManager'));

// HOD
const HODDashboard = lazy(() => import('../pages/hod/HODDashboard'));
const ManageFaculty = lazy(() => import('../pages/hod/ManageFaculty'));
const TimetableBuilder = lazy(() => import('../pages/hod/TimetableBuilder'));
const TimetableUpload = lazy(() => import('../pages/hod/TimetableUpload'));
const LeaveApprovals = lazy(() => import('../pages/hod/LeaveApprovals'));
const PostCircular = lazy(() => import('../pages/hod/PostCircular'));
const HODDepartmentEditor = lazy(() => import('../pages/hod/HODDepartmentEditor'));
// import Reports from '../pages/hod/Reports';

// Admin
const SuperAdminDashboard = lazy(() => import('../pages/admin/SuperAdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const ManageDepartments = lazy(() => import('../pages/admin/ManageDepartments'));
const SiteSettings = lazy(() => import('../pages/admin/SiteSettings'));
const AdminImportStudents = lazy(() => import('../pages/admin/AdminImportStudents'));

// New Feature Pages

const StudentProfile = lazy(() => import('../pages/student/StudentProfile'));

// Layouts
import PublicLayout from '../components/PublicLayout';
import PortalLayout from '../components/PortalLayout';

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/department/:id" element={<DepartmentDetail />} />
            <Route path="/faculty" element={<FacultyDirectory />} />
            <Route path="/faculty/:id" element={<FacultyProfile />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/gtu-circulars" element={<GTUCirculars />} />
            <Route path="/timetable" element={<TimetableViewer />} />
            <Route path="/events" element={<Events />} />
            <Route path="/calendar" element={<AcademicCalendar />} />
            <Route path="/syllabi" element={<SyllabusArchive />} />
            {/* <Route path="/placements" element={<Placements />} /> */}
            {/* <Route path="/feedback" element={<Feedback />} /> */}
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Student Portal */}
        <Route path="/student-portal" element={<ProtectedRoute allowedRoles={['student']}><PortalLayout role="student" /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<AttendanceViewer />} />
            <Route path="results" element={<GradesViewer />} />
            <Route path="assignments" element={<AssignmentUploader />} />
            <Route path="resources" element={<ResourceLibrary />} />
            <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Faculty Portal */}
        <Route path="/faculty-portal" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><PortalLayout role="faculty" /></ProtectedRoute>}>
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="qualifications" element={<Qualifications />} />
            <Route path="publications" element={<Publications />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="leave" element={<LeaveApplication />} />
            <Route path="workload" element={<WorkloadSheet />} />
            <Route path="attendance-manager" element={<AttendanceManager />} />
            <Route path="result-uploader" element={<ResultUploader />} />
            <Route path="assignments" element={<AssignmentPoster />} />
            <Route path="resources" element={<ResourceLibrary />} />
            <Route path="academics" element={<AcademicsManager />} />
            <Route path="events" element={<EventManager />} />
        </Route>

        {/* HOD Portal */}
        <Route path="/hod" element={<ProtectedRoute allowedRoles={['hod']}><PortalLayout role="hod" /></ProtectedRoute>}>
            <Route path="dashboard" element={<HODDashboard />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="timetable" element={<TimetableBuilder />} />
            <Route path="timetable-upload" element={<TimetableUpload />} />
            <Route path="leave" element={<LeaveApprovals />} />
            <Route path="circular" element={<PostCircular />} />
            {/* <Route path="reports" element={<Reports />} /> */}
            {/* <Route path="hod-reports" element={<HODReports />} /> */}
            <Route path="attendance-manager" element={<AttendanceManager />} />
            <Route path="result-uploader" element={<ResultUploader />} />
            <Route path="assignments" element={<AssignmentPoster />} />
            <Route path="academics" element={<AcademicsManager />} />
            <Route path="events" element={<EventManager />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="qualifications" element={<Qualifications />} />
            <Route path="publications" element={<Publications />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="department-page" element={<HODDepartmentEditor />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><PortalLayout role="super_admin" /></ProtectedRoute>}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="circular" element={<PostCircular />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="import-students" element={<AdminImportStudents />} />
            <Route path="profile" element={<MyProfile />} />
        </Route>

        {/* 404 — catches all unmatched routes */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRoutes;
