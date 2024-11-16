import { restaurantService } from '../services/restaurantService';
import { useEffect, useState } from 'react';
import { Restaurant, MenuSection as MenuSectionType } from '../types/restaurant';
import { MenuSection } from '../components/MenuSection';
import { Header } from '../components/Header';
import { AuthProvider } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import React from 'react';
import { startTransition } from 'react';
import type { CurrencyCode } from '../constants/currencies';

function MenuView() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <Header
          restaurantName={restaurant?.name || ''}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 relative flex overflow-hidden pt-16">
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
              isSidebarOpen ? '' : 'hidden'
            }`}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Menu Sections</h2>
              <nav>
                {restaurant?.sections?.map((section: MenuSectionType) => (
                  <a
                    key={section.id}
                    href={`#${section.title}`}
                    className="block py-2 hover:bg-gray-100 rounded px-2"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
            {restaurant && (
              <div className="max-w-4xl mx-auto">
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