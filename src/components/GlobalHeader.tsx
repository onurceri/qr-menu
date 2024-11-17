import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Menu as MenuIcon, X, Globe, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelect } from './LanguageSelect';
import { useState } from 'react';

export function GlobalHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo ve Proje Adı - ChefHat ikonu eklendi */}
          <div className="flex items-center flex-shrink-0">
            <ChefHat className="h-8 w-8 text-zinc-900" />
            <span className="ml-2 text-lg font-semibold text-zinc-900">
              QR Menu
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                <LanguageSelect />
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
              {/* Dil Seçimi - Diğer butonlarla aynı hizada */}
              <div className="px-2">
                <button
                  className="w-full text-left px-3 py-2 rounded-md text-sm 
                             text-zinc-700 hover:bg-zinc-100 flex items-center"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="mr-2">{t('common.language')}:</span>
                  <div className="flex-1">
                    <LanguageSelect />
                  </div>
                </button>
              </div>

              {/* Profil ve Çıkış Butonları */}
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