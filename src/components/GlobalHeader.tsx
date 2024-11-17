import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

export function GlobalHeader() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const handleLogoClick = () => {
    if (user) {
      navigate('/restaurants');
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-14 sm:h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="icon-responsive-xl text-zinc-900" />
            <span className="text-responsive-xl font-semibold text-zinc-900">QR Menu</span>
          </button>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            {user && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => navigate('/restaurants')}
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 
                           border border-zinc-300 rounded-md shadow-sm 
                           text-responsive-sm font-medium text-zinc-700 
                           bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-zinc-500 transition-colors 
                           duration-200 space-x-1.5 sm:space-x-2"
                >
                  <User className="icon-responsive-xs" />
                  <span>{t('common.profile')}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 
                           border border-zinc-300 rounded-md shadow-sm 
                           text-responsive-sm font-medium text-zinc-700 
                           bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-zinc-500 transition-colors 
                           duration-200 space-x-1.5 sm:space-x-2"
                >
                  <LogOut className="icon-responsive-xs" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 