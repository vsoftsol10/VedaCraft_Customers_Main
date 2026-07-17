import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import taTranslation from './locales/ta.json';
import hiTranslation from './locales/hi.json';
import teTranslation from './locales/te.json';
import knTranslation from './locales/kn.json';
import mlTranslation from './locales/ml.json';

const resources = {
    en: { translation: enTranslation },
    ta: { translation: taTranslation },
    hi: { translation: hiTranslation },
    te: { translation: teTranslation },
    kn: { translation: knTranslation },
    ml: { translation: mlTranslation },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        // LanguageDetector will look in localStorage under key 'i18nextLng'
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
        interpolation: {
            escapeValue: false,
        },
    });
export default i18n;
