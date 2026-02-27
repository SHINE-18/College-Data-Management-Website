import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Public
import Home from '../pages/public/Home';
import Departments from '../pages/public/Departments';
import DepartmentDetail from '../pages/public/DepartmentDetail';
import FacultyDirectory from '../pages/public/FacultyDirectory';
import FacultyProfile from '../pages/public/FacultyProfile';
import NoticeBoard from '../pages/public/NoticeBoard';
import TimetableViewer from '../pages/public/TimetableViewer';
import Events from '../pages/public/Events';
import AcademicCalendar from '../pages/public/AcademicCalendar';

// Auth
import Login from '../pages/auth/Login';

// Faculty
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import MyProfile from '../pages/faculty/MyProfile';
import Qualifications from '../pages/faculty/Qualifications';
import Publications from '../pages/faculty/Publications';
import Achievements from '../pages/faculty/Achievements';
import LeaveApplication from '../pages/faculty/LeaveApplication';
import WorkloadSheet from '../pages/faculty/WorkloadSheet';

// HOD
import HODDashboard from '../pages/hod/HODDashboard';
import ManageFaculty from '../pages/hod/ManageFaculty';
import TimetableBuilder from '../pages/hod/TimetableBuilder';
import LeaveApprovals from '../pages/hod/LeaveApprovals';
import PostCircular from '../pages/hod/PostCircular';
import Reports from '../pages/hod/Reports';

// Admin
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import ManageDepartments from '../pages/admin/ManageDepartments';
import SiteSettings from '../pages/admin/SiteSettings';

// Layouts
import PublicLayout from '../components/PublicLayout';
import PortalLayout from '../components/PortalLayout';

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/departments/:id" element={<DepartmentDetail />} />
            <Route path="/faculty" element={<FacultyDirectory />} />
            <Route path="/faculty/:id" element={<FacultyProfile />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/timetable" element={<TimetableViewer />} />
            <Route path="/events" element={<Events />} />
            <Route path="/calendar" element={<AcademicCalendar />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Faculty Portal */}
        <Route path="/faculty-portal" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><PortalLayout role="faculty" /></ProtectedRoute>}>
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="qualifications" element={<Qualifications />} />
            <Route path="publications" element={<Publications />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="leave" element={<LeaveApplication />} />
            <Route path="workload" element={<WorkloadSheet />} />
        </Route>

        {/* HOD Portal */}
        <Route path="/hod" element={<ProtectedRoute allowedRoles={['hod']}><PortalLayout role="hod" /></ProtectedRoute>}>
            <Route path="dashboard" element={<HODDashboard />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="timetable" element={<TimetableBuilder />} />
            <Route path="leave" element={<LeaveApprovals />} />
            <Route path="circular" element={<PostCircular />} />
            <Route path="reports" element={<Reports />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><PortalLayout role="super_admin" /></ProtectedRoute>}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="settings" element={<SiteSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-8xl font-bold text-primary">404</h1>
                    <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
                    <a href="/" className="mt-6 inline-block bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-500 transition">Go Home</a>
                </div>
            </div>
        } />
    </Routes>
);

export default AppRoutes;
