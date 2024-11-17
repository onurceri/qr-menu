import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';

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
        if (!newRestaurantName.trim()) {
            setError('Please enter a restaurant name');
            return;
        }
        if (isCreating) return;
        
        try {
            setError(null);
            setIsCreating(true);
            const response = await restaurantService.createRestaurant(user!.uid, { 
                name: newRestaurantName, 
                description: newRestaurantDescription
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Your Restaurants</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Add New Restaurant</h2>
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
                        onChange={(e) => setNewRestaurantName(e.target.value)} 
                        placeholder="Restaurant Name" 
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent
                            ${error ? 'border-red-300' : 'border-zinc-300'}`}
                    />
                    <input 
                        type="text" 
                        value={newRestaurantDescription} 
                        onChange={(e) => setNewRestaurantDescription(e.target.value)} 
                        placeholder="Restaurant Description (optional)" 
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
                                <span>Creating...</span>
                            </span>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                <span>Add Restaurant</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {restaurants.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-zinc-200 text-center">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-zinc-900 mb-2">
                            No Restaurants Yet
                        </h3>
                        <p className="text-zinc-600 mb-4">
                            You haven't added any restaurants yet. Create your first restaurant using the form above to get started.
                        </p>
                        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                            <p className="text-sm text-zinc-500">
                                💡 Tip: After creating a restaurant, you can add menu sections and items to showcase your offerings.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {restaurants.map((restaurant) => (
                        <div 
                            key={restaurant.restaurantId} 
                            className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200"
                        >
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
                                        <span>View</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/edit/${restaurant.restaurantId}`)} 
                                        className="btn-secondary-sm flex items-center space-x-2"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                                        disabled={isDeletingRestaurant === restaurant.restaurantId}
                                        className="btn-sm flex items-center space-x-2"
                                    >
                                        {isDeletingRestaurant === restaurant.restaurantId ? (
                                            <span className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Deleting...</span>
                                            </span>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                <span>Delete</span>
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