import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useDirection } from '../../hooks/useDirection';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';

const BASE_DOMAIN = 'apexmr.shop';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  useDirection();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', storeName: '', storeSlug: ''
  });
  const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [slugError, setSlugError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.storeSlug.length < 3) {
      setSlugStatus(form.storeSlug.length > 0 ? 'invalid' : null);
      setSlugError(form.storeSlug.length > 0 ? t('auth.slugInvalid') : '');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/auth/check-slug/${form.storeSlug}`);
        if (data.data.available) {
          setSlugStatus('available');
          setSlugError('');
        } else {
          setSlugStatus('taken');
          setSlugError(data.data.error || t('auth.slugTaken'));
        }
      } catch {
        setSlugStatus('taken');
        setSlugError(t('auth.slugTaken'));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.storeSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (slugStatus !== 'available') {
      toast.error(t('auth.chooseAvailableSlug'));
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">APEX</Link>
          <p className="text-gray-500 mt-2">{t('auth.createStore')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name')}</label>
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input type="password" required minLength={8} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field" />
            </div>

            <hr className="my-2" />

            {/* Store name - separate field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.storeName')}</label>
              <input type="text" required value={form.storeName}
                onChange={e => setForm({ ...form, storeName: e.target.value })}
                className="input-field"
                placeholder={t('auth.storeNamePlaceholder')} />
            </div>

            {/* Store URL / subdomain - separate field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.storeUrl')}</label>
              <div className="flex items-center gap-0">
                <input
                  type="text"
                  required
                  value={form.storeSlug}
                  onChange={e => setForm({ ...form, storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="input-field rounded-e-none border-e-0 flex-1"
                  placeholder="my-store"
                  dir="ltr"
                />
                <span className="inline-flex items-center px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-e-lg text-sm text-gray-500 whitespace-nowrap" dir="ltr">
                  .{BASE_DOMAIN}
                </span>
              </div>

              {/* Live URL preview */}
              {form.storeSlug.length >= 3 && slugStatus === 'available' && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
                  <FiCheck size={16} />
                  <span>{t('auth.slugAvailable')}</span>
                  <span className="text-green-500 font-mono text-xs" dir="ltr">
                    https://{form.storeSlug}.{BASE_DOMAIN}
                  </span>
                </div>
              )}
              {slugStatus === 'taken' && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                  <FiX size={16} />
                  {slugError || t('auth.slugTaken')}
                </p>
              )}
              {slugStatus === 'invalid' && form.storeSlug.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">{t('auth.slugMinLength')}</p>
              )}
              {slugStatus === 'checking' && (
                <p className="mt-1 text-xs text-gray-400">{t('common.loading')}</p>
              )}
            </div>

            <button type="submit" disabled={loading || slugStatus !== 'available'} className="btn-primary w-full">
              {loading ? t('common.loading') : t('auth.createStore')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary-600 font-medium">{t('auth.loginNow')}</Link>
          </p>
        </div>

        <div className="flex justify-center mt-4">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
