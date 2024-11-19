export interface IDaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

export interface IWeekSchedule {
    [key: string]: IDaySchedule;
}