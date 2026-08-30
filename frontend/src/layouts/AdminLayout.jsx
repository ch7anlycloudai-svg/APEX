import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useDirection } from '../hooks/useDirection';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { FiHome, FiShoppingBag, FiUsers, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isRtl } = useDirection();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', icon: FiHome, label: t('nav.dashboard'), end: true },
    { to: '/admin/stores', icon: FiShoppingBag, label: t('admin.stores') },
    { to: '/admin/users', icon: FiUsers, label: t('admin.users') },
  ];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <FiMenu size={24} />
        </button>
        <h1 className="font-bold">APEX Admin</h1>
        <LanguageSwitcher className="text-white" />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
      } lg:z-10`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">APEX Admin</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
              <FiX size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">{user?.name}</p>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-gray-700 text-white font-medium' : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
          <div className="hidden lg:block mb-2">
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg"
          >
            <FiLogOut size={18} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <main className="lg:ps-64">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
