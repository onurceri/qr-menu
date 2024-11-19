export interface SupportedLanguage {
    code: string;
    name: string;
    flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    {
        code: 'tr',
        name: 'Türkçe',
        flag: '🇹🇷'
    },
    {
        code: 'en',
        name: 'English',
        flag: '🇬🇧'
    },
    {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷'
    },
    {
        code: 'ar',
        name: 'العربية',
        flag: '🇸🇦'
    },
    {
        code: 'nl',
        name: 'Nederlands',
        flag: '🇳🇱'
    }
];

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']; 