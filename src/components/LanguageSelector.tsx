import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-600">{t('common.language')}:</span>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-sm border border-zinc-300 rounded-md px-2 py-1 
                   focus:outline-none focus:ring-2 focus:ring-zinc-500 
                   focus:border-transparent bg-white"
      >
        <option value="en">English</option>
        <option value="tr">Türkçe</option>
      </select>
    </div>
  );
} 