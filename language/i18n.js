import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './eng.json';
import es from './esp.json';

const STORE_LANGUAGE_KEY = "user_language";

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedData = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
      if (savedData) {
        return callback(savedData);
      }
      callback('es');
    } catch (error) {
      callback('es');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, lng);
    } catch (error) {}
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    interpolation: { 
      escapeValue: false 
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;