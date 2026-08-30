import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';
import { useCart } from '../../hooks/useCart';
import { FiShoppingCart } from 'react-icons/fi';

export default function Home() {
  const { t } = useTranslation();
  const { settings, theme, primaryColor } = useOutletContext();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/storefront/products?limit=12'),
      api.get('/storefront/categories')
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Hero */}
      {theme?.hero_image ? (
        <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
          <img src={theme.hero_image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{settings?.store_name}</h1>
              <p className="text-sm md:text-lg opacity-90">{settings?.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-10 px-4 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${theme?.secondary_color || '#1e40af'})` }}>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{settings?.store_name}</h1>
          <p className="text-white/80 text-sm md:text-lg">{settings?.description}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <Link to="/products"
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border hover:bg-gray-50 transition-colors">
                {t('common.all')}
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}
                  className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border hover:bg-gray-50 transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        <h2 className="text-xl font-bold mb-4">{t('storefront.allProducts')}</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">{t('storefront.noProducts')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow group">
                <Link to={`/products/${product.slug}`}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.product_images?.[0]?.url ? (
                      <img src={product.product_images[0].url} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FiShoppingCart size={40} />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm" style={{ color: primaryColor }}>
                      {Number(product.price).toLocaleString()} MRU
                    </span>
                    {product.compare_price && (
                      <span className="text-xs text-gray-400 line-through">
                        {Number(product.compare_price).toLocaleString()} MRU
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addItem(product)}
                    className="w-full py-2 rounded-lg text-white text-sm font-medium transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t('storefront.addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/products" className="btn-secondary">
              {t('storefront.allProducts')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
