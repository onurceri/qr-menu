export interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

export interface WeekSchedule {
    [key: string]: DaySchedule;
}

export const parseOpeningHours = (hoursString?: string): WeekSchedule | null => {
    if (!hoursString) return null;
    try {
        return JSON.parse(hoursString);
    } catch {
        return null;
    }
}; 