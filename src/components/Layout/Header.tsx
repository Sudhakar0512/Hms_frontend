import { Menu } from 'lucide-react';

export default function Header() {
  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      const isHidden = sidebar.classList.contains('-translate-x-full');
      if (isHidden) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
      } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="px-4 md:px-6 py-3 md:py-4 flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">Hospital Management System</h2>
      </div>
    </header>
  );
}
