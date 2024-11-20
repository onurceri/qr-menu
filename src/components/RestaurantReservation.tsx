import { Clock, Info, MapPin, Phone, Mail, CalendarCheck, Navigation, Facebook, Instagram, Twitter } from 'lucide-react';
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
                    {/* Sol Kolon: Restoran İletişim Bilgileri */}
                    <div className="w-full lg:w-1/3">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-zinc-900 mb-3">
                                    {t('restaurants.contact.title')}
                                </h3>
                                <div className="space-y-4 text-sm text-zinc-600">
                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 mt-0.5 text-zinc-400" />
                                        <div>
                                            <div className="font-medium text-zinc-700">{t('restaurants.contact.phone')}</div>
                                            <span>+90 (212) 555 0123</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 mt-0.5 text-zinc-400" />
                                        <div>
                                            <div className="font-medium text-zinc-700">{t('restaurants.contact.email')}</div>
                                            <span>contact@restaurant.com</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Navigation className="w-4 h-4 mt-0.5 text-zinc-400" />
                                        <div>
                                            <div className="font-medium text-zinc-700">{t('restaurants.contact.address')}</div>
                                            <span>Örnek Mahallesi, Örnek Sokak No:1, İstanbul</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sosyal Medya Hesapları */}
                        <div className="mt-6 pt-6 border-t border-zinc-100">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                    <div className="w-5 h-5 text-zinc-600">@</div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-zinc-900 mb-3">
                                        {t('restaurants.socialMedia.title')}
                                    </h4>
                                    <div className="space-y-3">
                                        <a 
                                            href="#" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                                        >
                                            <Instagram className="w-4 h-4" />
                                            <span>@restaurant.istanbul</span>
                                        </a>
                                        <a 
                                            href="#" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                                        >
                                            <Facebook className="w-4 h-4" />
                                            <span>Restaurant Istanbul</span>
                                        </a>
                                        <a 
                                            href="#" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                                        >
                                            <Twitter className="w-4 h-4" />
                                            <span>@restaurantist</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Separator */}
                    <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent self-stretch mx-2" />
                    
                    {/* Mobile Separator */}
                    <div className="lg:hidden w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent my-4" />

                    {/* Orta Kolon: Rezervasyon Başlığı ve Politika */}
                    <div className="w-full lg:w-1/3 pt-4 lg:pt-0">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                <CalendarCheck className="w-5 h-5 text-zinc-600" />
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

                    {/* Desktop Separator */}
                    <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent self-stretch mx-2" />
                    
                    {/* Mobile Separator */}
                    <div className="lg:hidden w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent my-4" />

                    {/* Sağ Kolon: Rezervasyon Takvimi */}
                    <div className="w-full lg:w-1/3 pt-4 lg:pt-0">
                        <ReservationCalendar
                            restaurantId={restaurantId}
                            schedule={schedule}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}