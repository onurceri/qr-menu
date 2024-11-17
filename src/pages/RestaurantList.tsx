import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export default function RestaurantList() {
    const { user, signOut } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [newRestaurantName, setNewRestaurantName] = useState<string>('');
    const [newRestaurantDescription, setNewRestaurantDescription] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [isDeletingRestaurant, setIsDeletingRestaurant] = useState<string | null>(null);
    const { t } = useTranslation();

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
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-900">{restaurant.name}</h2>
                                    {restaurant.description && (
                                        <p className="mt-1 text-zinc-600">{restaurant.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate(`/${restaurant.restaurantId}`)} 
                                        className="btn-secondary-sm flex items-center space-x-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>{t('restaurants.view')}</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/edit/${restaurant.restaurantId}`)} 
                                        className="btn-secondary-sm flex items-center space-x-2"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        <span>{t('restaurants.edit')}</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                                        disabled={isDeletingRestaurant === restaurant.restaurantId}
                                        className="btn-sm flex items-center space-x-2"
                                    >
                                        {isDeletingRestaurant === restaurant.restaurantId ? (
                                            <span className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>{t('restaurants.deleting')}</span>
                                            </span>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                <span>{t('restaurants.delete')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}