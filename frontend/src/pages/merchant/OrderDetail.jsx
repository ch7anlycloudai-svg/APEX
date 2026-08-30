import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

const allStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrder(); }, [id]);

  async function loadOrder() {
    try {
      const { data } = await api.get(`/merchant/orders/${id}`);
      setOrder(data.data);
    } catch {
      navigate('/dashboard/orders');
    } finally { setLoading(false); }
  }

  async function updateStatus(status) {
    try {
      await api.put(`/merchant/orders/${id}/status`, { status });
      toast.success('Status updated');
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  }

  if (loading) return <Spinner />;
  if (!order) return null;

  return (
    <div>
      <button onClick={() => navigate('/dashboard/orders')} className="flex items-center gap-2 text-gray-500 mb-4">
        <FiArrowLeft /> {t('common.back')}
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{order.order_number}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card">
            <h2 className="font-semibold mb-4">{t('orders.items')}</h2>
            <div className="space-y-3">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {item.products?.product_images?.[0]?.url && (
                      <img src={item.products.product_images[0].url} alt="" className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium">{item.products?.name || 'Product'}</p>
                      <p className="text-sm text-gray-500">x{item.quantity} @ {Number(item.price).toLocaleString()} MRU</p>
                    </div>
                  </div>
                  <p className="font-medium">{Number(item.total).toLocaleString()} MRU</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-bold">{t('orders.total')}</span>
              <span className="font-bold text-lg">{Number(order.total).toLocaleString()} MRU</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer info */}
          <div className="card">
            <h2 className="font-semibold mb-3">{t('orders.customer')}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">{t('storefront.customerName')}:</span> {order.customer_name}</p>
              <p><span className="text-gray-500">{t('orders.phone')}:</span> {order.customer_phone}</p>
              <p><span className="text-gray-500">{t('orders.address')}:</span> {order.customer_address}</p>
              {order.notes && <p><span className="text-gray-500">{t('orders.notes')}:</span> {order.notes}</p>}
            </div>
          </div>

          {/* Status update */}
          <div className="card">
            <h2 className="font-semibold mb-3">{t('orders.updateStatus')}</h2>
            <div className="space-y-2">
              {allStatuses.map(s => (
                <button key={s} onClick={() => updateStatus(s)}
                  className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                    order.status === s ? 'bg-primary-100 text-primary-700 font-medium' : 'hover:bg-gray-50'
                  }`}>
                  {t(`orders.${s}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
