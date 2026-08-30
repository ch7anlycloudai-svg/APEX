import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';

export default function CustomerList() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/merchant/customers')
      .then(res => setCustomers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('customers.title')}</h1>

      {customers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">{t('customers.noCustomers')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('storefront.customerName')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.phone')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.address')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('orders.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3">{c.address}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
