import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPackage, FiShoppingCart, FiClock, FiUsers, FiExternalLink } from 'react-icons/fi';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';

export default function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/merchant/dashboard')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const stats = data?.stats || {};
  const store = data?.store || {};

  const cards = [
    { label: t('dashboard.totalProducts'), value: stats.totalProducts, icon: FiPackage, color: 'text-blue-600 bg-blue-50' },
    { label: t('dashboard.totalOrders'), value: stats.totalOrders, icon: FiShoppingCart, color: 'text-green-600 bg-green-50' },
    { label: t('dashboard.pendingOrders'), value: stats.pendingOrders, icon: FiClock, color: 'text-orange-600 bg-orange-50' },
    { label: t('dashboard.totalCustomers'), value: stats.totalCustomers, icon: FiUsers, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div>
      {/* Store URL banner */}
      <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-800">{t('dashboard.yourStore')}</h2>
          <p className="text-sm text-primary-600">{store.slug}.{window.location.hostname.includes('localhost') ? 'apexmr.store' : window.location.hostname.split('.').slice(-2).join('.')}</p>
        </div>
        <a href={`/`} target="_blank" rel="noopener noreferrer"
          className="btn-primary flex items-center gap-2 text-sm">
          <FiExternalLink size={16} />
          {t('common.viewStore')}
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
