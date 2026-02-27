import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const PortalLayout = ({ role }) => (
    <div className="min-h-screen flex bg-gray-50">
        <Sidebar role={role} />
        <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">
                <Outlet />
            </div>
        </main>
    </div>
);

export default PortalLayout;
