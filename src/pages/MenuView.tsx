import { restaurantService } from '../services/restaurantService';
import { analyticsService } from '../services/analyticsService';
import { useEffect, useState, startTransition } from 'react';
import type { Menu, MenuSection as MenuSectionType, Restaurant } from '../types/restaurant';
import { MenuSection } from '../components/MenuSection';
import { useParams } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu as MenuIcon, X } from 'lucide-react';

function MenuView() {
  const { menuId } = useParams<{ menuId: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [_restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

      // Restaurant'ı da al
      const restaurantData = await restaurantService.getRestaurantByMenuId(menuId!);
      if (restaurantData) {
        setRestaurant(restaurantData);
        // Analitik tracking
        try {
          await analyticsService.trackPageView(restaurantData.restaurantId, 'menu');
          // URL'de qr parametresi varsa QR taramasını kaydet
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('qr')) {
            await analyticsService.trackQRScan(restaurantData.restaurantId);
          }
        } catch (analyticsError) {
          console.error('Analytics tracking failed:', analyticsError);
          // Analytics hatası ana işlemi etkilemesin
        }
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsSidebarOpen(false);
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
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-zinc-50">
      <div
        className={`fixed top-16 left-0 z-40 w-72 sm:w-80 lg:w-64 xl:w-72 
                    h-[calc(100vh-4rem)] bg-white shadow-lg transform 
                    transition-transform duration-300 ease-in-out 
                    lg:block ${
                      isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-4">
              {t('menu.sections')}
            </h2>
            <nav className="space-y-1.5">
              {menu.sections.map((section: MenuSectionType) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full text-left px-3 py-2.5 rounded-md 
                             text-sm sm:text-base text-zinc-700
                             hover:bg-zinc-100 hover:text-zinc-900 
                             transition-colors duration-200
                             focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="relative flex-1 lg:ml-64 xl:ml-72">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-20 left-4 z-30 p-2 bg-white rounded-md shadow-md 
                     hover:bg-zinc-50 transition-colors duration-200 lg:hidden"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-zinc-700" />
          ) : (
            <MenuIcon className="w-5 h-5 text-zinc-700" />
          )}
        </button>

        <div className="w-full lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl 
                        mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 
                        mt-16 lg:mt-0">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 border-b border-zinc-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {menu.name}
              </h1>
              {menu.description && (
                <p className="mt-2 text-sm sm:text-base text-zinc-600">
                  {menu.description}
                </p>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {menu.sections.map((section: MenuSectionType) => (
                <div 
                  id={section.id} 
                  key={section.id}
                  className="scroll-mt-24" // Scroll offset için
                >
                  <MenuSection
                    section={section}
                    currency={menu.currency}
                  />
                </div>
              ))}

              {menu.sections.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-zinc-500 text-sm sm:text-base">
                    {t('menu.noSections')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default React.memo(MenuView);