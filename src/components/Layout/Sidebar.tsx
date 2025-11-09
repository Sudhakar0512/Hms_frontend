import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Home
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/rooms', label: 'Rooms', icon: Home },
  { path: '/allocations', label: 'Allocations', icon: Calendar },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 hidden" 
        id="sidebar-overlay"
        onClick={() => {
          const sidebar = document.getElementById('sidebar');
          const overlay = document.getElementById('sidebar-overlay');
          if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
          }
        }}
      ></div>
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-300 min-h-screen fixed left-0 top-0 z-30 shadow-sm transform -translate-x-full md:translate-x-0 transition-transform duration-300" id="sidebar">
        <div className="p-4 md:p-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">HMS</h1>
              <p className="text-xs text-gray-500">Hospital Management</p>
            </div>
          </div>
        </div>
        <nav className="mt-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile when link is clicked
                  const sidebar = document.getElementById('sidebar');
                  const overlay = document.getElementById('sidebar-overlay');
                  if (sidebar && overlay && window.innerWidth < 768) {
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                  }
                }}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md mb-1 transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
