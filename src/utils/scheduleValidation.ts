interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface WeekSchedule {
    [key: string]: DaySchedule;
}

export const validateSchedule = (schedule: WeekSchedule) => {
    const errors: Record<string, string> = {};
    
    Object.entries(schedule).forEach(([day, daySchedule]) => {
        if (daySchedule.isOpen) {
            // Açılış saati kapanış saatinden önce olmalı
            const openTime = new Date(`1970-01-01T${daySchedule.openTime}`);
            const closeTime = new Date(`1970-01-01T${daySchedule.closeTime}`);
            
            if (openTime >= closeTime) {
                errors[day] = 'validation.invalidTimeRange';
            }

            // Saat formatı kontrolü
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(daySchedule.openTime) || !timeRegex.test(daySchedule.closeTime)) {
                errors[day] = 'validation.invalidTimeFormat';
            }
        }
    });

    return errors;
}; 