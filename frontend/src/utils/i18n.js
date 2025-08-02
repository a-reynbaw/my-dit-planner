import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import jsyaml from 'js-yaml';
i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'el'], // Add more languages as needed
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: './locales/{{lng}}.yml',
      parse: (data) => jsyaml.load(data),
    },
  });
export default i18n;
