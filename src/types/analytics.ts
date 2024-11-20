export enum AnalyticEventType {
    PROFILE_VIEW = 'PROFILE_VIEW',
    MENU_VIEW = 'MENU_VIEW',
    QR_SCAN = 'QR_SCAN',
    SOCIAL_MEDIA_CLICK = 'SOCIAL_MEDIA_CLICK'
}

export interface AnalyticEvent {
    id: string;
    restaurantId: string;
    eventType: AnalyticEventType;
    timestamp: Date;
    metadata?: {
        source?: string;
        platform?: string;
        userAgent?: string;
        referrer?: string;
    };
}

export interface AnalyticStats {
    totalViews: number;
    menuViews: number;
    qrScans: number;
    socialClicks: {
        [platform: string]: number;
    };
    hourlyDistribution: {
        [hour: string]: number;
    };
    weeklyTrends: Array<{
        week: string;
        views: number;
    }>;
    monthlyComparison: {
        currentMonth: number;
        previousMonth: number;
        percentageChange: number;
    };
}
