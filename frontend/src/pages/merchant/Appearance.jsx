import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import ImageUpload from '../../components/ui/ImageUpload';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function Appearance() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    primary_color: '#2563eb', secondary_color: '#1e40af', hero_image: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/merchant/theme')
      .then(res => {
        const th = res.data.data;
        setForm({
          primary_color: th.primary_color || '#2563eb',
          secondary_color: th.secondary_color || '#1e40af',
          hero_image: th.hero_image || ''
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/merchant/theme', form);
      toast.success(t('settings.saved'));
    } catch {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('appearance.title')}</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('appearance.primaryColor')}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color}
                  onChange={e => setForm({ ...form, primary_color: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer" />
                <input type="text" value={form.primary_color}
                  onChange={e => setForm({ ...form, primary_color: e.target.value })}
                  className="input-field flex-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('appearance.secondaryColor')}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.secondary_color}
                  onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer" />
                <input type="text" value={form.secondary_color}
                  onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                  className="input-field flex-1" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('appearance.heroImage')}</label>
            <ImageUpload
              images={form.hero_image ? [form.hero_image] : []}
              onChange={urls => setForm({ ...form, hero_image: urls[0] || '' })}
              folder="branding" multiple={false}
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </form>
    </div>
  );
}
