import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { reservationService } from '../services/reservationService';
import type { ReservationRequest, TimeSlot } from '../types/reservation';
import { useAuth } from '../contexts/AuthContext';
import 'react-day-picker/dist/style.css';

interface ReservationCalendarProps {
  restaurantId: string;
  schedule: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
}

export function ReservationCalendar({ restaurantId, schedule }: ReservationCalendarProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language === 'tr' ? tr : enUS;

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [guests, setGuests] = useState(2);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequests: '',
  });

  const handleDateSelect = async (date?: Date) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedTime(undefined);
    setIsLoading(true);
    setIsDialogOpen(true);

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const availability = await reservationService.getAvailableSlots(
        restaurantId,
        formattedDate,
        i18n.language,
      );
      setTimeSlots(availability?.timeSlots || []);
      if (!availability?.timeSlots?.length) {
        toast.error(t('reservation.noSlots'));
      }
    } catch {
      toast.error(t('reservation.error'));
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !user) return;
    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const reservation: ReservationRequest = {
        restaurantId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        numberOfGuests: guests,
        ...formData,
      };

      await reservationService.createReservation(reservation, token);
      setIsDialogOpen(false);
      toast.success(t('reservation.success'));
      resetForm();
    } catch {
      toast.error(t('reservation.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setTimeSlots([]);
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      specialRequests: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const modifiers = {
    disabled: [
      { before: new Date() },
      (date: Date) => {
        const dayName = format(date, 'EEEE', { locale: enUS }).toLowerCase();
        return !schedule[dayName]?.isOpen;
      },
    ],
  };

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={locale}
          modifiers={modifiers}
          fromMonth={new Date()}
          toMonth={new Date(new Date().setMonth(new Date().getMonth() + 2))}
          className="!font-sans mx-auto w-full 
                         [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full
                         [&_.rdp-cell]:p-0 [&_.rdp-button]:w-full [&_.rdp-button]:h-12
                         [&_.rdp-day_not-selected:hover]:bg-zinc-50
                         [&_.rdp-day_selected]:bg-zinc-900 [&_.rdp-day_selected]:text-white
                         [&_.rdp-day_selected:hover]:bg-zinc-800
                         [&_.rdp-day_disabled]:opacity-25
                         [&_.rdp-head_cell]:text-zinc-500 [&_.rdp-head_cell]:font-normal
                         [&_.rdp-button]:text-sm [&_.rdp-button]:font-medium"
        />
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-full h-full sm:h-auto sm:max-w-lg bg-white sm:rounded-xl shadow-xl flex flex-col">
              {/* Header - Fixed at top */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                <Dialog.Title className="text-lg font-medium text-zinc-900">
                  {t('reservation.makeReservation')}
                </Dialog.Title>
                <Dialog.Close className="rounded-lg p-1.5 hover:bg-zinc-100">
                  <X className="w-5 h-5 text-zinc-500" />
                </Dialog.Close>
              </div>

              {/* Form - Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4">
                <form id="reservationForm" onSubmit={handleSubmit} className="space-y-6">
                  <p className="text-sm text-zinc-500">
                    {t('common.requiredFields')} <span className="text-red-500">*</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-900">
                        {t('reservation.selectTime')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedTime || ''}
                        onChange={e => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900/10"
                      >
                        <option value="" disabled>
                          {t('reservation.chooseTime')}
                        </option>
                        {timeSlots.map(slot => (
                          <option key={slot.time} value={slot.time}>
                            {slot.time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-900">
                        {t('reservation.guests')} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                          className="p-2 rounded-lg hover:bg-zinc-100"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium w-8 text-center">{guests}</span>
                        <button
                          type="button"
                          onClick={() => setGuests(prev => Math.min(10, prev + 1))}
                          className="p-2 rounded-lg hover:bg-zinc-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="customerName" className="block text-sm font-medium text-zinc-900">
                        {t('reservation.name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-zinc-900">
                        {t('reservation.email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        required
                        value={formData.customerEmail}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="customerPhone" className="block text-sm font-medium text-zinc-900">
                        {t('reservation.phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        required
                        value={formData.customerPhone}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-zinc-900">
                      {t('reservation.specialRequests')}
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      rows={3}
                      value={formData.specialRequests}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900/10 resize-none"
                    />
                  </div>
                </form>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="p-4 border-t border-zinc-200">
                <button
                  type="submit"
                  form="reservationForm"
                  disabled={!selectedTime || isLoading}
                  className="w-full py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isLoading ? t('common.loading') : t('reservation.confirm')}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
