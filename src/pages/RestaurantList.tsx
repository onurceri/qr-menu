import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';

export default function RestaurantList() {
    const { user, signOut } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [newRestaurantName, setNewRestaurantName] = useState<string>('');
    const [newRestaurantDescription, setNewRestaurantDescription] = useState<string>('');

    useEffect(() => {
        console.log("user", user);  
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchRestaurants = async () => {
            try {
                const fetchedRestaurants = await restaurantService.getRestaurants(user.uid);
                setRestaurants(Array.isArray(fetchedRestaurants) ? fetchedRestaurants : []);
                console.log("Fetched restaurants:", fetchedRestaurants);
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
            setError('Restaurant name cannot be empty');
            return;
        }
        try {
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
            setError('Failed to create restaurant');
            console.error(err);
        }
    };

    const handleDeleteRestaurant = async (restaurantId: string) => {
        try {
            await restaurantService.deleteRestaurant(restaurantId);
            const fetchedRestaurants = await restaurantService.getRestaurants(user!.uid);
            setRestaurants(fetchedRestaurants);
        } catch (err) {
            setError('Failed to delete restaurant');
            console.error(err);
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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">{error}</div>
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
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={newRestaurantName} 
                        onChange={(e) => setNewRestaurantName(e.target.value)} 
                        placeholder="Restaurant Name" 
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    />
                    <input 
                        type="text" 
                        value={newRestaurantDescription} 
                        onChange={(e) => setNewRestaurantDescription(e.target.value)} 
                        placeholder="Restaurant Description (optional)" 
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    />
                    <button 
                        onClick={handleCreateRestaurant} 
                        className="btn flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Restaurant</span>
                    </button>
                </div>
            </div>

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
                                    className="btn-sm flex items-center space-x-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}