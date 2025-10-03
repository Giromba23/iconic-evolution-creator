import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import es from './locales/es';
import pt from './locales/pt';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      es,
      pt,
    },
    lng: 'pt', // idioma padrão
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;