import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Menu as MenuIcon, X, Globe, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

export function GlobalHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/restaurants');
    } else {
      navigate('/');
    }
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo ve Proje Adı - Tıklanabilir */}
          <button
            onClick={handleLogoClick}
            className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="h-8 w-8 text-zinc-900" />
            <span className="ml-2 text-lg font-semibold text-zinc-900">
              QR Menu
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                {/* Desktop Language Selector */}
                <div className="relative inline-block w-32">
                  <select
                    value={i18n.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
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
                    <Globe className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <span>{currentLanguage.flag}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/restaurants')}
                  className="btn-secondary"
                >
                  <User className="icon-responsive-xs" />
                  <span>{t('common.profile')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  <LogOut className="icon-responsive-xs" />
                  <span>{t('common.logout')}</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-zinc-700 hover:bg-zinc-100 
                         focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {user && (
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <div className="py-3 space-y-2 border-t border-zinc-200">
              {/* Mobile Language Selector */}
              <div className="px-2">
                <div className="flex items-center">
                  <div className="flex items-center text-sm text-zinc-600 min-w-[72px]">
                    <Globe className="h-4 w-4 mr-1.5" />
                    <span>{t('common.language')}:</span>
                  </div>
                  <div className="flex-1 ml-2">
                    <select
                      value={i18n.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full bg-white border border-zinc-200 px-2 py-1.5 rounded-md text-sm"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Profile Button */}
              <div className="px-2">
                <button
                  onClick={() => {
                    navigate('/restaurants');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm 
                             text-zinc-700 hover:bg-zinc-100 flex items-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('common.profile')}
                </button>
              </div>

              {/* Logout Button */}
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm 
                             text-zinc-700 hover:bg-zinc-100 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 