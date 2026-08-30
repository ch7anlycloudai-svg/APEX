import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' }
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();

  function changeLanguage(code) {
    i18n.changeLanguage(code);
    localStorage.setItem('apex_lang', code);
    document.documentElement.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', code);
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            i18n.language === lang.code
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
