import { restaurantService } from '../services/restaurantService';
import { useEffect, useState } from 'react';
import { Restaurant, MenuSection as MenuSectionType } from '../types/restaurant';
import { MenuSection } from '../components/MenuSection';
import { AuthProvider } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import React from 'react';
import { startTransition } from 'react';
import type { CurrencyCode } from '../constants/currencies';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function MenuView() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantData();
    }
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await restaurantService.getRestaurant(restaurantId!);
      
      if (!data) {
        throw new Error('Restaurant data not found');
      }

      startTransition(() => {
        const validatedRestaurant: Restaurant = {
          _id: data._id,
          userId: data.userId || '',
          name: data.name || '',
          sections: data.sections || [],
          currency: (data.currency || 'TRY') as CurrencyCode,
          __v: data.__v
        };
        
        setRestaurant(validatedRestaurant);
      });
    } catch (error) {
      console.error('Failed to load restaurant data:', error);
      setError('Failed to load restaurant data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="h-screen flex flex-col">
        {/* Sidebar toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed left-4 top-20 md:hidden z-50 p-2 bg-white rounded-md shadow-md"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 relative flex overflow-hidden">
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
              isSidebarOpen ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Sidebar */}
          <aside
            className={`fixed md:static w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-30 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="p-4 pt-20"> {/* Increased top padding for header */}
              <h2 className="text-xl font-bold mb-4">{t('menu.sections')}</h2>
              <nav>
                {restaurant?.sections?.map((section: MenuSectionType) => (
                  <a
                    key={section.id}
                    href={`#${section.title}`}
                    className="block py-2 hover:bg-gray-100 rounded px-2"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4 pt-20"> {/* Increased top padding for header */}
            {restaurant && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 mb-6">
                  {restaurant.name}
                </h1>
                  {restaurant.sections?.map((section: MenuSectionType) => (
                    <MenuSection
                      key={section.id}
                      section={section}
                      currency={restaurant.currency}
                    />
                  ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default React.memo(MenuView);