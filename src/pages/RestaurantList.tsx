import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Edit2, Trash2, Plus, Globe, PlusCircle, ChevronDown, ChevronRight, ChevronUp, BarChart2 } from 'lucide-react';
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

// Hata alert komponenti
const FormErrorAlert = ({ message }: { message: string }) => (
    <div className="text-sm text-red-600 mt-1">
        <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {message}
        </span>
    </div>
);

// Form komponenti için props interface'i
interface RestaurantFormProps {
    newRestaurantName: string;
    setNewRestaurantName: (value: string) => void;
    newRestaurantDescription: string;
    setNewRestaurantDescription: (value: string) => void;
    handleCreateRestaurant: () => void;
    isCreating: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    validateInput: {
        restaurantName: (value: string) => string | null;
        description: (value: string) => string | null;
    };
    t: (key: string) => string;
}

const MAX_DESCRIPTION_LENGTH = 500;

// Form komponenti
const RestaurantForm: React.FC<RestaurantFormProps> = ({
    newRestaurantName,
    setNewRestaurantName,
    newRestaurantDescription,
    setNewRestaurantDescription,
    handleCreateRestaurant,
    isCreating,
    error,
    setError,
    validateInput,
    t
}) => (
    <div className="space-y-4">
        <div>
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
                    ${error ? 'border-red-300 bg-red-50' : 'border-zinc-300'}`}
            />
            {error && <FormErrorAlert message={error} />}
        </div>
        <div>
            <div className="relative">
                <textarea 
                    value={newRestaurantDescription} 
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_DESCRIPTION_LENGTH) {
                            setNewRestaurantDescription(value);
                            const error = validateInput.description(value);
                            if (error) setError(error);
                            else setError(null);
                        }
                    }}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    placeholder={t('restaurants.description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent resize-none"
                />
                <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
                    {newRestaurantDescription.length}/{MAX_DESCRIPTION_LENGTH}
                </div>
            </div>
            {/* Karakter sayısı uyarısı */}
            <div className="mt-1 text-xs text-zinc-500">
                <span>{t('restaurants.descriptionHint')}</span>
            </div>
        </div>
        <button 
            onClick={handleCreateRestaurant} 
            disabled={isCreating || !!error}
            className={`btn flex items-center space-x-2 w-full justify-center
                ${(isCreating || !!error) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    const [formError, setFormError] = useState<string | null>(null);
    const [loadingLanguage, setLoadingLanguage] = useState<string | null>(null);
    const [expandedRestaurants, setExpandedRestaurants] = useState<Set<string>>(new Set());
    const [allExpanded, setAllExpanded] = useState(false);

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
                setLoading(true);
                setError(null);
                const fetchedRestaurants = await restaurantService.getRestaurants(user.uid);
                setRestaurants(fetchedRestaurants);
            } catch (err) {
                console.error('Failed to fetch restaurants:', err);
                setError(t('restaurants.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [user, navigate, t]);

    const handleCreateRestaurant = async () => {
        if (isCreating) return;

        try {
            // Boş isim kontrolü
            if (!newRestaurantName.trim()) {
                setFormError(t('validation.nameRequired'));
                return;
            }

            // Input validasyonu
            const nameError = validateInput.restaurantName(newRestaurantName);
            const descriptionError = validateInput.description(newRestaurantDescription || '');

            if (nameError) {
                setFormError(nameError);
                return;
            }

            if (descriptionError) {
                setFormError(descriptionError);
                return;
            }

            setFormError(null);
            setIsCreating(true);

            // XSS koruması için HTML escape işlemi
            const sanitizedName = newRestaurantName.trim().replace(/[<>]/g, '');
            const sanitizedDescription = (newRestaurantDescription || '').trim().replace(/[<>]/g, '');

            const response = await restaurantService.createRestaurant(user!.uid, { 
                name: sanitizedName, 
                description: sanitizedDescription // Boş string olabilir
            });

            if (response.status === 201) {
                const fetchedRestaurants = await restaurantService.getRestaurants(user!.uid);
                setRestaurants(Array.isArray(fetchedRestaurants) ? fetchedRestaurants : []);
                setNewRestaurantName('');
                setNewRestaurantDescription('');
            }
        } catch (err) {
            setFormError(t('restaurants.createError'));
            console.error('Restaurant creation error:', err);
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

    const handleLanguageSelect = async (restaurantId: string, language: string) => {
        try {
            setLoadingLanguage(language);
            setIsAddingMenu(restaurantId);
            const restaurant = restaurants.find(r => r.restaurantId === restaurantId);
            if (!restaurant) {
                console.error('Restaurant not found:', restaurantId);
                return;
            }

            if (restaurant.menus.some(menu => menu.language === language)) {
                setError(t('restaurants.menuExists'));
                return;
            }

            const response = await restaurantService.createMenu(restaurantId, {
                language,
                name: restaurant.name || 'New Menu',
                description: restaurant.description || '',
                sections: [],
                currency: 'TRY'
            });

            if (response.ok) {
                const fetchedRestaurants = await restaurantService.getRestaurants(user!.uid);
                setRestaurants(fetchedRestaurants);
            } else {
                throw new Error('Failed to create menu');
            }
        } catch (err) {
            console.error('Menu creation error:', err);
            setError(t('restaurants.menuCreateError'));
        } finally {
            setLoadingLanguage(null);
            setIsAddingMenu(null);
        }
    };

    const handleDeleteMenu = async (restaurantId: string, menuId: string) => {
        try {
            const restaurant = restaurants.find(r => r.restaurantId === restaurantId);
            if (!restaurant) return;

            setIsDeletingMenu(menuId);
            
            // Menü silme isteği at
            await restaurantService.deleteMenu(restaurantId, menuId);
            
            // Güncel restoran listesini getir
            const fetchedRestaurants = await restaurantService.getRestaurants(user!.uid);
            setRestaurants(fetchedRestaurants);
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

    // Form render'ı
    const renderRestaurantForm = () => (
        <RestaurantForm
            newRestaurantName={newRestaurantName}
            setNewRestaurantName={setNewRestaurantName}
            newRestaurantDescription={newRestaurantDescription}
            setNewRestaurantDescription={setNewRestaurantDescription}
            handleCreateRestaurant={handleCreateRestaurant}
            isCreating={isCreating}
            error={formError}
            setError={setFormError}
            validateInput={validateInput}
            t={t}
        />
    );

    const handleExpandAll = (expand: boolean) => {
        if (expand) {
            setExpandedRestaurants(new Set(restaurants.map(r => r.restaurantId)));
            setAllExpanded(true);
        } else {
            setExpandedRestaurants(new Set());
            setAllExpanded(false);
        }
    };

    const toggleRestaurant = (restaurantId: string) => {
        const newExpanded = new Set(expandedRestaurants);
        if (newExpanded.has(restaurantId)) {
            newExpanded.delete(restaurantId);
        } else {
            newExpanded.add(restaurantId);
        }
        setExpandedRestaurants(newExpanded);
        setAllExpanded(newExpanded.size === restaurants.length);
    };

    // Add this new component for truncated description
    interface TruncatedDescriptionProps {
        description: string;
        maxLength?: number;
    }

    const TruncatedDescription: React.FC<TruncatedDescriptionProps> = ({ description, maxLength = 150 }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const shouldTruncate = description.length > maxLength;
        
        const truncatedText = shouldTruncate && !isExpanded 
            ? `${description.slice(0, maxLength)}...` 
            : description;

        return (
            <div className="mt-1 text-zinc-600">
                <p className="inline">{truncatedText}</p>
                {shouldTruncate && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-1 text-zinc-800 hover:text-zinc-600 text-sm font-medium inline-flex items-center"
                    >
                        {isExpanded ? (
                            <>
                                {t('common.showLess')}
                                <ChevronUp className="w-4 h-4 ml-1" />
                            </>
                        ) : (
                            <>
                                {t('common.showMore')}
                                <ChevronDown className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-900"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                            {t('common.error')}
                        </h2>
                        <p className="text-zinc-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="btn-secondary"
                        >
                            {t('common.tryAgain')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">{t('restaurants.title')}</h1>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-zinc-200">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">{t('restaurants.addNew')}</h2>
                    {renderRestaurantForm()}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-zinc-600">{t('restaurants.noRestaurants')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">{t('restaurants.title')}</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">{t('restaurants.addNew')}</h2>
                {renderRestaurantForm()}
            </div>

            {restaurants.length > 0 && (
                <div className="flex justify-end gap-2 mb-4">
                    <button
                        onClick={() => handleExpandAll(true)}
                        className="btn-secondary-sm h-10 flex items-center justify-center space-x-2"
                        disabled={allExpanded}
                    >
                        <ChevronDown className="h-4 w-4" />
                        <span>{t('common.expandAll')}</span>
                    </button>
                    <button
                        onClick={() => handleExpandAll(false)}
                        className="btn-secondary-sm h-10 flex items-center justify-center space-x-2"
                        disabled={!allExpanded && expandedRestaurants.size === 0}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span>{t('common.collapseAll')}</span>
                    </button>
                </div>
            )}

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
                        <div key={restaurant.restaurantId} 
                            className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
                            {/* Restaurant Header - Sadece başlık ve butonlar */}
                            <div className="p-6">
                                <div className="flex flex-col gap-4">
                                    {/* Title and Toggle Row - Mobil için yeniden düzenlendi */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex items-center gap-3 min-w-0"> {/* min-w-0 text overflow için önemli */}
                                            <button
                                                onClick={() => toggleRestaurant(restaurant.restaurantId)}
                                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors flex-shrink-0"
                                            >
                                                {expandedRestaurants.has(restaurant.restaurantId) ? (
                                                    <ChevronDown className="w-5 h-5 text-zinc-600" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-zinc-600" />
                                                )}
                                            </button>
                                            <h2 className="text-xl font-semibold text-zinc-900 truncate">
                                                {restaurant.name}
                                            </h2>
                                        </div>
                                        
                                        {/* Mobile Action Bar - iOS style */}
                                        <div className="sm:hidden flex items-center justify-around w-full mt-3 pt-3 border-t border-zinc-100">
                                            <button
                                                onClick={() => navigate(`/restaurant/${restaurant.restaurantId}`)}
                                                className="flex flex-col items-center gap-1 p-2"
                                                title={t('restaurants.view')}
                                            >
                                                <Eye className="w-6 h-6 text-zinc-600" />
                                                <span className="text-xs text-zinc-600">
                                                    {t('restaurants.view')}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/restaurant/${restaurant.restaurantId}/edit`)}
                                                className="flex flex-col items-center gap-1 p-2"
                                                title={t('restaurants.edit')}
                                            >
                                                <Edit2 className="w-6 h-6 text-zinc-600" />
                                                <span className="text-xs text-zinc-600">
                                                    {t('restaurants.edit')}
                                                </span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                                                disabled={isDeletingRestaurant === restaurant.restaurantId}
                                                className="flex flex-col items-center gap-1 p-2"
                                                title={t('restaurants.delete')}
                                            >
                                                {isDeletingRestaurant === restaurant.restaurantId ? (
                                                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-6 h-6 text-red-600" />
                                                        <span className="text-xs text-red-600">
                                                            {t('restaurants.delete')}
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Desktop Action Bar */}
                                        <div className="hidden sm:flex items-center gap-1 bg-zinc-50 rounded-lg p-1 border border-zinc-100 ml-auto">
                                            <button
                                                onClick={() => navigate(`/restaurant/${restaurant.restaurantId}`)}
                                                className="p-2 hover:bg-white rounded-md transition-colors flex items-center gap-2"
                                                title={t('restaurants.view')}
                                            >
                                                <Eye className="w-5 h-5 text-zinc-600" />
                                                <span className="text-sm text-zinc-600">
                                                    {t('restaurants.view')}
                                                </span>
                                            </button>
                                            {restaurant.userId === user?.uid && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/restaurant/${restaurant.restaurantId}/analytics`)}
                                                        className="p-2 hover:bg-white rounded-md transition-colors flex items-center gap-2"
                                                        title={t('analytics.viewAnalytics')}
                                                    >
                                                        <BarChart2 className="w-5 h-5 text-zinc-600" />
                                                        <span className="text-sm text-zinc-600">
                                                            {t('analytics.viewAnalytics')}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/restaurant/${restaurant.restaurantId}/edit`)}
                                                        className="p-2 hover:bg-white rounded-md transition-colors flex items-center gap-2"
                                                        title={t('restaurants.edit')}
                                                    >
                                                        <Edit2 className="w-5 h-5 text-zinc-600" />
                                                        <span className="text-sm text-zinc-600">
                                                            {t('restaurants.edit')}
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                            <div className="w-px h-6 bg-zinc-200 mx-1" />
                                            <button 
                                                onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                                                disabled={isDeletingRestaurant === restaurant.restaurantId}
                                                className="p-2 hover:bg-red-100 rounded-md transition-colors flex items-center gap-2"
                                                title={t('restaurants.delete')}
                                            >
                                                {isDeletingRestaurant === restaurant.restaurantId ? (
                                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-5 h-5 text-red-600" />
                                                        <span className="text-sm text-red-600">
                                                            {t('restaurants.delete')}
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Collapsible Content - Description ve menüler */}
                            {expandedRestaurants.has(restaurant.restaurantId) && (
                                <div className="border-t border-zinc-200">
                                    {/* Description Section */}
                                    {restaurant.description && (
                                        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                                            <TruncatedDescription description={restaurant.description} />
                                        </div>
                                    )}
                                    
                                    {/* Menus Section */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
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

                                        {/* Menü Listesi */}
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
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantList;