import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = {
  en: {
    name: 'English',
    flag: '🇬🇧'
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷'
  },
  tr: {
    name: 'Türkçe',
    flag: '🇹🇷'
  }
} as const;

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = LANGUAGES[i18n.language as keyof typeof LANGUAGES] || LANGUAGES.en;

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-transparent pl-7 pr-8 py-1.5 
                 border border-zinc-200 rounded-md text-sm text-zinc-700
                 hover:border-zinc-300 focus:outline-none focus:ring-2 
                 focus:ring-zinc-500 focus:border-transparent cursor-pointer"
      >
        {Object.entries(LANGUAGES).map(([code, lang]) => (
          <option key={code} value={code}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
        <span>{currentLanguage.flag}</span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </div>
    </div>
  );
} 