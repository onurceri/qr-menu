import { useTranslation } from 'react-i18next';
import type { TimeSlot } from '../types/reservation';

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  selectedTime?: string;
  onSelectTime: (time: string) => void;
}

export function TimeSlotSelector({
  timeSlots,
  selectedTime,
  onSelectTime,
}: TimeSlotSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-900">
        {t('reservation.selectTime')}
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => onSelectTime(slot.time)}
            disabled={!slot.available}
            className={`
              flex items-center justify-center px-3 py-2 rounded-lg text-sm
              ${selectedTime === slot.time
                ? 'bg-zinc-900 text-white'
                : slot.available
                ? 'bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-900'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}
            `}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
