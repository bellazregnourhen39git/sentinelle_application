import React, { useState } from 'react';
import {
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Send, X
} from 'lucide-react';
import api from '../api';

// ─── Shared UI Components ───────────────────────────────────────────────────────

const SectionHeader = ({ letter, title, subtitle, color = 'bg-slate-900' }) => (
  <div className={`${color} text-white rounded-2xl p-8 mb-8 relative overflow-hidden`}>
    <div className="absolute right-6 top-6 text-7xl font-black opacity-10 select-none">{letter}</div>
    <div className="relative z-10">
      <span className="text-xs font-black uppercase tracking-[3px] text-white/50 mb-2 block">Section {letter}</span>
      <h2 className="text-3xl font-extrabold leading-tight">{title}</h2>
      {subtitle && <p className="text-white/60 mt-2 text-sm font-medium">{subtitle}</p>}
    </div>
  </div>
);

const FieldLabel = ({ code, fr, ar, isRTL }) => (
  <label className="block mb-3">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{code}</span>
    <span className="text-base font-semibold text-slate-800">{isRTL ? ar : fr}</span>
  </label>
);

const SelectField = ({ name, value, onChange, options, isRTL }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-slate-50 text-slate-800 font-medium focus:border-blue-500 focus:ring-0 outline-none transition-all hover:border-slate-200"
  >
    <option value="">{isRTL ? '-- اختر --' : '-- Sélectionner --'}</option>
    {options.map(([val, label, labelAr]) => (
      <option key={val} value={val}>{isRTL && labelAr ? labelAr : label}</option>
    ))}
  </select>
);

const RadioGroup = ({ name, value, onChange, options, isRTL }) => (
  <div className="flex flex-wrap gap-3">
    {options.map(([val, label, labelAr]) => (
      <button
        key={val}
        type="button"
        onClick={() => onChange({ target: { name, value: val } })}
        className={`px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all ${value === val
          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
          }`}
      >
        {isRTL && labelAr ? labelAr : label}
      </button>
    ))}
  </div>
);

const CheckboxGroup = ({ name, values = {}, onChange, options, isRTL }) => (
  <div className="space-y-2">
    {options.map(([val, label, labelAr]) => (
      <label key={val} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer group">
        <input
          type="checkbox"
          checked={!!values[val]}
          onChange={(e) => onChange(name, val, e.target.checked)}
          className="w-5 h-5 rounded text-blue-600 border-slate-300"
        />
        <span className="font-medium text-slate-700 group-hover:text-slate-900">
          {isRTL && labelAr ? labelAr : label}
        </span>
      </label>
    ))}
  </div>
);

const GridQuestion = ({ title, code, options, items, values, onChange, isRTL }) => (
  <div className="overflow-x-auto -mx-1 px-1 mt-8">
    <div className="mb-4">
      <FieldLabel code={code} fr={title} ar={title} isRTL={isRTL} />
    </div>
    <table className="w-full text-sm border-separate border-spacing-y-2 min-w-[600px]">
      <thead>
        <tr className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
          <th className="text-left py-2 px-4">Item</th>
          {options.map(([val, fr, ar]) => (
            <th key={val} className="text-center py-2 px-2">{isRTL ? ar : fr}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(([key, fr, ar]) => (
          <tr key={key} className="bg-slate-50 transition-colors hover:bg-slate-100">
            <td className="py-4 px-4 rounded-l-2xl font-bold text-slate-700">{isRTL ? ar : fr}</td>
            {options.map(([val]) => (
              <td key={val} className="text-center py-4 px-2">
                <input type="radio" checked={values[key] === val} onChange={() => onChange(key, val)}
                  className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500" />
              </td>
            ))}
            <td className="rounded-r-2xl w-0 px-0"></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Choice Constants ────────────────────────────────────────────────────────────

const FREQ_LIFETIME = [
  ['never', 'Jamais', 'أبداً'],
  ['1_2', '1-2 fois', '1-2 مرة'],
  ['3_5', '3-5 fois', '3-5 مرات'],
  ['6_9', '6-9 fois', '6-9 مرات'],
  ['10_19', '10-19 fois', '10-19 مرة'],
  ['20_39', '20-39 fois', '20-39 مرة'],
  ['40_plus', '40 fois ou plus', '40 مرة أو أكثر'],
];

const FREQ_30DAYS_CIGS = [
  ['never', 'Jamais', 'أبداً'],
  ['lt1_week', '< 1 cigarette par semaine', 'أقل من سيجارة واحدة في الأسبوع'],
  ['lt1_day', '< 1 cigarette par jour', 'أقل من سيجارة واحدة في اليوم'],
  ['1_5_day', '1-5 par jour', '1-5 في اليوم'],
  ['6_10_day', '6-10 par jour', '6-10 في اليوم'],
  ['11_20_day', '11-20 par jour', '11-20 في اليوم'],
  ['gt20_day', '> 20 par jour', 'أكثر من 20 في اليوم'],
];

const FREQ_30DAYS_VAPE = [
  ['never', 'Jamais', 'أبداً'],
  ['lt1_week', '< 1 fois par semaine', 'أقل من مرة في الأسبوع'],
  ['ge1_week', 'Au moins 1 fois par semaine', 'على الأقل مرة واحدة في الأسبوع'],
  ['daily', 'Tous les jours ou presque', 'يومياً أو تقريباً كل يوم'],
];

const FREQ_30DAYS_HOOKAH = [
  ['never', 'Jamais', 'أبداً'],
  ['lt1_week', '< 1 par semaine', 'أقل من مرة في الأسبوع'],
  ['lt1_day', '< 1 par jour', 'أقل من مرة في اليوم'],
  ['1_5_day', '1-5 par jour', '1-5 في اليوم'],
  ['6_10_day', '6-10 par jour', '6-10 في اليوم'],
  ['11_20_day', '11-20 par jour', '11-20 في اليوم'],
  ['gt20_day', '> 20 par jour', 'أكثر من 20 في اليوم'],
];

const FREQ_30DAYS_STANDARD = [
  ['never', 'Jamais', 'أبداً'],
  ['1_2', '1-2 fois', '1-2 مرة'],
  ['3_5', '3-5 fois', '3-5 مرات'],
  ['6_9', '6-9 fois', '6-9 مرات'],
  ['10_19', '10-19 fois', '10-19 مرة'],
  ['20_39', '20-39 fois', '20-39 مرة'],
  ['40_plus', '40 fois ou plus', '40 مرة أو أكثر'],
];

const RISK_LEVELS = [
  ['none', 'Aucun', 'لا يوجد'],
  ['slight', 'Petit', 'خفيف'],
  ['moderate', 'Moyen', 'متوسط'],
  ['great', 'Grand', 'كبير'],
  ['dont_know', 'Ne sait pas', 'لا أعرف'],
];

const FREQ_ACTIVITIES = [
  ['never', 'Jamais', 'أبداً'],
  ['few_year', 'Quelques fois par an', 'بضع مرات في السنة'],
  ['1_2_month', '1 ou 2 fois par mois', 'مرة أو مرتين في الشهر'],
  ['ge1_week', 'Au moins une fois par semaine', 'مرة واحدة على الأقل في الأسبوع'],
  ['daily', 'Tous les jours', 'كل يوم'],
];

const FREQ_DIGITAL = [
  ['none', 'Aucune', 'لا شيء'],
  ['30m', 'Une demi-heure ou moins', 'نصف ساعة أو أقل'],
  ['1h', 'Environ 1 heure', 'حوالي ساعة واحدة'],
  ['2_3h', 'Environ 2-3 heures', 'حوالي 2-3 ساعات'],
  ['4_5h', 'Environ 4-5 heures', 'حوالي 4-5 ساعات'],
  ['6h_plus', '6 heures ou plus', '6 ساعات أو أكثر'],
];

const DIFFICULTY = [
  ['impossible', 'Impossible', 'مستحيل'],
  ['difficult', 'Difficile', 'صعب'],
  ['easy', 'Facile', 'سهل'],
  ['dont_know', 'Ne sait pas', 'لا أعرف'],
];

const SOCIAL_CIRCLE = [
  ['none', 'Aucun', 'لا يوجد'],
  ['few', 'Quelques-uns', 'القليل منهم'],
  ['many', 'La plupart', 'أغلبهم'],
  ['all', 'Tous', 'جميعهم'],
];

const PARENTS_USE = [
  ['none', 'Non', 'لا'],
  ['sometimes', 'Parfois', 'أحياناً'],
  ['often', 'Souvent', 'غالباً'],
  ['dont_know', 'Ne sait pas', 'لا أعرف'],
];

const FREQ_BINGE = [
  ['0', '0 fois', '0 مرة'],
  ['1', '1 fois', '1 مرة'],
  ['2', '2 fois', '2 مرة'],
  ['3_5', '3-5 fois', '3-5 مرات'],
  ['6_9', '6-9 fois', '6-9 مرات'],
  ['10_plus', '10 fois ou plus', '10 مرات أو أكثر'],
];

const AGE_SCALE = [
  ['never', 'Jamais', 'أبداً'],
  ['le9', '9 ans ou moins', '9 سنوات أو أقل'],
  ['10', '10 ans', '10 سنوات'], ['11', '11 ans', '11 سنوات'], ['12', '12 ans', '12 سنوات'],
  ['13', '13 ans', '13 سنوات'], ['14', '14 ans', '14 سنوات'], ['15', '15 ans', '15 سنوات'],
  ['ge16', '16 ans ou plus', '16 سنة أو أكثر'],
];

const HONESTY_SCALE = [
  ['admitted', 'J’ai déjà déclaré [cela]', 'لقد ذكرت ذلك بالفعل'],
  ['yes_undoubtedly', 'Oui, sans aucun doute', 'نعم، بدون أدنى شك'],
  ['probably_yes', 'Probablement oui', 'ربما نعم'],
  ['probably_no', 'Probablement pas', 'ربما لا'],
  ['no_undoubtedly', 'Non, sans aucun doute', 'لا، بدون أدنى شك'],
];

const PERFORMANCE = [
  ['below_10', 'En dessous de la moyenne (<10/20)', 'أقل من المعدل'],
  ['10_12', 'Moyen [10 – 12]', 'متوسط'],
  ['above_12', 'En dessus de la moyenne (>12/20)', 'فوق المعدل'],
];

const EDUCATION = [
  ['none', 'Sans instruction', 'بدون تعليم'],
  ['primary', 'Niveau primaire', 'المستوى الابتدائي'],
  ['college', 'Niveau collège', 'المستوى الإعدادي'],
  ['secondary', 'Niveau secondaire', 'المستوى الثانوي'],
  ['higher', 'Niveau universitaire ou plus', 'مستوى جامعي أو أكثر'],
  ['dont_know', 'Ne sait pas', 'لا أعرف'],
  ['na', 'Non applicable', 'غير قابل للتطبيق'],
  ['vocational', 'Formation professionnelle', 'تكوين مهني'],
];

const JOBS = [
  ['full_time', 'Oui, à plein temps', 'نعم، بدوام كامل'],
  ['part_time', 'Oui, temps partiel', 'نعم، بدوام جزئي'],
  ['unemployed', 'Ne travaille pas', 'لا يعمل'],
  ['retired', 'Retraité(e)', 'متقاعد(ة)'],
  ['dont_know', 'Je ne sais pas', 'لا أعرف'],
  ['na', 'Non applicable', 'غير قابل للتطبيق'],
];

const HOUSEHOLD = [
  ['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'],
  ['stepfather', 'Beau-père', 'زوج الأم'], ['stepmother', 'Belle-mère', 'زوجة الأب'],
  ['brothers', 'Frère(s)', 'إخوة'], ['sisters', 'Sœur(s)', 'أخوات'],
  ['grandparents', 'Grands parent(s)', 'أجداد'],
  ['other_relatives', 'Autres proches', 'أقارب آخرون'],
  ['institution', 'Je ne vis avec aucun de mes proches (internat...)', 'لا أعيش مع أي من أقاربي'],
];

const YES_NO = [['yes', 'Oui', 'نعم'], ['no', 'Non', 'لا']];
const YES_NO_DK = [['yes', 'Oui', 'نعم'], ['no', 'Non', 'لا'], ['dont_know', 'Ne sait pas', 'لا أعرف']];

const STRESS_FREQ = [
  ['never', 'Jamais', 'أبداً'],
  ['almost_never', 'Presque jamais', 'نادراً'],
  ['sometimes', 'Parfois', 'أحياناً'],
  ['fairly_often', 'Assez souvent', 'في أغلب الأحيان'],
  ['very_often', 'Très souvent', 'دائماً'],
];

const SATISFACTION_SCALE = [
  ['very_satisfied', 'Très satisfait(e)', 'راضٍ جداً'],
  ['satisfied', 'Satisfait(e)', 'راضٍ'],
  ['neutral', 'Ni satisfait(e) ni insatisfait(e)', 'محايد'],
  ['not_so_satisfied', 'Pas tellement satisfait(e)', 'غير راضٍ تماماً'],
  ['unsatisfied', 'Non satisfait(e)', 'غير راضٍ'],
  ['na', 'Non applicable', 'غير قابل للتطبيق'],
];

const FIGHT_FREQUENCY = [
  ['0', '0 fois', '0 مرة'],
  ['1', '1 fois', '1 مرة'],
  ['2_3', '2-3 fois', '2-3 مرات'],
  ['4_5', '4-5 fois', '4-5 مرات'],
  ['6_7', '6-7 fois', '6-7 مرات'],
  ['8_9', '8-9 fois', '8-9 مرات'],
  ['10_11', '10-11 fois', '10-11 مرّة'],
  ['12_plus', '12 fois ou plus', '12 مرة أو أكثر'],
];

const AGREEMENT_SCALE = [
  ['strongly_agree', 'Tout à fait d\'accord', 'أوافق بشدة'],
  ['agree', 'D\'accord', 'أوافق'],
  ['disagree', 'Pas d\'accord', 'لا أوافق'],
  ['strongly_disagree', 'Pas du tout d\'accord', 'لا أوافق بشدة'],
];

const ECONOMIC = [
  ['superior', 'Supérieure aux autres familles', 'أعلى من بقية العائلات'],
  ['identical', 'Identique aux autres familles', 'مماثلة لبقية العائلات'],
  ['inferior', 'Inférieure aux autres familles', 'أقل من بقية العائلات'],
];

const FREQ_30DAYS = FREQ_30DAYS_STANDARD;
const DIFFICULTY_LEVELS = DIFFICULTY;
const SOCIAL_CIRCLE_OPTIONS = YES_NO_DK;
const AGE_FIRST_USE = AGE_SCALE;
const JOB_STATUS = JOBS;
const FREQ_LIFETIME_12M = FREQ_LIFETIME;
const FREQ_LIFETIME_12M_30D = FREQ_LIFETIME;
const FREQ_LIFETIME_30D = FREQ_LIFETIME;
const AGREEMENT_SCALE_SIMPLE = AGREEMENT_SCALE;

// ─── Initial State ──────────────────────────────────────────────────────────────

const INITIAL_DATA = {
  section_a: {
    gender: '', birth_month: '', birth_year: '', academic_performance: '',
    activities_frequency: {}, school_absences: {}, household_members: [],
    parents_absence_reason: '', parents_absence_reason_other: '', nights_out_30days: '',
    family_relationship_satisfaction: {}
  },
  section_b: { father_education: '', mother_education: '', father_job: '', mother_job: '', economic_status: '' },
  section_c: { access_difficulty: '', family_smoke: '', friends_smoke: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', age_daily_use: '' },
  section_d: { access_difficulty: '', family_vape: '', friends_vape: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', age_daily_use: '' },
  section_e: { access_difficulty: '', family_hookah: '', friends_hookah: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', age_daily_use: '' },
  section_g: { access_difficulty: {}, family_use: '', friends_use: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', days_30_by_type: {}, binge_drinking_30days: '', intoxication_lifetime: '', intoxication_12months: '', intoxication_30days: '', age_first_drink: '', age_first_intoxication: '' },
  section_h: { access_difficulty: '', family_use: '', friends_use: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '' },
  section_i: { access_difficulty: '', family_use: '', friends_use: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', cannabis_types_12months: {}, cannabis_problems_12months: {} },
  section_j: { access_difficulty: '', family_use: '', friends_use: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '' },
  section_k: { access_difficulty: '', family_use: '', friends_use: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '' },
  section_l: { access_difficulty: '', family_use: '', friends_use: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '' },
  section_m: { access_difficulty: '', family_use: '', friends_use: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '' },
  section_n: { lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', forms: {}, synthetic_cannabinoids: '', synthetic_cathinones: '' },
  section_p: { frequencies: {}, forms: {}, substances_lifetime: {} },
  section_q: { risk_perceptions: {}, help_sources: {}, friend_use_risk: '' },
  section_r: { hours_per_day: '', agreement: {} },
  section_s: { hours_per_day: '', days_per_week: '', agreement: {} },
  section_t: { months_12_freq: '', offline_games: {}, online_games: {}, felt_need_increase: '', lied_about_it: '', gambling_problems: {} },
  section_u: { fights_12months: '', fight_circumstances: '', fight_location: '', staff_intervention: '', fight_consequences: [], serious_injury_12months: '' },
  section_v: { control: '', confidence: '', success: '', difficulties: '' },
  section_z: { honesty_alcohol: '', honesty_cannabis: '' },
};

// ─── The Form Component ─────────────────────────────────────────────────────────

const QuestionnaireForm = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState(null);
  const [lang, setLang] = useState('fr');
  const isRTL = lang === 'ar';

  const update = (section, field, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateCheck = (section, field, key, checked) => {
    setData(prev => {
      const current = prev[section][field] || {};
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: { ...current, [key]: checked }
        }
      };
    });
  };

  const toggleList = (section, field, value) => {
    setData(prev => {
      const current = prev[section][field] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return {
        ...prev,
        [section]: { ...prev[section], [field]: updated }
      };
    });
  };

  const handleChange = (section) => (e) => update(section, e.target.name, e.target.value);

  const handleSubmit = async () => {
    setStatus('submitting');
    setErrors(null);
    try {
      await api.post('questionnaire/submit/', {
        school_class: 1, // Placeholder
        language_used: lang.toUpperCase(),
        ...data,
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
      setStatus('error');
    }
  };

  const SECTIONS = [
    {
      id: 'section_a',
      letter: 'A',
      title: 'Informations Générales',
      color: 'bg-slate-900',
      content: (
        <div className="space-y-12">
          {/* C.A01 */}
          <div>
            <FieldLabel code="C.A01" fr="Genre?" ar="الجنس؟" isRTL={isRTL} />
            <RadioGroup name="gender" value={data.section_a.gender} onChange={handleChange('section_a')}
              options={[['M', 'Masculin', 'ذكر'], ['F', 'Féminin', 'أنثى']]} isRTL={isRTL} />
          </div>

          {/* C.A02 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel code="C.A02-M" fr="Mois de naissance" ar="شهر الميلاد" isRTL={isRTL} />
                <SelectField name="birth_month" value={data.section_a.birth_month} onChange={handleChange('section_a')} isRTL={isRTL}
                  options={['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => [String(i + 1), m, m])} />
              </div>
              <div>
                <FieldLabel code="C.A02-Y" fr="Année de naissance" ar="سنة الميلاد" isRTL={isRTL} />
                <input type="number" name="birth_year" placeholder="2008" value={data.section_a.birth_year} onChange={handleChange('section_a')}
                  className="w-full border-2 border-slate-100 rounded-xl px-4 py-[10.5px] bg-slate-50 text-slate-800 font-medium focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* C.A03 */}
          <GridQuestion title="À Quelle fréquence pratiquez-vous chacune des activités suivantes ?" code="C.A03" isRTL={isRTL}
            options={FREQ_ACTIVITIES} values={data.section_a.activities_frequency}
            onChange={(key, val) => updateCheck('section_a', 'activities_frequency', key, val)}
            items={[
              ['sports', 'Activité sportive de tout type', 'نشاط رياضي من أي نوع'],
              ['reading', 'Lire des livres pour le plaisir', 'قراءة الكتب للمتعة'],
              ['going_out', 'Sortir le soir (bar, fête...)', 'الخروج في المساء (ملهى، حفلة...)'],
              ['hobbies', 'Autres loisirs (musique, art...)', 'هوايات أخرى (موسيقى، فن...)'],
              ['mall_park', 'Se retrouver entre amis (rue, parc...)', 'اللقاء مع الأصدقاء (شارع، منتزه...)'],
              ['internet', 'Utiliser Internet pour s’amuser', 'استخدام الإنترنت للمتعة'],
              ['tv', 'Regarder la télévision', 'مشاهدة التلفاز']
            ]} />

          {/* C.A04 */}
          <GridQuestion title="Au cours du dernier mois, combien de jours avez-vous manqué le lycée pour l'une des raisons suivantes ?" code="C.A04" isRTL={isRTL}
            options={[['never', 'Jamais'], ['1', '1 jour'], ['2', '2 jours'], ['3_4', '3-4 jours'], ['5_6', '5-6 jours'], ['7_plus', '7 jours+']]}
            values={data.section_a.school_absences}
            onChange={(key, val) => updateCheck('section_a', 'school_absences', key, val)}
            items={[
              ['sick', 'Parce que vous étiez malade', 'لأنك كنت مريضاً'],
              ['no_desire', 'Parce que vous n’aviez pas envie', 'لأنك لم ترغب في الذهاب'],
              ['admin_problems', 'Problèmes avec l’administration', 'مشاكل مع الإدارة'],
              ['friend_problems', 'Problèmes avec des ami(e)s', 'مشاكل مع الأصدقاء'],
              ['expelled', 'Parce que vous avez été renvoyé', 'لأنك طُردت'],
              ['other', 'Pour d’autres raisons', 'لأسباب أخرى']
            ]} />

          {/* C.A05 */}
          <div>
            <FieldLabel code="C.A05" fr="Comment évaluez-vous votre rendement scolaire à la fin du dernier trimestre ?" ar="كيف تقيم مستواك الدراسي؟" isRTL={isRTL} />
            <RadioGroup name="academic_performance" value={data.section_a.academic_performance} onChange={handleChange('section_a')} isRTL={isRTL} options={PERFORMANCE} />
          </div>

          {/* C.A07 */}
          <div>
            <FieldLabel code="C.A07" fr="Laquelle/lesquelles des personnes suivantes vit avec vous dans la même maison?" ar="من من الأشخاص التاليين يعيش معك؟" isRTL={isRTL} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {HOUSEHOLD.map(([val, fr, ar]) => (
                <label key={val} className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${data.section_a.household_members.includes(val) ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <input type="checkbox" checked={data.section_a.household_members.includes(val)}
                    onChange={() => toggleList('section_a', 'household_members', val)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-800 font-bold text-sm">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* C.A07/2 */}
          <div>
            <FieldLabel code="C.A07/2" fr="Si vous n’habitez pas avec vos parents ensemble, précisez pourquoi ?" ar="إذا كنت لا تعيش مع والديك، وضح السبب" isRTL={isRTL} />
            <RadioGroup name="parents_absence_reason" value={data.section_a.parents_absence_reason} onChange={handleChange('section_a')}
              options={[['death', 'Décès', 'وفاة'], ['divorce', 'Divorce', 'طلاق'], ['migration', 'Migration', 'هجرة'], ['other', 'Autres causes', 'أسباب أخرى']]} isRTL={isRTL} />
            {data.section_a.parents_absence_reason === 'other' && (
              <input type="text" name="parents_absence_reason_other" placeholder="Précisez..." value={data.section_a.parents_absence_reason_other}
                onChange={handleChange('section_a')} className="mt-4 w-full border-b-2 border-slate-200 py-2 focus:border-blue-500 outline-none" />
            )}
          </div>

          {/* O.A08 */}
          <div>
            <FieldLabel code="O.A08" fr="Durant les 30 derniers jours, combien de nuits avez vous passé en dehors de la maison ?" ar="خلال الـ 30 يومًا الماضية، كم ليلة قضيتها خارج المنزل؟" isRTL={isRTL} />
            <SelectField name="nights_out_30days" value={data.section_a.nights_out_30days} onChange={handleChange('section_a')} isRTL={isRTL}
              options={[['0', 'Aucune nuit', 'لا ليلة'], ['1', '1 nuit', 'ليلة واحدة'], ['2', '2 nuits', 'ليلتان'], ['3', '3 nuits', '3 ليالي'], ['4', '4 nuits', '4 ليالي'], ['5', '5 nuits', '5 ليالي'], ['6', '6 nuits', '6 ليالي'], ['7_plus', '7 nuits ou plus', '7 ليالي أو أكثر']]} />
          </div>

          {/* C.A09 */}
          <GridQuestion title="D’une manière générale, quel est votre degré de satisfaction de votre relation avec :" code="C.A09" isRTL={isRTL}
            options={SATISFACTION_SCALE} values={data.section_a.family_relationship_satisfaction}
            onChange={(key, val) => updateCheck('section_a', 'family_relationship_satisfaction', key, val)}
            items={[
              ['mother', 'Votre mère', 'أمك'], ['father', 'Votre père', 'أبوك'],
              ['stepmother', 'Votre belle-mère', 'زوجة أبيك'], ['stepfather', 'Votre beau-père', 'زوج أمك'],
              ['siblings', 'Votre fratrie', 'إخوتك'], ['friends', 'Vos ami(e)s', 'أصدقاؤك'],
              ['classmates', 'Vos camarades de classe', 'زملاؤك في القسم'], ['teachers', 'Vos enseignants', 'أساتذتك'],
              ['admin', 'L’administration du lycée', 'إدارة المعهد']
            ]} />
        </div>
      )
    },
    {
      id: 'section_b',
      letter: 'B',
      title: 'Famille & Situation Socio-Économique',
      color: 'bg-blue-900',
      content: (
        <div className="space-y-12">
          {/* C.B01 */}
          <div>
            <FieldLabel code="C.B01" fr="Quel est le plus haut niveau de scolarité atteint par votre père ?" ar="ما هو أعلى مستوى تعليمي وصل إليه والدك؟" isRTL={isRTL} />
            <RadioGroup name="father_education" value={data.section_b.father_education} onChange={handleChange('section_b')} options={EDUCATION} isRTL={isRTL} />
          </div>

          {/* C.B02 */}
          <div>
            <FieldLabel code="C.B02" fr="Quel est le plus haut niveau de scolarité atteint par votre mère ?" ar="ما هو أعلى مستوى تعليمي وصلت إليه والدتك؟" isRTL={isRTL} />
            <RadioGroup name="mother_education" value={data.section_b.mother_education} onChange={handleChange('section_b')} options={EDUCATION} isRTL={isRTL} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* C.B03 */}
            <div>
              <FieldLabel code="C.B03" fr="Votre père a-t-il un emploi ?" ar="هل والدك يعمل؟" isRTL={isRTL} />
              <RadioGroup name="father_job" value={data.section_b.father_job} onChange={handleChange('section_b')} options={JOB_STATUS} isRTL={isRTL} />
            </div>

            {/* C.B04 */}
            <div>
              <FieldLabel code="C.B04" fr="Votre mère a-t-elle un emploi ?" ar="هل والدتك تعمل؟" isRTL={isRTL} />
              <RadioGroup name="mother_job" value={data.section_b.mother_job} onChange={handleChange('section_b')} options={JOB_STATUS} isRTL={isRTL} />
            </div>
          </div>

          {/* C.B05 */}
          <div>
            <FieldLabel code="C.B05" fr="Comment décrivez-vous la situation économique de votre famille par rapport au niveau économique des autres familles en Tunisie ?" ar="كيف تصف الوضع الاقتصادي لعائلتك مقارنة بالعائلات الأخرى؟" isRTL={isRTL} />
            <RadioGroup name="economic_status" value={data.section_b.economic_status} onChange={handleChange('section_b')} options={ECONOMIC} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_c',
      letter: 'C',
      title: 'Consommation de Tabac',
      subtitle: 'Section C',
      color: 'bg-amber-600',
      content: (
        <div className="space-y-12">
          {/* C.C01 */}
          <div>
            <FieldLabel code="C.C01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des cigarettes si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على السجائر؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_c.access_difficulty} onChange={handleChange('section_c')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.C02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui fume des cigarettes?" code="C.C02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_c.social_circle}
            onChange={(key, val) => updateCheck('section_c', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.C03 */}
          <GridQuestion title="Combien de fois avez-vous fumé des cigarettes (sans compter les cigarettes électroniques)?" code="C.C03" isRTL={isRTL}
            options={FREQ_LIFETIME_12M} values={data.section_c}
            onChange={(key, val) => update('section_c', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.C04 */}
          <div>
            <FieldLabel code="C.C04" fr="Combien de fois avez-vous fumé des cigarettes au cours des 30 DERNIERS JOURS? (sans compter les cigarettes électroniques)" ar="كم مرة دخنت السجائر خلال الـ 30 يومًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="days_30_freq" value={data.section_c.days_30_freq} onChange={handleChange('section_c')} options={FREQ_30DAYS_CIGS} isRTL={isRTL} />
          </div>

          {/* C.C05 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit?" code="C.C05" isRTL={isRTL}
            options={AGE_FIRST_USE} values={data.section_c}
            onChange={(key, val) => update('section_c', key, val)}
            items={[['age_first_use', 'Fumé votre première cigarette', 'دخنت أول سيجارة'], ['age_daily_use', 'Fumé quotidiennement', 'دخنت يومياً']]} />
        </div>
      )
    },
    {
      id: 'section_d',
      letter: 'D',
      title: 'Cigarettes Électroniques',
      subtitle: 'Section D',
      color: 'bg-emerald-600',
      content: (
        <div className="space-y-12">
          {/* C.D01 */}
          <div>
            <FieldLabel code="C.D01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des cigarettes électroniques si vous le vouliez? " ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على السجائر الإلكترونية؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_d.access_difficulty} onChange={handleChange('section_d')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.D02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui fume des cigarettes électroniques?" code="C.D02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_d.social_circle}
            onChange={(key, val) => updateCheck('section_d', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.D03 */}
          <GridQuestion title="Combien de fois avez-vous fumé des cigarettes électroniques?" code="C.D03" isRTL={isRTL}
            options={FREQ_LIFETIME_12M} values={data.section_d}
            onChange={(key, val) => update('section_d', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.D04 */}
          <div>
            <FieldLabel code="C.D04" fr="Combien de fois avez-vous fumé des cigarettes électroniques au cours des 30 DERNIERS JOURS?" ar="كم مرة دخنت السجائر الإلكترونية خلال الـ 30 يومًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="days_30_freq" value={data.section_d.days_30_freq} onChange={handleChange('section_d')} options={FREQ_30DAYS_VAPE} isRTL={isRTL} />
          </div>

          {/* C.D05 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit ?" code="C.D05" isRTL={isRTL}
            options={AGE_FIRST_USE} values={data.section_d}
            onChange={(key, val) => update('section_d', key, val)}
            items={[['age_first_use', 'Utilisé pour la première fois une cigarette électronique', 'استخدمت السيجارة الإلكترونية لأول مرة'], ['age_daily_use', 'Utilisé quotidiennement', 'استخدمتها يومياً']]} />
        </div>
      )
    },
    {
      id: 'section_e',
      letter: 'E',
      title: 'Consommation de Narguilé (Chicha)',
      subtitle: 'Section E',
      color: 'bg-orange-600',
      content: (
        <div className="space-y-12">
          {/* C.E01 */}
          <div>
            <FieldLabel code="C.E01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer un narguilé si vous le vouliez ?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الشيشة؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_e.access_difficulty} onChange={handleChange('section_e')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.E02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui fume le narguilé?" code="C.E02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_e.social_circle}
            onChange={(key, val) => updateCheck('section_e', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.E03 */}
          <GridQuestion title="Combien de fois avez-vous fumé narguilé?" code="C.E03" isRTL={isRTL}
            options={FREQ_LIFETIME_12M} values={data.section_e}
            onChange={(key, val) => update('section_e', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.E04 */}
          <div>
            <FieldLabel code="C.E04" fr="Combien de fois avez-vous fumé le narguilé au cours des 30 DERNIERS JOURS ?" ar="كم مرة دخنت الشيشة خلال الـ 30 يومًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="days_30_freq" value={data.section_e.days_30_freq} onChange={handleChange('section_e')} options={FREQ_30DAYS_HOOKAH} isRTL={isRTL} />
          </div>

          {/* C.E05 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit?" code="C.E05" isRTL={isRTL}
            options={AGE_FIRST_USE} values={data.section_e}
            onChange={(key, val) => update('section_e', key, val)}
            items={[['age_first_use', 'Fumé pour la première fois le narguilé', 'دخنت الشيشة لأول مرة'], ['age_daily_use', 'Fumé quotidiennement le narguilé', 'دخنتها يومياً']]} />
        </div>
      )
    },
    {
      id: 'section_g',
      letter: 'G',
      title: 'Boissons Alcoolisées',
      color: 'bg-amber-800',
      content: (
        <div className="space-y-12">
          {/* C.G01 */}
          <GridQuestion title="À quel point pensez-vous qu'il serait difficile de vous procurer les boissons suivantes si vous le vouliez ?" code="C.G01" isRTL={isRTL}
            options={DIFFICULTY_LEVELS} values={data.section_g.access_difficulty}
            onChange={(key, val) => updateCheck('section_g', 'access_difficulty', key, val)}
            items={[['beer', 'Bière', 'بيرة'], ['wine', 'Vin', 'نبيذ'], ['spirits', 'Alcools forts', 'خمور قوية']]} />

          {/* C.G02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme les boissons alcoolisées?" code="C.G02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_g.social_circle}
            onChange={(key, val) => updateCheck('section_g', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.G03 */}
          <GridQuestion title="Combien de fois avez-vous consommé des boissons alcoolisées?" code="C.G03" isRTL={isRTL}
            options={FREQ_LIFETIME_12M} values={data.section_g}
            onChange={(key, val) => update('section_g', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.G04 */}
          <GridQuestion title="Combien de fois avez-vous consommé les boissons alcoolisées suivantes au cours des 30 DERNIERS JOURS?" code="C.G04" isRTL={isRTL}
            options={FREQ_30DAYS} values={data.section_g.days_30_by_type}
            onChange={(key, val) => updateCheck('section_g', 'days_30_by_type', key, val)}
            items={[['beer', 'Bière', 'بيرة'], ['wine', 'Vin', 'نبيذ'], ['spirits', 'Alcools forts', 'خمور قوية']]} />

          {/* C.G05 */}
          <div>
            <FieldLabel code="C.G05" fr="Durant les 30 DERNIERS JOURS, combien de fois avez-vous consommé 5 boissons alcoolisées ou plus à la même occasion ?" ar="خلال الـ 30 يومًا الماضية، كم مرة تناولت 5 مشروبات كحولية أو أكثر؟" isRTL={isRTL} />
            <RadioGroup name="binge_drinking_30days" value={data.section_g.binge_drinking_30days} onChange={handleChange('section_g')} options={FREQ_BINGE} isRTL={isRTL} />
          </div>

          {/* C.G06 */}
          <GridQuestion title="Combien de fois (éventuellement) avez-vous été intoxiqué par la consommation des boissons alcoolisées?" code="C.G06" isRTL={isRTL}
            options={FREQ_LIFETIME_12M_30D} values={data.section_g}
            onChange={(key, val) => update('section_g', key, val)}
            items={[['intoxication_lifetime', 'Au cours de votre vie', 'طوال حياتك'], ['intoxication_12months', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['intoxication_30days', 'Au cours des 30 derniers jours', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.G07 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit pour la première fois ?" code="C.G07" isRTL={isRTL}
            options={AGE_FIRST_USE} values={data.section_g}
            onChange={(key, val) => update('section_g', key, val)}
            items={[['age_first_drink', 'Boire de l’alcool', 'شرب الكحول'], ['age_first_intoxication', 'Être intoxiqué (soûl)', 'الوقوع في السكر']]} />
        </div>
      )
    },
    {
      id: 'section_h',
      letter: 'H',
      title: 'Tranquillisants ou Sédatifs (sans ordonnance)',
      subtitle: 'Section H',
      color: 'bg-purple-900',
      content: (
        <div className="space-y-12">
          {/* C.H01 */}
          <div>
            <FieldLabel code="C.H01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des tranquillisants ou sédatifs (sans ordonnance) si vous le vouliez ?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على المهدئات؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_h.access_difficulty} onChange={handleChange('section_h')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.H02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme des tranquillisants ou sédatifs (sans ordonnance) ?" code="C.H02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_h.social_circle}
            onChange={(key, val) => updateCheck('section_h', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.H03 */}
          <GridQuestion title="Combien de fois avez-vous consommé des tranquillisants ou sédatifs (sans ordonnance) ?" code="C.H03" isRTL={isRTL}
            options={FREQ_LIFETIME_12M_30D} values={data.section_h}
            onChange={(key, val) => update('section_h', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['days_30_freq', 'Au cours des 30 derniers jours', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.H04 */}
          <div>
            <FieldLabel code="C.H04" fr="À quel âge avez-vous consommé des tranquillisants ou sédatifs (sans ordonnance) pour la première fois ?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_h.age_first_use} onChange={handleChange('section_h')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_i',
      letter: 'I',
      title: 'Cannabis (Zatla, Marihuana...)',
      subtitle: 'Section I',
      color: 'bg-green-900',
      content: (
        <div className="space-y-12">
          {/* C.I01 */}
          <div>
            <FieldLabel code="C.I01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer du cannabis si vous le vouliez ?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على القنب الهندي؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_i.access_difficulty} onChange={handleChange('section_i')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.I02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme du cannabis?" code="C.I02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_i.social_circle}
            onChange={(key, val) => updateCheck('section_i', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.I03 */}
          <div>
            <FieldLabel code="C.I03" fr="À quel âge avez-vous consommé du cannabis pour la première fois ?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_i.age_first_use} onChange={handleChange('section_i')} options={AGE_SCALE} isRTL={isRTL} />
          </div>

          {/* C.I04 */}
          <GridQuestion title="Combien de fois avez-vous consommé du cannabis?" code="C.I04" isRTL={isRTL}
            options={FREQ_LIFETIME_12M_30D} values={data.section_i}
            onChange={(key, val) => update('section_i', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['days_30_freq', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.I06 */}
          <div>
            <FieldLabel code="C.I06" fr="Avez-vous consommé du cannabis durant les 12 DERNIERS MOIS ?" ar="هل استهلكت القنب الهندي خلال الـ 12 شهرًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="use_last_12months" value={data.section_i.use_last_12months} onChange={handleChange('section_i')} options={YES_NO} isRTL={isRTL} />
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.I08</span>{isRTL ? 'أنواع القنب المستعملة خلال الـ 12 شهرًا الأخيرة:' : 'Plus précisément, quel type de cannabis avez-vous utilisé au cours des 12 derniers mois?'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['resin', 'Résine (Zatla, Hachich)', 'راتنج (زطلة، حشيش)'], ['leaves', 'Herbe (Marihuana, Kif, Fleur)', 'أوراق (ماريجوانا، كيف، زهرة)']].map(([key, fr, ar]) => (
                <label key={key} className={`flex items-center space-x-3 p-4 bg-white rounded-2xl border-2 transition-all cursor-pointer ${data.section_i.cannabis_types_12months[key] ? 'border-green-500 bg-green-50/30' : 'border-slate-100'}`}>
                  <input type="checkbox" checked={data.section_i.cannabis_types_12months[key]}
                    onChange={(e) => updateCheck('section_i', 'cannabis_types_12months', key, e.target.checked)} className="w-5 h-5 rounded text-green-600 focus:ring-green-500" />
                  <span className="font-bold text-slate-700">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-8 bg-slate-100 rounded-[2.5rem] border-2 border-white shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full uppercase tracking-tighter">SCREENING CAST</span>
                {isRTL ? 'مشاكل متعلقة بالقنب (آخر 12 شهر):' : 'Evaluation Usage Cannabis (12m)'}
              </h4>
            </div>
            <div className="space-y-4">
              {[
                ['noon', 'C.I09/1', 'Consommé avant midi ?', 'قبل الظهر؟'],
                ['alone', 'C.I09/2', 'Consommé seul ?', 'وحدك؟'],
                ['memory', 'C.I09/3', 'Problèmes de mémoire ?', 'مشاكل في الذاكرة؟'],
                ['advice', 'C.I09/4', 'Famille/amis conseillé d’arrêter ?', 'نصيحة العائلة/الأصدقاء بالتوقف؟'],
                ['tried_stop', 'C.I09/5', 'Essai de s’arrêter sans succès ?', 'محاولة التوقف بدون نجاح؟'],
                ['problems', 'C.I09/6', 'Problèmes (dispute, accident...) ?', 'مشاكل (شجار، حادث...)؟']
              ].map(([key, code, fr, ar]) => (
                <div key={key} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 hover:border-green-200 transition-colors gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">{code}</span>
                    <span className="font-bold text-slate-700">{isRTL ? ar : fr}</span>
                  </div>
                  <RadioGroup name={key} value={data.section_i.cannabis_problems_12months[key]}
                    onChange={(e) => updateCheck('section_i', 'cannabis_problems_12months', key, e.target.value)} options={YES_NO} isRTL={isRTL} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'section_j',
      letter: 'J',
      title: 'Cocaïne',
      subtitle: 'Section J',
      color: 'bg-red-900',
      content: (
        <div className="space-y-12">
          {/* C.J01 */}
          <div>
            <FieldLabel code="C.J01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer de la cocaïne si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الكوكايين؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_j.access_difficulty} onChange={handleChange('section_j')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.J02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme de la cocaïne?" code="C.J02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_j.social_circle}
            onChange={(key, val) => updateCheck('section_j', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.J03 */}
          <div>
            <FieldLabel code="C.J03" fr="À quel âge avez-vous consommé de la cocaïne pour la première fois?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_j.age_first_use} onChange={handleChange('section_j')} options={AGE_SCALE} isRTL={isRTL} />
          </div>

          {/* C.J04 */}
          <GridQuestion title="Combien de fois avez-vous consommé de la cocaïne?" code="C.J04" isRTL={isRTL}
            options={FREQ_LIFETIME_30D} values={data.section_j}
            onChange={(key, val) => update('section_j', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['days_30_freq', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.J06 */}
          <div>
            <FieldLabel code="C.J06" fr="Avez-vous consommé de la cocaïne durant les 12 DERNIERS MOIS ?" ar="هل استهلكت الكوكايين خلال الـ 12 شهرًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="use_last_12months" value={data.section_j.use_last_12months} onChange={handleChange('section_j')} options={YES_NO} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_k',
      letter: 'K',
      title: 'Ecstasy',
      subtitle: 'Section K',
      color: 'bg-pink-700',
      content: (
        <div className="space-y-12">
          {/* C.K01 */}
          <div>
            <FieldLabel code="C.K01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer de l'ecstasy si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الإكستازي؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_k.access_difficulty} onChange={handleChange('section_k')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.K02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme de l'ecstasy?" code="C.K02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_k.social_circle}
            onChange={(key, val) => updateCheck('section_k', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.K03 */}
          <div>
            <FieldLabel code="C.K03" fr="À quel âge avez-vous consommé de l'ecstasy pour la première fois?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_k.age_first_use} onChange={handleChange('section_k')} options={AGE_SCALE} isRTL={isRTL} />
          </div>

          {/* C.K04 */}
          <GridQuestion title="Combien de fois avez-vous consommé de l'ecstasy?" code="C.K04" isRTL={isRTL}
            options={FREQ_LIFETIME_30D} values={data.section_k}
            onChange={(key, val) => update('section_k', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['days_30_freq', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.K06 */}
          <div>
            <FieldLabel code="C.K06" fr="Avez-vous consommé de l'ecstasy durant les 12 DERNIERS MOIS ?" ar="هل استهلكت الإكستازي خلال الـ 12 شهرًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="use_last_12months" value={data.section_k.use_last_12months} onChange={handleChange('section_k')} options={YES_NO} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_l',
      letter: 'L',
      title: 'Héroïne',
      subtitle: 'Section L',
      color: 'bg-stone-900',
      content: (
        <div className="space-y-12">
          {/* C.L01 */}
          <div>
            <FieldLabel code="C.L01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer de l'héroïne si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الهيروين؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_l.access_difficulty} onChange={handleChange('section_l')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.L02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme de l'héroïne?" code="C.L02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_l.social_circle}
            onChange={(key, val) => updateCheck('section_l', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.L03 */}
          <div>
            <FieldLabel code="C.L03" fr="À quel âge avez-vous consommé de l'héroïne pour la première fois?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_l.age_first_use} onChange={handleChange('section_l')} options={AGE_SCALE} isRTL={isRTL} />
          </div>

          {/* C.L04 */}
          <GridQuestion title="Combien de fois avez-vous consommé de l'héroïne?" code="C.L04" isRTL={isRTL}
            options={FREQ_LIFETIME_30D} values={data.section_l}
            onChange={(key, val) => update('section_l', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['days_30_freq', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.L06 */}
          <div>
            <FieldLabel code="C.L06" fr="Avez-vous consommé de l'héroïne durant les 12 DERNIERS MOIS ?" ar="هل استهلكت الهيروين خلال الـ 12 شهرًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="use_last_12months" value={data.section_l.use_last_12months} onChange={handleChange('section_l')} options={YES_NO} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_m',
      letter: 'M',
      title: 'Solvants et Inhalants',
      subtitle: 'Section M',
      color: 'bg-zinc-800',
      content: (
        <div className="space-y-12">
          {/* C.M01 */}
          <div>
            <FieldLabel code="C.M01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des solvants ou des inhalants (Colle, Diluant, Essence...) si vous le vouliez ?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على المذيبات؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_m.access_difficulty} onChange={handleChange('section_m')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.M02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme des solvants ou des inhalants (Colle, Diluant, Essence...)?" code="C.M02" isRTL={isRTL}
            options={SOCIAL_CIRCLE_OPTIONS} values={data.section_m.social_circle}
            onChange={(key, val) => updateCheck('section_m', 'social_circle', key, val)}
            items={[['father', 'Père', 'الأب'], ['mother', 'Mère', 'الأم'], ['siblings', 'Fratrie', 'الإخوة'], ['best_friend', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['other_friends', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.M03 */}
          <div>
            <FieldLabel code="C.M03" fr="À quel âge avez-vous consommé des solvants ou des inhalants (Colle, Diluant, Essence...) pour la première fois ?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_m.age_first_use} onChange={handleChange('section_m')} options={AGE_SCALE} isRTL={isRTL} />
          </div>

          {/* C.M04 */}
          <GridQuestion title="Combien de fois avez-vous consommé des solvants ou des inhalants (Colle, Diluant, Essence...)?" code="C.M04" isRTL={isRTL}
            options={FREQ_LIFETIME_30D} values={data.section_m}
            onChange={(key, val) => update('section_m', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['days_30_freq', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.M06 */}
          <div>
            <FieldLabel code="C.M06" fr="Avez-vous consommé des solvants ou des inhalants durant les 12 DERNIERS MOIS ?" ar="هل استهلكت المذيبات خلال الـ 12 شهرًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="use_last_12months" value={data.section_m.use_last_12months} onChange={handleChange('section_m')} options={YES_NO} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_n',
      letter: 'N',
      title: 'Nouvelles Substances (NSP)',
      subtitle: 'Section N',
      color: 'bg-yellow-800',
      content: (
        <div className="space-y-12">
          {/* C.N01 */}
          <GridQuestion title="Combien de fois avez-vous consommé des nouvelles substances psychoactives (NSP) ?" code="C.N01" isRTL={isRTL}
            options={FREQ_LIFETIME_12M_30D} values={data.section_n}
            onChange={(key, val) => update('section_n', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['days_30_freq', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.N04 */}
          <div>
            <FieldLabel code="C.N04" fr="À quel âge avez-vous consommé des nouvelles substances psychoactives (NSP) pour la première fois ?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_n.age_first_use} onChange={handleChange('section_n')} options={AGE_SCALE} isRTL={isRTL} />
          </div>

          {/* C.N05 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.N05</span>{isRTL ? 'تحت أي شكل كانت هذه المواد (NPS):' : 'Sous quelle forme se présentaient ces substances (NSP) :'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ['herbal', 'Herbes', 'أعشاب'],
                ['powder', 'Poudre', 'مسحوق'],
                ['pills', 'Pilules / Tablettes', 'حبوب / أقراص'],
                ['blotter', 'Buvard', 'منشف'],
                ['other', 'Autre', 'أخرى']
              ].map(([key, fr, ar]) => (
                <label key={key} className={`flex items-center space-x-3 p-3 bg-white rounded-xl border-2 transition-all cursor-pointer ${data.section_n.forms[key] ? 'border-yellow-500 bg-yellow-50/30' : 'border-slate-100'}`}>
                  <input type="checkbox" checked={data.section_n.forms[key]}
                    onChange={(e) => updateCheck('section_n', 'forms', key, e.target.checked)} className="w-5 h-5 rounded text-yellow-600 focus:ring-yellow-500" />
                  <span className="font-bold text-slate-700 text-sm">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'section_p',
      letter: 'P',
      title: 'Autres Substances & Nouvelles Formes',
      subtitle: 'Section P',
      color: 'bg-rose-900',
      content: (
        <div className="space-y-12">
          {/* C.P01 */}
          <GridQuestion title="Combien de fois avez-vous consommé l’une de ces substances (LSD, stéroïdes, GHB, crack...) ?" code="C.P01" isRTL={isRTL}
            options={FREQ_LIFETIME_12M_30D} values={data.section_p.frequencies}
            onChange={(key, val) => updateCheck('section_p', 'frequencies', key, val)}
            items={[['lifetime', 'Au cours de votre vie', 'طوال حياتك'], ['last_12months', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['last_30days', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.P03 */}
          <GridQuestion title="Combien de fois DANS VOTRE VIE avez-vous consommé l'une des substances suivantes :" code="C.P03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_p.substances_lifetime}
            onChange={(key, val) => updateCheck('section_p', 'substances_lifetime', key, val)}
            items={[
              ['lsd', 'LSD ou autres hallucinogènes', 'LSD أو مهلوسات أخرى'],
              ['steroids', 'Stéroïdes anabolisants', 'ستيرويدات بنائية'],
              ['ghb', 'GHB', 'GHB'],
              ['crack', 'Crack', 'كراك'],
              ['other', 'Autres substances', 'مواد أخرى']
            ]} />
        </div>
      )
    },
    {
      id: 'section_q',
      letter: 'Q',
      title: 'Perception des Risques et Aide',
      subtitle: 'Section Q',
      color: 'bg-emerald-800',
      content: (
        <div className="space-y-12">
          {/* C.Q01-Q02 */}
          <GridQuestion title="À votre avis, quel risque les gens courent-ils de se nuire s'ils font ce qui suit :" code="C.Q01-02" isRTL={isRTL}
            options={RISK_LEVELS} values={data.section_q.risk_perceptions}
            onChange={(key, val) => updateCheck('section_q', 'risk_perceptions', key, val)}
            items={[
              ['cigarettes', 'Fumer 1 paquet de cigarettes ou plus par jour', 'تدخين علبة سجائر أو أكثر يومياً'],
              ['alcohol', 'Prendre 4 ou 5 verres de boisson alcoolisée quasiment chaque jour', 'ناول 4 أو 5 كؤوس من مشروب كحولي يومياً تقريباً'],
              ['cannabis', 'Fumer du cannabis (Zatla, Marijuana) régulièrement', 'تدخين القنب الهندي (زطلة، ماريجوانا) بانتظام'],
              ['nsp', 'Utiliser de nouvelles substances psychoactives (NSP)', 'استعمال مواد نفسية جديدة (NSP)']
            ]} />

          {/* C.Q03 */}
          <GridQuestion title="Si vous aviez un problème lié à l’alcool ou aux drogues, vers qui vous tourneriez-vous pour obtenir de l’aide ?" code="C.Q03" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_q.help_sources}
            onChange={(key, val) => updateCheck('section_q', 'help_sources', key, val)}
            items={[
              ['parents', 'Parents', 'الوالدان'],
              ['friends', 'Ami(e)s', 'الأصدقاء'],
              ['staff', 'Personnel de l’école (enseignants...)', 'موظفو المدرسة (أساتذة...)'],
              ['doctor', 'Médecin, infirmier(e)', 'طبيب، ممرض(ة)'],
              ['internet', 'Internet', 'الإنترنت'],
              ['other', 'Autres (Ligne verte, etc.)', 'آخرون (الخط الأخضر، إلخ)']
            ]} />
        </div>
      )
    },
    {
      id: 'section_r',
      letter: 'R',
      title: 'Réseaux Sociaux',
      subtitle: 'Section R',
      color: 'bg-indigo-800',
      content: (
        <div className="space-y-12">
          {/* C.R01 */}
          <div>
            <FieldLabel code="C.R01" fr="Au cours des 7 DERNIERS JOURS, combien d’heures avez-vous passé sur les réseaux sociaux ?" ar="خلال الـ 7 أيام الماضية، كم ساعة قضيتها على وسائل التواصل الاجتماعي؟" isRTL={isRTL} />
            <SelectField name="hours_per_day" value={data.section_r.hours_per_day} onChange={handleChange('section_r')} options={FREQ_DIGITAL} isRTL={isRTL} />
          </div>

          {/* C.R02 */}
          <GridQuestion title="Dans quelle mesure êtes-vous d’accord ou en désaccord avec les avis suivants concernant l’utilisation des réseaux sociaux :" code="C.R02" isRTL={isRTL}
            options={AGREEMENT_SCALE_SIMPLE} values={data.section_r.agreement}
            onChange={(key, val) => updateCheck('section_r', 'agreement', key, val)}
            items={[
              ['preoccupied', 'Vous sentiez-vous très concerné par les réseaux sociaux ?', 'انشغال شديد بالشبكات؟'],
              ['neglect', 'Avez-vous négligé d’autres activités / hobbies ?', 'إهمال الأنشطة الأخرى؟'],
              ['mood_bad', 'Mauvaise humeur si vous ne pouviez pas les utiliser ?', 'سوء الحالة المزاجية بدونها؟']
            ]} />
        </div>
      )
    },
    {
      id: 'section_s',
      letter: 'S',
      title: 'Jeux Vidéo',
      subtitle: 'Section S',
      color: 'bg-sky-900',
      content: (
        <div className="space-y-12">
          {/* C.S01 */}
          <div>
            <FieldLabel code="C.S01" fr="Durant les 30 DERNIERS JOURS, combien d’heures en moyenne par jour avez-vous passé sur les jeux vidéo ?" ar="خلال الـ 30 يومًا الأخيرة، كم ساعة في اليوم قضيتها في ألعاب الفيديو؟" isRTL={isRTL} />
            <SelectField name="hours_per_day" value={data.section_s.hours_per_day} onChange={handleChange('section_s')} options={FREQ_DIGITAL} isRTL={isRTL} />
          </div>

          {/* C.S02 */}
          <div>
            <FieldLabel code="C.S02" fr="Au cours des 7 DERNIERS JOURS, combien de jours avez-vous passé sur les jeux vidéo ?" ar="خلال الـ 7 أيام الماضية، كم يوماً لعبت فيها ألعاب الفيديو؟" isRTL={isRTL} />
            <SelectField name="days_per_week" value={data.section_s.days_per_week} onChange={handleChange('section_s')}
              options={[['0','0'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7']]} isRTL={isRTL} />
          </div>

          {/* C.S03 */}
          <GridQuestion title="Dans quelle mesure êtes-vous d’accord ou en désaccord avec les avis suivants concernant les jeux vidéo :" code="C.S03" isRTL={isRTL}
            options={AGREEMENT_SCALE_SIMPLE} values={data.section_s.agreement}
            onChange={(key, val) => updateCheck('section_s', 'agreement', key, val)}
            items={[
              ['preoccupied', 'Passionné par les jeux (même sans y jouer) ?', 'شغف بالألعاب (حتى بدون لعب)؟'],
              ['neglect', 'Avez-vous négligé d’autres activités / hobbies ?', 'إهمال الأنشطة الأخرى؟']
            ]} />
        </div>
      )
    },
    {
      id: 'section_t',
      letter: 'T',
      title: "Jeux d'Argent",
      subtitle: 'Section T',
      color: 'bg-orange-900',
      content: (
        <div className="space-y-12">
          {/* C.T01 */}
          <div>
            <FieldLabel code="C.T01" fr="Au cours des 12 derniers mois, avec quelle fréquence avez-vous joué de l'argent (loto, paris, cartes...) ?" ar="خلال الـ 12 شهراً الماضية، كم مرة لعبت بالمال (لوتو، رهانات، ورق...)؟" isRTL={isRTL} />
            <SelectField name="months_12_freq" value={data.section_t.months_12_freq} onChange={handleChange('section_t')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>

          {/* C.T02 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.T02</span>{isRTL ? 'خلال الـ 12 شهراً الماضية، هل لعبت ألعاب حظ من أجل المال (خارج الإنترنت):' : "Au cours des 12 derniers mois, avez-vous joué de l'argent hors ligne (pas sur internet) à :"}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['slot_machines', 'Machines à sous', 'آلة القمار'],
                ['cards_dice', 'Cartes ou dés', 'ورق أو نرد'],
                ['lottery', 'Loterie, bingo', 'ياصيب، بينغو'],
                ['sports_betting', 'Paris sportifs ou animaux', 'رهانات رياضية'],
                ['other', 'Autres', 'أخرى']
              ].map(([key, fr, ar]) => (
                <label key={`offline_${key}`} className={`flex items-center space-x-3 p-3 bg-white rounded-xl border-2 transition-all cursor-pointer ${data.section_t.offline_games[key] ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100'}`}>
                  <input type="checkbox" checked={data.section_t.offline_games[key] || false}
                    onChange={(e) => updateCheck('section_t', 'offline_games', key, e.target.checked)} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500" />
                  <span className="font-bold text-slate-700 text-sm">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* C.T03 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.T03</span>{isRTL ? 'خلال الـ 12 شهراً الماضية، هل لعبت ألعاب حظ من أجل المال (على الإنترنت):' : "Au cours des 12 derniers mois, avez-vous joué de l'argent sur internet à :"}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['slot_machines', 'Machines à sous', 'آلة القمار'],
                ['cards_dice', 'Cartes ou dés', 'ورق أو نرد'],
                ['lottery', 'Loterie, bingo', 'ياصيب، بينغو'],
                ['sports_betting', 'Paris sportifs ou animaux', 'رهانات رياضية'],
                ['other', 'Autres', 'أخرى']
              ].map(([key, fr, ar]) => (
                <label key={`online_${key}`} className={`flex items-center space-x-3 p-3 bg-white rounded-xl border-2 transition-all cursor-pointer ${data.section_t.online_games[key] ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100'}`}>
                  <input type="checkbox" checked={data.section_t.online_games[key] || false}
                    onChange={(e) => updateCheck('section_t', 'online_games', key, e.target.checked)} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500" />
                  <span className="font-bold text-slate-700 text-sm">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* C.T04-05 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-orange-50 rounded-3xl border-2 border-orange-100">
              <FieldLabel code="C.T04" fr="Avez-vous déjà ressenti le besoin d’augmenter les enjeux (mises) ?" ar="الحاجة لزيادة الرهانات؟" isRTL={isRTL} />
              <RadioGroup name="felt_need_increase" value={data.section_t.felt_need_increase} onChange={handleChange('section_t')} options={YES_NO} isRTL={isRTL} />
            </div>
            <div className="p-6 bg-orange-50 rounded-3xl border-2 border-orange-100">
              <FieldLabel code="C.T05" fr="Avez-vous déjà menti sur l'ampleur de vos jeux ?" ar="هل كذبت بشأن مدى لعبك؟" isRTL={isRTL} />
              <RadioGroup name="lied_about_it" value={data.section_t.lied_about_it} onChange={handleChange('section_t')} options={YES_NO} isRTL={isRTL} />
            </div>
          </div>

          {/* C.T06 */}
          <GridQuestion title="Au cours des 12 derniers mois, avez-vous vécu l'un des problèmes suivants à cause du jeu :" code="C.T06" isRTL={isRTL}
            options={YES_NO} values={data.section_t.gambling_problems}
            onChange={(key, val) => updateCheck('section_t', 'gambling_problems', key, val)}
            items={[
              ['played_more', 'Joué plus d’argent que prévu ?', 'لعب مبالغ أكثر من المتوقع؟'],
              ['regretted', 'Regretté d’avoir joué de l’argent ?', 'ندم على اللعب بالمال؟']
            ]} />
        </div>
      )
    },
    {
      id: 'section_u',
      letter: 'U',
      title: 'Violence & Sécurité',
      subtitle: 'Section U',
      color: 'bg-red-800',
      content: (
        <div className="space-y-12">
          {/* C.U01 */}
          <div>
            <FieldLabel code="C.U01" fr="Au cours des 12 derniers mois, combien de fois avez-vous été impliqué dans une bagarre physique ?" ar="خلال الـ 12 شهراً الماضية، كم مرة شاركت في مشاجرة جسدية؟" isRTL={isRTL} />
            <SelectField name="fights_12months" value={data.section_u.fights_12months} onChange={handleChange('section_u')} options={FIGHT_FREQUENCY} isRTL={isRTL} />
          </div>

          {/* C.U02 */}
          <div>
            <FieldLabel code="C.U02" fr="La dernière fois, est-ce que vous étiez :" ar="في المرة الأخيرة، هل كنت:" isRTL={isRTL} />
            <RadioGroup name="fight_circumstances" value={data.section_u.fight_circumstances} onChange={handleChange('section_u')}
              options={[['alone', 'Seul', 'وحدك'], ['with_friend', 'Avec un ami', 'مع صديق'], ['with_friends', 'Plusieurs amis', 'مع عدة أصدقاء'], ['family', 'Fard men el aila', 'فرد من العائلة'], ['other', 'Autre', 'آخر']]} isRTL={isRTL} />
          </div>

          {/* C.U03 */}
          <div>
            <FieldLabel code="C.U03" fr="La dernière fois, où était-ce ?" ar="في المرة الأخيرة، أين كان ذلك؟" isRTL={isRTL} />
            <RadioGroup name="fight_location" value={data.section_u.fight_location} onChange={handleChange('section_u')}
              options={[['school', 'École', 'المدرسة'], ['party', 'Lieu de fête', 'المكان الاحتفال'], ['street', 'Rue', 'الشارع'], ['other', 'Autre', 'آخر']]} isRTL={isRTL} />
          </div>

          {/* C.U04 */}
          <div>
            <FieldLabel code="C.U04" fr="Est-ce que le personnel de l'école est intervenu ?" ar="هل تدخل موظفو المدرسة؟" isRTL={isRTL} />
            <RadioGroup name="staff_intervention" value={data.section_u.staff_intervention} onChange={handleChange('section_u')} options={YES_NO} isRTL={isRTL} />
          </div>

          {/* C.U05 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.U05</span>{isRTL ? 'ماذا حدث نتيجة لذلك؟ (يمكن اختيار أكثر من إجابة):' : 'Qu’est-ce qui s’est passé en conséquence ? (plusieurs choix possibles) :'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['injured', 'Blessé', 'مصاب'],
                ['clothes_torn', 'Vêtements déchirés', 'ملابس ممزقة'],
                ['complaint', 'Plainte', 'شكوى'],
                ['other', 'Autre', 'آخر']
              ].map(([key, fr, ar]) => (
                <label key={key} className={`flex items-center space-x-3 p-3 bg-white rounded-xl border-2 transition-all cursor-pointer ${data.section_u.fight_consequences.includes(key) ? 'border-red-500 bg-red-50/30' : 'border-slate-100'}`}>
                  <input type="checkbox" checked={data.section_u.fight_consequences.includes(key)}
                    onChange={() => toggleList('section_u', 'fight_consequences', key)} className="w-5 h-5 rounded text-red-600 focus:ring-red-500" />
                  <span className="font-bold text-slate-700 text-sm">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* C.U06 */}
          <div>
            <FieldLabel code="C.U06" fr="Si vous avez été gravement blessé, c'était dû à :" ar="إذا تعرضت لإصابة خطيرة، فكان ذلك بسبب:" isRTL={isRTL} />
            <RadioGroup name="serious_injury_12months" value={data.section_u.serious_injury_12months} onChange={handleChange('section_u')}
              options={[['accident', 'Accident', 'حادث'], ['fight', 'Bagarre', 'مشاجرة'], ['self_harm', 'Automutilation', 'إيذاء النفس'], ['other', 'Autre', 'آخر']]} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_v',
      letter: 'V',
      title: 'Santé Mentale',
      subtitle: 'Section V',
      color: 'bg-violet-800',
      content: (
        <div className="space-y-12">
          {/* C.V01 */}
          <GridQuestion title="Au cours du DERNIER MOIS, à quelle fréquence avez-vous :" code="C.V01" isRTL={isRTL}
            options={STRESS_FREQ} values={data.section_v}
            onChange={(key, val) => update('section_v', key, val)}
            items={[
              ['control', 'Avoir le sentiment que vous ne pouviez pas contrôler les choses importantes de votre vie ?', 'الشعور بعدم القدرة على التحكم في أمور حياتك المهمة؟'],
              ['confidence', 'Vous être senti confiant dans votre capacité à gérer vos problèmes personnels ?', 'الشعور بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟'],
              ['success', 'Avoir senti que les choses allaient dans votre sens ?', 'الشعور بأن الأمور تسير لصالحك؟'],
              ['difficulties', 'Senti que les difficultés s\'accumulaient à un point tel que vous ne pouviez pas les surmonter ?', 'الشعور بأن الصعوبات تتراكم لدرجة لا يمكنك التغلب عليها؟']
            ]} />
        </div>
      )
    },
    {
      id: 'section_z',
      letter: 'Z',
      title: 'Validation (Honnêteté)',
      subtitle: 'Section Z',
      color: 'bg-slate-900',
      content: (
        <div className="space-y-12">
          {/* C.Z01 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <FieldLabel code="C.Z01" fr="En toute honnêteté, si vous aviez consommé de l'alcool, le diriez-vous dans ce questionnaire ?" ar="بكل صراحة، إذا كنت قد استهلكت الكحول، فهل كنت ستقول ذلك في الاستمارة؟" isRTL={isRTL} />
            <RadioGroup name="honesty_alcohol" value={data.section_z.honesty_alcohol} onChange={handleChange('section_z')}
              options={HONESTY_SCALE} isRTL={isRTL} />
          </div>

          {/* C.Z02 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <FieldLabel code="C.Z02" fr="En toute honnêteté, si vous aviez consommé du cannabis (Zatla, marijuana), le diriez-vous dans ce questionnaire ?" ar="لو كنت قد استخدمت القنب الهندي (الزطلة)، هل كنت ستعترف بذلك؟" isRTL={isRTL} />
            <RadioGroup name="honesty_cannabis" value={data.section_z.honesty_cannabis} onChange={handleChange('section_z')}
              options={HONESTY_SCALE} isRTL={isRTL} />
          </div>
        </div>
      )
    }
  ];

const currentSection = SECTIONS[step];
const progress = ((step + 1) / SECTIONS.length) * 100;

if (status === 'success') return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-8">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
      <CheckCircle2 size={48} className="text-green-500" />
    </div>
    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Questionnaire soumis !</h1>
    <p className="text-slate-500 text-xl mb-10 max-w-md">
      {isRTL ? 'شكراً على مشاركتك. بياناتك محمية بالكامل.' : 'Merci pour votre participation. Vos données sont entièrement protégées.'}
    </p>
    <button onClick={() => { setStatus(null); setStep(0); setData(INITIAL_DATA); }}
      className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all">
      Nouveau questionnaire
    </button>
  </div>
);

return (
  <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
    {/* Top Bar */}
    <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onClose && <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>}
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">MedSPAD 2026</span>
            <span className="font-bold text-slate-700 text-sm">{step + 1} / {SECTIONS.length} — {currentSection.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="px-4 py-2 text-sm font-bold border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
            {lang === 'fr' ? 'العربية' : 'Français'}
          </button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="h-1 bg-slate-100 w-full">
        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-3xl mx-auto px-6 py-10">
      <SectionHeader letter={currentSection.letter} title={currentSection.title} color={currentSection.color} />
      <div className="animate-fade-in">
        {currentSection.content}
      </div>
    </div>

    {/* Navigation Footer */}
    <div className="sticky bottom-0 bg-white border-t border-slate-100 shadow-lg">
      <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} />
          {isRTL ? 'السابق' : 'Précédent'}
        </button>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {SECTIONS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} className={`h-2 rounded-full cursor-pointer transition-all ${i === step ? 'w-6 bg-blue-600' : i < step ? 'w-2 bg-blue-200' : 'w-2 bg-slate-200'}`}></div>
          ))}
        </div>

        {step === SECTIONS.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={status === 'submitting'}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-100 transition-all disabled:opacity-70"
          >
            {status === 'submitting' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send size={18} />{isRTL ? 'إرسال' : 'Soumettre'}</>}
          </button>
        ) : (
          <button
            onClick={() => setStep(s => Math.min(SECTIONS.length - 1, s + 1))}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
          >
            {isRTL ? 'التالي' : 'Suivant'}
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {status === 'error' && (
        <div className="max-w-3xl mx-auto px-6 pb-4">
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-red-700 mb-4 font-black uppercase tracking-tighter text-sm">
              <AlertCircle size={20} />
              {isRTL ? 'حدث خطأ أثناء الإرسال' : 'Erreurs de validation'}
            </div>
            <ul className="space-y-3">
              {errors ? (
                Object.entries(errors).map(([key, value]) => {
                  const renderErrorValue = (val) => {
                    if (Array.isArray(val)) {
                      return val.map(v => typeof v === 'object' ? renderErrorValue(v) : String(v)).join(', ');
                    }
                    if (typeof val === 'object' && val !== null) {
                      return Object.entries(val)
                        .map(([k, v]) => `${k}: ${typeof v === 'object' ? renderErrorValue(v) : String(v)}`)
                        .join(' | ');
                    }
                    return String(val);
                  };

                  return (
                    <li key={key} className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {renderErrorValue(value)}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="text-sm font-bold text-red-600">
                  {isRTL ? 'يرجى التحقق من الاتصال والمحاولة مرة أخرى.' : 'Veuillez vérifier votre connexion et réessayer.'}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default QuestionnaireForm;
