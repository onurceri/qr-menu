import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Globe, ChevronRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('common.profile')}</h1>
      
      <div className="bg-white rounded-lg shadow">
        {/* User Info Section */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-2">{t('profile.userInfo')}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* Language Selection */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">{t('common.language')}</h2>
          <div className="relative inline-block w-full max-w-xs">
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none w-full bg-white border border-zinc-200 
                       hover:border-zinc-300 px-2 py-2 pr-8 rounded-md
                       focus:outline-none focus:ring-1 focus:ring-zinc-500 
                       focus:border-zinc-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Globe className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <span>{currentLanguage.flag}</span>
            </div>
          </div>
        </div>

        {/* Restaurant Management */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{t('profile.management')}</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="w-full text-left px-4 py-3 bg-zinc-50 hover:bg-zinc-100 
                     rounded-lg flex items-center justify-between transition-colors"
          >
            <span className="text-zinc-900">{t('profile.manageRestaurants')}</span>
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
