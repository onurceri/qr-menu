import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticStats } from '../types/analytics';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RestaurantAnalytics() {
    const { restaurantId } = useParams();
    console.log('RestaurantAnalytics rendered with restaurantId:', restaurantId); // Debug log

    const [stats, setStats] = useState<AnalyticStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        console.log('RestaurantAnalytics useEffect triggered'); // Debug log
        if (!restaurantId) {
            console.log('No restaurantId found'); // Debug log
            return;
        }
        
        loadStats();
        // Her 5 dakikada bir güncelle
        const interval = setInterval(loadStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [restaurantId]);

    const loadStats = async () => {
        if (!restaurantId) return;
        
        try {
            console.log('Fetching stats for restaurantId:', restaurantId); // Debug log
            setLoading(true);
            setError(null);
            const data = await analyticsService.getStats(restaurantId);
            console.log('Received stats:', data); // Debug log
            setStats(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const getPercentageChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-zinc-600';
    };

    const getPercentageChangeIcon = (change: number) => {
        if (change > 0) return <ArrowUp className="w-4 h-4" />;
        if (change < 0) return <ArrowDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-4 bg-red-50 rounded-md">
                <p className="text-red-700">{error || t('analytics.noData')}</p>
            </div>
        );
    }

    // Saatlik dağılım verilerini hazırla
    const hourlyData = Object.entries(stats.hourlyDistribution).map(([hour, count]) => ({
        hour: `${hour}:00`,
        views: count
    })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    // Sosyal medya tıklama verilerini hazırla
    const socialData = Object.entries(stats.socialClicks).map(([platform, count]) => ({
        platform,
        clicks: count
    }));

    // Haftalık trend verilerini hazırla
    const weeklyData = stats.weeklyTrends
        .sort((a, b) => a.week - b.week)
        .map(trend => ({
            week: `Week ${trend.week}`,
            views: trend.views
        }));

    return (
        <div className="space-y-8 p-6 bg-zinc-50 rounded-xl">
            {/* Genel Metrikler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500">{t('analytics.totalViews')}</h3>
                    <p className="mt-2 text-3xl font-semibold text-zinc-900">{stats.totalViews}</p>
                    <div className="mt-2 flex items-center gap-1">
                        <span className={getPercentageChangeColor(stats.monthlyComparison.percentageChange)}>
                            {getPercentageChangeIcon(stats.monthlyComparison.percentageChange)}
                        </span>
                        <span className={`text-sm ${getPercentageChangeColor(stats.monthlyComparison.percentageChange)}`}>
                            {Math.abs(stats.monthlyComparison.percentageChange).toFixed(1)}% vs last month
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500">{t('analytics.menuViews')}</h3>
                    <p className="mt-2 text-3xl font-semibold text-zinc-900">{stats.menuViews}</p>
                    <p className="mt-2 text-sm text-zinc-500">
                        {((stats.menuViews / stats.totalViews) * 100).toFixed(1)}% of total views
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500">{t('analytics.qrScans')}</h3>
                    <p className="mt-2 text-3xl font-semibold text-zinc-900">{stats.qrScans}</p>
                    <p className="mt-2 text-sm text-zinc-500">
                        {((stats.qrScans / stats.totalViews) * 100).toFixed(1)}% conversion rate
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500">{t('analytics.socialClicks')}</h3>
                    <p className="mt-2 text-3xl font-semibold text-zinc-900">
                        {Object.values(stats.socialClicks).reduce((a, b) => a + b, 0)}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                        Across all platforms
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Haftalık Trend Grafiği */}
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-medium text-zinc-900 mb-4">
                        {t('analytics.weeklyTrends')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="week" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                    dot={{ fill: '#0088FE' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Saatlik Dağılım Grafiği */}
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-medium text-zinc-900 mb-4">
                        {t('analytics.hourlyDistribution')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="hour" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip />
                                <Bar dataKey="views" fill="#00C49F" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sosyal Medya Tıklamaları */}
                {socialData.length > 0 && (
                    <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm md:col-span-2">
                        <h3 className="text-lg font-medium text-zinc-900 mb-4">
                            {t('analytics.socialMediaClicks')}
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={socialData}
                                        dataKey="clicks"
                                        nameKey="platform"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {socialData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
