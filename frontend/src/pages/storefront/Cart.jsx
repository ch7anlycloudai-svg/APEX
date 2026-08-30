import { Link, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function Cart() {
  const { t } = useTranslation();
  const { primaryColor } = useOutletContext();
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FiShoppingCart size={60} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">{t('storefront.emptyCart')}</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">
          {t('storefront.continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t('storefront.cart')}</h1>

      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.product_id} className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                <FiShoppingCart />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <p className="text-sm font-bold" style={{ color: primaryColor }}>
                {Number(item.price).toLocaleString()} MRU
              </p>
            </div>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5">
                <FiMinus size={14} />
              </button>
              <span className="px-2 text-sm font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5">
                <FiPlus size={14} />
              </button>
            </div>
            <button onClick={() => removeItem(item.product_id)} className="p-1.5 text-red-400 hover:text-red-600">
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex justify-between text-lg font-bold">
          <span>{t('storefront.total')}</span>
          <span style={{ color: primaryColor }}>{total.toLocaleString()} MRU</span>
        </div>
      </div>

      <Link to="/checkout"
        className="block w-full py-3 rounded-xl text-white text-center font-medium text-lg"
        style={{ backgroundColor: primaryColor }}>
        {t('storefront.checkout')}
      </Link>
    </div>
  );
}
