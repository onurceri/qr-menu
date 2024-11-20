import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';
import { RestaurantAnalytics as AnalyticsDashboard } from '../components/RestaurantAnalytics';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import type { Restaurant } from '../types/restaurant';
import { ChevronLeft } from 'lucide-react';

export function RestaurantAnalytics() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const { user } = useAuth();

    useEffect(() => {
        if (!restaurantId || !user) return;
        loadRestaurant();
    }, [restaurantId, user]);

    const loadRestaurant = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await restaurantService.getRestaurant(restaurantId!);
            
            // Sadece restoran sahibi erişebilir
            if (data.userId !== user?.uid) {
                navigate('/');
                return;
            }
            
            setRestaurant(data);
        } catch (error) {
            console.error('Failed to load restaurant:', error);
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-700">{error || t('common.error')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Üst Başlık */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/restaurant/${restaurantId}`)}
                        className="flex items-center text-sm text-zinc-600 hover:text-zinc-900 mb-4"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t('common.back')}
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-zinc-900">
                            {restaurant.name} - {t('analytics.title')}
                        </h1>
                    </div>
                </div>

                {/* Analytics Dashboard */}
                <AnalyticsDashboard restaurantId={restaurantId!} />
            </div>
        </div>
    );
}
