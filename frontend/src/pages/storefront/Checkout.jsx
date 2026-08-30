import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';

export default function Checkout() {
  const { t } = useTranslation();
  const { primaryColor, settings } = useOutletContext();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (items.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/storefront/orders', {
        ...form,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      });
      setOrderSuccess(data.data);
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setSubmitting(false); }
  }

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <FiCheckCircle size={60} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('storefront.orderSuccess')}</h1>
        <p className="text-gray-500 mb-2">{t('storefront.orderSuccessMsg')}</p>
        <p className="font-mono text-sm text-gray-400 mb-6">{orderSuccess.order_number}</p>
        <Link to="/" className="btn-primary">{t('storefront.continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t('storefront.checkout')}</h1>

      {/* Order summary */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        {items.map(item => (
          <div key={item.product_id} className="flex justify-between py-2 text-sm border-b last:border-0">
            <span>{item.name} x{item.quantity}</span>
            <span className="font-medium">{(item.price * item.quantity).toLocaleString()} MRU</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-2 border-t font-bold">
          <span>{t('storefront.total')}</span>
          <span style={{ color: primaryColor }}>{total.toLocaleString()} MRU</span>
        </div>
      </div>

      {/* Delivery info */}
      <div className="p-4 bg-green-50 rounded-lg text-sm text-green-700 mb-6">
        🚚 {settings?.delivery_text || 'التوصيل متوفر في انوكشوط و لجميع الولايات'}
      </div>

      {/* Customer form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('storefront.customerName')} *</label>
          <input type="text" required value={form.customer_name}
            onChange={e => setForm({ ...form, customer_name: e.target.value })}
            className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('storefront.customerPhone')} *</label>
          <input type="tel" required value={form.customer_phone}
            onChange={e => setForm({ ...form, customer_phone: e.target.value })}
            className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('storefront.customerAddress')}</label>
          <textarea rows={2} value={form.customer_address}
            onChange={e => setForm({ ...form, customer_address: e.target.value })}
            className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('storefront.orderNotes')}</label>
          <textarea rows={2} value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="input-field" />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-3 rounded-xl text-white font-medium text-lg"
          style={{ backgroundColor: primaryColor }}>
          {submitting ? t('common.loading') : t('storefront.placeOrder')}
        </button>
      </form>
    </div>
  );
}
