import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Send, X, LogOut, ArrowLeft,
  Pencil, Plus, Trash2, Edit2, Save, LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

// ─── Shared UI Components ───────────────────────────────────────────────────────

const SectionHeader = ({ letter, title, subtitle, color = 'bg-slate-900', actionButtons }) => (
  <div className={`${color} text-white rounded-2xl p-8 mb-8 relative overflow-hidden flex items-center justify-between`}>
    <div className="absolute right-6 top-6 text-7xl font-black opacity-10 select-none">{letter}</div>
    <div className="relative z-10">
      <span className="text-xs font-black uppercase tracking-[3px] text-white/50 mb-2 block">Section {letter}</span>
      <h2 className="text-3xl font-extrabold leading-tight">{title}</h2>
      {subtitle && <p className="text-white/60 mt-2 text-sm font-medium">{subtitle}</p>}
    </div>
    {actionButtons && (
      <div className="relative z-20 flex gap-2 ml-4">
        {actionButtons}
      </div>
    )}
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
    {options.map((opt, idx) => (
      <option key={opt[0]} value={opt[0]}>
        {opt[3] || idx + 1}. {isRTL && opt[2] ? opt[2] : opt[1]}
      </option>
    ))}
  </select>
);

const RadioGroup = ({ name, value, onChange, options, isRTL }) => (
  <div className="flex flex-wrap gap-3">
    {options.map((opt, idx) => (
      <button
        key={opt[0]}
        type="button"
        onClick={() => onChange({ target: { name, value: opt[0] } })}
        className={`group flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all ${value === opt[0]
          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
          }`}
      >
        <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-black transition-colors ${value === opt[0] ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
          {opt[3] || idx + 1}
        </span>
        {isRTL && opt[2] ? opt[2] : opt[1]}
      </button>
    ))}
  </div>
);

const CheckboxGroup = ({ name, values = {}, onChange, options, isRTL }) => (
  <div className="space-y-2">
    {options.map((opt, idx) => (
      <label key={opt[0]} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer group">
        <input
          type="checkbox"
          checked={!!values[opt[0]]}
          onChange={(e) => onChange(name, opt[0], e.target.checked)}
          className="w-5 h-5 rounded text-blue-600 border-slate-300"
        />
        <span className="w-5 h-5 flex items-center justify-center bg-slate-900 text-white rounded text-[10px] font-black transition-colors">
          {opt[3] || idx + 1}
        </span>
        <span className="font-medium text-slate-700 group-hover:text-slate-900">
          {isRTL && opt[2] ? opt[2] : opt[1]}
        </span>
      </label>
    ))}
  </div>
);

const GridQuestion = ({ title, titleAr, code, options, items, values, onChange, isRTL }) => (
  <div className="overflow-x-auto -mx-1 px-1 mt-8">
    <div className="mb-4">
      <FieldLabel code={code} fr={title} ar={titleAr || title} isRTL={isRTL} />
    </div>
    <table className="w-full text-sm border-separate border-spacing-y-2 min-w-[600px]">
      <thead>
        <tr className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
          <th className="text-left py-2 px-4">{isRTL ? 'العنصر' : 'Élément'}</th>
          {options.map((opt, idx) => (
            <th key={opt[0]} className="text-center py-2 px-2">
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 flex items-center justify-center bg-slate-900 text-white rounded text-[8px] font-bold">{opt[3] || idx + 1}</span>
                {isRTL ? opt[2] : opt[1]}
              </div>
            </th>
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
  ['1', 'Jamais', 'أبداً'],
  ['2', '1-2 fois', '1-2 مرة'],
  ['3', '3-5 fois', '3-5 مرات'],
  ['4', '6-9 fois', '6-9 مرات'],
  ['5', '10-19 fois', '10-19 مرة'],
  ['6', '20-39 fois', '20-39 مرة'],
  ['7', '40 fois ou plus', '40 مرة أو أكثر'],
];

const FREQ_30DAYS_CIGS = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '< 1 cigarette par semaine', 'أقل من سيجارة واحدة في الأسبوع'],
  ['3', '< 1 cigarette par jour', 'أقل من سيجارة واحدة في اليوم'],
  ['4', '1-5 par jour', '1-5 في اليوم'],
  ['5', '6-10 par jour', '6-10 في اليوم'],
  ['6', '11-20 par jour', '11-20 في اليوم'],
  ['7', '> 20 par jour', 'أكثر من 20 في اليوم'],
];

const FREQ_30DAYS_VAPE = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '< 1 fois par semaine', 'أقل من مرة في الأسبوع'],
  ['3', 'Au moins 1 fois par semaine', 'على الأقل مرة واحدة في الأسبوع'],
  ['4', 'Tous les jours ou presque', 'يومياً أو تقريباً كل يوم'],
];

const FREQ_30DAYS_HOOKAH = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '< 1 par semaine', 'أقل من مرة في الأسبوع'],
  ['3', '< 1 par jour', 'أقل من مرة في اليوم'],
  ['4', '1-5 par jour', '1-5 في اليوم'],
  ['5', '6-10 par jour', '6-10 في اليوم'],
  ['6', '11-20 par jour', '11-20 في اليوم'],
  ['7', '> 20 par jour', 'أكثر من 20 في اليوم'],
];

const FREQ_30DAYS_STANDARD = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '1-2 fois', '1-2 مرة'],
  ['3', '3-5 fois', '3-5 مرات'],
  ['4', '6-9 fois', '6-9 مرات'],
  ['5', '10-19 fois', '10-19 مرة'],
  ['6', '20-39 fois', '20-39 مرة'],
  ['7', '40 fois ou plus', '40 مرة أو أكثر'],
];

const RISK_LEVELS = [
  ['1', 'Sans risque', 'بدون خطر'],
  ['2', 'Léger risque', 'خطر خفيف'],
  ['3', 'Risque modéré', 'خطر متوسط'],
  ['4', 'Grand risque', 'خطر كبير'],
  ['5', 'Ne sait pas', 'لا أعرف'],
];

const FREQ_ACTIVITIES = [
  ['1', 'Jamais', 'أبداً'],
  ['2', 'Quelques fois par an', 'بضع مرات في السنة'],
  ['3', '1 ou 2 fois par mois', 'مرة أو مرتين في الشهر'],
  ['4', 'Au moins une fois par semaine', 'مرة واحدة على الأقل في الأسبوع'],
  ['5', 'Presque tous les jours', 'كل يوم'],
];

const FREQ_DIGITAL = [
  ['1', 'Aucune', 'لا شيء'],
  ['2', 'Une demi-heure ou moins', 'نصف ساعة أو أقل'],
  ['3', 'Environ 1 heure', 'حوالي ساعة واحدة'],
  ['4', 'Environ 2-3 heures', 'حوالي 2-3 ساعات'],
  ['5', 'Environ 4-5 heures', 'حوالي 4-5 ساعات'],
  ['6', '6 heures ou plus', '6 ساعات أو أكثر'],
];

const DIFFICULTY = [
  ['1', 'Impossible', 'مستحيل'],
  ['2', 'Difficile', 'صعب'],
  ['3', 'Facile', 'سهل'],
  ['4', 'Ne sait pas', 'لا أعرف'],
];

const SOCIAL_CIRCLE = [
  ['1', 'Aucun', 'لا يوجد'],
  ['2', 'Quelques-uns', 'القليل منهم'],
  ['3', 'La plupart', 'أغلبهم'],
  ['4', 'Tous', 'جميعهم'],
];

const PARENTS_USE = [
  ['1', 'Non', 'لا'],
  ['2', 'Parfois', 'أحياناً'],
  ['3', 'Souvent', 'غالباً'],
  ['4', 'Ne sait pas', 'لا أعرف'],
];

const FREQ_BINGE = [
  ['1', 'Aucune fois', 'ولا مرة'],
  ['2', '1 fois', 'مرة واحدة'],
  ['3', '2 fois', 'مرتين'],
  ['4', '3-5 fois', '3-5 مرات'],
  ['5', '6-9 fois', '6-9 مرات'],
  ['6', '10 fois ou plus', '10 مرات أو أكثر'],
];

const FREQ_GAMBLING = [
  ['0', 'Jamais', 'أبداً'],
  ['1', '1-2 fois', '1-2 مرة'],
  ['2', '3-5 fois', '3-5 مرات'],
  ['3', '6-9 fois', '6-9 مرات'],
  ['4', '10-19 fois', '10-19 مرة'],
  ['5', '20-39 fois', '20-39 مرة'],
  ['6', '40 fois ou plus', '40 مرة أو أكثر'],
];

const AGE_SCALE = [
  ['1', 'Jamais / Je n’ai jamais utilisé', 'أبداً / لم أستخدمه أبداً'],
  ['2', '9 ans ou moins', '9 سنوات أو أقل'],
  ['3', '10 ans', '10 سنوات'], ['4', '11 ans', '11 سنوات'], ['5', '12 ans', '12 سنوات'],
  ['6', '13 ans', '13 سنوات'], ['7', '14 ans', '14 سنوات'], ['8', '15 ans', '15 سنوات'],
  ['9', '16 ans ou plus', '16 سنة أو أكثر'],
];

const HONESTY_SCALE = [
  ['1', 'J’ai déjà déclaré [cela]', 'لقد ذكرت ذلك بالفعل'],
  ['2', 'Oui, sans aucun doute', 'نعم، بدون أدنى شك'],
  ['3', 'Probablement oui', 'ربما نعم'],
  ['4', 'Probablement pas', 'ربما لا'],
  ['5', 'Non, sans aucun doute', 'لا، بدون أدنى شك'],
];


const PERFORMANCE = [
  ['1', 'En dessous de la moyenne (<10/20)', 'أقل من المعدل'],
  ['2', 'Moyen [10 – 12]', 'متوسط'],
  ['3', 'En dessus de la moyenne (>12/20)', 'فوق المعدل'],
];

const EDUCATION = [
  ['1', 'Non scolarisé', 'بدون تعليم'],
  ['2', 'Primaire (n’a pas réussi sa 6ème année)', 'ابتدائي (لم ينجح في السنة السادسة)'],
  ['3', 'Primaire (a réussi sa 6ème année)', 'ابتدائي (نجح في السنة السادسة)'],
  ['4', 'Collège (n’a pas réussi sa 9ème année)', 'إعدادي (لم ينجح في السنة التاسعة)'],
  ['5', 'Collège (a réussi sa 9ème année)', 'إعدادي (نجح في السنة التاسعة)'],
  ['6', 'Secondaire (n’a pas réussi son BAC)', 'ثانوي (لم ينجح في البكالوريا)'],
  ['7', 'Secondaire (a réussi son BAC)', 'ثانوي (نجح في البكالوريا)'],
  ['8', 'Supérieur ou plus', 'جامعي أو أكثر'],
  ['9', 'Formation professionnelle', 'تكوين مهني'],
  ['10', 'Je ne sais pas', 'لا أعرف'],
  ['11', 'Non applicable', 'غير قابل للتطبيق'],
];

const JOBS = [
  ['1', 'Oui, à plein temps', 'نعم، بدوام كامل'],
  ['2', 'Oui, à temps partiel', 'نعم، بدوام جزئي'],
  ['3', 'Ne travaille pas', 'لا يعمل'],
  ['4', 'Retraité(e)', 'متقاعد(ة)'],
  ['5', 'Je ne sais pas', 'لا أعرف'],
  ['6', 'Non applicable', 'غير قابل للتطبيق'],
];

const HOUSEHOLD = [
  ['1', 'Père', 'الأب'], ['2', 'Mère', 'الأم'],
  ['3', 'Beau-père (conjoint de votre mère)', 'زوج الأم'], ['4', 'Belle-mère (conjointe de votre père)', 'زوجة الأب'],
  ['5', 'Frère(s)', 'إخوة'], ['6', 'Sœur(s)', 'أخوات'],
  ['7', 'Grands parent(s)', 'أجداد'],
  ['8', 'Autres proches', 'أقارب آخرون'],
  ['9', 'Je ne vis avec aucun de mes proches (par exemple : orphelinat, foyer, etc.)', 'لا أعيش مع أي من أقاربي'],
];

const YES_NO = [['1', 'Oui', 'نعم'], ['2', 'Non', 'لا']];
const YES_NO_INV = [['1', 'Non', 'لا'], ['2', 'Oui', 'نعم']];
const YES_NO_01 = [['0', 'Non', 'لا'], ['1', 'Oui', 'نعم']];
const YES_NO_DK = [['1', 'Oui', 'نعم'], ['2', 'Non', 'لا'], ['3', 'Ne sait pas', 'لا أعرف']];

const STRESS_FREQ = [
  ['1', 'Jamais', 'أبداً'],
  ['2', 'Presque jamais', 'نادراً'],
  ['3', 'Parfois', 'أحياناً'],
  ['4', 'Assez souvent', 'في أغلب الأحيان'],
  ['5', 'Très souvent', 'دائماً'],
];

const SATISFACTION_SCALE = [
  ['1', 'Très satisfait(e)', 'راضٍ جداً'],
  ['2', 'Satisfait(e)', 'راضٍ'],
  ['3', 'Ni satisfait(e) ni insatisfait(e)', 'محايد'],
  ['4', 'Pas tellement satisfait(e)', 'غير راضٍ تماماً'],
  ['5', 'Non satisfait(e)', 'غير راضٍ'],
  ['6', 'Non applicable', 'غير قابل للتطبيق'],
];

const FIGHT_FREQUENCY = [
  ['1', '0 fois', '0 مرة'],
  ['2', '1 fois', '1 مرة'],
  ['3', '2-3 fois', '2-3 مرات'],
  ['4', '4-5 fois', '4-5 مرات'],
  ['5', '6-7 fois', '6-7 مرات'],
  ['6', '8-9 fois', '8-9 مرات'],
  ['7', '10-11 fois', '10-11 مرّة'],
  ['8', '12 fois ou plus', '12 مرة أو أكثر'],
];

const AGREEMENT_SCALE = [
  ['0', 'Pas du tout', 'لا أوافق بشدة'],
  ['1', 'Plutôt pas', 'لا أوافق'],
  ['2', 'Ni d\'accord ni pas d\'accord', 'محايد'],
  ['3', 'Plutôt d\'accord', 'أوافق'],
  ['4', 'Tout à fait d\'accord', 'أوافق بشدة'],
];

const ECONOMIC = [
  ['1', 'Supérieure aux autres familles', 'أعلى من بقية العائلات'],
  ['2', 'Identique aux autres familles', 'مماثلة لبقية العائلات'],
  ['3', 'Inférieure aux autres familles', 'أقل من بقية العائلات'],
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
    school_appreciation: '',
    activities_frequency: {}, school_absences: {}, household_members: [],
    parents_absence_reason: '', parents_absence_reason_other: '', nights_out_30days: '',
    family_relationship_satisfaction: {}
  },
  section_b: { father_education: '', mother_education: '', father_job: '', mother_job: '', economic_status: '', private_room: '' },
  section_c: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', age_daily_use: '' },
  section_d: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', age_daily_use: '' },
  section_e: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', age_daily_use: '' },
  section_g: { access_difficulty: {}, social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', days_30_by_type: {}, binge_drinking_30days: '', intoxication_lifetime: '', intoxication_12months: '', intoxication_30days: '', age_first_drink: '', age_first_intoxication: '' },
  section_h: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '' },
  section_i: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', use_last_12months: '', cannabis_types_12months: {}, cannabis_problems_12months: {} },
  section_j: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', use_last_12months: '' },
  section_k: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', use_last_12months: '' },
  section_l: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', use_last_12months: '' },
  section_m: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', days_30_freq: '', age_first_use: '', use_last_12months: '' },
  section_n: { access_difficulty: {}, lifetime_freq_by_type: {}, months_12_freq_by_type: {}, age_first_use_by_type: {} },
  section_p: { lifetime_freq: '', months_12_freq: '', forms: {}, substances: {}, fictive_substance_consumption: '' },
  section_q: { risk_perceptions: {}, help_sources: {}, friend_use_risk: '' },
  section_r: { hours_per_day_breakdown: {}, agreement: {} },
  section_s: { hours_per_day: '', days_per_week: '', agreement: {} },
  section_t: { months_12_freq: '', offline_games: {}, online_games: {}, felt_need_increase: '', lied_about_it: '', gambling_problems: {} },
  section_u: { fights_12months: '', fight_circumstances: '', fight_location: '', staff_intervention: '', fight_consequences: [], serious_injury_12months: [] },
  section_v: { a: '', b: '', c: '', d: '', self_esteem: {}, mental_health_states: {}, help_seeking: {} },
  section_z: { honesty_level: '', honesty_cannabis: '' },
};

// ─── The Form Component ─────────────────────────────────────────────────────────

const QuestionnaireForm = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState(null);
  const [lang, setLang] = useState('fr');
  const isRTL = lang === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('report_id');
  


  const getExclusionWarnings = () => {
    const warnings = [];
    const currentYear = 2026; // Reference year

    // Gender exclusion
    if (data.section_a.gender && !['M', 'F'].includes(data.section_a.gender)) {
      warnings.push(isRTL ? "جنس غير صالح" : "Genre non valide");
    }

    // Age exclusion
    if (data.section_a.birth_year && data.section_a.birth_year.length === 4) {
      const age = currentYear - parseInt(data.section_a.birth_year);
      if (age < 15 || age > 18) {
        warnings.push(isRTL ? `العمر خارج النطاق المقبول (15-18). العمر الحالي المحسوب: ${age}` : `Âge hors limites (15-18 ans). Âge calculé : ${age}`);
      }
    }

    // Fictive substance
    if (data.section_p && data.section_p.fictive_substance_consumption === 'yes') {
      warnings.push(isRTL ? "تم رصد إجابات غير متسقة." : "Réponses incohérentes identifiées.");
    }

    // Missing values exclusion (only warn if near the end)
    if (step >= SECTIONS.length - 2) {
      let total = 0;
      let missing = 0;
      Object.values(data).forEach(section => {
        Object.keys(section).forEach(key => {
          const val = section[key];
          if (typeof val === 'string') {
            total++;
            if (!val.trim()) missing++;
          }
        });
      });
      if (total > 0 && (missing / total) > 0.5) {
        warnings.push(isRTL ? "أكثر من 50٪ من الإجابات مفقودة" : "Plus de 50% de valeurs manquantes");
      }
    }

    return warnings;
  };

  const update = (section, field, value) => {
    setData(prev => {
      const sectionData = { ...prev[section], [field]: value };

      // Auto-propagate "1" (Jamais) if lifetime is "1"
      if (field === 'lifetime_freq' && value === '1') {
        if (sectionData.months_12_freq !== undefined) sectionData.months_12_freq = '1';
        if (sectionData.days_30_freq !== undefined) sectionData.days_30_freq = '1';
        if (sectionData.age_first_use !== undefined) sectionData.age_first_use = '1';
        if (sectionData.age_daily_use !== undefined) sectionData.age_daily_use = '1';
        if (sectionData.use_last_12months !== undefined) sectionData.use_last_12months = '2'; // '2' is Non
      }

      // Auto-propagate "1" from 12 months to 30 days
      if (field === 'months_12_freq' && value === '1') {
        if (sectionData.days_30_freq !== undefined) sectionData.days_30_freq = '1';
      }

      // --- NEW: Universal Upward Auto-propagation ---
      const isReal = (v) => v && v !== '1' && v !== '2' && v !== '0'; // '2' is Non, '0' is fallback

      // Detect prefix for isolated propagation (e.g., "intoxication_")
      const prefix = field.includes('_') ? field.split('_')[0] + '_' : '';
      const isSpecial = prefix && (prefix.startsWith('intoxication') || prefix.startsWith('age_'));

      if ((field.includes('days_30') || field.includes('30days')) && isReal(value)) {
        const yField = isSpecial ? `${prefix}12months` : 'months_12_freq';
        const lField = isSpecial ? `${prefix}lifetime` : 'lifetime_freq';
        
        if (sectionData[yField] !== undefined && !isReal(sectionData[yField])) sectionData[yField] = '2'; // 1-2 fois
        if (sectionData[lField] !== undefined && !isReal(sectionData[lField])) sectionData[lField] = '2';
        if (sectionData.use_last_12months !== undefined) sectionData.use_last_12months = '1'; // '1' is Oui
      }

      if ((field.includes('months_12') || field.includes('12months')) && isReal(value)) {
        const lField = isSpecial ? `${prefix}lifetime` : 'lifetime_freq';
        if (sectionData[lField] !== undefined && !isReal(sectionData[lField])) sectionData[lField] = '2';
      }

      return { ...prev, [section]: sectionData };
    });
  };

  const updateCheck = (section, field, key, checked) => {
    setData(prev => {
      const current = prev[section][field] || {};
      const updatedField = { ...current, [key]: checked };
      const sectionData = { ...prev[section], [field]: updatedField };

      const isReal = (v) => v && v !== '1' && v !== '2' && v !== '0';

      // UNIVERSAL Upward propagation: 
      // If we are checking something in a "30 days" or "30_by_type" field and it's a real value
      if ((field.includes('30_days') || field.includes('30days') || field.includes('30_by_type')) && isReal(checked)) {
        if (sectionData.months_12_freq !== undefined && !isReal(sectionData.months_12_freq)) sectionData.months_12_freq = '2';
        if (sectionData.lifetime_freq !== undefined && !isReal(sectionData.lifetime_freq)) sectionData.lifetime_freq = '2';
        if (sectionData.use_last_12months !== undefined) sectionData.use_last_12months = '1';
      }

      // Downward propagation for grids
      if (field.includes('lifetime') && !isReal(checked)) {
          if (sectionData.months_12_freq !== undefined) sectionData.months_12_freq = '1';
          if (sectionData.days_30_freq !== undefined) sectionData.days_30_freq = '1';
      }

      return { ...prev, [section]: sectionData };
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

    // ── Contradiction (filling-policy) validation ──────────────────────────
    // ── Contradiction (filling-policy) validation ──────────────────────────
    const validateContradictions = () => {
      const warnings = [];

      const isRealValue = (v) => v && v !== '1' && v !== '0';

      // Section C – Tobacco
      if (data.section_c.lifetime_freq === '1') {
        if (isRealValue(data.section_c.months_12_freq))
          warnings.push('Tabac (C): vous avez déclaré "Jamais" mais renseigné une fréquence sur 12 mois.');
        if (isRealValue(data.section_c.days_30_freq))
          warnings.push('Tabac (C): vous avez déclaré "Jamais" mais renseigné une fréquence sur 30 jours.');
        if (data.section_c.age_first_use && data.section_c.age_first_use !== '1')
          warnings.push('Tabac (C): vous avez déclaré "Jamais" mais indiqué un âge de première utilisation.');
      }

      // Section D – E-cigarettes
      if (data.section_d.lifetime_freq === '1') {
        if (isRealValue(data.section_d.months_12_freq))
          warnings.push('Cigarettes électroniques (D): "Jamais" mais fréquence 12 mois renseignée.');
        if (isRealValue(data.section_d.days_30_freq))
          warnings.push('Cigarettes électroniques (D): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_d.age_first_use && data.section_d.age_first_use !== '1')
          warnings.push('Cigarettes électroniques (D): "Jamais" mais âge de première utilisation indiqué.');
      }

      // Section E – Hookah
      if (data.section_e.lifetime_freq === '1') {
        if (isRealValue(data.section_e.months_12_freq))
          warnings.push('Narguilé (E): "Jamais" mais fréquence 12 mois renseignée.');
        if (isRealValue(data.section_e.days_30_freq))
          warnings.push('Narguilé (E): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_e.age_first_use && data.section_e.age_first_use !== '1')
          warnings.push('Narguilé (E): "Jamais" mais âge de première utilisation indiqué.');
      }

      // Section G – Alcohol
      if (data.section_g.lifetime_freq === '1') {
        if (isRealValue(data.section_g.months_12_freq))
          warnings.push('Alcool (G): "Jamais" mais fréquence 12 mois renseignée.');
        if (data.section_g.days_30_by_type &&
            Object.values(data.section_g.days_30_by_type).some(v => isRealValue(v)))
          warnings.push('Alcool (G): "Jamais" mais consommation 30 jours par type renseignée.');
        if (isRealValue(data.section_g.binge_drinking_30days))
          warnings.push('Alcool (G): "Jamais" mais binge drinking renseigné.');
        if (data.section_g.age_first_drink && data.section_g.age_first_drink !== '1')
          warnings.push('Alcool (G): "Jamais" mais âge de premier verre indiqué.');
      }

      // Section H – Tranquillisants
      if (data.section_h.lifetime_freq === '1') {
        if (isRealValue(data.section_h.months_12_freq))
          warnings.push('Tranquillisants (H): "Jamais" mais fréquence 12 mois renseignée.');
        if (isRealValue(data.section_h.days_30_freq))
          warnings.push('Tranquillisants (H): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_h.age_first_use && data.section_h.age_first_use !== '1')
          warnings.push('Tranquillisants (H): "Jamais" mais âge de première utilisation indiqué.');
      }

      // Section I – Cannabis
      if (data.section_i.lifetime_freq === '1') {
        if (isRealValue(data.section_i.days_30_freq))
          warnings.push('Cannabis (I): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_i.age_first_use && data.section_i.age_first_use !== '1')
          warnings.push('Cannabis (I): "Jamais" mais âge de première utilisation indiqué.');
        if (data.section_i.use_last_12months === '1')
          warnings.push('Cannabis (I): "Jamais" mais usage déclaré sur les 12 derniers mois.');
      }

      // Section J – Cocaine
      if (data.section_j.lifetime_freq === '1') {
        if (isRealValue(data.section_j.days_30_freq))
          warnings.push('Cocaïne (J): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_j.age_first_use && data.section_j.age_first_use !== '1')
          warnings.push('Cocaïne (J): "Jamais" mais âge de première utilisation indiqué.');
        if (data.section_j.use_last_12months === '1')
          warnings.push('Cocaïne (J): "Jamais" mais usage déclaré sur les 12 derniers mois.');
      }

      // Section K – Ecstasy
      if (data.section_k.lifetime_freq === '1') {
        if (isRealValue(data.section_k.days_30_freq))
          warnings.push('Ecstasy (K): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_k.age_first_use && data.section_k.age_first_use !== '1')
          warnings.push('Ecstasy (K): "Jamais" mais âge de première utilisation indiqué.');
      }

      // Section L – Héroïne
      if (data.section_l.lifetime_freq === '1') {
        if (isRealValue(data.section_l.days_30_freq))
          warnings.push('Héroïne (L): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_l.age_first_use && data.section_l.age_first_use !== '1')
          warnings.push('Héroïne (L): "Jamais" mais âge de première utilisation indiqué.');
      }

      // Section M – Solvants
      if (data.section_m.lifetime_freq === '1') {
        if (isRealValue(data.section_m.days_30_freq))
          warnings.push('Solvants (M): "Jamais" mais fréquence 30 jours renseignée.');
        if (data.section_m.age_first_use && data.section_m.age_first_use !== '1')
          warnings.push('Solvants (M): "Jamais" mais âge de première utilisation indiqué.');
      }

      // --- Hierarchical Validation ---
      const FREQ_VALS = {
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6
      };
      
      const AGE_VALS = {
        '1': 0, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16
      };

      const checkHierarchy = (sectionKey, label) => {
        const s = data[sectionKey];
        if (!s) return;
        const life = FREQ_VALS[s.lifetime_freq] || 0;
        const year = FREQ_VALS[s.months_12_freq] || 0;
        const month = FREQ_VALS[s.days_30_freq] || 0;

        if (month > year) warnings.push(`${label}: L'usage au cours du dernier mois ne peut pas être supérieur à l'usage sur l'année.`);
        if (year > life) warnings.push(`${label}: L'usage sur l'année ne peut pas être supérieur à l'usage sur la vie.`);
        
        const ageFirst = AGE_VALS[s.age_first_use] || 0;
        const ageDaily = AGE_VALS[s.age_daily_use] || 0;

        if (ageDaily > 0 && ageFirst === 0) warnings.push(`${label}: Usage quotidien déclaré mais "Jamais" pour la première utilisation.`);
        if (ageDaily > 0 && ageDaily < ageFirst) warnings.push(`${label}: L'âge de consommation quotidienne ne peut pas être inférieur à l'âge de la première fois.`);
      };

      checkHierarchy('section_c', 'Tabac');
      checkHierarchy('section_d', 'Vape');
      checkHierarchy('section_e', 'Narguilé');
      checkHierarchy('section_g', 'Alcool');
      checkHierarchy('section_h', 'Tranquillisants');
      checkHierarchy('section_i', 'Cannabis');
      checkHierarchy('section_j', 'Cocaïne');
      checkHierarchy('section_k', 'Ecstasy');
      checkHierarchy('section_l', 'Héroïne');
      checkHierarchy('section_m', 'Solvants');
      checkHierarchy('section_n', 'NSP');

      return warnings;
    };

    const contradictionWarnings = validateContradictions();
    if (contradictionWarnings.length > 0) {
      setErrors({ contradiction: contradictionWarnings });
      setStatus('error');
      return;
    }
    // ──────────────────────────────────────────────────────────────────────

    try {
      await api.post('questionnaire/submit/', {
        class_report: reportId,
        language_used: lang.toUpperCase(),
        ...data,
        extra_answers: extraAnswers
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



  // ── Real-time per-section contradiction warnings ───────────────────────────
  const getSectionWarnings = (sectionId) => {
    const w = [];
    const FREQ_VALS = {
      'never': 0, '0': 0, '1_2': 1, '3_5': 2, '6_9': 3, '10_19': 4, '20_39': 5, '40_plus': 6,
      'lt1_week': 0.5, 'lt1_day': 1, '1_5_day': 2, '6_10_day': 3, '11_20_day': 4, 'gt20_day': 5
    };

    const s = data[sectionId];
    if (s && s.lifetime_freq !== undefined) {
       const life = FREQ_VALS[s.lifetime_freq] || 0;
       const year = FREQ_VALS[s.months_12_freq] || 0;
       const month = FREQ_VALS[s.days_30_freq] || 0;
       
       if (month > year) w.push(isRTL ? "الاستخدام الشهري لا يمكن أن يكون أعلى من السنوي" : "L'usage mensuel ne peut être supérieur à l'usage annuel.");
       if (year > life) w.push(isRTL ? "الاستخدام السنوي لا يمكن أن يكون أعلى من مدى الحياة" : "L'usage annuel ne peut être supérieur à l'usage vie.");
       if (month > 0 && year === 0) w.push(isRTL ? "تناقض: استخدام شهري مع نفي سنوي" : "Contradiction : usage mensuel déclaré mais annuel nié.");

       const ageFirst = FREQ_VALS[s.age_first_use] || 0;
       const ageDaily = FREQ_VALS[s.age_daily_use] || 0;
       if (ageDaily > 0 && ageDaily < ageFirst) w.push(isRTL ? "العمر اليومي لا يمكن أن يكون أقل من عمر المرة الأولى" : "L'âge quotidien ne peut être inférieur à l'âge de la première fois.");
    }

    return w;
  };
  // ──────────────────────────────────────────────────────────────────────────

  // ── DEV: Random data generator ────────────────────────────────────────────
  const generateRandomData = () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pickYN     = () => pick(['1', '2']);
    const pickYN01   = () => pick(['0', '1']);
    const pickAge    = () => pick(['2','3','4','5','6','7','8','9']); // matches AGE_SCALE 1-indexed ('1'=never)
    const pickDiff   = () => pick(['1', '2', '3', '4']); // DIFFICULTY_LEVELS: 1=Impossible, 2=Difficile, 3=Facile, 4=Ne sait pas
    const pickSC     = () => pick(['1', '2', '3']);
    const freqOrder  = ['1','2','3','4','5','6','7']; // '1'=Jamais matches UI FREQ_LIFETIME
    const freqStress = ['1', '2', '3', '4', '5'];
    const digitalH   = ['1', '2', '3', '4', '5', '6'];
    const agreement  = ['0', '1', '2', '3', '4'];
    const satOpts    = ['1', '2', '3', '4', '5', '6'];
    const freqAct    = ['1', '2', '3', '4', '5'];
    const absOpts    = ['1', '2', '3', '4', '5', '6'];

    const socialCircle = () => ({
      a: pickSC(), b: pickSC(), c: pickSC(), d: pickSC(), e: pickSC()
    });

    const coherentFreqs = () => {
      const li = Math.floor(Math.random() * freqOrder.length);
      const yi = Math.floor(Math.random() * (li + 1));
      const mi = Math.floor(Math.random() * (yi + 1));
      return {
        lifetime_freq: freqOrder[li],
        months_12_freq: freqOrder[yi],
        days_30_freq: freqOrder[mi],
        _never: freqOrder[li] === '1'  // '1' = Jamais in 1-indexed UI scale
      };
    };

    // Smoking sections (C, D, E) – have age_daily_use
    const smokeSection = () => {
      const f = coherentFreqs();
      return {
        access_difficulty: pickDiff(), social_circle: socialCircle(),
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: f.days_30_freq,
        age_first_use: f._never ? '1' : pickAge(),
        age_daily_use: f._never ? '1' : pickAge(),
      };
    };

    // Drug sections J – has use_last_12months
    const drugSection = () => {
      const f = coherentFreqs();
      return {
        access_difficulty: pickDiff(), social_circle: socialCircle(),
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: f.days_30_freq,
        age_first_use: f._never ? '1' : pickAge(),
        use_last_12months: f._never ? '2' : pickYN(),
      };
    };

    // Drug sections K, L, M – NO use_last_12months (3-row freq grid only)
    const drugSectionSimple = () => {
      const f = coherentFreqs();
      return {
        access_difficulty: pickDiff(), social_circle: socialCircle(),
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: f.days_30_freq,
        age_first_use: f._never ? '1' : pickAge(),
      };
    };

    // Section H – no use_last_12months
    const drugSectionH = () => {
      const f = coherentFreqs();
      return {
        access_difficulty: pickDiff(), social_circle: socialCircle(),
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: f.days_30_freq,
        age_first_use: f._never ? '1' : pickAge(),
      };
    };

    const actKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const absKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
    const satKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

    const hh = ['father', 'mother', 'siblings', 'grandparents'].filter(() => Math.random() > 0.5);
    if (!hh.length) hh.push('mother');

    const iFreqs = coherentFreqs();
    const gFreqs = coherentFreqs();
    const nFreqs = coherentFreqs();
    const pFreqs = coherentFreqs();

    return {
      section_a: {
        gender: pick(['M', 'F']),
        birth_month: pick(['1','2','3','4','5','6','7','8','9','10','11','12']),
        birth_year: pick(['2007','2008','2009','2010','2011']),
        academic_performance: pick(['1', '2', '3']),      // exact backend choices (1: <10, 2: 10-12, 3: >12)
        activities_frequency: Object.fromEntries(actKeys.map(k => [k, pick(freqAct)])),
        school_absences: Object.fromEntries(absKeys.map(k => [k, pick(absOpts)])),
        household_members: hh,
        parents_absence_reason: pick(['', '1', '2', '3', '4']),
        parents_absence_reason_other: '',
        nights_out_30days: pick(['1','2','3','4','5','6','7','8']),
        family_relationship_satisfaction: Object.fromEntries(satKeys.map(k => [k, pick(satOpts)])),
      },
      section_b: {
        father_education: pick(['1','2','3','4','5','6','7','8','9','10','11']), // EDUCATION_LEVEL numeric codes
        mother_education: pick(['1','2','3','4','5','6','7','8','9','10','11']),
        father_job: pick(['1','2','3','4','5','6']), // EMPLOYMENT_STATUS: 1=plein temps...6=NA
        mother_job: pick(['1','2','3','4','5','6']),
        economic_status: pick(['1', '2', '3']),
      },
      section_c: smokeSection(),
      section_d: smokeSection(),
      section_e: smokeSection(),
      section_g: {
        access_difficulty: { beer: pickDiff(), wine: pickDiff(), spirits: pickDiff() },
        social_circle: socialCircle(),
        lifetime_freq: gFreqs.lifetime_freq, months_12_freq: gFreqs.months_12_freq, days_30_freq: gFreqs.days_30_freq,
        days_30_by_type: { beer: pick(freqOrder), wine: pick(freqOrder), spirits: pick(freqOrder) },
        binge_drinking_30days: pick(['1','2','3','4','5','6']), // 1=Aucune...6=≥10
        intoxication_lifetime: pick(freqOrder), intoxication_12months: pick(freqOrder), intoxication_30days: pick(freqOrder),
        age_first_drink: gFreqs._never ? '1' : pickAge(),
        age_first_intoxication: gFreqs._never ? '1' : pickAge(),
      },
      section_h: drugSectionH(),
      section_i: {
        access_difficulty: pickDiff(), social_circle: socialCircle(),
        lifetime_freq: iFreqs.lifetime_freq, months_12_freq: iFreqs.months_12_freq, days_30_freq: iFreqs.days_30_freq,
        age_first_use: iFreqs._never ? '1' : pickAge(),
        use_last_12months: iFreqs._never ? '2' : pickYN(),
        cannabis_types_12months: { resin: pick([true, false]), leaves: pick([true, false]) },
        cannabis_problems_12months: Object.fromEntries(['a','b','c','d','e','f'].map(k => [k, pickYN()])),
      },
      section_j: drugSection(),
      section_k: drugSectionSimple(),
      section_l: drugSectionSimple(),
      section_m: drugSectionSimple(),
      section_n: {
        access_difficulty: Object.fromEntries(['a','d','f','g','h','j','k'].map(k => [k, pickDiff()])),
        lifetime_freq_by_type: Object.fromEntries(['a','d','f','g','h','j','k'].map(k => [k, pick(freqOrder)])),
        months_12_freq_by_type: Object.fromEntries(['a','d','f','g','h','j','k'].map(k => [k, pick(freqOrder)])),
        age_first_use_by_type: Object.fromEntries(['a','d','f','g','h','j','k'].map(k => [k, pickAge()])),
      },
      section_p: {
        lifetime_freq: pFreqs.lifetime_freq, months_12_freq: pFreqs.months_12_freq,
        forms: Object.fromEntries(['a','b','c','d'].map(k => [k, pick([true, false])])),
        substances: Object.fromEntries(['cannabinoids','cathinones'].map(k => [k, pick(freqOrder)])),
      },
      section_q: {
        risk_perceptions: Object.fromEntries(['a','b','c','d','e','f','i','j','k','l','q2a','q2b','q2c','q2d','q2e','q2f','q2g','q2h','q2i','q2m','q2k'].map(k => [k, pick(['1','2','3','4','5'])])),
        help_sources: Object.fromEntries(['a','b','c','d','e','f','g','h'].map(k => [k, pickYN()])),
        friend_use_risk: pick(['1','2','3','4']),
      },
      section_r: {
        hours_per_day_breakdown: { a: pick(digitalH), b: pick(digitalH) },
        agreement: Object.fromEntries(['a','b','c'].map(k => [k, pick(agreement)])),
      },
      section_s: {
        hours_per_day: pick(digitalH),
        days_per_week: pick(['0','1','2','3','4','5','6','7']),
        agreement: Object.fromEntries(['a','b'].map(k => [k, pick(agreement)])),
      },
      section_t: {
        months_12_freq: pick(freqOrder),                                     // uses FREQUENCY_LIFETIME_12M
        offline_games: Object.fromEntries(['slot_machines','cards_dice','lottery','sports_betting','other'].map(k => [k, pick([true, false])])),
        online_games: Object.fromEntries(['slot_machines','cards_dice','lottery','sports_betting','other'].map(k => [k, pick([true, false])])),
        felt_need_increase: pickYN(), lied_about_it: pickYN(),
        gambling_problems: Object.fromEntries(['a','b','c','d','e','f','g','h','i','j','k','l'].map(k => [k, pickYN01()])),
      },
      section_u: {
        fights_12months: pick(['1','2','3','4','5','6','7','8']),
        fight_circumstances: pick(['1','2']),
        fight_location: pick(['1','2']),
        staff_intervention: pickYN(), // YES_NO: '1'=Oui, '2'=Non
        fight_consequences: [pick(['a','b','c','d','e'])],
        serious_injury_12months: pick(['1','2','3','4','5']),
      },
      section_v: {
        a: pick(freqStress), b: pick(freqStress), c: pick(freqStress), d: pick(freqStress),
        self_esteem: Object.fromEntries(['a','b','c','d','e'].map(k => [k, pick(agreement)])),
        mental_health_states: Object.fromEntries(['a','b','c','d','e'].map(k => [k, pickYN()])),
        help_seeking: Object.fromEntries(['a','b'].map(k => [k, pickYN()])),
      },
      section_z: {
        honesty_level: pick(['1','2','3','4','5']),
        honesty_cannabis: pick(['1','2','3','4','5']),
      },
    };
  };
  // ──────────────────────────────────────────────────────────────────────────

  const SECTIONS = [

    {
      id: 'section_a',
      letter: 'A',
      title: 'Informations Générales',
      titleAr: 'معلومات عامة',
      color: 'bg-slate-900',
      content: (
        <div className="space-y-12">
          {/* C.A01 */}
          <div>
            <FieldLabel code="C.A01" fr="Genre?" ar="الجنس؟" isRTL={isRTL} />
            <RadioGroup name="gender" value={data.section_a.gender} onChange={handleChange('section_a')}
              options={[['1', 'Masculin', 'ذكر'], ['2', 'Féminin', 'أنثى']]} isRTL={isRTL} />
          </div>

          {/* C.A02 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel code="C.A02m" fr="Mois de naissance" ar="شهر الميلاد" isRTL={isRTL} />
                <SelectField name="birth_month" value={data.section_a.birth_month} onChange={handleChange('section_a')} isRTL={isRTL}
                  options={['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => [String(i + 1), m, m])} />
              </div>
              <div>
                <FieldLabel code="C.A02a" fr="Année de naissance" ar="سنة الميلاد" isRTL={isRTL} />
                <input type="number" name="birth_year" placeholder="2008" value={data.section_a.birth_year} onChange={handleChange('section_a')}
                  className="w-full border-2 border-slate-100 rounded-xl px-4 py-[10.5px] bg-slate-50 text-slate-800 font-medium focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* C.A03 */}
          <GridQuestion title="À Quelle fréquence pratiquez-vous chacune des activités suivantes ?" titleAr="ما مدى تكرار ممارستك لكل من الأنشطة التالية؟" code="C.A03" isRTL={isRTL}
            options={FREQ_ACTIVITIES} values={data.section_a.activities_frequency}
            onChange={(key, val) => updateCheck('section_a', 'activities_frequency', key, val)}
            items={[
              ['a', 'Activité sportive de tout type', 'نشاط رياضي من أي نوع'],
              ['b', 'Lire des livres pour le plaisir', 'قراءة الكتب للمتعة'],
              ['c', 'Sortir le soir (bar, fête...)', 'الخروج في المساء (ملهى، حفلة...)'],
              ['d', 'Autres loisirs (musique, art...)', 'هوايات أخرى (موسيقى، فن...)'],
              ['e', 'Se retrouver entre amis (rue, parc...)', 'اللقاء مع الأصدقاء (شارع، منتزه...)'],
              ['f', 'Utiliser Internet pour s’amuser', 'استخدام الإنترنت للمتعة'],
              ['g', 'Regarder la télévision', 'مشاهدة التلفاز']
            ]} />

          {/* C.A04 */}
          <GridQuestion title="Au cours du dernier mois, combien de jours avez-vous manqué le lycée pour l'une des raisons suivantes ?" titleAr="خلال الشهر الماضي، كم يوماً تغيبت عن المدرسة بسبب أحد الأسباب التالية؟" code="C.A04" isRTL={isRTL}
            options={[['1', 'Jamais'], ['2', '1 jour'], ['3', '2 jours'], ['4', '3-4 jours'], ['5', '5-6 jours'], ['6', '7 jours+']]}
            values={data.section_a.school_absences}
            onChange={(key, val) => updateCheck('section_a', 'school_absences', key, val)}
            items={[
              ['a', 'Parce que vous étiez malade', 'لأنك كنت مريضاً'],
              ['b', 'Parce que vous n’aviez pas envie', 'لأنك لم ترغب في الذهاب'],
              ['c', 'Problèmes avec l’administration', 'مشاكل مع الإدارة'],
              ['d', 'Problèmes avec des ami(e)s', 'مشاكل مع الأصدقاء'],
              ['e', 'Parce que vous avez été renvoyé', 'لأنك طُردت'],
              ['f', 'Pour d’autres raisons', 'لأسباب أخرى']
            ]} />

          {/* C.A05 */}
          <div>
            <FieldLabel code="C.A05" fr="Comment évaluez-vous votre rendement scolaire à la fin du dernier trimestre ?" ar="كيف تقيم مستواك الدراسي؟" isRTL={isRTL} />
            <RadioGroup name="academic_performance" value={data.section_a.academic_performance} onChange={handleChange('section_a')} isRTL={isRTL} options={PERFORMANCE} />
          </div>

          {/* C.A06 */}
          <div>
            <FieldLabel code="C.A06" fr="Dans quelle mesure appréciez-vous l'école ?" ar="إلى أي مدى تحب المدرسة؟" isRTL={isRTL} />
            <RadioGroup name="school_appreciation" value={data.section_a.school_appreciation} onChange={handleChange('section_a')} isRTL={isRTL}
              options={[['1', 'Je l’apprécie beaucoup', 'أحبها كثيراً'], ['2', 'Je l’apprécie assez', 'أحبها نوعاً ما'], ['3', 'Je ne l’apprécie pas tellement', 'لا أحبها كثيراً'], ['4', 'Je ne l’apprécie pas du tout', 'لا أحبها أبداً']]} />
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
                  <span className="text-[10px] font-black text-slate-400 mr-2">{val}</span>
                  <span className="text-slate-800 font-bold text-sm">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* C.A07/2 */}
          <div>
            <FieldLabel code="C.A07/2" fr="Si vous n’habitez pas avec vos parents ensemble, précisez pourquoi ?" ar="إذا كنت لا تعيش مع والديك، وضح السبب" isRTL={isRTL} />
            <RadioGroup name="parents_absence_reason" value={data.section_a.parents_absence_reason} onChange={handleChange('section_a')}
              options={[['1', 'Décès', 'وفاة'], ['2', 'Divorce', 'طلاق'], ['3', 'Migration', 'هجرة'], ['4', 'Autres causes', 'أسباب أخرى']]} isRTL={isRTL} />
            {data.section_a.parents_absence_reason === '4' && (
              <input type="text" name="parents_absence_reason_other" placeholder="Précisez..." value={data.section_a.parents_absence_reason_other}
                onChange={handleChange('section_a')} className="mt-4 w-full border-b-2 border-slate-200 py-2 focus:border-blue-500 outline-none" />
            )}
          </div>

          {/* C.A08 */}
          <div>
            <FieldLabel code="C.A08" fr="Durant les 30 derniers jours, combien de nuits avez vous passé en dehors de la maison ?" ar="خلال الـ 30 يومًا الماضية، كم ليلة قضيتها خارج المنزل؟" isRTL={isRTL} />
            <SelectField name="nights_out_30days" value={data.section_a.nights_out_30days} onChange={handleChange('section_a')} isRTL={isRTL}
              options={[['1', 'Aucune nuit', 'لا ليلة'], ['2', '1 nuit', 'ليلة واحدة'], ['3', '2 nuits', 'ليلتان'], ['4', '3 nuits', '3 ليالي'], ['5', '4 nuits', '4 ليالي'], ['6', '5 nuits', '5 ليالي'], ['7', '6 nuits', '6 ليالي'], ['8', '7 nuits ou plus', '7 ليالي أو أكثر']]} />
          </div>

          {/* C.A09 */}
          <GridQuestion title="D’une manière générale, quel est votre degré de satisfaction de votre relation avec :" titleAr="بشكل عام، ما مدى رضاك عن علاقتك بـ:" code="C.A09" isRTL={isRTL}
            options={SATISFACTION_SCALE} values={data.section_a.family_relationship_satisfaction}
            onChange={(key, val) => updateCheck('section_a', 'family_relationship_satisfaction', key, val)}
            items={[
              ['a', 'Votre mère', 'أمك'], ['b', 'Votre père', 'أبوك'],
              ['c', 'Votre belle-mère', 'زوجة أبيك'], ['d', 'Votre beau-père', 'زوج أمك'],
              ['e', 'Votre fratrie', 'إخوتك'], ['f', 'Vos ami(e)s', 'أصدقاؤك'],
              ['g', 'Vos camarades de classe', 'زملاؤك في القسم'], ['h', 'Vos enseignants', 'أساتذتك'],
              ['i', 'L’administration du lycée', 'إدارة المعهد']
            ]} />
        </div>
      )
    },
    {
      id: 'section_b',
      letter: 'B',
      title: 'Famille & Situation Socio-Économique',
      titleAr: 'العائلة والوضع الاجتماعي - الاقتصادي',
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

          {/* C.B06 */}
          <div>
            <FieldLabel code="C.B06" fr="Avez-vous une chambre à vous seul(e) ?" ar="هل لديك غرفة خاصة بك؟" isRTL={isRTL} />
            <RadioGroup name="private_room" value={data.section_b.private_room} onChange={handleChange('section_b')} options={YES_NO} isRTL={isRTL} />
          </div>
        </div>
      )
    },

    {
      id: 'section_c',
      letter: 'C',
      title: 'Consommation de Tabac',
      titleAr: 'استهلاك التبغ',
      subtitle: 'Section C',
      subtitleAr: 'القسم C',
      color: 'bg-amber-600',
      content: (
        <div className="space-y-12">
          {/* C.C01 */}
          <div>
            <FieldLabel code="C.C01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des cigarettes si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على السجائر؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_c.access_difficulty} onChange={handleChange('section_c')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.C02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui fume des cigarettes?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يدخن السجائر؟" code="C.C02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_c.social_circle}
            onChange={(key, val) => updateCheck('section_c', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.C03 */}
          <GridQuestion title="Combien de fois avez-vous fumé des cigarettes (sans compter les cigarettes électroniques)?" titleAr="كم مرة دخنت السجائر (بدون احتساب السجائر الإلكترونية)؟" code="C.C03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_c}
            onChange={(key, val) => update('section_c', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.C04 */}
          <div>
            <FieldLabel code="C.C04" fr="Combien de fois avez-vous fumé des cigarettes au cours des 30 DERNIERS JOURS? (sans compter les cigarettes électroniques)" ar="كم مرة دخنت السجائر خلال الـ 30 يومًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="days_30_freq" value={data.section_c.days_30_freq} onChange={handleChange('section_c')} options={FREQ_30DAYS_CIGS} isRTL={isRTL} />
          </div>

          {/* C.C05 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit?" titleAr="في أي عمر بدأت تفعل ما يلي؟" code="C.C05" isRTL={isRTL}
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
      titleAr: 'السجائر الإلكترونية',
      subtitle: 'Section D',
      subtitleAr: 'القسم D',
      color: 'bg-emerald-600',
      content: (
        <div className="space-y-12">
          {/* C.D01 */}
          <div>
            <FieldLabel code="C.D01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des cigarettes électroniques si vous le vouliez? " ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على السجائر الإلكترونية؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_d.access_difficulty} onChange={handleChange('section_d')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.D02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui fume des cigarettes électroniques?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يدخن السجائر الإلكترونية؟" code="C.D02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_d.social_circle}
            onChange={(key, val) => updateCheck('section_d', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.D03 */}
          <GridQuestion title="Combien de fois avez-vous fumé des cigarettes électroniques?" titleAr="كم مرة دخنت السجائر الإلكترونية؟" code="C.D03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_d}
            onChange={(key, val) => update('section_d', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.D04 */}
          <div>
            <FieldLabel code="C.D04" fr="Combien de fois avez-vous fumé des cigarettes électroniques au cours des 30 DERNIERS JOURS?" ar="كم مرة دخنت السجائر الإلكترونية خلال الـ 30 يومًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="days_30_freq" value={data.section_d.days_30_freq} onChange={handleChange('section_d')} options={FREQ_30DAYS_VAPE} isRTL={isRTL} />
          </div>

          {/* C.D05 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit ?" titleAr="في أي عمر بدأت تفعل ما يلي؟" code="C.D05" isRTL={isRTL}
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
      titleAr: 'استهلاك النرجيلة (شيشة)',
      subtitle: 'Section E',
      subtitleAr: 'القسم E',
      color: 'bg-orange-600',
      content: (
        <div className="space-y-12">
          {/* C.E01 */}
          <div>
            <FieldLabel code="C.E01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer un narguilé si vous le vouliez ?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الشيشة؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_e.access_difficulty} onChange={handleChange('section_e')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.E02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui fume le narguilé?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يدخن الشيشة؟" code="C.E02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_e.social_circle}
            onChange={(key, val) => updateCheck('section_e', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.E03 */}
          <GridQuestion title="Combien de fois avez-vous fumé narguilé?" titleAr="كم مرة دخنت الشيشة؟" code="C.E03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_e}
            onChange={(key, val) => update('section_e', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.E04 */}
          <div>
            <FieldLabel code="C.E04" fr="Combien de fois avez-vous fumé le narguilé au cours des 30 DERNIERS JOURS ?" ar="كم مرة دخنت الشيشة خلال الـ 30 يومًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="days_30_freq" value={data.section_e.days_30_freq} onChange={handleChange('section_e')} options={FREQ_30DAYS_HOOKAH} isRTL={isRTL} />
          </div>

          {/* C.E05 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit?" titleAr="في أي عمر بدأت تفعل ما يلي؟" code="C.E05" isRTL={isRTL}
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
      titleAr: 'المشروبات الكحولية',
      color: 'bg-amber-800',
      content: (
        <div className="space-y-12">
          {/* C.G01 */}
          <GridQuestion title="À quel point pensez-vous qu'il serait difficile de vous procurer les boissons suivantes si vous le vouliez ?" titleAr="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على المشروبات التالية؟" code="C.G01" isRTL={isRTL}
            options={DIFFICULTY_LEVELS} values={data.section_g.access_difficulty}
            onChange={(key, val) => updateCheck('section_g', 'access_difficulty', key, val)}
            items={[
              ['a', 'La bière', 'البيرة'],
              ['b', 'Les cocktails', 'الكوكتيلات'],
              ['c', 'Les vins', 'النبيذ'],
              ['d', 'Les eaux-de-vie (Whisky, Vodka...)', 'المشروبات الروحية (ويسكي، فودكا...)'],
              ['e', 'Autres boissons alcoolisées', 'مشروبات كحولية أخرى']
            ]} />

          {/* C.G02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme les boissons alcoolisées?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يستهلك المشروبات الكحولية؟" code="C.G02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_g.social_circle}
            onChange={(key, val) => updateCheck('section_g', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.G03 */}
          <GridQuestion title="Combien de fois avez-vous consommé des boissons alcoolisées?" titleAr="كم مرة تناولت المشروبات الكحولية؟" code="C.G03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_g}
            onChange={(key, val) => update('section_g', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.G04 */}
          <GridQuestion title="Combien de fois avez-vous consommé les boissons alcoolisées suivantes au cours des 30 DERNIERS JOURS ?" titleAr="كم مرة استهلكت المشروبات الكحولية التالية خلال الـ 30 يومًا الماضية؟" code="C.G04" isRTL={isRTL}
            options={FREQ_30DAYS} values={data.section_g.days_30_by_type}
            onChange={(key, val) => updateCheck('section_g', 'days_30_by_type', key, val)}
            items={[
              ['a', 'Bière', 'البيرة'],
              ['b', 'Cocktails', 'الكوكتيلات'],
              ['c', 'Vins', 'النبيذ'],
              ['d', 'Eaux-de-vie (Whisky, Vodka...)', 'المشروبات الروحية']
            ]} />

          {/* C.G05 */}
          <div>
            <FieldLabel code="C.G05" fr="Durant les 30 DERNIERS JOURS, combien de fois avez-vous consommé 5 boissons alcoolisées ou plus à la même occasion ?" ar="خلال الـ 30 يومًا الماضية، كم مرة تناولت 5 مشروبات كحولية أو أكثر؟" isRTL={isRTL} />
            <RadioGroup name="binge_drinking_30days" value={data.section_g.binge_drinking_30days} onChange={handleChange('section_g')} options={FREQ_BINGE} isRTL={isRTL} />
          </div>

          {/* C.G06 */}
          <GridQuestion title="Combien de fois (éventuellement) avez-vous été intoxiqué par la consommation des boissons alcoolisées?" titleAr="كم مرة (إن وجدت) كنت في حالة سكر بسبب تناول المشروبات الكحولية؟" code="C.G06" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_g}
            onChange={(key, val) => update('section_g', key, val)}
            items={[['intoxication_lifetime', 'Au cours de votre vie', 'طوال حياتك'], ['intoxication_12months', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['intoxication_30days', 'Au cours des 30 derniers jours', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.G07 */}
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit pour la première fois ?" titleAr="في أي عمر بدأت تفعل ما يلي لأول مرة؟" code="C.G07" isRTL={isRTL}
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
      titleAr: 'المهدئات أو المهدئات (بدون وصفة طبية)',
      subtitle: 'Section H',
      subtitleAr: 'القسم H',
      color: 'bg-purple-900',
      content: (
        <div className="space-y-12">
          {/* C.H01 */}
          <div>
            <FieldLabel code="C.H01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des tranquillisants ou sédatifs (sans ordonnance) si vous le vouliez ?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على المهدئات؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_h.access_difficulty} onChange={handleChange('section_h')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.H02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme des tranquillisants ou sédatifs (sans ordonnance) ?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يستهلك المهدئات أو المهدئات بدون وصفة طبية؟" code="C.H02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_h.social_circle}
            onChange={(key, val) => updateCheck('section_h', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.H03 */}
          <GridQuestion title="Combien de fois avez-vous consommé des tranquillisants ou sédatifs (sans ordonnance) ?" titleAr="كم مرة تناولت المهدئات أو المهدئات (بدون وصفة طبية)؟" code="C.H03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_h}
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
      titleAr: 'القنب الهندي (زطلة، ماريجوانا...)',
      subtitle: 'Section I',
      subtitleAr: 'القسم I',
      color: 'bg-green-900',
      content: (
        <div className="space-y-12">
          {/* C.I01 */}
          <div>
            <FieldLabel code="C.I01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer du cannabis si vous le vouliez ?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على القنب الهندي؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_i.access_difficulty} onChange={handleChange('section_i')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.I02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme du cannabis?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يستهلك القنب الهندي؟" code="C.I02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_i.social_circle}
            onChange={(key, val) => updateCheck('section_i', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.I03 */}
          <div>
            <FieldLabel code="C.I03" fr="À quel âge avez-vous consommé du cannabis pour la première fois ?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_i.age_first_use} onChange={handleChange('section_i')} options={AGE_SCALE} isRTL={isRTL} />
          </div>

          {/* C.I04 */}
          <GridQuestion title="Combien de fois avez-vous consommé du cannabis?" titleAr="كم مرة استهلكت القنب الهندي؟" code="C.I04" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_i}
            onChange={(key, val) => update('section_i', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['days_30_freq', 'Au cours des 30 DERNIERS JOURS', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.I06 */}
          <div>
            <FieldLabel code="C.I06" fr="Avez-vous consommé du cannabis durant les 12 DERNIERS MOIS ?" ar="هل استهلكت القنب الهندي خلال الـ 12 شهرًا الماضية؟" isRTL={isRTL} />
            <RadioGroup name="use_last_12months" value={data.section_i.use_last_12months} onChange={handleChange('section_i')} options={YES_NO} isRTL={isRTL} />
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.I08</span>{isRTL ? 'أنواع القنب المستعملة خلال الـ 12 شهرًا الأخيرة:' : 'Plus précisément, quel type de cannabis avez-vous utilisé au cours des 12 derniers mois?'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['a', 'Résine (Zatla, Hachich)', 'راتنج (زطلة، حشيش)'], ['b', 'Herbe (Marihuana, Kif, Fleur)', 'أوراق (ماريجوانا، كيف، زهرة)']].map(([key, fr, ar]) => (
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
                ['a', 'C.I09/1', 'Consommé avant midi ?', 'قبل الظهر؟'],
                ['b', 'C.I09/2', 'Consommé seul ?', 'وحدك؟'],
                ['c', 'C.I09/3', 'Problèmes de mémoire ?', 'مشاكل في الذاكرة؟'],
                ['d', 'C.I09/4', 'Famille/amis conseillé d’arrêter ?', 'نصيحة العائلة/الأصدقاء بالتوقف؟'],
                ['e', 'C.I09/5', 'Essai de s’arrêter sans succès ?', 'محاولة التوقف بدون نجاح؟'],
                ['f', 'C.I09/6', 'Problèmes (dispute, accident...) ?', 'مشاكل (شجار، حادث...)؟']
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
      titleAr: 'الكوكايين',
      subtitle: 'Section J',
      subtitleAr: 'القسم J',
      color: 'bg-red-900',
      content: (
        <div className="space-y-12">
          {/* C.J01 */}
          <div>
            <FieldLabel code="C.J01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer de la cocaïne si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الكوكايين؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_j.access_difficulty} onChange={handleChange('section_j')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.J02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme de la cocaïne?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يستهلك الكوكايين؟" code="C.J02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_j.social_circle}
            onChange={(key, val) => updateCheck('section_j', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.J03 */}
          <GridQuestion title="Combien de fois avez-vous consommé de la cocaïne?" titleAr="كم مرة استهلكت الكوكايين؟" code="C.J03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_j}
            onChange={(key, val) => update('section_j', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['days_30_freq', 'Au cours des 30 derniers jours', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.J04 */}
          <div>
            <FieldLabel code="C.J04" fr="À quel âge avez-vous consommé de la cocaïne pour la première fois?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_j.age_first_use} onChange={handleChange('section_j')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_k',
      letter: 'K',
      title: 'Ecstasy',
      titleAr: 'إكستاسي',
      subtitle: 'Section K',
      subtitleAr: 'القسم K',
      color: 'bg-pink-900',
      content: (
        <div className="space-y-12">
          {/* C.K01 */}
          <div>
            <FieldLabel code="C.K01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer de l'Ecstasy si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الإكستاسي؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_k.access_difficulty} onChange={handleChange('section_k')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.K02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme de l'Ecstasy?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يستهلك الإكستاسي؟" code="C.K02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_k.social_circle}
            onChange={(key, val) => updateCheck('section_k', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.K03 */}
          <GridQuestion title="Combien de fois avez-vous consommé de l'Ecstasy?" titleAr="كم مرة استهلكت الإكستاسي؟" code="C.K03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_k}
            onChange={(key, val) => update('section_k', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['days_30_freq', 'Au cours des 30 derniers jours', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.K04 */}
          <div>
            <FieldLabel code="C.K04" fr="À quel âge avez-vous consommé de l'Ecstasy pour la première fois?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_k.age_first_use} onChange={handleChange('section_k')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_l',
      letter: 'L',
      title: 'Héroïne',
      titleAr: 'هيروين',
      subtitle: 'Section L',
      subtitleAr: 'القسم L',
      color: 'bg-stone-900',
      content: (
        <div className="space-y-12">
          {/* C.L01 */}
          <div>
            <FieldLabel code="C.L01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer de l'héroïne si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على الهيروين؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_l.access_difficulty} onChange={handleChange('section_l')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.L02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme de l'héroïne?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يستهلك الهيروين؟" code="C.L02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_l.social_circle}
            onChange={(key, val) => updateCheck('section_l', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.L03 */}
          <GridQuestion title="Combien de fois avez-vous consommé de l'héroïne?" titleAr="كم مرة استهلكت الهيروين؟" code="C.L03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_l}
            onChange={(key, val) => update('section_l', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['days_30_freq', 'Au cours des 30 derniers jours', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.L04 */}
          <div>
            <FieldLabel code="C.L04" fr="À quel âge avez-vous consommé de l'héroïne pour la première fois?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_l.age_first_use} onChange={handleChange('section_l')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_m',
      letter: 'M',
      title: 'Solvants et Inhalants',
      titleAr: 'المذيبات والمستنشقات',
      subtitle: 'Section M',
      subtitleAr: 'القسم M',
      color: 'bg-blue-900',
      content: (
        <div className="space-y-12">
          {/* C.M01 */}
          <div>
            <FieldLabel code="C.M01" fr="À quel point pensez-vous qu'il serait difficile de vous procurer des solvants ou des inhalants (Colle, Diluant, Essence...) si vous le vouliez?" ar="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على المذيبات أو الاستنشاقات؟" isRTL={isRTL} />
            <RadioGroup name="access_difficulty" value={data.section_m.access_difficulty} onChange={handleChange('section_m')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>

          {/* C.M02 */}
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis qui consomme des solvants ou des inhalants?" titleAr="هل هناك شخص من أفراد عائلتك أو أصدقائك يستهلك المذيبات أو الاستنشاقات؟" code="C.M02" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_m.social_circle}
            onChange={(key, val) => updateCheck('section_m', 'social_circle', key, val)}
            items={[['a', 'Père', 'الأب'], ['b', 'Mère', 'الأم'], ['c', 'Fratrie', 'الإخوة'], ['d', 'Meilleur(e) ami(e)', 'أفضل صديق'], ['e', 'Autres ami(e)s', 'أصدقاء آخرون']]} />

          {/* C.M03 */}
          <GridQuestion title="Combien de fois avez-vous consommé des solvants ou des inhalants (Colle, Diluant, Essence...)?" titleAr="كم مرة استهلكت المذيبات أو الاستنشاقات (غراء، مخفف، بنزين...)؟" code="C.M03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_m}
            onChange={(key, val) => update('section_m', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة'], ['days_30_freq', 'Au cours des 30 derniers jours', 'خلال الـ 30 يومًا الأخيرة']]} />

          {/* C.M04 */}
          <div>
            <FieldLabel code="C.M04" fr="À quel âge avez-vous consommé des solvants ou des inhalants pour la première fois?" ar="العمر عند أول مرة" isRTL={isRTL} />
            <SelectField name="age_first_use" value={data.section_m.age_first_use} onChange={handleChange('section_m')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_n',
      letter: 'N',
      title: 'Autres Substances Narcotiques',
      titleAr: 'مواد مخدرة أخرى',
      subtitle: 'Section N',
      subtitleAr: 'القسم N',
      color: 'bg-yellow-800',
      content: (
        <div className="space-y-12">
          {/* C.N01 Access */}
          <GridQuestion title="À quel point pensez-vous qu'il serait difficile de vous procurer les substances suivantes si vous le vouliez ?" titleAr="إلى أي مدى تعتقد أنه سيكون من الصعب الحصول على المواد التالية؟" code="C.N01" isRTL={isRTL}
            options={DIFFICULTY_LEVELS} values={data.section_n.access_difficulty}
            onChange={(key, val) => updateCheck('section_n', 'access_difficulty', key, val)}
            items={[
              ['a', 'Amphétamines', 'الأمفيتامينات'],
              ['d', 'Dipaje', 'ديباج'],
              ['f', 'Hallucinogènes (LSD, champignons...)', 'المهلوسات (LSD، الفطر...)'],
              ['g', 'Méthamphétamines', 'الميثامفيتامين'],
              ['h', 'Antalgiques (Tramadol, Codéine...)', 'المسكنات (ترامادول، كوديين...)'],
              ['j', 'Subutex', 'سوبوتيكس'],
              ['k', 'Speed', 'سبيد']
            ]} />

          {/* C.N02-N03-N04 Grid */}
          <GridQuestion title="Utilisation de substances au cours de votre VIE :" titleAr="استخدام المواد خلال حياتك:" code="C.N02" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_n.lifetime_freq_by_type}
            onChange={(key, val) => updateCheck('section_n', 'lifetime_freq_by_type', key, val)}
            items={[
              ['a', 'Amphétamines', 'الأمفيتامينات'],
              ['d', 'Dipaje', 'ديباج'],
              ['f', 'Hallucinogènes', 'المهلوسات'],
              ['g', 'Méthamphétamines', 'الميثامفيتامين'],
              ['h', 'Antalgiques', 'المسكنات'],
              ['j', 'Subutex', 'سوبوتيكس'],
              ['k', 'Speed', 'سبيد']
            ]} />

          <GridQuestion title="Utilisation de substances au cours des 12 DERNIERS MOIS :" titleAr="استخدام المواد خلال الـ 12 شهراً الماضية:" code="C.N03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_n.months_12_freq_by_type}
            onChange={(key, val) => updateCheck('section_n', 'months_12_freq_by_type', key, val)}
            items={[
              ['a', 'Amphétamines', 'الأمفيتامينات'],
              ['d', 'Dipaje', 'ديباج'],
              ['f', 'Hallucinogènes', 'المهلوسات'],
              ['g', 'Méthamphétamines', 'الميثامفيتامين'],
              ['h', 'Antalgiques', 'المسكنات'],
              ['j', 'Subutex', 'سوبوتيكس'],
              ['k', 'Speed', 'سبيد']
            ]} />

          <GridQuestion title="À quel âge avez-vous consommé pour la première fois chacune des substances suivantes ?" titleAr="في أي عمر استهلكت لأول مرة كل من المواد التالية؟" code="C.N04" isRTL={isRTL}
            options={AGE_SCALE} values={data.section_n.age_first_use_by_type}
            onChange={(key, val) => updateCheck('section_n', 'age_first_use_by_type', key, val)}
            items={[
              ['a', 'Amphétamines', 'الأمفيتامينات'],
              ['d', 'Dipaje', 'ديباج'],
              ['f', 'Hallucinogènes', 'المهلوسات'],
              ['g', 'Méthamphétamines', 'الميثامفيتامين'],
              ['h', 'Antalgiques', 'المسكنات'],
              ['j', 'Subutex', 'سوبوتيكس'],
              ['k', 'Speed', 'سبيد']
            ]} />
        </div>
      )
    },
    {
      id: 'section_p',
      letter: 'P',
      title: 'Nouvelles Substances Narcotiques (NSP)',
      titleAr: 'المواد المخدرة الجديدة (NSP)',
      subtitle: 'Section P',
      subtitleAr: 'القسم P',
      color: 'bg-indigo-900',
      content: (
        <div className="space-y-12">
          {/* C.P01 */}
          <GridQuestion title="Combien de fois avez-vous consommé l'une de ces substances (NSP) ?" titleAr="كم مرة استهلكت إحدى هذه المواد (NSP)؟" code="C.P01" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_p}
            onChange={(key, val) => update('section_p', key, val)}
            items={[['lifetime_freq', 'Au cours de votre vie', 'طوال حياتك'], ['months_12_freq', 'Au cours des 12 derniers mois', 'خلال الـ 12 شهرًا الأخيرة']]} />

          {/* C.P02 Formes */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.P02</span>{isRTL ? 'تحت أي شكل كانت هذه المواد خلال الـ 12 شهرًا الأخيرة:' : 'Quelle forme avaient ces substances au cours des 12 derniers mois ?'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['a', 'Poudre', 'مسحوق'],
                ['b', 'Comprimés', 'أقراص'],
                ['c', 'Liquide', 'سوائل'],
                ['d', 'Autre', 'أخرى']
              ].map(([key, fr, ar]) => (
                <label key={key} className={`flex items-center space-x-3 p-4 bg-white rounded-2xl border-2 transition-all cursor-pointer ${data.section_p.forms[key] ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100'}`}>
                  <input type="checkbox" checked={data.section_p.forms[key]}
                    onChange={(e) => updateCheck('section_p', 'forms', key, e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className="font-bold text-slate-700">{isRTL ? ar : fr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* C.P03 Types */}
          <GridQuestion title="Combien de fois DANS VOTRE VIE avez-vous consommé l'une des substances suivantes ?" titleAr="كم مرة في حياتك استهلكت إحدى المواد التالية؟" code="C.P03" isRTL={isRTL}
            options={FREQ_LIFETIME} values={data.section_p.substances}
            onChange={(key, val) => updateCheck('section_p', 'substances', key, val)}
            items={[
              ['cannabinoids', 'Cannabinoïdes synthétiques', 'الكانابينويدات الاصطناعية'],
              ['cathinones', 'Cathinones synthétiques', 'الكاثينونات الاصطناعية']
            ]} />
        </div>
      )
    },

    {
      id: 'section_q',
      letter: 'Q',
      title: 'Perception des Risques et Aide',
      titleAr: 'إدراك المخاطر والمساعدة',
      subtitle: 'Section Q',
      subtitleAr: 'القسم Q',
      color: 'bg-emerald-800',
      content: (
        <div className="space-y-12">
          {/* C.Q01-Q02 */}
          {/* C.Q01 */}
          <GridQuestion title="À votre avis, quel risque les gens courent-ils de se nuire (physique ou autre) s'ils font ce qui suit :" titleAr="برأيك، ما المخاطر التي يتعرض لها الناس (جسدياً أو غير ذلك) إذا فعلوا ما يلي:" code="C.Q01" isRTL={isRTL}
            options={RISK_LEVELS} values={data.section_q.risk_perceptions}
            onChange={(key, val) => updateCheck('section_q', 'risk_perceptions', key, val)}
            items={[
              ['a', 'Fument des cigarettes OCCASIONNELLEMENT', 'تدخين السجائر أحياناً'],
              ['b', 'Fument un paquet de cigarettes ou plus par jour REGULIEREMENT', 'تدخين علبة سجائر أو أكثر يومياً بانتظام'],
              ['c', 'Fument les cigarettes électroniques OCCASIONNELLEMENT', 'تدخين السجائر الإلكترونية أحياناً'],
              ['d', 'Fument les cigarettes électroniques REGULIEREMENT', 'تدخين السجائر الإلكترونية بانتظام'],
              ['e', 'Fument le narguilé OCCASIONNELLEMENT', 'تدخين الشيشة أحياناً'],
              ['f', 'Fument le narguilé REGULIEREMENT', 'تدخين الشيشة بانتظام'],
              ['i', 'Consomment les boissons alcoolisées OCCASIONNELLEMENT', 'تناول المشروبات الكحولية أحياناً'],
              ['j', 'Consomment de l’alcool presque tous les jours (1 ou 2 verres)', 'تناول الكحول يومياً تقريباً (كأس أو كأسان)'],
              ['k', 'Consomment 3 verres ou plus de boissons alcoolisées presque tous les jours', 'تناول 3 كؤوس أو أكثر من الكحول يومياً تقريباً'],
              ['l', 'Consomment 5 verres ou plus à la même occasion presque chaque weekend', 'تناول 5 كؤوس أو أكثر في نفس المناسبة كل نهاية أسبوع تقريباً']
            ]} />

          {/* C.Q02 */}
          <GridQuestion title="À votre avis, quel risque les gens courent-ils de se nuire s'ils font ce qui suit :" titleAr="برأيك، ما المخاطر التي يتعرض لها الناس إذا فعلوا ما يلي:" code="C.Q02" isRTL={isRTL}
            options={RISK_LEVELS} values={data.section_q.risk_perceptions}
            onChange={(key, val) => updateCheck('section_q', 'risk_perceptions', key, val)}
            items={[
              ['q2a', 'Consomment des tranquillisants sans prescription OCCASIONNELLEMENT', 'تناول المهدئات بدون وصفة أحياناً'],
              ['q2b', 'Consomment des tranquillisants sans prescription REGULIEREMENT', 'تناول المهدئات بدون وصفة بانتظام'],
              ['q2c', 'Consomment du cannabis OCCASIONNELLEMENT', 'استهلاك القنب الهندي أحياناً'],
              ['q2d', 'Consomment du cannabis REGULIEREMENT', 'استهلاك القنب الهندي بانتظام'],
              ['q2e', 'Consomment de la cocaïne OCCASIONNELLEMENT', 'استهلاك الكوكايين أحياناً'],
              ['q2f', 'Consomment de l’Ecstasy OCCASIONNELLEMENT', 'استهلاك الإكستاسي أحياناً'],
              ['q2g', 'Consomment de l’héroïne OCCASIONNELLEMENT', 'استهلاك الهيروين أحياناً'],
              ['q2h', 'Consomment des inhalants narcotiques OCCASIONNELLEMENT', 'استنشاق المواد المخدرة أحياناً'],
              ['q2i', 'Consomment des amphétamines OCCASIONNELLEMENT', 'استهلاك الأمفيتامينات أحياناً'],
              ['q2m', 'Consomment Subutex OCCASIONNELLEMENT', 'استهلاك السوبوتيكس أحياناً'],
              ['q2k', 'Consomment des cannabinoïdes synthétiques OCCASIONNELLEMENT', 'استهلاك الكانابينويدات الاصطناعية أحياناً']
            ]} />

          {/* C.Q03 */}
          <GridQuestion title="Si vous aviez un problème lié à l’alcool ou aux drogues, vers qui vous tourneriez-vous pour obtenir de l’aide ?" titleAr="إذا كانت لديك مشكلة متعلقة بالكحول أو المخدرات، إلى من ستتوجه للحصول على مساعدة؟" code="C.Q03" isRTL={isRTL}
            options={YES_NO_DK} values={data.section_q.help_sources}
            onChange={(key, val) => updateCheck('section_q', 'help_sources', key, val)}
            items={[
              ['a', 'Membre(s) de la famille', 'أفراد العائلة'],
              ['b', 'Ami(e)s', 'الأصدقاء'],
              ['c', 'Enseignants ou autres responsables du lycée', 'الأساتذة أو مسؤولو المعهد'],
              ['d', 'Médecin, psychologue...', 'طبيب، أخصائي نفسي...'],
              ['e', 'Une personne de religion', 'رجل دين'],
              ['f', 'Centres de traitement de la toxicomanie', 'مراكز علاج الإدمان'],
              ['g', 'Associations (ONG)', 'الجمعيات (منظمات غير حكومية)'],
              ['h', 'Autre', 'خيار آخر']
            ]} />

          {/* C.Q04 */}
          <div>
            <FieldLabel code="C.Q04" fr="Pensez-vous que vous fumeriez du cannabis si l'un de vos meilleurs amis vous en proposait ?" ar="هل تعتقد أنك ستدخن القنب الهندي إذا عرضه عليك أحد أعز أصدقائك؟" isRTL={isRTL} />
            <RadioGroup name="friend_use_risk" value={data.section_q.friend_use_risk} onChange={handleChange('section_q')} 
              options={[['1', 'Certainement non', 'بالتأكيد لا'], ['2', 'Probablement non', 'على الأرجح لا'], ['3', 'Probablement oui', 'على الأرجح نعم'], ['4', 'Certainement oui', 'بالتأكيد نعم']]} isRTL={isRTL} />
          </div>
        </div>
      )
    },
    {
      id: 'section_r',
      letter: 'R',
      title: 'Réseaux Sociaux',
      titleAr: 'وسائل التواصل الاجتماعي',
      subtitle: 'Section R',
      subtitleAr: 'القسم R',
      color: 'bg-indigo-800',
      content: (
        <div className="space-y-12">
          {/* C.R01 */}
          <GridQuestion title="Au cours des 30 DERNIERS JOURS, combien d’heures avez-vous passé par jour sur les réseaux sociaux ?" titleAr="خلال الـ 30 يوماً الماضية، كم ساعة قضيتها يومياً على وسائل التواصل الاجتماعي؟" code="C.R01" isRTL={isRTL}
            options={FREQ_DIGITAL} values={data.section_r.hours_per_day_breakdown}
            onChange={(key, val) => updateCheck('section_r', 'hours_per_day_breakdown', key, val)}
            items={[
              ['a', 'Les jours de cours', 'أيام الدراسة'],
              ['b', 'Le weekend', 'نهاية الأسبوع']
            ]} />

          {/* C.R02 */}
          <GridQuestion title="Dans quelle mesure êtes-vous d’accord ou en désaccord avec les avis suivants concernant l’utilisation des réseaux sociaux :" titleAr="إلى أي مدى توافق أو تختلف مع الآراء التالية بخصوص استخدام وسائل التواصل الاجتماعي:" code="C.R02" isRTL={isRTL}
            options={AGREEMENT_SCALE_SIMPLE} values={data.section_r.agreement}
            onChange={(key, val) => updateCheck('section_r', 'agreement', key, val)}
            items={[
              ['a', 'Vous sentiez-vous très concerné par les réseaux sociaux ?', 'انشغال شديد بالشبكات؟'],
              ['b', 'Avez-vous négligé d’autres activités / hobbies ?', 'إهمال الأنشطة الأخرى؟'],
              ['c', 'Mauvaise humeur si vous ne pouviez pas les utiliser ?', 'سوء الحالة المزاجية بدونها؟']
            ]} />
        </div>
      )
    },
    {
      id: 'section_s',
      letter: 'S',
      title: 'Jeux Vidéo',
      titleAr: 'ألعاب الفيديو',
      subtitle: 'Section S',
      subtitleAr: 'القسم S',
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
              options={[['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7']]} isRTL={isRTL} />
          </div>

          {/* C.S03 */}
          <GridQuestion title="Dans quelle mesure êtes-vous d’accord ou en désaccord avec les avis suivants concernant les jeux vidéo :" titleAr="إلى أي مدى توافق أو تختلف مع الآراء التالية بخصوص ألعاب الفيديو:" code="C.S03" isRTL={isRTL}
            options={AGREEMENT_SCALE_SIMPLE} values={data.section_s.agreement}
            onChange={(key, val) => updateCheck('section_s', 'agreement', key, val)}
            items={[
              ['a', 'Es-tu passionné par les jeux (penses-tu souvent à tes activités de jeux même quand tu n’y joues pas) ?', 'هل أنت شغوف بالألعاب (هل تفكر غالباً في أنشطة اللعب الخاصة بك حتى عندما لا تلعب)؟'],
              ['b', 'As-tu négligé d’autres activités/loisirs (école, devoirs, sports...) ?', 'هل أهملت أنشطة/هوايات أخرى (المدرسة، الفروض المنزلية، الرياضة...)؟']
            ]} />
        </div>
      )
    },
    {
      id: 'section_t',
      letter: 'T',
      title: "Jeux d'Argent",
      subtitle: 'Section T',
      subtitleAr: 'القسم T',
      color: 'bg-orange-900',
      content: (
        <div className="space-y-12">
          {/* C.T01 */}
          <div>
            <FieldLabel code="C.T01" fr="Au cours des 12 derniers mois, avec quelle fréquence avez-vous joué de l'argent (loto, paris, cartes...) ?" ar="خلال الـ 12 شهراً الماضية، كم مرة لعبت بالمال (لوتو، رهانات، ورق...)؟" isRTL={isRTL} />
            <SelectField name="months_12_freq" value={data.section_t.months_12_freq} onChange={handleChange('section_t')} options={FREQ_GAMBLING} isRTL={isRTL} />
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
          <GridQuestion title="Si vous avez joué aux jeux d’argent durant les 12 DERNIERS MOIS… :" titleAr="إذا كنت قد لعبت ألعاب القمار خلال الـ 12 شهراً الماضية...:" code="C.T06" isRTL={isRTL}
            options={YES_NO} values={data.section_t.gambling_problems}
            onChange={(key, val) => updateCheck('section_t', 'gambling_problems', key, val)}
            items={[
              ['a', 'Êtes-vous retourné un autre jour pour essayer de gagner l’argent que vous avez perdu ?', 'هل عدت يوماً آخر لمحاولة استعادة المال الذي خسرته؟'],
              ['b', 'Avez-vous dit aux autres que vous gagniez de l’argent, alors qu’en réalité, vous perdiez ?', 'هل قلت للآخرين أنك تربح المال بينما كنت في الواقع تخسر؟'],
              ['c', 'Jouer vous a-t-il causé des problèmes (disputes famille/amis, lycée) ?', 'هل سبب لك اللعب مشاكل (خلافات مع العائلة/الأصدقاء، المعهد)؟'],
              ['d', 'Avez-vous joué plus que vous ne l’aviez prévu au début ?', 'هل لعبت أكثر مما كنت تتوقع في البداية؟'],
              ['e', 'Quelqu’un vous a-t-il critiqué ou dit que vous étiez accro ?', 'هل انتقدك شخص ما أو قال لك أنك مدمن؟'],
              ['f', 'Avez-vous déjà senti mal à propos de l’argent que vous pariez ?', 'هل شعرت يوماً بالسوء تجاه المبالغ التي تراهن بها؟'],
              ['g', 'Avez-vous déjà eu envie d’arrêter de jouer sans y parvenir ?', 'هل رغبت يوماً في التوقف عن اللعب ولم تستطع؟'],
              ['h', 'Avez-vous caché des preuves de vos jeux (tickets, argent gagné) ?', 'هل أخفيت أدلة على لعبك (تذاكر، أموال فائزة)؟'],
              ['i', 'Avez-vous eu des conflits financiers avec votre famille/amis ?', 'هل دخلت في صراعات مالية مع عائلتك أو أصدقائك؟'],
              ['j', 'Avez-vous emprunté de l’argent pour parier sans le rendre ?', 'هل اقترضت مالاً للمراهنة ولم ترجعه؟'],
              ['k', 'Avez-vous déjà manqué l’école en raison des jeux d’argent ?', 'هل تغيبت عن المدرسة بسبب أنشطة القمار؟'],
              ['l', 'Avez-vous emprunté ou volé de l’argent pour parier ?', 'هل اقترضت أو سرقت مالاً للمراهنة؟']
            ]} />
        </div>
      )
    },
    {
      id: 'section_u',
      letter: 'U',
      title: 'Violence & Sécurité',
      titleAr: 'العنف والأمن',
      subtitle: 'Section U',
      subtitleAr: 'القسم U',
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
            <FieldLabel code="C.U02" fr="Quelles étaient les circonstances de la dernière bagarre ?" ar="ما هي ظروف المشاجرة الأخيرة؟" isRTL={isRTL} />
            <RadioGroup name="fight_circumstances" value={data.section_u.fight_circumstances} onChange={handleChange('section_u')}
              options={[['1', 'Je me battais avec quelqu\'un (J’étais l’initiateur)', 'كنت أقاتل شخصاً ما (أنا من بدأ)'], ['2', 'J’ai été attaqué, agressé ou maltraité', 'تعرضت للهجوم أو الاعتداء أو سوء المعاملة']]} isRTL={isRTL} />
          </div>

          {/* C.U03 */}
          <div>
            <FieldLabel code="C.U03" fr="Quel était le lieu de la bagarre ?" ar="أين كان مكان المشاجرة؟" isRTL={isRTL} />
            <RadioGroup name="fight_location" value={data.section_u.fight_location} onChange={handleChange('section_u')}
              options={[['1', 'Au sein du lycée', 'داخل المعهد'], ['2', 'À l’extérieur du lycée', 'خارج المعهد']]} isRTL={isRTL} />
          </div>

          {/* C.U04 */}
          <div>
            <FieldLabel code="C.U04" fr="En cas de problème, est-ce que le personnel du lycée intervient pour vous aider ?" ar="في حالة وجود مشكلة، هل يتدخل موظفو المعهد لمساعدتك؟" isRTL={isRTL} />
            <RadioGroup name="staff_intervention" value={data.section_u.staff_intervention} onChange={handleChange('section_u')} options={YES_NO} isRTL={isRTL} />
          </div>

          {/* C.U05 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 tracking-tight"><span className="text-[10px] font-black text-slate-400 uppercase mr-2">C.U05</span>{isRTL ? 'هل عانيت من أي من العواقب التالية بعد المشاجرة؟' : 'Avez-vous vécu l’une des conséquences suivantes suite à une bagarre ?'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['a', 'Absentéisme du lycée', 'التغيب عن المعهد'],
                ['b', 'Défaut de concentration aux études', 'عدم التركيز في الدراسة'],
                ['c', 'Anxiété et peur', 'القلق والخوف'],
                ['d', 'Cauchemars', 'كوابيس'],
                ['e', 'Insomnie', 'أرق']
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
            <FieldLabel code="C.U06" fr="Au cours des 12 derniers mois, dans quelle circonstance avez-vous été très gravement blessé ?" ar="خلال الـ 12 شهرًا الماضية، في أي ظرف تعرضت لإصابة خطيرة جدًا؟" isRTL={isRTL} />
            <RadioGroup name="serious_injury_12months" value={data.section_u.serious_injury_12months} onChange={handleChange('section_u')}
              options={[
                ['1', 'Je n\'ai pas été très gravement blessé', 'لم أصب بجروح خطيرة'],
                ['2', 'Je me suis blessé accidentellement', 'أصبت عن طريق الخطأ'],
                ['3', 'Quelqu\'un d\'autre m\'a blessé accidentellement', 'أصابني شخص آخر عن طريق الخطأ'],
                ['4', 'Je me suis blessé délibérément', 'أصبت نفسي عمداً'],
                ['5', 'Quelqu\'un d\'autre m\'a blessé délibérément', 'أصابني شخص آخر عمداً']
              ]} isRTL={isRTL} />
          </div>

        </div>
      )
    },
    {
      id: 'section_v',
      letter: 'V',
      title: 'Santé Mentale',
      titleAr: 'الصحة النفسية',
      subtitle: 'Section V',
      subtitleAr: 'القسم V',
      color: 'bg-violet-800',
      content: (
        <div className="space-y-12">
          {/* C.V01 */}
          <GridQuestion title="Au cours du DERNIER MOIS, à quelle fréquence avez-vous :" titleAr="خلال الشهر الماضي، كم مرة:" code="C.V01" isRTL={isRTL}
            options={STRESS_FREQ} values={data.section_v}
            onChange={(key, val) => update('section_v', key, val)}
            items={[
              ['a', 'Avoir le sentiment que vous ne pouviez pas contrôler les choses importantes de votre vie ?', 'الشعور بعدم القدرة على التحكم في أمور حياتك المهمة؟'],
              ['b', 'Vous être senti confiant dans votre capacité à gérer vos problèmes personnels ?', 'الشعور بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟'],
              ['c', 'Avoir senti que les choses allaient dans votre sens ?', 'الشعور بأن الأمور تسير لصالحك؟'],
              ['d', 'Senti que les difficultés s\'accumulaient à un point tel que vous ne pouviez pas les surmonter ?', 'الشعور بأن الصعوبات تتراكم لدرجة لا يمكنك التغلب عليها؟']
            ]} />

          {/* C.V02 */}
          <GridQuestion title="À quel point êtes-vous d’accord ou en désaccord avec chacune des propositions suivantes ?" titleAr="إلى أي مدى توافق أو تختلف مع كل من المقترحات التالية؟" code="C.V02" isRTL={isRTL}
            options={AGREEMENT_SCALE} values={data.section_v.self_esteem}
            onChange={(key, val) => updateCheck('section_v', 'self_esteem', key, val)}
            items={[
              ['a', "J'ai beaucoup de bonnes qualités", "لدي الكثير من الصفات الجيدة"],
              ['b', "Dans l'ensemble, je suis satisfait de moi", "بشكل عام، أنا راضٍ عن نفسي"],
              ['c', "Je sens que je n'ai pas grand-chose dont je puisse être fier", "أشعر أنه ليس لدي الكثير لأفخر به"],
              ['d', "Je me sens certainement inutile parfois", "أشعر بالتأكيد أنني عديم الفائدة أحياناً"],
              ['e', "Je sens que je suis une personne de valeur, au moins égale à n'importe qui d'autre", "أشعر أنني شخص ذو قيمة، على الأقل مساوٍ لأي شخص آخر"]
            ]} />

          {/* C.V03 */}
          <GridQuestion title="Au cours des 12 DERNIERS MOIS, vous est-il arrivé de :" titleAr="خلال الـ 12 شهرًا الماضية، هل حدث لك أن:" code="C.V03" isRTL={isRTL}
            options={YES_NO} values={data.section_v.mental_health_states}
            onChange={(key, val) => updateCheck('section_v', 'mental_health_states', key, val)}
            items={[
              ['a', "Se sentir si triste ou sans espoir que vous avez arrêté vos activités habituelles ?", "الشعور بالحزن أو فقدان الأمل لدرجة التوقف عن أنشطتك المعتادة؟"],
              ['b', "Manquer d'espoir en l'avenir ?", "فقدان الأمل في المستقبل؟"],
              ['c', "Être incapable de dormir à cause de vos soucis ?", "عدم القدرة على النوم بسبب الهموم؟"],
              ['d', "Avoir sérieusement pensé à vous blesser ou à vous faire du mal ?", "فكرت بجدية في إيذاء نفسك؟"],
              ['e', "Avoir sérieusement tenté de vous suicider ?", "حاولت بجدية الانتحار؟"]
            ]} />

          {/* C.V04 */}
          <GridQuestion title="Au cours des 12 DERNIERS MOIS :" titleAr="خلال الـ 12 شهرًا الماضية:" code="C.V04" isRTL={isRTL}
            options={YES_NO} values={data.section_v.help_seeking}
            onChange={(key, val) => updateCheck('section_v', 'help_seeking', key, val)}
            items={[
              ['a', "Avez-vous ressenti le besoin de parler à un professionnel de vos problèmes psychologiques ?", "هل شعرت بالحاجة للتحدث مع اختصاصي عن مشاكلك النفسية؟"],
              ['b', "Avez-vous été hospitalisé dans un service psychiatrique ?", "هل دخلت المستشفى في قسم الأمراض النفسية؟"]
            ]} />
        </div>
      )
    },
    {
      id: 'section_z',
      letter: 'Z',
      title: 'Validation (Honnêteté)',
      titleAr: 'التحقق (الصدق)',
      subtitle: 'Section Z',
      subtitleAr: 'القسم Z',
      color: 'bg-slate-900',
      content: (
        <div className="space-y-12">
          {/* C.Z01 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <FieldLabel code="C.Z01" fr="Si vous étiez un consommateur d'alcool, pensez-vous que vous auriez répondu à ce questionnaire comme vous l'avez fait ?" ar="لو كنت مستهلكاً للكحول، هل تعتقد أنك كنت ستجيب على هذا الاستبيان كما فعلت؟" isRTL={isRTL} />
            <RadioGroup name="honesty_level" value={data.section_z.honesty_level} onChange={handleChange('section_z')}
              options={[
                ['1', "J'ai déjà déclaré avoir consommé de l'alcool", 'لقد صرحت بالفعل باستهلاك الكحول'],
                ['2', 'Oui, sans aucun doute', 'نعم، بدون أدنى شك'],
                ['3', 'Probablement oui', 'على الأرجح نعم'],
                ['4', 'Probablement pas', 'على الأرجح لا'],
                ['5', 'Non, sans aucun doute', 'لا، بدون أدنى شك'],
              ]} isRTL={isRTL} />
          </div>

          {/* C.Z02 */}
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <FieldLabel code="C.Z02" fr="Si vous étiez un consommateur de cannabis, pensez-vous que vous répondriez à ce questionnaire comme vous l’avez fait ?" ar="لو كنت مستهلكاً للقنب الهندي، هل تعتقد أنك كنت ستجيب على هذا الاستبيان كما فعلت؟" isRTL={isRTL} />
            <RadioGroup name="honesty_cannabis" value={data.section_z.honesty_cannabis} onChange={handleChange('section_z')}
              options={HONESTY_SCALE} isRTL={isRTL} />
          </div>
        </div>
      )
    }
  ];

  const exclusionWarnings = getExclusionWarnings();

  const [dynamicConfigs, setDynamicConfigs] = useState([]);
  const [extraAnswers, setExtraAnswers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  const fetchConfig = async () => {

    try {
      const res = await api.get('dynamic-questions/');
      setDynamicConfigs(res.data);
    } catch (err) {
      console.error("Failed to load questionnaire config", err);
    }
  };

  const fetchActiveReport = async () => {
    try {
      const res = await api.get('class-report/active/');
      if (res.data) setActiveReport(res.data);
    } catch (err) {
      console.error("Failed to fetch active report", err);
    }
  };

  useEffect(() => {
    fetchConfig();
    const u = localStorage.getItem('user');
    if (u) {
      try { setCurrentUser(JSON.parse(u)); } catch(e){}
    }
    fetchActiveReport();
  }, []);

  const isSuperAdmin = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' || currentUser?.role?.toUpperCase() === 'GLOBAL_ADMIN';

  const isHidden = (code) => {
    return dynamicConfigs.find(q => q.code === code && q.is_hidden);
  };

  const handleDeleteDynamic = async (code, type) => {
    if(!window.confirm(isRTL ? 'تأكيد الحذف؟' : 'Confirmer la suppression ?')) return;
    try {
      await api.delete(`dynamic-questions/${code}/`);
      fetchConfig();
    } catch(err) { console.error(err); }
  };

  const renderDynamicQuestion = (q, extraAnswers, setExtraAnswers, isRTL) => (
    <div key={q.code} className={`p-6 bg-slate-50 rounded-3xl border-2 ${isEditMode ? 'border-brand-200' : 'border-slate-100'} relative group`}>
      {isEditMode && (
         <div className="absolute top-4 right-4 flex gap-2 z-50">
            <button onClick={() => setEditingItem({ id: q.code, type: 'QUESTION', section: q.section, data: q })} className="p-2 text-slate-400 hover:text-brand-600 bg-white rounded-lg shadow-sm border border-slate-100"><Edit2 size={14}/></button>
            <button onClick={() => handleDeleteDynamic(q.code, 'QUESTION')} className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm border border-slate-100"><Trash2 size={14}/></button>
         </div>
      )}
      <FieldLabel code={q.code} fr={q.label_fr} ar={q.label_ar} isRTL={isRTL} />
      {q.question_type === 'RADIO' ? (
        <RadioGroup
          name={q.code}
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          options={Array.isArray(q.options_json) ? q.options_json : []}
          isRTL={isRTL}
        />
      ) : (
        <input
          type={q.question_type === 'NUMBER' ? 'number' : 'text'}
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-white focus:border-brand-500 outline-none transition-all ${isEditMode ? 'opacity-50 pointer-events-none' : ''}`}
          placeholder={isRTL ? 'إجابتك...' : 'Votre réponse...'}
        />
      )}
    </div>
  );

  // 1. Process static sections
  const staticProcessed = SECTIONS.filter(s => !isHidden(s.id)).map(s => {
    const sectionDynQuestions = dynamicConfigs.filter(q => q.is_dynamic && !q.is_hidden && q.question_type !== 'SECTION' && q.section === s.id);
    let contentNode = s.content;
    if (sectionDynQuestions.length > 0 || isEditMode) {
      contentNode = (
        <>
          {s.content}
          <div className={`mt-12 pt-12 border-t-2 border-dashed ${isEditMode ? 'border-brand-200' : 'border-slate-200'}`}>
            <h4 className={`font-bold mb-8 uppercase tracking-widest text-sm ${isEditMode ? 'text-brand-600' : 'text-slate-800'}`}>
              {isRTL ? 'أسئلة إضافية' : 'Questions Supplémentaires'}
            </h4>
            <div className="space-y-10">
              {sectionDynQuestions.map(q => renderDynamicQuestion(q, extraAnswers, setExtraAnswers, isRTL))}
              {isEditMode && (
                 <button onClick={() => setEditingItem({ id: null, type: 'QUESTION', section: s.id, data: {code: '', label_fr: '', question_type: 'TEXT', section: s.id, is_dynamic: true, options_json: []} })} className="w-full py-4 border-2 border-dashed border-brand-200 text-brand-600 rounded-3xl flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors font-bold text-sm">
                    <Plus size={16} /> Ajouter une question
                 </button>
              )}
            </div>
          </div>
        </>
      );
    }
    const overriddenTitle = dynamicConfigs.find(q => q.code === s.id && q.question_type === 'SECTION');
    return {
      ...s,
      title: overriddenTitle ? overriddenTitle.label_fr : s.title,
      titleAr: overriddenTitle ? (overriddenTitle.label_ar || overriddenTitle.label_fr) : s.titleAr,
      content: contentNode,
      actionButtons: isEditMode ? (
        <>
           <button onClick={() => setEditingItem({ id: s.id, type: 'SECTION', section: s.id, data: overriddenTitle || {code: s.id, label_fr: s.title, question_type: 'SECTION', section: s.id, is_dynamic: false} })} className="px-4 py-2 text-slate-900 bg-white rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-50"><Edit2 size={14}/> Éditer</button>
           <button onClick={async () => {
                if(!window.confirm('Voulez-vous masquer cette section entière ?')) return;
                try {
                    await api.post('dynamic-questions/', { code: s.id, label_fr: s.title, question_type: 'SECTION', section: s.id, is_hidden: true, is_dynamic: false });
                    fetchConfig();
                } catch(err) { alert("Erreur."); }
           }} className="px-4 py-2 text-white bg-rose-600 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-rose-700"><Trash2 size={14}/> Masquer</button>
        </>
      ) : null
    };
  });

  // 2. Process purely dynamic sections
  const dynamicSectionsList = dynamicConfigs.filter(q => q.is_dynamic && !q.is_hidden && q.question_type === 'SECTION');
  const dynamicProcessed = dynamicSectionsList.map(sec => {
    const sectionDynQuestions = dynamicConfigs.filter(q => q.is_dynamic && !q.is_hidden && q.question_type !== 'SECTION' && q.section === sec.code);
    return {
      id: sec.code,
      letter: sec.code.replace(/^section_/i, '').toUpperCase(),
      title: sec.label_fr,
      titleAr: sec.label_ar || sec.label_fr,
      color: 'bg-brand-800',
      actionButtons: isEditMode ? (
         <>
            <button onClick={() => setEditingItem({ id: sec.code, type: 'SECTION', section: sec.code, data: sec })} className="px-4 py-2 text-slate-900 bg-white rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-50"><Edit2 size={14}/> Éditer</button>
            <button onClick={() => handleDeleteDynamic(sec.code, 'SECTION')} className="px-4 py-2 text-white bg-rose-600 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-rose-700"><Trash2 size={14}/> Supprimer</button>
         </>
      ) : null,
      content: (
        <div className="space-y-10 relative">
          {sectionDynQuestions.length > 0 ? (
            sectionDynQuestions.map(q => renderDynamicQuestion(q, extraAnswers, setExtraAnswers, isRTL))
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 font-medium">
              {isRTL ? 'هذا القسم فارغ حالياً.' : 'Cette section est vide pour le moment.'}
            </div>
          )}
          {isEditMode && (
             <button onClick={() => setEditingItem({ id: null, type: 'QUESTION', section: sec.code, data: {code: '', label_fr: '', question_type: 'TEXT', section: sec.code, is_dynamic: true, options_json: []} })} className="w-full py-4 border-2 border-dashed border-brand-200 text-brand-600 rounded-3xl flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors font-bold text-sm mt-8">
                <Plus size={16} /> Ajouter une question
             </button>
          )}
        </div>
      )
    };
  });

  // 3. Combine and Sort
  const allProcessed = [...staticProcessed, ...dynamicProcessed];
  allProcessed.sort((a, b) => {
    const normalize = (id) => id.toLowerCase().replace(/^section_/, '');
    const codeA = normalize(a.id);
    const codeB = normalize(b.id);
    
    // A "Letter Code" is something like 'A', 'B', 'BA', 'Z' (usually 1 or 2 letters)
    // We treat anything that's 1-2 letters as a priority group
    const isLetterA = /^[a-z]{1,2}$/.test(codeA);
    const isLetterB = /^[a-z]{1,2}$/.test(codeB);

    if (isLetterA && isLetterB) {
      // Sort alphabetically: 'a' < 'b' < 'ba' < 'c'
      return codeA.localeCompare(codeB);
    }
    
    if (isLetterA) return -1;
    if (isLetterB) return 1;

    // Both are custom words/numbers, sort at the end
    return codeA.localeCompare(codeB);
  });

  const filteredSections = allProcessed;

  if (isEditMode) {
      filteredSections.push({
          id: 'add_section',
          letter: '+',
          title: 'Nouvelle Section',
          color: 'bg-slate-200 !text-slate-800',
          content: (
              <div className="p-12 border-4 border-dashed border-slate-200 rounded-[48px] flex items-center justify-center">
                 <button onClick={() => setEditingItem({ id: null, type: 'SECTION', section: '', data: {code: 'section_', label_fr: '', question_type: 'SECTION', section: 'section_', is_dynamic: true, options_json: []} })} className="flex flex-col items-center gap-4 text-slate-400 hover:text-brand-600 transition-colors group">
                    <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors"><Plus size={32} /></div>
                    <span className="font-black uppercase tracking-widest text-sm">Ajouter une Section Dynamique</span>
                 </button>
              </div>
          )
      });
  }


  const currentSection = filteredSections[step] || filteredSections[0];
  const progress = ((step + 1) / filteredSections.length) * 100;

  if (status === 'success') {
    const isPractitioner = ['PRACTITIONER', 'OPERATOR', 'ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(currentUser?.role?.toUpperCase());
    const reportToFinalize = activeReport || (reportId ? { id: reportId } : null);

    const handleFinalize = async (redirectPath) => {
      if (reportToFinalize) {
        try {
          await api.post(`class-report/${reportToFinalize.id}/finalize/`);
        } catch (err) {
          console.error("Failed to finalize report", err);
        }
      }
      navigate(redirectPath);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-8">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Questionnaire soumis !</h1>
        <p className="text-slate-500 text-xl mb-12 max-w-md leading-relaxed">
          {isRTL ? 'شكراً على مشاركتك. بياناتك محمية بالكامل.' : 'Merci pour votre participation. Vos données sont entièrement protégées.'}
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => { setStatus(null); setStep(0); setData(INITIAL_DATA); window.scrollTo(0, 0); }}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3"
          >
            Nouveau questionnaire
          </button>

          {currentUser && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400"><span className="bg-slate-50 px-3">{isRTL ? 'إجراءات الممارس' : 'Actions Praticien'}</span></div>
              </div>

              <button 
                onClick={() => handleFinalize('/class-report')}
                className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-100"
              >
                <Plus size={20} />
                {isRTL ? 'إغلاق وفصل جديد' : 'Clôturer et Nouvelle Classe'}
              </button>

              <button 
                onClick={() => handleFinalize('/user')}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <LayoutDashboard size={20} className="text-slate-400" />
                {isRTL ? 'لوحة القيادة' : 'Accéder au Tableau de Bord'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onClose ? onClose() : navigate(-1)} 
              className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
              title="Retour"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">MedSPAD 2026</span>
              <span className="font-bold text-slate-700 text-sm">{step + 1} / {filteredSections.length} — {currentSection?.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <button onClick={() => setIsEditMode(!isEditMode)} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest border-2 rounded-xl transition-all flex items-center gap-2 ${isEditMode ? 'bg-brand-50 text-brand-600 border-brand-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-brand-50 hover:text-brand-600'}`}>
                 <Pencil size={14} /> {isEditMode ? 'Quitter Édition' : 'Mode Édition'}
              </button>
            )}
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
        {exclusionWarnings.length > 0 && (
          <div className="mb-6 animate-fade-in p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-3 text-orange-700 font-extrabold text-sm uppercase tracking-wide">
              <AlertCircle size={22} className="text-orange-500" />
              <span>{isRTL ? "تنبيه: سيتم استبعاد هذا الاستبيان من الإحصائيات لعدم استيفائه معايير الإدراج:" : "Avertissement : Ce questionnaire ne sera pas comptabilisé dans les statistiques (Critères d'exclusion) :"}</span>
            </div>
            <ul className="list-disc list-inside text-sm text-orange-800 font-medium ml-2 space-y-1">
              {exclusionWarnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
        <SectionHeader letter={currentSection.letter} title={currentSection.title} color={currentSection.color} actionButtons={currentSection.actionButtons} />
        <div className="animate-fade-in">
          {currentSection.content}
        </div>

        {/* ── Real-time contradiction banner ─────────────────────── */}
        {(() => {
          const warns = getSectionWarnings(currentSection.id);
          if (!warns.length) return null;
          return (
            <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex flex-col gap-3 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 text-red-700 font-extrabold text-sm uppercase tracking-wide">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <span>{isRTL ? 'تناقض في الإجابات — يرجى المراجعة:' : 'Réponses contradictoires — veuillez corriger :'}</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 font-medium ml-2 space-y-1">
                {warns.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          );
        })()}
        {/* ─────────────────────────────────────────────────────────── */}
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
            {filteredSections.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} className={`h-2 rounded-full cursor-pointer transition-all ${i === step ? 'w-6 bg-blue-600' : i < step ? 'w-2 bg-blue-200' : 'w-2 bg-slate-200'}`}></div>
            ))}
          </div>

          {step === filteredSections.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={status === 'submitting'}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-100 transition-all disabled:opacity-70"
            >
              {status === 'submitting' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send size={18} />{isRTL ? 'إرسال' : 'Soumettre'}</>}
            </button>
          ) : (
            <button
              onClick={() => setStep(s => Math.min(filteredSections.length - 1, s + 1))}
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

      {/* ── DEV: Auto-fill floating button ─────────────────────────────── */}
      <div className="fixed bottom-6 left-6 z-[300]">
        <button
          onClick={() => setData(generateRandomData())}
          className="group flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-sm text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: '2px dashed rgba(255,255,255,0.3)' }}
          title="Outil de développement — Génère des réponses aléatoires cohérentes"
        >
          <span className="text-lg group-hover:animate-spin" style={{ display: 'inline-block' }}>🎲</span>
          <span>Auto-remplir</span>
        </button>
      </div>

      {/* Inline Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingItem(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest italic">{editingItem.id ? 'Éditer' : 'Créer'} {editingItem.type === 'SECTION' ? 'Section' : 'Question'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">{editingItem.section}</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Code Unique (obligatoire, max 10 chars pour section)</label>
                <input type="text" maxLength={editingItem.type === 'SECTION' ? 10 : 50} value={editingItem.data.code} disabled={!!editingItem.id} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, code: e.target.value.toUpperCase()}})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:border-brand-500 outline-none disabled:opacity-50" placeholder={editingItem.type === 'SECTION' ? 'SEC_W' : 'W.01'} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Libellé (Français)</label>
                <input type="text" value={editingItem.data.label_fr} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, label_fr: e.target.value}})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Libellé (Arabe)</label>
                <input type="text" dir="rtl" value={editingItem.data.label_ar || ''} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, label_ar: e.target.value}})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:border-brand-500 outline-none text-right" />
              </div>
              {editingItem.type === 'QUESTION' && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Type de question</label>
                    <select value={editingItem.data.question_type} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, question_type: e.target.value}})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:border-brand-500 outline-none">
                      <option value="TEXT">Texte</option>
                      <option value="NUMBER">Nombre</option>
                      <option value="RADIO">Choix Multiple (Radio)</option>
                    </select>
                  </div>
                  {editingItem.data.question_type === 'RADIO' && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Options (séparées par des virgules)</label>
                      <input type="text" value={Array.isArray(editingItem.data.options_json) ? editingItem.data.options_json.map(o => o[0]).join(', ') : ''} onChange={(e) => {
                          const opts = e.target.value.split(',').map(o => [o.trim(), o.trim(), o.trim()]);
                          setEditingItem({...editingItem, data: {...editingItem.data, options_json: opts}});
                      }} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-sm focus:border-brand-500 outline-none" placeholder="Oui, Non, Peut-être" />
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-6 pt-2">
                 <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ordre d'affichage</label>
                    <input type="number" value={editingItem.data.order || 100} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, order: parseInt(e.target.value)}})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:border-brand-500 outline-none" />
                 </div>
                 <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Visibilité</label>
                    <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input type="checkbox" checked={!editingItem.data.is_hidden} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, is_hidden: !e.target.checked}})} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300" />
                        <span className="text-sm font-bold text-slate-700">Afficher au public</span>
                    </label>
                 </div>
              </div>

              {modalError && (
                 <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 flex gap-3 text-rose-700">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm font-bold">{modalError}</p>
                 </div>
              )}

              <div className="pt-6">
                <button onClick={async () => {
                    setModalError(null);
                    if (!editingItem.data.code || !editingItem.data.label_fr) {
                        setModalError("Veuillez remplir le code unique et le libellé français.");
                        return;
                    }
                    try {
                        const payload = editingItem.data;
                        if(editingItem.type === 'SECTION') {
                            payload.section = payload.code;
                        }
                        if(editingItem.id) {
                            await api.patch(`dynamic-questions/${editingItem.id}/`, payload);
                        } else {
                            await api.post('dynamic-questions/', payload);
                        }
                        fetchConfig();
                        setModalError("Succès ! Modification enregistrée.");
                        setTimeout(() => {
                            setEditingItem(null);
                            setModalError(null);
                        }, 1000);
                    } catch(err) {
                        if (err.response && err.response.data) {
                            const errs = Object.entries(err.response.data).map(([k,v]) => `${k}: ${v}`).join(' | ');
                            setModalError(errs);
                        } else {
                            setModalError("Erreur de sauvegarde. Vérifiez le code unique.");
                        }
                    }
                }} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                   <Save size={16}/> Sauvegarder
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireForm;