import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Menu as MenuIcon, X, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function GlobalHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Project Name - Clickable */}
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
                <button
                  onClick={() => navigate('/profile')}
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-900 
                       hover:bg-zinc-100 focus:outline-none focus:ring-2 
                       focus:ring-inset focus:ring-zinc-500"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
              </span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md 
                           text-base font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  <User className="inline-block h-5 w-5 mr-2" />
                  {t('common.profile')}
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md 
                           text-base font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  <LogOut className="inline-block h-5 w-5 mr-2" />
                  {t('common.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}