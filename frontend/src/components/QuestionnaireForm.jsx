import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

const QuestionnaireForm = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    // Section A: GeneralInfo
    gender: '',
    birth_year: '',
    // Section C: Tobacco
    tobacco_lifetime: '',
    tobacco_30days: '',
    // Section G: Alcohol
    alcohol_lifetime: '',
    alcohol_30days: '',
    alcohol_binge: '',
    // Section I: Cannabis
    cannabis_lifetime: '',
    cannabis_30days: '',
    // Section J, K, N: Other Drugs
    cocaine_lifetime: '',
    ecstasy_lifetime: '',
    new_substances: '',
    // Just a sample of the numerous tracking fields. The backend accepts arbitrary JSON into `answers`.
  });
  
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Calculate simple flags for the backend
    const isTobaccoUser = formData.tobacco_30days && formData.tobacco_30days !== 'Jamais' && formData.tobacco_30days !== 'Never';
    const isAlcoholUser = formData.alcohol_30days && formData.alcohol_30days !== 'Jamais' && formData.alcohol_30days !== 'Never';
    const isCannabisUser = formData.cannabis_30days && formData.cannabis_30days !== 'Jamais' && formData.cannabis_30days !== 'Never';
    const isCocaineUser = !!formData.cocaine_lifetime;
    const isEcstasyUser = !!formData.ecstasy_lifetime;
    const hasRisk = isTobaccoUser || isAlcoholUser || isCannabisUser || isCocaineUser || isEcstasyUser;

    const payload = {
      // Assuming user.context supplies school_class, school, governorate via API or profile
      // For this prototype, we hardcode fallback IDs 1 to allow testing. Real app would select or infer them.
      school_class: 1, 
      school: 1,
      governorate: 1,
      language_used: i18n.language.toUpperCase(),
      answers: formData,
      tobacco_user: isTobaccoUser,
      alcohol_user: isAlcoholUser,
      cannabis_user: isCannabisUser,
      cocaine_user: isCocaineUser,
      ecstasy_user: isEcstasyUser,
      has_risk_behavior: hasRisk,
    };

    try {
      await api.post('questionnaire/submit/', payload);
      setStatus('success');
      alert('Questionnaire submitted successfully!');
      // Reset form or redirect
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const isRTL = i18n.language === 'ar';
  
  const questionLabel = (frText, arText) => {
    return isRTL ? arText : frText;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="bg-brand-700 rounded-3xl p-10 text-white shadow-xl text-center">
        <h1 className="text-3xl font-extrabold mb-4">{t('Questionnaire')}</h1>
        <p className="text-brand-100 max-w-2xl mx-auto">
          {isRTL 
            ? "يرجى الإجابة على جميع الأسئلة بصدق. الإجابات سرية بالكامل ومجهولة الهوية."
            : "Veuillez répondre à toutes les questions honnêtement. Les réponses sont totalement confidentielles et anonymes."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Section A: Info General */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">A. Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {questionLabel('C.A01 Genre?', 'C.A01 الجنس؟')}
              </label>
              <select name="gender" onChange={handleChange} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                <option value="">--</option>
                <option value="M">{questionLabel('Masculin', 'ذكر')}</option>
                <option value="F">{questionLabel('Féminin', 'أنثى')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {questionLabel('C.A02 Année de naissance (ex: 2008)', 'C.A02 سنة الميلاد (مثل: 2008)')}
              </label>
              <input type="number" name="birth_year" onChange={handleChange} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50" />
            </div>
          </div>
        </section>

        {/* Section C: Tobacco */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">C. Consommation de Cigarettes</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {questionLabel("C.C03 Combien de fois avez-vous fumé durant votre vie ?", "C.C03 كم مرة دخنت طوال حياتك؟")}
              </label>
              <select name="tobacco_lifetime" onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                <option value="">--</option>
                <option value="Jamais">{questionLabel('Jamais', 'أبداً')}</option>
                <option value="1-2 fois">{questionLabel('1-2 fois', '1-2 مرات')}</option>
                <option value="3-5 fois">{questionLabel('3-5 fois', '3-5 مرات')}</option>
                <option value="Plus de 40">{questionLabel('40 ou plus', '40 أو أكثر')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {questionLabel("C.C04 Combien de fois avez-vous fumé des cigarettes au cours des 30 DERNIERS JOURS ?", "C.C04 كم مرة دخنت في الـ 30 يومًا الماضية؟")}
              </label>
              <select name="tobacco_30days" onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                <option value="">--</option>
                <option value="Jamais">{questionLabel('Jamais', 'أبداً')}</option>
                <option value="<1 par semaine">{questionLabel('< 1 cigarette par semaine', 'أقل من 1 في الأسبوع')}</option>
                <option value="<1 par jour">{questionLabel('< 1 cigarette par jour', 'أقل من 1 في اليوم')}</option>
                <option value="1-5 par jour">{questionLabel('1-5 par jour', '1-5 في اليوم')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section G: Alcohol */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">G. Boissons Alcoolisées</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {questionLabel("C.G03 Nombre de fois de consommation durant les 30 DERNIERS JOURS", "C.G03 كم مرة شربت الكحول في الـ 30 يومًا الماضية؟")}
              </label>
              <select name="alcohol_30days" onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                <option value="">--</option>
                <option value="Jamais">{questionLabel('Jamais', 'أبداً')}</option>
                <option value="1-2 fois">{questionLabel('1-2 fois', '1-2 مرات')}</option>
                <option value="3-5 fois">{questionLabel('3-5 fois', '3-5 مرات')}</option>
                <option value="6-9 fois">{questionLabel('6-9 fois', '6-9 مرات')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section I: Cannabis (Zatla) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">I. Cannabis (Zatla, الزطلة)</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {questionLabel("C.I03 Combien de fois avez-vous consommé du cannabis dans votre VIE ?", "C.I03 كم مرة تعاطيت الحشيش، الزطلة طوال حياتك؟")}
              </label>
              <select name="cannabis_lifetime" onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                <option value="">--</option>
                <option value="Jamais">{questionLabel('Jamais', 'أبداً')}</option>
                <option value="1-2 fois">{questionLabel('1-2 fois', '1-2 مرات')}</option>
                <option value="3-5 fois">{questionLabel('3-5 fois', '3-5 مرات')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {questionLabel("C.I03c Nombre de fois durant les 30 DERNIERS JOURS", "C.I03c كم مرة في الـ 30 يومًا الماضية؟")}
              </label>
              <select name="cannabis_30days" onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                <option value="">--</option>
                <option value="Jamais">{questionLabel('Jamais', 'أبداً')}</option>
                <option value="1-2 fois">{questionLabel('1-2 fois', '1-2 مرات')}</option>
                <option value="3-5 fois">{questionLabel('3-5 fois', '3-5 مرات')}</option>
              </select>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full md:w-auto px-12 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
          >
            {status === 'submitting' ? '...' : t('Submit')}
          </button>
          
          {status === 'success' && <p className="mt-4 text-green-600 font-medium">Submission stored successfully!</p>}
          {status === 'error' && <p className="mt-4 text-red-600 font-medium">An error occurred. Make sure parameters are valid.</p>}
        </div>
      </form>
    </div>
  );
};

export default QuestionnaireForm;
