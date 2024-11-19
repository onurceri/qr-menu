import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { X, Calendar, Clock, Users, MessageSquare } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { reservationService } from '../services/reservationService';
import type { ReservationRequest, TimeSlot } from '../types/reservation';
import { useAuth } from '../contexts/AuthContext';
import 'react-day-picker/dist/style.css';

interface ReservationCalendarProps {
    restaurantId: string;
    schedule: Record<string, { isOpen: boolean; openTime: string; closeTime: string; }>;
    className?: string;
}

export function ReservationCalendar({ restaurantId, schedule, className = '' }: ReservationCalendarProps) {
    const { t, i18n } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState<string>();
    const [guests, setGuests] = useState(2);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialRequests: ''
    });
    const { user } = useAuth();
    const locale = i18n.language === 'tr' ? tr : enUS;

    // Generate time slots based on restaurant schedule
    const generateTimeSlots = async (date: Date) => {
        if (!user) return;
        
        const dayName = format(date, 'EEEE', { locale }).toLowerCase();
        const daySchedule = schedule[dayName];

        if (!daySchedule?.isOpen) {
            setTimeSlots([]);
            toast.error(t('reservation.closed'));
            return;
        }

        try {
            const token = await user.getIdToken();
            const formattedDate = format(date, 'yyyy-MM-dd');
            const availabilityData = await reservationService.getAvailableSlots(
                restaurantId, 
                formattedDate,
                token
            );
            
            if (!availabilityData?.timeSlots?.length) {
                setTimeSlots([]);
                toast.error(t('reservation.noSlots'));
                return;
            }

            setTimeSlots(availabilityData.timeSlots);
        } catch (error) {
            console.error('Error fetching time slots:', error);
            setTimeSlots([]);
            toast.error(t('reservation.error'));
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        generateTimeSlots(date);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !user) return;

        try {
            const token = await user.getIdToken();
            const reservation: ReservationRequest = {
                restaurantId,
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                numberOfGuests: guests,
                ...formData,
                status: 'pending'
            };

            await reservationService.createReservation(reservation, token);
            setIsDialogOpen(false);
            toast.success(t('reservation.success'));
            // Refresh available slots after successful reservation
            generateTimeSlots(selectedDate);
        } catch (error) {
            console.error('Error submitting reservation:', error);
            toast.error(t('reservation.error'));
        }
    };

    return (
        <div className={`${className}`}>
            {/* Takvim ve Saat Seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Takvim Bölümü */}
                <div className="w-full">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={{ before: new Date() }}
                        locale={locale}
                        className="!font-sans bg-white p-1 xs:p-2 sm:p-3 rounded-lg border border-zinc-200/70 w-full max-w-full overflow-x-auto"
                        classNames={{
                            months: "w-full min-w-[280px]",
                            month: "w-full",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-xs sm:text-sm font-medium text-zinc-900",
                            nav: "flex items-center",
                            nav_button: "inline-flex items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-50 p-0.5 sm:p-1",
                            nav_button_previous: "absolute left-0.5 sm:left-1",
                            nav_button_next: "absolute right-0.5 sm:right-1",
                            table: "w-full border-collapse",
                            head_row: "flex w-full",
                            head_cell: "text-zinc-500 rounded-md w-6 sm:w-7 md:w-9 font-normal text-[0.7rem] sm:text-[0.8rem]",
                            row: "flex w-full mt-0.5 sm:mt-1 md:mt-2",
                            cell: "text-center text-xs sm:text-sm relative p-0 rounded-md focus-within:relative focus-within:z-20",
                            day: "h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                            day_selected: "bg-zinc-900 text-white hover:bg-zinc-800",
                            day_today: "bg-zinc-50 text-zinc-900",
                            day_outside: "text-zinc-400 opacity-50",
                            day_disabled: "text-zinc-400 opacity-50 hover:bg-transparent",
                            day_range_middle: "aria-selected:bg-zinc-100",
                            day_hidden: "invisible",
                        }}
                    />
                </div>

                {/* Saat Seçimi Bölümü */}
                <div className="w-full bg-white rounded-lg border border-zinc-200/70">
                    <div className="p-2 sm:p-4 border-b border-zinc-200/70">
                        <h3 className="font-medium text-zinc-900 text-sm sm:text-base">
                            {t('reservation.availableSlots')}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 sm:mt-1">
                            {selectedDate 
                                ? format(selectedDate, 'PPP', { locale })
                                : t('reservation.selectDateFirst')}
                        </p>
                    </div>
                    <div className="p-2 sm:p-4">
                        <div className="grid grid-cols-3 gap-1 sm:gap-2">
                            {timeSlots.length > 0 ? (
                                timeSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        onClick={() => handleTimeSelect(slot.time)}
                                        disabled={!slot.available}
                                        className={`
                                            relative p-1.5 sm:p-2 rounded-md text-xs sm:text-sm font-medium
                                            transition-all duration-200
                                            ${slot.available 
                                                ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-900' 
                                                : 'bg-zinc-50/50 text-zinc-400 cursor-not-allowed'}
                                        `}
                                    >
                                        {slot.time}
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-3 py-6 sm:py-8 text-center text-zinc-500 text-xs sm:text-sm">
                                    {selectedDate 
                                        ? t('reservation.noSlots')
                                        : t('reservation.selectDateFirst')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rezervasyon Detayları Modal */}
            <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                            <Dialog.Title className="text-lg font-semibold text-zinc-900">
                                {t('reservation.details')}
                            </Dialog.Title>
                            <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-full 
                                                  text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all">
                                <X size={20} />
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Seçim Özeti */}
                            <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-zinc-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{selectedDate && format(selectedDate, 'PPP', { locale })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{selectedTime}</span>
                                </div>
                            </div>

                            {/* Form Alanları */}
                            <div className="space-y-4">
                                {/* Misafir Sayısı */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-2">
                                        <Users className="w-4 h-4" />
                                        {t('reservation.numberOfGuests')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={guests}
                                            onChange={(e) => setGuests(Number(e.target.value))}
                                            className="w-full p-2.5 pr-12 border rounded-lg bg-white
                                                     focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                                            {t('common.people')}
                                        </span>
                                    </div>
                                </div>

                                {/* İletişim Bilgileri */}
                                <div className="space-y-4">
                                    {/* Ad Soyad */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            {t('reservation.name')}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            className="w-full p-2.5 border rounded-lg bg-white
                                                     focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                                            placeholder={t('reservation.namePlaceholder')}
                                        />
                                    </div>

                                    {/* E-posta */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            {t('reservation.email')}
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.customerEmail}
                                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                            className="w-full p-2.5 border rounded-lg bg-white
                                                     focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                                            placeholder={t('reservation.emailPlaceholder')}
                                        />
                                    </div>

                                    {/* Telefon */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            {t('reservation.phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            className="w-full p-2.5 border rounded-lg bg-white
                                                     focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                                            placeholder={t('reservation.phonePlaceholder')}
                                        />
                                    </div>
                                </div>

                                {/* Özel İstekler */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-2">
                                        <MessageSquare className="w-4 h-4" />
                                        {t('reservation.specialRequests')}
                                    </label>
                                    <textarea
                                        value={formData.specialRequests}
                                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                        className="w-full p-2.5 border rounded-lg bg-white resize-none
                                                 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                                        rows={3}
                                        placeholder={t('reservation.specialRequestsPlaceholder')}
                                    />
                                </div>
                            </div>

                            {/* Gönder Butonu */}
                            <button
                                type="submit"
                                className="w-full bg-zinc-900 text-white py-3 px-4 rounded-lg 
                                         hover:bg-zinc-800 transition-colors duration-200 font-medium
                                         focus:outline-none focus:ring-2 focus:ring-zinc-900 
                                         focus:ring-offset-2"
                            >
                                {t('reservation.submit')}
                            </button>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
