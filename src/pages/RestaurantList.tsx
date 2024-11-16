import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { restaurantService } from '../services/restaurantService';
import { Restaurant } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-4">Your Restaurants</h1>
            <div className="mb-4">
                <input 
                    type="text" 
                    value={newRestaurantName} 
                    onChange={(e) => setNewRestaurantName(e.target.value)} 
                    placeholder="New Restaurant Name" 
                    className="border p-2 rounded-lg w-full"
                />
                <input 
                    type="text" 
                    value={newRestaurantDescription} 
                    onChange={(e) => setNewRestaurantDescription(e.target.value)} 
                    placeholder="Optional Description" 
                    className="border p-2 rounded-lg w-full mt-2"
                />
                <button 
                    onClick={handleCreateRestaurant} 
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
                >
                    Add Restaurant
                </button>
            </div>
            <ul className="space-y-4">
                {restaurants.map((restaurant) => (
                    <li key={restaurant.restaurantId} className="border p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                        <p>{restaurant.description}</p>
                        <div className="flex justify-end space-x-2">
                            <button 
                                onClick={() => navigate(`/${restaurant.restaurantId}`)} 
                                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                            >
                                <i className="fas fa-eye mr-2"></i> {/* Eye icon for View Menu */}
                                View Menu
                            </button>
                            <button 
                                onClick={() => navigate(`/edit/${restaurant.restaurantId}`)} 
                                className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
                            >
                                <i className="fas fa-edit mr-2"></i> {/* Edit icon for Edit Menu */}
                                Edit Menu
                            </button>
                            <button 
                                onClick={() => handleDeleteRestaurant(restaurant.restaurantId)} 
                                className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
                            >
                                <i className="fas fa-trash mr-2"></i> {/* Trash icon for Delete */}
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}