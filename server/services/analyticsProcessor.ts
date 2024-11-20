import { redisClient } from '../../shared/lib/redis.js';

interface AnalyticEvent {
    id: string;
    restaurantId: string;
    eventType: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

class AnalyticsProcessor {
    private readonly QUEUE_KEY = 'analytics:queue';
    private readonly BATCH_SIZE = 100;
    private readonly PROCESSING_INTERVAL = 60 * 1000; // 1 dakika

    // Queue'dan event'leri işle
    private async processEvents(): Promise<void> {
        try {
            // Queue'dan batch_size kadar event al
            const events = await redisClient.lRange(this.QUEUE_KEY, 0, this.BATCH_SIZE - 1);
            
            if (events.length === 0) return;

            console.log(`Processing ${events.length} events...`);

            // Event'leri grupla
            const groupedEvents = events.reduce((acc, eventStr) => {
                const event = JSON.parse(eventStr) as AnalyticEvent;
                if (!acc[event.restaurantId]) {
                    acc[event.restaurantId] = [];
                }
                acc[event.restaurantId].push(event);
                return acc;
            }, {} as Record<string, AnalyticEvent[]>);

            // Her restaurant için event'leri işle
            await Promise.all(
                Object.entries(groupedEvents).map(async ([restaurantId, restaurantEvents]) => {
                    await this.updateRestaurantStats(restaurantId, restaurantEvents);
                })
            );

            // İşlenen event'leri queue'dan sil
            await redisClient.lTrim(this.QUEUE_KEY, events.length, -1);
            
            console.log('Events processed successfully');
        } catch (error) {
            console.error('Error processing analytics events:', error);
        }
    }

    // Restaurant istatistiklerini güncelle
    private async updateRestaurantStats(
        restaurantId: string,
        events: AnalyticEvent[]
    ): Promise<void> {
        const statsKey = `analytics:stats:${restaurantId}`;
        
        try {
            // Mevcut istatistikleri al veya yeni oluştur
            let stats = await redisClient.get(statsKey);
            let currentStats = stats ? JSON.parse(stats) : {
                totalViews: 0,
                menuViews: 0,
                qrScans: 0,
                socialClicks: {},
                hourlyDistribution: {},
                weeklyTrends: [],
                monthlyComparison: {
                    currentMonth: 0,
                    previousMonth: 0,
                    percentageChange: 0
                }
            };

            console.log(`Updating stats for restaurant ${restaurantId}...`);
            console.log('Current stats:', currentStats);

            const now = new Date();
            const currentMonth = now.getMonth();

            // Event'lere göre istatistikleri güncelle
            events.forEach(event => {
                switch (event.eventType) {
                    case 'page_view':
                        if (event.metadata?.pageType === 'profile') {
                            currentStats.totalViews++;
                        } else if (event.metadata?.pageType === 'menu') {
                            currentStats.menuViews++;
                        }
                        
                        // Aylık karşılaştırma güncelle
                        const eventDate = new Date(event.timestamp);
                        if (eventDate.getMonth() === currentMonth) {
                            currentStats.monthlyComparison.currentMonth++;
                        }
                        
                        // Haftalık trend güncelle
                        const eventWeek = this.getWeekNumber(eventDate);
                        const weekTrend = currentStats.weeklyTrends.find(w => w.week === eventWeek) || {
                            week: eventWeek,
                            views: 0
                        };
                        weekTrend.views++;
                        
                        if (!currentStats.weeklyTrends.some(w => w.week === eventWeek)) {
                            currentStats.weeklyTrends.push(weekTrend);
                        }
                        
                        // Son 4 haftayı tut
                        currentStats.weeklyTrends = currentStats.weeklyTrends
                            .sort((a, b) => b.week - a.week)
                            .slice(0, 4);
                        break;
                        
                    case 'qr_scan':
                        currentStats.qrScans++;
                        break;
                        
                    case 'social_media_click':
                        if (event.metadata?.platform) {
                            const platform = event.metadata.platform;
                            currentStats.socialClicks[platform] = (currentStats.socialClicks[platform] || 0) + 1;
                        }
                        break;
                }

                // Saatlik dağılımı güncelle
                const hour = new Date(event.timestamp).getHours().toString();
                currentStats.hourlyDistribution[hour] = (currentStats.hourlyDistribution[hour] || 0) + 1;
            });

            // Aylık değişim yüzdesini hesapla
            if (currentStats.monthlyComparison.previousMonth > 0) {
                currentStats.monthlyComparison.percentageChange = 
                    ((currentStats.monthlyComparison.currentMonth - currentStats.monthlyComparison.previousMonth) / 
                    currentStats.monthlyComparison.previousMonth) * 100;
            }

            console.log('Updated stats:', currentStats);

            // İstatistikleri kaydet
            await redisClient.set(statsKey, JSON.stringify(currentStats));
            console.log(`Stats saved for restaurant ${restaurantId}`);
        } catch (error) {
            console.error(`Error updating restaurant stats for ${restaurantId}:`, error);
        }
    }

    // Haftanın numarasını hesapla (1-52)
    private getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // Event işleme döngüsünü başlat
    startProcessing(): void {
        // İlk çalıştırma
        this.processEvents().catch(error => {
            console.error('Error in initial analytics processing:', error);
        });

        // Periyodik çalıştırma
        setInterval(() => {
            this.processEvents().catch(error => {
                console.error('Error in periodic analytics processing:', error);
            });
        }, this.PROCESSING_INTERVAL);

        console.log('Analytics processor started with interval:', this.PROCESSING_INTERVAL, 'ms');
    }
}

export const analyticsProcessor = new AnalyticsProcessor();
