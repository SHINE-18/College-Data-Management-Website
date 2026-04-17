import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-red-500">403</h1>
                    <p className="text-xl text-gray-600 mt-4">Access Denied</p>
                    <p className="text-gray-500 mt-2">You don't have permission to view this page.</p>
                    <a href="/" className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">Go Home</a>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
