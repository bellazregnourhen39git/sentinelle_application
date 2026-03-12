import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations omitted, using French and Arabic.
// Will add more translations in the form component or a separate file if needed.
const resources = {
  fr: {
    translation: {
      "Sentinelle": "Sentinelle",
      "Login": "Connexion",
      "Switch Language": "العربية",
      "Email": "Email",
      "Password": "Mot de passe",
      "Dashboard": "Tableau de Bord",
      "Submit": "Soumettre",
      "Logout": "Déconnexion",
      "Questionnaire": "Questionnaire MedSPAD",
    }
  },
  ar: {
    translation: {
      "Sentinelle": "سنتينال",
      "Login": "تسجيل الدخول",
      "Switch Language": "Français",
      "Email": "البريد الإلكتروني",
      "Password": "كلمة المرور",
      "Dashboard": "لوحة القيادة",
      "Submit": "إرسال",
      "Logout": "تسجيل خروج",
      "Questionnaire": "استبيان MedSPAD",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr",
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
