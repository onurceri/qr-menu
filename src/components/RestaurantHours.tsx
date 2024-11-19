import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface WeekSchedule {
    [key: string]: DaySchedule;
}

interface RestaurantHoursProps {
    schedule: WeekSchedule;
    onScheduleChange: (day: string, field: keyof DaySchedule, value: string | boolean) => void;
    errors?: Record<string, string>;
}

// Helper function for time format
const formatTimeForInput = (time: string): string => {
    return time.length === 5 ? time : '09:00';
};

export function RestaurantHours({ schedule, onScheduleChange, errors = {} }: RestaurantHoursProps) {
    const { t } = useTranslation();

    return (
        <div className="border-t border-zinc-200 pt-6">
            <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {t('restaurants.hours')}
            </h2>
            <div className="space-y-4">
                {Object.entries(schedule).map(([day, daySchedule]) => (
                    <div key={day} className="flex flex-col space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center justify-between sm:w-auto">
                                <div className="w-28">
                                    <span className="text-sm font-medium text-zinc-700 capitalize">
                                        {t(`days.${day}`)}
                                    </span>
                                </div>
                                <label className="flex items-center sm:ml-4">
                                    <input
                                        type="checkbox"
                                        checked={daySchedule.isOpen}
                                        onChange={(e) => onScheduleChange(day, 'isOpen', e.target.checked)}
                                        className="rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500"
                                    />
                                    <span className="ml-2 text-sm text-zinc-600">
                                        {t('restaurants.isOpen')}
                                    </span>
                                </label>
                            </div>
                            {daySchedule.isOpen && (
                                <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                                    <input
                                        type="time"
                                        value={formatTimeForInput(daySchedule.openTime)}
                                        onChange={(e) => onScheduleChange(day, 'openTime', e.target.value)}
                                        className={`block w-[120px] rounded-md shadow-sm focus:border-zinc-500 
                                                focus:ring-zinc-500 sm:text-sm
                                                ${errors[day] ? 'border-red-300 bg-red-50' : 'border-zinc-300'}`}
                                    />
                                    <span className="text-zinc-500">-</span>
                                    <input
                                        type="time"
                                        value={formatTimeForInput(daySchedule.closeTime)}
                                        onChange={(e) => onScheduleChange(day, 'closeTime', e.target.value)}
                                        className={`block w-[120px] rounded-md shadow-sm focus:border-zinc-500 
                                                focus:ring-zinc-500 sm:text-sm
                                                ${errors[day] ? 'border-red-300 bg-red-50' : 'border-zinc-300'}`}
                                    />
                                </div>
                            )}
                        </div>
                        {/* Error message */}
                        {errors[day] && (
                            <div className="text-sm text-red-600 ml-0 sm:ml-32 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {t(errors[day])}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
