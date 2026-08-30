import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function StoreList() {
  const { t } = useTranslation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadStores(); }, [search]);

  async function loadStores() {
    try {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/admin/stores${params}`);
      setStores(data.data);
    } catch {} finally { setLoading(false); }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/admin/stores/${id}/status`, { status });
      toast.success('Status updated');
      loadStores();
    } catch (err) {
      toast.error('Failed to update');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.stores')}</h1>
        <input type="text" placeholder={t('common.search')} value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-auto max-w-xs" />
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{t('settings.storeName')}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Slug</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{t('common.status')}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.date')}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{store.name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-500">{store.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {store.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(store.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {store.status === 'active' ? (
                      <button onClick={() => updateStatus(store.id, 'suspended')}
                        className="text-xs text-red-600 hover:underline">{t('admin.suspend')}</button>
                    ) : (
                      <button onClick={() => updateStatus(store.id, 'active')}
                        className="text-xs text-green-600 hover:underline">{t('admin.activate')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
