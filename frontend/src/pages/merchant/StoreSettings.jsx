import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import ImageUpload from '../../components/ui/ImageUpload';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function StoreSettings() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    store_name: '', logo: '', description: '', phone: '', whatsapp: '',
    address: '', delivery_text: 'التوصيل متوفر في انوكشوط و لجميع الولايات',
    currency: 'MRU', default_language: 'ar', seo_title: '', seo_description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/merchant/settings')
      .then(res => {
        const s = res.data.data;
        setForm({
          store_name: s.store_name || '', logo: s.logo || '',
          description: s.description || '', phone: s.phone || '',
          whatsapp: s.whatsapp || '', address: s.address || '',
          delivery_text: s.delivery_text || 'التوصيل متوفر في انوكشوط و لجميع الولايات',
          currency: s.currency || 'MRU', default_language: s.default_language || 'ar',
          seo_title: s.seo_title || '', seo_description: s.seo_description || ''
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/merchant/settings', form);
      toast.success(t('settings.saved'));
    } catch (err) {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.storeName')}</label>
            <input type="text" value={form.store_name}
              onChange={e => setForm({ ...form, store_name: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('appearance.logo')}</label>
            <ImageUpload
              images={form.logo ? [form.logo] : []}
              onChange={urls => setForm({ ...form, logo: urls[0] || '' })}
              folder="branding" multiple={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.description')}</label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.phone')}</label>
              <input type="text" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.whatsapp')}</label>
              <input type="text" value={form.whatsapp}
                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.address')}</label>
            <input type="text" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.deliveryText')}</label>
            <input type="text" value={form.delivery_text}
              onChange={e => setForm({ ...form, delivery_text: e.target.value })}
              className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.currency')}</label>
              <input type="text" value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.language')}</label>
              <select value={form.default_language}
                onChange={e => setForm({ ...form, default_language: e.target.value })}
                className="input-field">
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">SEO</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.seoTitle')}</label>
            <input type="text" value={form.seo_title}
              onChange={e => setForm({ ...form, seo_title: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.seoDescription')}</label>
            <textarea rows={2} value={form.seo_description}
              onChange={e => setForm({ ...form, seo_description: e.target.value })}
              className="input-field" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </form>
    </div>
  );
}
