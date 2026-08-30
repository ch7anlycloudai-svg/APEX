import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useDirection } from '../../hooks/useDirection';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  useDirection();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">APEX</Link>
          <p className="text-gray-500 mt-2">{t('auth.login')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 font-medium">{t('auth.registerNow')}</Link>
          </p>
        </div>

        <div className="flex justify-center mt-4">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
