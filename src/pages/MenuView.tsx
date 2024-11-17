import { restaurantService } from '../services/restaurantService';
import { useEffect, useState, startTransition } from 'react';
import type { Menu, MenuSection as MenuSectionType } from '../types/restaurant';
import { MenuSection } from '../components/MenuSection';
import { useParams } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';

function MenuView() {
  const { menuId } = useParams<{ menuId: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (menuId) {
      loadMenuData();
    }
  }, [menuId]);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await restaurantService.getMenu(menuId!);
      
      if (!data) {
        throw new Error('Menu data not found');
      }

      startTransition(() => {
        setMenu(data);
      });
    } catch (error) {
      console.error('Failed to load menu data:', error);
      setError('Failed to load menu data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error || t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-zinc-200">
          <h1 className="text-3xl font-bold text-zinc-900">{menu.name}</h1>
          {menu.description && (
            <p className="mt-2 text-zinc-600">{menu.description}</p>
          )}
        </div>

        <div className="p-6">
          {menu.sections.map((section: MenuSectionType) => (
            <MenuSection 
              key={section.id} 
              section={section} 
              currency={menu.currency} 
            />
          ))}

          {menu.sections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">{t('menu.noSections')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(MenuView);