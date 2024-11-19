interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface WeekSchedule {
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

export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
};

export const isValidTimeFormat = (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const compareTimeStrings = (time1: string, time2: string): number => {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    if (hours1 !== hours2) {
        return hours1 - hours2;
    }
    return minutes1 - minutes2;
};

export const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins);
    date.setMinutes(date.getMinutes() + minutes);
    
    return formatTime(date);
}; 