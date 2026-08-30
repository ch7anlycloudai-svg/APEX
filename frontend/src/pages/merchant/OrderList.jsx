import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function OrderList() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => { loadOrders(); }, [page, filter]);

  async function loadOrders() {
    try {
      const params = new URLSearchParams({ page });
      if (filter) params.set('status', filter);
      const { data } = await api.get(`/merchant/orders?${params}`);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('orders.title')}</h1>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="input-field w-auto">
          <option value="">{t('common.all')}</option>
          {['pending','confirmed','preparing','shipped','delivered','cancelled'].map(s => (
            <option key={s} value={s}>{t(`orders.${s}`)}</option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">{t('orders.noOrders')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.orderNumber')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.customer')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.total')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/orders/${order.id}`} className="text-primary-600 font-medium">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{order.customer_name}</td>
                    <td className="px-4 py-3">{Number(order.total).toLocaleString()} MRU</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {t(`orders.${order.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
