import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../hooks/useDirection';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { FiShoppingBag, FiPackage, FiTruck, FiGlobe } from 'react-icons/fi';

export default function Landing() {
  const { t } = useTranslation();
  useDirection();

  const features = [
    { icon: FiShoppingBag, title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { icon: FiPackage, title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { icon: FiTruck, title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
    { icon: FiGlobe, title: t('landing.feature4Title'), desc: t('landing.feature4Desc') },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">APEX</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600">
              {t('landing.login')}
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              {t('landing.createStore')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('landing.hero')}</h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">{t('landing.heroSub')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
              {t('landing.createStore')}
            </Link>
            <Link to="/login" className="border-2 border-white/50 text-white px-8 py-3 rounded-xl font-medium text-lg hover:bg-white/10 transition-colors">
              {t('landing.login')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon size={28} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white font-bold text-lg mb-2">APEX Digital Solutions</p>
          <p className="text-sm">APEX Commerce - Multi-tenant E-commerce Platform</p>
        </div>
      </footer>
    </div>
  );
}
