import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';
import { FiShoppingBag, FiUsers, FiShoppingCart } from 'react-icons/fi';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const cards = [
    { label: t('admin.totalStores'), value: stats?.totalStores, icon: FiShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: t('admin.activeStores'), value: stats?.activeStores, icon: FiShoppingBag, color: 'text-green-600 bg-green-50' },
    { label: t('admin.totalMerchants'), value: stats?.totalMerchants, icon: FiUsers, color: 'text-purple-600 bg-purple-50' },
    { label: t('admin.totalOrders'), value: stats?.totalOrders, icon: FiShoppingCart, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.title')}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold">{card.value || 0}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
