import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../hooks/useDirection';
import { useCart } from '../hooks/useCart';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import Spinner from '../components/ui/Spinner';
import api from '../config/api';
import { FiShoppingCart, FiSearch, FiMenu, FiX } from 'react-icons/fi';

export default function StorefrontLayout() {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const { count } = useCart();
  const navigate = useNavigate();
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStore();
  }, []);

  async function loadStore() {
    try {
      const { data } = await api.get('/storefront/info');
      setStoreInfo(data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('storefront.storeNotFound')}</h1>
          <p className="text-gray-500">{t('storefront.storeNotFoundMsg')}</p>
        </div>
      </div>
    );
  }

  const store = storeInfo?.store;
  const settings = storeInfo?.settings;
  const theme = storeInfo?.theme;
  const primaryColor = theme?.primary_color || '#2563eb';

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ '--store-primary': primaryColor }}>
      {/* Delivery banner */}
      <div className="text-white text-center py-2 text-sm" style={{ backgroundColor: primaryColor }}>
        {settings?.delivery_text || 'التوصيل متوفر في انوكشوط و لجميع الولايات'}
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white border-b shadow-sm z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Menu button - mobile */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 -ms-2">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              {settings?.logo ? (
                <img src={settings.logo} alt={store?.name} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  {settings?.store_name || store?.name || 'Store'}
                </span>
              )}
            </Link>

            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('storefront.searchProducts')}
                  className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400">
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className="lg:hidden p-2 text-gray-600">
                <FiSearch size={20} />
              </button>
              <LanguageSwitcher />
              <Link to="/cart" className="relative p-2 text-gray-600">
                <FiShoppingCart size={22} />
                {count > 0 && (
                  <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}>
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="mt-3 lg:hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('storefront.searchProducts')}
                className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                autoFocus
              />
            </form>
          )}

          {/* Mobile menu */}
          {menuOpen && (
            <nav className="mt-3 pb-2 lg:hidden border-t pt-3 space-y-2">
              <Link to="/" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">
                {t('nav.home')}
              </Link>
              <Link to="/products" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">
                {t('storefront.allProducts')}
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet context={{ store, settings, theme, primaryColor }} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-white font-bold mb-2">{settings?.store_name || store?.name}</h3>
              <p className="text-sm">{settings?.description}</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">{t('storefront.delivery')}</h3>
              <p className="text-sm">{settings?.delivery_text || 'التوصيل متوفر في انوكشوط و لجميع الولايات'}</p>
            </div>
            <div>
              {settings?.phone && <p className="text-sm mb-1">📞 {settings.phone}</p>}
              {settings?.whatsapp && <p className="text-sm mb-1">💬 {settings.whatsapp}</p>}
              {settings?.address && <p className="text-sm">📍 {settings.address}</p>}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
            Powered by APEX Commerce
          </div>
        </div>
      </footer>
    </div>
  );
}
