import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import ImageUpload from '../../components/ui/ImageUpload';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_price: '',
    stock: '0', sku: '', category_id: '', status: 'active', images: []
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEdit) loadProduct();
  }, [id]);

  async function loadCategories() {
    try {
      const { data } = await api.get('/merchant/categories');
      setCategories(data.data);
    } catch {}
  }

  async function loadProduct() {
    try {
      const { data } = await api.get(`/merchant/products/${id}`);
      const p = data.data;
      setForm({
        name: p.name, description: p.description || '', price: String(p.price),
        compare_price: p.compare_price ? String(p.compare_price) : '',
        stock: String(p.stock), sku: p.sku || '', category_id: p.category_id || '',
        status: p.status, images: p.product_images?.map(i => i.url) || []
      });
    } catch (err) {
      toast.error('Product not found');
      navigate('/dashboard/products');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock, 10),
        category_id: form.category_id || null
      };
      if (isEdit) {
        await api.put(`/merchant/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/merchant/products', payload);
        toast.success('Product created');
      }
      navigate('/dashboard/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t('products.editProduct') : t('products.addProduct')}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.productName')}</label>
            <input type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.description')}</label>
            <textarea rows={4} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.price')} (MRU)</label>
              <input type="number" required step="0.01" min="0" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.comparePrice')}</label>
              <input type="number" step="0.01" min="0" value={form.compare_price}
                onChange={e => setForm({ ...form, compare_price: e.target.value })}
                className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.stock')}</label>
              <input type="number" min="0" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.sku')}</label>
              <input type="text" value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.category')}</label>
              <select value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="input-field">
                <option value="">—</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
              <select value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="input-field">
                <option value="active">{t('products.active')}</option>
                <option value="draft">{t('products.draft')}</option>
                <option value="inactive">{t('products.inactive')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">{t('products.images')}</label>
          <ImageUpload images={form.images} onChange={images => setForm({ ...form, images })} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? t('common.loading') : t('common.save')}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/products')} className="btn-secondary">
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
