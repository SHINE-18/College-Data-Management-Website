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
import StudentDashboard from '../pages/student/StudentDashboard';
import AttendanceViewer from '../pages/student/AttendanceViewer';
import GradesViewer from '../pages/student/GradesViewer';
import AssignmentUploader from '../pages/student/AssignmentUploader';
import ResourceLibrary from '../pages/common/ResourceLibrary';

// Faculty
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import MyProfile from '../pages/faculty/MyProfile';
import Qualifications from '../pages/faculty/Qualifications';
import Publications from '../pages/faculty/Publications';
import Achievements from '../pages/faculty/Achievements';
import LeaveApplication from '../pages/faculty/LeaveApplication';
import WorkloadSheet from '../pages/faculty/WorkloadSheet';
import AttendanceManager from '../pages/faculty/AttendanceManager';
import ResultUploader from '../pages/faculty/ResultUploader';
import AssignmentPoster from '../pages/faculty/AssignmentPoster';
import AcademicsManager from '../pages/faculty/AcademicsManager';

// HOD
import HODDashboard from '../pages/hod/HODDashboard';
import ManageFaculty from '../pages/hod/ManageFaculty';
import TimetableBuilder from '../pages/hod/TimetableBuilder';
import TimetableUpload from '../pages/hod/TimetableUpload';
import LeaveApprovals from '../pages/hod/LeaveApprovals';
import PostCircular from '../pages/hod/PostCircular';
import Reports from '../pages/hod/Reports';

// Admin
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import ManageDepartments from '../pages/admin/ManageDepartments';
import SiteSettings from '../pages/admin/SiteSettings';
import AdminImportStudents from '../pages/admin/AdminImportStudents';

// New Feature Pages
import Placements from '../pages/Placements';
import Feedback from '../pages/Feedback';
import HODReports from '../pages/HODReports';
import StudentProfile from '../pages/student/StudentProfile';

// Layouts
import PublicLayout from '../components/PublicLayout';
import PortalLayout from '../components/PortalLayout';

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            {/* <Route path="/departments" element={<Departments />} /> temporarily removed */}
            <Route path="/department/:id" element={<DepartmentDetail />} />
            <Route path="/faculty" element={<FacultyDirectory />} />
            <Route path="/faculty/:id" element={<FacultyProfile />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/gtu-circulars" element={<GTUCirculars />} />
            <Route path="/timetable" element={<TimetableViewer />} />
            <Route path="/events" element={<Events />} />
            <Route path="/calendar" element={<AcademicCalendar />} />
            <Route path="/syllabi" element={<SyllabusArchive />} />
            {/* <Route path="/placements" element={<Placements />} />
            <Route path="/feedback" element={<Feedback />} /> */}
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
        </Route>

        {/* HOD Portal */}
        <Route path="/hod" element={<ProtectedRoute allowedRoles={['hod']}><PortalLayout role="hod" /></ProtectedRoute>}>
            <Route path="dashboard" element={<HODDashboard />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="timetable" element={<TimetableBuilder />} />
            <Route path="timetable-upload" element={<TimetableUpload />} />
            <Route path="leave" element={<LeaveApprovals />} />
            <Route path="circular" element={<PostCircular />} />
            <Route path="reports" element={<Reports />} />
            <Route path="hod-reports" element={<HODReports />} />
            <Route path="attendance-manager" element={<AttendanceManager />} />
            <Route path="result-uploader" element={<ResultUploader />} />
            <Route path="assignments" element={<AssignmentPoster />} />
            <Route path="academics" element={<AcademicsManager />} />
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
        </Route>

        {/* 404 — catches all unmatched routes */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRoutes;
