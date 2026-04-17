import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
            {/* Animated 404 Number */}
            <div className="relative mb-6">
                <div className="text-[10rem] font-black leading-none select-none">
                    <span className="text-primary opacity-10 absolute inset-0 blur-2xl">404</span>
                    <span className="relative bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">404</span>
                </div>
            </div>

            {/* Illustration */}
            <div className="flex justify-center mb-6">
                <svg className="w-48 h-32 text-gray-300" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="160" height="90" rx="8" fill="currentColor" opacity="0.3" />
                    <rect x="35" y="35" width="130" height="10" rx="4" fill="currentColor" opacity="0.5" />
                    <rect x="35" y="55" width="80" height="8" rx="4" fill="currentColor" opacity="0.4" />
                    <rect x="35" y="71" width="100" height="8" rx="4" fill="currentColor" opacity="0.4" />
                    <circle cx="160" cy="30" r="20" fill="#ef4444" opacity="0.7" />
                    <text x="153" y="36" fill="white" fontSize="16" fontWeight="bold">!</text>
                </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                The page you're looking for doesn't exist or has been moved.<br />
                Let's get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    to="/"
                    className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 text-sm"
                >
                    ← Go to Homepage
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="bg-white text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
                >
                    Go Back
                </button>
            </div>
        </div>
    </div>
);

export default NotFound;
