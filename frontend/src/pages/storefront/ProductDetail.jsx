import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';
import { useCart } from '../../hooks/useCart';
import { FiMinus, FiPlus, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { primaryColor, settings } = useOutletContext();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    api.get(`/storefront/products/${slug}`)
      .then(res => setProduct(res.data.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [slug]);

  function handleAddToCart() {
    addItem(product, quantity);
    toast.success(t('storefront.addToCart'));
  }

  if (loading) return <Spinner />;
  if (!product) return null;

  const images = product.product_images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
        <FiArrowLeft /> {t('common.back')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            {images[selectedImage]?.url ? (
              <img src={images[selectedImage].url} alt={product.name}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FiShoppingCart size={60} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                    i === selectedImage ? 'border-primary-500' : 'border-gray-200'
                  }`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

          {product.categories?.name && (
            <p className="text-sm text-gray-500 mb-3">{product.categories.name}</p>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold" style={{ color: primaryColor }}>
              {Number(product.price).toLocaleString()} MRU
            </span>
            {product.compare_price && (
              <span className="text-lg text-gray-400 line-through">
                {Number(product.compare_price).toLocaleString()} MRU
              </span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">{t('storefront.quantity')}</span>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-gray-50">
                <FiMinus size={16} />
              </button>
              <span className="px-4 py-2 font-medium min-w-[40px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}
                className="p-2.5 hover:bg-gray-50">
                <FiPlus size={16} />
              </button>
            </div>
          </div>

          <button onClick={handleAddToCart}
            className="w-full py-3 rounded-xl text-white font-medium text-lg transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}>
            <FiShoppingCart size={20} />
            {t('storefront.addToCart')}
          </button>

          {/* Delivery info */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-green-700">
            🚚 {settings?.delivery_text || 'التوصيل متوفر في انوكشوط و لجميع الولايات'}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">{t('products.description')}</h2>
              <p className="text-gray-600 text-sm whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
