import { useState, useEffect } from 'react';
import { Link, useSearchParams, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';
import { useCart } from '../../hooks/useCart';
import { FiShoppingCart } from 'react-icons/fi';

export default function ProductCatalog() {
  const { t } = useTranslation();
  const { primaryColor } = useOutletContext();
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [category, search, page]);

  async function loadProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const { data } = await api.get(`/storefront/products?${params}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }

  async function loadCategories() {
    try {
      const { data } = await api.get('/storefront/categories');
      setCategories(data.data);
    } catch {}
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        <button
          onClick={() => setSearchParams(prev => { prev.delete('category'); return prev; })}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            !category ? 'text-white' : 'hover:bg-gray-50'
          }`}
          style={!category ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
        >
          {t('common.all')}
        </button>
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => setSearchParams({ category: cat.id })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              category === cat.id ? 'text-white' : 'hover:bg-gray-50'
            }`}
            style={category === cat.id ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t('storefront.noProducts')}</p>
      ) : (
        <>
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
                  <button onClick={() => addItem(product)}
                    className="w-full py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}>
                    {t('storefront.addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i}
                  onClick={() => setSearchParams(prev => { prev.set('page', i + 1); return prev; })}
                  className={`px-3 py-1.5 rounded text-sm ${
                    page === i + 1 ? 'text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={page === i + 1 ? { backgroundColor: primaryColor } : {}}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
