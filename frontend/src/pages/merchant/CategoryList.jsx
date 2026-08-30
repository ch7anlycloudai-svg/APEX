import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import ImageUpload from '../../components/ui/ImageUpload';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function CategoryList() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', status: 'active' });

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try {
      const { data } = await api.get('/merchant/categories');
      setCategories(data.data);
    } catch {} finally { setLoading(false); }
  }

  function startEdit(cat) {
    setEditing(cat.id);
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '', status: cat.status });
    setShowForm(true);
  }

  function resetForm() {
    setEditing(null);
    setForm({ name: '', description: '', image: '', status: 'active' });
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/merchant/categories/${editing}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/merchant/categories', form);
        toast.success('Category created');
      }
      resetForm();
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/merchant/categories/${id}`);
      toast.success('Category deleted');
      loadCategories();
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('categories.title')}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> {t('categories.addCategory')}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editing ? t('categories.editCategory') : t('categories.addCategory')}</h2>
            <button onClick={resetForm}><FiX size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.categoryName')}</label>
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.description')}</label>
              <textarea rows={2} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.images')}</label>
              <ImageUpload
                images={form.image ? [form.image] : []}
                onChange={urls => setForm({ ...form, image: urls[0] || '' })}
                folder="categories"
                multiple={false}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">{t('common.save')}</button>
              <button type="button" onClick={resetForm} className="btn-secondary">{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">{t('categories.noCategories')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="card">
              {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
              <h3 className="font-semibold">{cat.name}</h3>
              {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-primary-600">
                  <FiEdit2 size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
