import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

interface LanguageSelectProps {
  className?: string;
}

export function LanguageSelect({ className = '' }: LanguageSelectProps) {
  const { i18n } = useTranslation();

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative inline-block w-32 ${className}`}>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="appearance-none w-full bg-white border border-zinc-200 
                   hover:border-zinc-300 px-2 py-1.5 pr-8 rounded-md text-sm 
                   focus:outline-none focus:ring-1 focus:ring-zinc-500 
                   focus:border-zinc-500 cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-1.5 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
        <span>{currentLanguage.flag}</span>
      </div>
    </div>
  );
} 