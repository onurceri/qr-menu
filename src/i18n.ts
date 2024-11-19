import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import en from './locales/en';
import tr from './locales/tr';
import fr from './locales/fr';
import ar from './locales/ar';
import nl from './locales/nl';

const resources = {
  en,
  tr,
  fr,
  ar,
  nl
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
