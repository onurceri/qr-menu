import { Clock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReservationCalendar } from './ReservationCalendar';
import type { WeekSchedule } from '../utils/dateUtils';

interface RestaurantReservationProps {
    restaurantId: string;
    schedule: WeekSchedule;
}

export function RestaurantReservation({ restaurantId, schedule }: RestaurantReservationProps) {
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Sol Kolon: Rezervasyon Başlığı ve Açıklama */}
                    <div className="lg:w-[350px]">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-zinc-900 mb-3">
                                    {t('reservation.title')}
                                </h3>
                                <p className="text-sm text-zinc-500">
                                    {t('reservation.description')}
                                </p>
                            </div>
                        </div>

                        {/* Rezervasyon Politikası */}
                        <div className="mt-6 pt-6 border-t border-zinc-100">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                    <Info className="w-5 h-5 text-zinc-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-zinc-900 mb-3">
                                        {t('reservation.policy')}
                                    </h4>
                                    <ul className="space-y-3 text-sm text-zinc-600">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-zinc-400 mt-2" />
                                            {t('reservation.policyItem1')}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-zinc-400 mt-2" />
                                            {t('reservation.policyItem2')}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-zinc-400 mt-2" />
                                            {t('reservation.policyItem3')}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent self-stretch mx-2" />

                    {/* Sağ Kolon: Rezervasyon Takvimi */}
                    <div className="flex-1">
                        <ReservationCalendar
                            restaurantId={restaurantId}
                            schedule={schedule}
                            className="bg-white rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 