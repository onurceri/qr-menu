import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Edit2, Trash2, Plus, Globe, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../constants/languages';
import { v4 as uuidv4 } from 'uuid';

const ErrorAlert = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="rounded-md bg-red-50 p-4 mb-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
      <div className="ml-auto pl-3">
        <div className="-mx-1.5 -my-1.5">
          <button
            onClick={onClose}
            className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Input validation fonksiyonlarını ekleyelim
const RestaurantList = () => {
    const { user, signOut } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [newRestaurantName, setNewRestaurantName] = useState<string>('');
    const [newRestaurantDescription, setNewRestaurantDescription] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [isDeletingRestaurant, setIsDeletingRestaurant] = useState<string | null>(null);
    const [isAddingMenu, setIsAddingMenu] = useState<string | null>(null);
    const [isDeletingMenu, setIsDeletingMenu] = useState<string | null>(null);
    const { t } = useTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const validateInput = {
        restaurantName: (value: string) => {
            if (!value.trim()) return t('validation.nameRequired');
            if (value.length > 100) return t('validation.nameTooLong');
            if (/[<>{}]/g.test(value)) return t('validation.invalidCharacters');
            return null;
        },

        description: (value: string) => {
            if (value.length > 500) return t('validation.descriptionTooLong');
            if (/[<>{}]/g.test(value)) return t('validation.invalidCharacters');
            return null;
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchRestaurants = async () => {
            try {
                const fetchedRestaurants = await restaurantService.getRestaurants(user.uid);
                setRestaurants(Array.isArray(fetchedRestaurants) ? fetchedRestaurants : []);
            } catch (err) {
                setError('Failed to fetch restaurants');
                console.error(err);
                setRestaurants([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [user, navigate]);

    const handleCreateRestaurant = async () => {
        if (isCreating) return;

        try {
            // Input validasyonu
            const nameError = validateInput.restaurantName(newRestaurantName);
            const descriptionError = validateInput.description(newRestaurantDescription);

            if (nameError) {
                setError(nameError);
                return;
            }

            if (descriptionError) {
                setError(descriptionError);
                return;
            }

            setError(null);
            setIsCreating(true);

            // XSS koruması için HTML escape işlemi
            const sanitizedName = newRestaurantName.replace(/[<>]/g, '');
            const sanitizedDescription = newRestaurantDescription.replace(/[<>]/g, '');

            const response = await restaurantService.createRestaurant(user!.uid, { 
                name: sanitizedName, 
                description: sanitizedDescription
            });

            if (response.status === 201) {
                const fetchedRestaurants = await restaurantService.getRestaurants(user!.uid);
                setRestaurants(Array.isArray(fetchedRestaurants) ? fetchedRestaurants : []);
                setNewRestaurantName('');
                setNewRestaurantDescription('');
            }
        } catch (err) {
            setError('Failed to create restaurant. Please try again.');
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRestaurant = async (restaurantId: string) => {
        if (isDeletingRestaurant) return;
        
        try {
            setIsDeletingRestaurant(restaurantId);
            await restaurantService.deleteRestaurant(restaurantId);
            const fetchedRestaurants = await restaurantService.getRestaurants(user!.uid);
            setRestaurants(fetchedRestaurants);
        } catch (err) {
            setError('Failed to delete restaurant');
            console.error(err);
        } finally {
            setIsDeletingRestaurant(null);
        }
    };

    const handleCreateMenu = async (restaurantId: string, language: string) => {
        try {
            const restaurant = restaurants.find(r => r.restaurantId === restaurantId);
            if (!restaurant) return;

            // Eğer bu dilde zaten bir menü varsa, oluşturma
            if (restaurant.menus.some(menu => menu.language === language)) {
                setError(t('restaurants.menuExists'));
                return;
            }

            const menuData = {
                id: uuidv4(),
                language,
                name: restaurant.name,
                description: restaurant.description,
                sections: [],
                currency: 'TRY' as const
            };

            const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId, {
                menus: [...restaurant.menus, menuData]
            });

            // Restoran listesini güncelle
            setRestaurants(restaurants.map(r => 
                r.restaurantId === restaurantId ? updatedRestaurant : r
            ));
        } catch (err) {
            setError('Failed to create menu');
            console.error(err);
        } finally {
            setIsAddingMenu(null);
        }
    };

    const handleDeleteMenu = async (restaurantId: string, menuId: string) => {
        try {
            const restaurant = restaurants.find(r => r.restaurantId === restaurantId);
            if (!restaurant) return;

            setIsDeletingMenu(menuId);
            
            // Menüyü filtrele
            const updatedMenus = restaurant.menus.filter(menu => menu.id !== menuId);
            
            // Restoranı güncelle
            const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId, {
                menus: updatedMenus
            });

            // Restoran listesini güncelle
            setRestaurants(restaurants.map(r => 
                r.restaurantId === restaurantId ? updatedRestaurant : r
            ));
        } catch (err) {
            setError('Failed to delete menu');
            console.error(err);
        } finally {
            setIsDeletingMenu(null);
        }
    };

    // Add this helper function at the component level
    const hasAllSupportedLanguageMenus = (restaurant: Restaurant) => {
        return restaurant.menus.length >= SUPPORTED_LANGUAGES.length;
    };

    // Click-outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAddingMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    if (error) {
        return <div>{t('common.error')}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">{t('restaurants.title')}</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">{t('restaurants.addNew')}</h2>
                {error && (
                    <ErrorAlert 
                        message={error} 
                        onClose={() => setError(null)} 
                    />
                )}
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={newRestaurantName} 
                        onChange={(e) => {
                            const value = e.target.value;
                            setNewRestaurantName(value);
                            const error = validateInput.restaurantName(value);
                            if (error) setError(error);
                            else setError(null);
                        }}
                        maxLength={100}
                        placeholder={t('restaurants.name')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent
                            ${error ? 'border-red-300' : 'border-zinc-300'}`}
                    />
                    <input 
                        type="text" 
                        value={newRestaurantDescription} 
                        onChange={(e) => {
                            const value = e.target.value;
                            setNewRestaurantDescription(value);
                            const error = validateInput.description(value);
                            if (error) setError(error);
                            else setError(null);
                        }}
                        maxLength={500}
                        placeholder={t('restaurants.description')}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    />
                    <button 
                        onClick={handleCreateRestaurant} 
                        disabled={isCreating}
                        className="btn flex items-center space-x-2"
                    >
                        {isCreating ? (
                            <span className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{t('restaurants.creating')}</span>
                            </span>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                <span>{t('restaurants.add')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {restaurants.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-zinc-200 text-center">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-zinc-900 mb-2">
                            {t('restaurants.noRestaurants')}
                        </h3>
                        <p className="text-zinc-600 mb-4">
                            {t('restaurants.noRestaurantsDesc')}
                        </p>
                        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                            <p className="text-sm text-zinc-500">
                                {t('restaurants.tip')}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant.restaurantId} className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-semibold text-zinc-900">{restaurant.name}</h2>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => navigate(`/restaurant/${restaurant.restaurantId}`)}
                                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                                title={t('restaurants.view')}
                                            >
                                                <Eye className="w-5 h-5 text-zinc-600" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/restaurant/${restaurant.restaurantId}/edit`)}
                                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                                title={t('restaurants.edit')}
                                            >
                                                <Edit2 className="w-5 h-5 text-zinc-600" />
                                            </button>
                                        </div>
                                    </div>
                                    {restaurant.description && (
                                        <p className="mt-1 text-zinc-600">{restaurant.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                                        disabled={isDeletingRestaurant === restaurant.restaurantId}
                                        className="p-2 hover:bg-red-100 rounded-full transition-colors"
                                        title={t('restaurants.delete')}
                                    >
                                        {isDeletingRestaurant === restaurant.restaurantId ? (
                                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5 text-red-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Menü Listesi */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-medium text-zinc-800">
                                        <Globe className="inline-block w-5 h-5 mr-2" />
                                        {t('restaurants.menus')}
                                    </h3>
                                    {!hasAllSupportedLanguageMenus(restaurant) && (
                                        <button
                                            onClick={() => setIsAddingMenu(restaurant.restaurantId)}
                                            className="btn-secondary-sm"
                                        >
                                            <PlusCircle className="w-4 h-4 mr-1" />
                                            {t('restaurants.addMenu')}
                                        </button>
                                    )}
                                </div>

                                {/* Menü Ekleme Dropdown'ı */}
                                {isAddingMenu === restaurant.restaurantId && (
                                    <div 
                                        ref={dropdownRef}
                                        className="mt-2 p-4 bg-zinc-50 rounded-lg border border-zinc-200"
                                    >
                                        <h4 className="text-sm font-medium text-zinc-700 mb-2">
                                            {t('restaurants.selectLanguage')}
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {SUPPORTED_LANGUAGES.map((lang: SupportedLanguage) => {
                                                const hasMenu = restaurant.menus.some(
                                                    menu => menu.language === lang.code
                                                );
                                                return (
                                                    <button
                                                        key={lang.code}
                                                        onClick={() => handleCreateMenu(restaurant.restaurantId, lang.code)}
                                                        disabled={hasMenu}
                                                        className={`flex items-center p-2 rounded ${
                                                            hasMenu 
                                                                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                                                                : 'bg-white hover:bg-zinc-50 text-zinc-700'
                                                        }`}
                                                    >
                                                        <span className="mr-2">{lang.flag}</span>
                                                        <span>{lang.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Mevcut Menüler */}
                                <div className="space-y-2 mt-4">
                                    {restaurant.menus.length === 0 ? (
                                        <p className="text-zinc-500 text-sm">
                                            {t('restaurants.noMenus')}
                                        </p>
                                    ) : (
                                        restaurant.menus.map(menu => {
                                            const language = SUPPORTED_LANGUAGES.find(
                                                (lang: SupportedLanguage) => lang.code === menu.language
                                            );
                                            return (
                                                <div key={menu.id} 
                                                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                                                >
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{language?.flag}</span>
                                                        <span className="text-zinc-700">
                                                            {t('restaurants.menuInLanguage', { language: language?.name })}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => navigate(`/menu/${menu.id}`)}
                                                            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                                            title={t('common.view')}
                                                        >
                                                            <Eye className="w-5 h-5 text-zinc-600" />
                                                        </button>
                                                        <button 
                                                            onClick={() => navigate(`/edit/menu/${menu.id}`)}
                                                            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                                            title={t('common.edit')}
                                                        >
                                                            <Edit2 className="w-5 h-5 text-zinc-600" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteMenu(restaurant.restaurantId, menu.id)}
                                                            disabled={isDeletingMenu === menu.id}
                                                            className="p-2 hover:bg-red-100 rounded-full transition-colors"
                                                            title={t('common.delete')}
                                                        >
                                                            {isDeletingMenu === menu.id ? (
                                                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-5 h-5 text-red-600" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantList;