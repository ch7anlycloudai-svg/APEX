import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ProductList() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { loadProducts(); }, [page]);

  async function loadProducts() {
    try {
      const { data } = await api.get(`/merchant/products?page=${page}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('products.deleteConfirm'))) return;
    try {
      await api.delete(`/merchant/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('products.title')}</h1>
        <Link to="/dashboard/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={18} />
          {t('products.addProduct')}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">{t('products.noProducts')}</p>
          <Link to="/dashboard/products/new" className="btn-primary mt-4 inline-block">
            {t('products.addProduct')}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('products.productName')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('products.price')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('products.stock')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.product_images?.[0]?.url && (
                          <img src={product.product_images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{Number(product.price).toLocaleString()} MRU</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' :
                        product.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t(`products.${product.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/dashboard/products/${product.id}`} className="p-1.5 text-gray-400 hover:text-primary-600">
                          <FiEdit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
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
                  className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
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
