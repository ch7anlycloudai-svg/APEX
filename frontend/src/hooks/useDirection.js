import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function useDirection() {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const lang = i18n.language;

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [dir, lang]);

  return { dir, lang, isRtl: dir === 'rtl' };
}
