import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthToken = async (): Promise<string | null> => {
    const auth = getAuth();
    return auth.currentUser?.getIdToken() || null;
};

class AnalyticsService {
    async trackEvent(restaurantId: string, eventType: string, metadata?: Record<string, any>): Promise<void> {
        try {
            const token = await getAuthToken();
            const response = await fetch(`${API_URL}/api/analytics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    restaurantId,
                    eventType,
                    metadata,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to track analytics event');
            }
        } catch (error) {
            console.error('Error tracking analytics event:', error);
        }
    }

    async trackPageView(restaurantId: string, pageType: string): Promise<void> {
        return this.trackEvent(restaurantId, 'page_view', { pageType });
    }

    async trackQRScan(restaurantId: string): Promise<void> {
        return this.trackEvent(restaurantId, 'qr_scan');
    }

    async trackSocialMediaClick(restaurantId: string, platform: string): Promise<void> {
        return this.trackEvent(restaurantId, 'social_media_click', { platform });
    }

    async getStats(restaurantId: string): Promise<any> {
        try {
            const token = await getAuthToken();
            const response = await fetch(`${API_URL}/api/analytics/stats/${restaurantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics stats');
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching analytics stats:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();
