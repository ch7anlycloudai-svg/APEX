import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useDirection } from '../hooks/useDirection';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import {
  FiHome, FiPackage, FiGrid, FiShoppingCart, FiUsers,
  FiSettings, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';

export default function MerchantLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isRtl } = useDirection();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: t('nav.dashboard'), end: true },
    { to: '/dashboard/products', icon: FiPackage, label: t('nav.products') },
    { to: '/dashboard/categories', icon: FiGrid, label: t('nav.categories') },
    { to: '/dashboard/orders', icon: FiShoppingCart, label: t('nav.orders') },
    { to: '/dashboard/customers', icon: FiUsers, label: t('nav.customers') },
    { to: '/dashboard/appearance', icon: FiSettings, label: t('nav.appearance') },
    { to: '/dashboard/settings', icon: FiSettings, label: t('nav.settings') },
  ];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <FiMenu size={24} />
        </button>
        <h1 className="font-bold text-primary-600">APEX Commerce</h1>
        <LanguageSwitcher />
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-64 bg-white border-e shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
      } lg:z-10`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-600">APEX</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
              <FiX size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-white">
          <div className="hidden lg:block mb-2">
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut size={18} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`lg:${isRtl ? 'mr-64' : 'ml-64'} min-h-screen`} style={isRtl ? { marginRight: '' } : {}}>
        <div className="hidden lg:block" style={isRtl ? { marginRight: '16rem' } : { marginLeft: '16rem' }}>
        </div>
        <div className="lg:ps-64">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
