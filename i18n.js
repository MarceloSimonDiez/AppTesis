// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import es from './assets/locales/es.json';
import en from './assets/locales/en.json';

// Función segura para obtener el idioma
const getDeviceLanguage = () => {
  try {
    const locales = Localization.getLocales();
    return locales && locales.length > 0 ? locales[0].languageCode : 'es';
  } catch (error) {
    return 'es'; // Fallback si falla el módulo nativo
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: getDeviceLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    // Esto evita que la app se rompa si i18next no está listo
    react: {
      useSuspense: false 
    }
  });

export default i18n;