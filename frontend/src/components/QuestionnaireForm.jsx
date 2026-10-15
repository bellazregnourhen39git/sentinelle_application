import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Send, X, LogOut, ArrowLeft,
  Pencil, Plus, Trash2, Edit2, Save, LayoutDashboard, Check, Sparkles, HelpCircle, Layers,
  ArrowUp, ArrowDown, Grid
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';


// ─── Shared UI Components ──────────────────────────────────────────────────────────

const toArabicNumeral = (num) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, w => arabicNumbers[+w]);
};

const SectionHeader = ({ letter, title, subtitle, color = 'bg-slate-900', actionButtons }) => (
  <div className={`${color} text-white rounded-2xl p-8 mb-8 relative overflow-hidden flex items-center justify-between`}>
    <div className="absolute right-6 top-6 text-7xl font-black opacity-10 select-none">{letter}</div>
    <div className="relative z-10">
      <span className="text-xs font-black uppercase tracking-[3px] text-white/50 mb-2 block">Section {letter}</span>
      <h2 className="text-3xl font-extrabold leading-tight">{title}</h2>
      {subtitle && <p className="text-white/60 mt-2 text-sm font-medium leading-relaxed">{subtitle}</p>}
    </div>
    {actionButtons && (
      <div className="relative z-20 flex gap-2 ml-4">
        {actionButtons}
      </div>
    )}
  </div>
);

const ChoiceInteractionStyles = () => (
  <style>{`
    input[type="radio"], input[type="checkbox"] {
      -webkit-tap-highlight-color: transparent;
    }
    .choice-touch {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      user-select: none;
    }
  `}</style>
);

const ChoiceNumber = ({ value, isRTL }) => (
  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
    {isRTL ? toArabicNumeral(value) : value}
  </span>
);

const SquareMark = ({ checked, size = 20 }) => (
  <div
    className={`flex items-center justify-center border-2 rounded-md transition-all duration-150 shrink-0 ${
      checked
        ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
        : 'bg-white border-slate-700 text-transparent hover:border-slate-900'
    }`}
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    {checked && <Check size={Math.max(13, size - 5)} className="stroke-[3.5]" />}
  </div>
);

const ChoiceButton = ({ checked, onClick, ariaLabel, role = 'checkbox', children, className = '' }) => (
  <button
    type="button"
    role={role}
    aria-checked={!!checked}
    aria-label={ariaLabel}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    className={`relative z-20 cursor-pointer touch-manipulation select-none border-0 bg-transparent p-0 m-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`}
  >
    {children}
  </button>
);

const SquareCheckbox = ({ checked, onChange, ariaLabel, size = 18 }) => (
  <ChoiceButton
    checked={!!checked}
    onClick={onChange}
    ariaLabel={ariaLabel}
    role="checkbox"
    className="inline-flex min-h-10 min-w-10 items-center justify-center p-2"
  >
    <SquareMark checked={!!checked} size={size} />
  </ChoiceButton>
);

const FIELD_NAME_TO_CODE = {
  gender: 'C.A01',
  birth_month: 'C.A02',
  birth_year: 'C.A02',
  academic_performance: 'C.A03',
  school_absences: 'C.A04',
  school_appreciation: 'C.A05',
  activities_frequency: 'C.A06',
  household_members: 'C.A07',
  parents_absence_reason: 'C.A08',
  relationship_satisfaction: 'C.A09',
  truancy_nights: 'C.A10',
  father_education: 'C.B01',
  mother_education: 'C.B02',
  father_job: 'C.B03',
  mother_job: 'C.B04',
  economic_status: 'C.B05',
  access_difficulty: 'C.C01',
  peer_use: 'C.C02',
  lifetime_freq: 'C.C03',
  months_12_freq: 'C.C04',
  days_30_freq: 'C.C05',
  age_first_use: 'C.C06',
  age_daily_use: 'C.C07',
  binge_drinking_30days: 'C.G06',
  intoxication_lifetime: 'C.G07',
  intoxication_12months: 'C.G07b',
  intoxication_30days: 'C.G07c',
  age_first_drink: 'C.G08',
  age_first_intoxication: 'C.G09',
  use_last_12months: 'C.I05',
  felt_need_increase: 'C.T04',
  lied_about_it: 'C.T05',
  fights_12months: 'C.U01',
  fight_circumstances: 'C.U02',
  fight_location: 'C.U03',
  staff_intervention: 'C.U04',
  serious_injury_12months: 'C.U06',
  honesty_level: 'C.Z01',
  honesty_cannabis: 'C.Z02',
};

export const resolveDynamicOverride = (code, name, dynamicConfigs) => {
  if (!Array.isArray(dynamicConfigs) || dynamicConfigs.length === 0) return null;
  const rawCode = String(code || '').trim();
  const rawName = String(name || '').trim();
  const cleanCode = rawCode.replace(/[\s._-]+/g, '').toUpperCase();
  const mappedCode = rawName ? (FIELD_NAME_TO_CODE[rawName.toLowerCase()] || rawName).replace(/[\s._-]+/g, '').toUpperCase() : '';

  return dynamicConfigs.find((q) => {
    const qClean = String(q.code || '').replace(/[\s._-]+/g, '').toUpperCase();
    return (cleanCode && qClean === cleanCode) || (mappedCode && qClean === mappedCode);
  }) || null;
};

const VerticalChoiceList = ({ code, name, value, onChange, options = [], isRTL }) => {
  const { dynamicConfigs } = React.useContext(EditModeContext);
  const overridden = resolveDynamicOverride(code, name, dynamicConfigs);
  const effectiveOptions = (overridden && Array.isArray(overridden.options_json) && overridden.options_json.length > 0)
    ? overridden.options_json
    : options;

  const selected = String(value ?? '');
  return (
    <div role="radiogroup" aria-label={name} className="mt-2 flex w-full flex-col gap-1">
      {effectiveOptions.map((opt, idx) => {
        const numVal = opt[3] ?? (typeof opt[0] === 'number' ? opt[0] : idx + 1);
        const checked = selected === String(opt[0]);
        const label = isRTL && opt[2] ? opt[2] : opt[1];
        return (
          <ChoiceButton
            key={opt[0] ?? idx}
            checked={checked}
            role="radio"
            ariaLabel={`${label} — ${numVal}`}
            onClick={() => onChange({ target: { name, value: String(opt[0]) } })}
            className={`flex w-full min-h-11 items-center gap-3 rounded-none px-2 py-1.5 transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
          >
            <ChoiceNumber value={numVal} isRTL={isRTL} />
            <SquareMark checked={checked} />
            <span className={`text-sm leading-tight ${checked ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{label}</span>
          </ChoiceButton>
        );
      })}
    </div>
  );
};

const InlineChoiceRow = ({ code, label, labelAr, value, onChange, options = [], isRTL }) => {
  const { dynamicConfigs } = React.useContext(EditModeContext);
  const overridden = resolveDynamicOverride(code, null, dynamicConfigs);
  const effectiveOptions = (overridden && Array.isArray(overridden.options_json) && overridden.options_json.length > 0)
    ? overridden.options_json
    : options;
  const displayFr = overridden?.label_fr || label;
  const displayAr = overridden?.label_ar || labelAr;
  const selected = String(value ?? '');

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse table-fixed text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="w-[42%] px-2 py-2 text-left text-[11px] font-bold text-slate-600">{isRTL ? 'العنصر' : 'Élément'}</th>
            {effectiveOptions.map((opt, idx) => (
              <th key={opt[0] ?? idx} className="px-1 py-2 text-center text-[10px] font-bold leading-tight text-slate-600">{isRTL && opt[2] ? opt[2] : opt[1]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="align-middle">
            <td className="px-2 py-2.5 font-medium leading-tight text-slate-700 break-words">({code}) {isRTL ? displayAr : displayFr}</td>
            {effectiveOptions.map((opt, idx) => {
              const checked = selected === String(opt[0]);
              const numVal = opt[3] ?? idx + 1;
              return (
                <td key={opt[0] ?? idx} className="px-0 py-0 text-center align-middle">
                  <ChoiceButton
                    checked={checked}
                    role="radio"
                    ariaLabel={`${isRTL && opt[2] ? opt[2] : opt[1]} — ${numVal}`}
                    onClick={() => onChange({ target: { name: code, value: String(opt[0]) } })}
                    className="flex h-11 w-full items-center justify-center gap-1 p-1 hover:bg-slate-50"
                  >
                    <ChoiceNumber value={numVal} isRTL={isRTL} />
                    <SquareMark checked={checked} />
                  </ChoiceButton>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const DigitBoxes = ({ value = '', length, onChange, isRTL }) => {
  const normalized = String(value || '').slice(0, length).padEnd(length, '');
  const setDigit = (index, raw) => {
    const digit = String(raw).replace(/\D/g, '').slice(-1);
    const chars = normalized.split('');
    chars[index] = digit;
    onChange(chars.join(''));
  };
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={normalized[index] || ''}
          onChange={(e) => setDigit(index, e.target.value)}
          aria-label={isRTL ? `الخانة ${index + 1}` : `Case ${index + 1}`}
          className="h-9 w-8 rounded-none border-2 border-slate-700 bg-white text-center font-bold text-slate-800 outline-none transition-colors focus:border-blue-600 sm:h-10 sm:w-9"
        />
      ))}
    </div>
  );
};

const EditModeContext = React.createContext({
  isEditMode: false,
  dynamicConfigs: [],
  onEditQuestion: () => {},
  onDeleteQuestion: () => {},
});

const FieldLabel = ({ code, fr, ar, isRTL, options = [], items = [], questionType = 'RADIO' }) => {
  const { isEditMode, onEditQuestion, onDeleteQuestion, dynamicConfigs } = React.useContext(EditModeContext);
  const overridden = resolveDynamicOverride(code, null, dynamicConfigs);
  const displayFr = overridden?.label_fr || fr;
  const displayAr = overridden?.label_ar || ar;

  return (
    <div className={`relative ${isEditMode ? 'p-4 bg-blue-50/60 border-2 border-dashed border-blue-300 rounded-2xl mb-4 shadow-sm group' : 'mb-3'}`}>
      {isEditMode && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-900 text-white px-2 py-1 rounded-xl shadow-md border border-slate-800">
          <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">{code}</span>
          <button
            type="button"
            onClick={() => onEditQuestion?.(code, fr, ar, options, questionType, items)}
            className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-600 shadow-xs cursor-pointer"
            title="Éditer cette question et ses propositions"
          >
            <Pencil size={12} /> Éditer
          </button>
          <button
            type="button"
            onClick={() => onDeleteQuestion?.(code)}
            className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
            title="Masquer la question"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <label className="block">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-1">
          {code}
        </span>
        <span className="text-base font-bold text-slate-800 block">
          {isRTL ? displayAr : displayFr}
        </span>
      </label>
    </div>
  );
};

const RadioGroup = ({ code, name, value, onChange, options = [], isRTL, horizontal = false }) => {
  const { dynamicConfigs } = React.useContext(EditModeContext);
  const overridden = resolveDynamicOverride(code, name, dynamicConfigs);
  const effectiveOptions = (overridden && Array.isArray(overridden.options_json) && overridden.options_json.length > 0)
    ? overridden.options_json
    : options;

  return (
    <div className={`flex ${horizontal ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'} mt-2`}>
      {effectiveOptions.map((opt, idx) => {
        const val = Array.isArray(opt) ? opt[0] : opt;
        const labelFr = Array.isArray(opt) ? opt[1] : opt;
        const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
        const checked = String(value) === String(val);
        return (
          <label
            key={val ?? idx}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
              checked
                ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={val}
              checked={checked}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm">{isRTL ? labelAr : labelFr}</span>
          </label>
        );
      })}
    </div>
  );
};

const CheckboxGroup = ({ code, name, values = [], onChange, options = [], isRTL }) => {
  const { dynamicConfigs } = React.useContext(EditModeContext);
  const overridden = resolveDynamicOverride(code, name, dynamicConfigs);
  const effectiveOptions = (overridden && Array.isArray(overridden.options_json) && overridden.options_json.length > 0)
    ? overridden.options_json
    : options;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {effectiveOptions.map((opt, idx) => {
        const val = Array.isArray(opt) ? opt[0] : opt;
        const labelFr = Array.isArray(opt) ? opt[1] : opt;
        const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
        const checked = Array.isArray(values) && values.includes(val);
        return (
          <label
            key={val ?? idx}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
              checked
                ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                const cur = Array.isArray(values) ? values : [];
                if (e.target.checked) {
                  onChange([...cur, val]);
                } else {
                  onChange(cur.filter(v => v !== val));
                }
              }}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm">{isRTL ? labelAr : labelFr}</span>
          </label>
        );
      })}
    </div>
  );
};

const SelectField = ({ code, name, value, onChange, options = [], isRTL }) => {
  const { dynamicConfigs } = React.useContext(EditModeContext);
  const overridden = resolveDynamicOverride(code, name, dynamicConfigs);
  const effectiveOptions = (overridden && Array.isArray(overridden.options_json) && overridden.options_json.length > 0)
    ? overridden.options_json
    : options;

  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full mt-2 p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 focus:outline-none transition-colors"
    >
      <option value="">{isRTL ? '-- اختر إجابة --' : '-- Sélectionnez une réponse --'}</option>
      {effectiveOptions.map((opt, idx) => {
        const val = Array.isArray(opt) ? opt[0] : opt;
        const labelFr = Array.isArray(opt) ? opt[1] : opt;
        const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
        return (
          <option key={val ?? idx} value={val}>
            {isRTL ? labelAr : labelFr}
          </option>
        );
      })}
    </select>
  );
};

const GridQuestion = ({ title, titleAr, code, items, options, values = {}, onChange, isRTL }) => {
  const { dynamicConfigs } = React.useContext(EditModeContext);
  const cleanCode = String(code || '').replace(/[\s._-]+/g, '').toUpperCase();
  const overridden = Array.isArray(dynamicConfigs)
    ? dynamicConfigs.find((q) => String(q.code || '').replace(/[\s._-]+/g, '').toUpperCase() === cleanCode)
    : null;

  const effectiveOptions = (overridden && Array.isArray(overridden.options_json) && overridden.options_json.length > 0)
    ? overridden.options_json
    : options;

  const effectiveItems = (overridden && Array.isArray(overridden.items_json) && overridden.items_json.length > 0)
    ? overridden.items_json
    : items;

  return (
    <div className="mt-6 mb-8">
      <FieldLabel
        code={code}
        fr={title}
        ar={titleAr}
        isRTL={isRTL}
        options={effectiveOptions}
        items={effectiveItems}
        questionType="MATRIX"
      />
      <div className="mt-3 overflow-x-auto border-2 border-slate-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75">
              <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 w-1/3">
                {isRTL ? 'العنصر' : 'Élément'}
              </th>
              {effectiveOptions.map((opt) => {
                const val = Array.isArray(opt) ? opt[0] : opt;
                const labelFr = Array.isArray(opt) ? opt[1] : opt;
                const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
                return (
                  <th key={val} className="p-3 text-center text-xs font-bold text-slate-600">
                    {isRTL ? labelAr : labelFr}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {effectiveItems.map((item) => {
              const key = Array.isArray(item) ? item[0] : item;
              const itemFr = Array.isArray(item) ? item[1] : item;
              const itemAr = Array.isArray(item) && item[2] ? item[2] : itemFr;
              return (
                <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">
                    {isRTL ? itemAr : itemFr}
                  </td>
                  {effectiveOptions.map((opt) => {
                    const val = Array.isArray(opt) ? opt[0] : opt;
                    const checked = String(values[key]) === String(val);
                    return (
                      <td key={val} className="p-3 text-center">
                        <input
                          type="radio"
                          name={`${code}_${key}`}
                          value={val}
                          checked={checked}
                          onChange={() => onChange(key, val)}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EducationWithSubQuestions = ({ fieldName, successFields, labelCode, labelFr, labelAr, data, update, isRTL }) => {
  const mainValue = String(data[fieldName] ?? '');
  const setMain = (val) => update('section_b', fieldName, String(val));
  const setSuccess = (subField, val) => update('section_b', subField, String(val));
  const isMother = fieldName === 'mother_education';

  const rows = [
    { type: 'main', id: '1', labelFr: 'Non scolarisé', labelAr: 'غير متمدرس' },
    { type: 'main', id: '2', labelFr: 'Niveau primaire', labelAr: 'مستوى ابتدائي' },
    { type: 'sub', id: 'A', labelFr: isMother ? 'A-t-elle réussi en sixième année ?' : 'A-t-il réussi en sixième année ?', labelAr: isMother ? 'هل نجحت في السنة السادسة؟' : 'هل نجح في السنة السادسة؟', subKey: successFields.primary },
    { type: 'main', id: '3', labelFr: 'Niveau collège', labelAr: 'مستوى إعدادي' },
    { type: 'sub', id: 'B', labelFr: isMother ? 'A-t-elle réussi en neuvième année ?' : 'A-t-il réussi en neuvième année ?', labelAr: isMother ? 'هل نجحت في السنة التاسعة؟' : 'هل نجح في السنة التاسعة؟', subKey: successFields.middle },
    { type: 'main', id: '4', labelFr: 'Niveau secondaire', labelAr: 'مستوى ثانوي' },
    { type: 'sub', id: 'C', labelFr: isMother ? 'A-t-elle obtenu le baccalauréat ?' : 'A-t-il obtenu le baccalauréat ?', labelAr: isMother ? 'هل حصلت على البكالوريا؟' : 'هل حصل على البكالوريا؟', subKey: successFields.secondary },
    { type: 'main', id: '5', labelFr: 'Niveau universitaire', labelAr: 'مستوى جامعي' },
    { type: 'main', id: '6', labelFr: 'Formation professionnelle', labelAr: 'تكوين مهني' },
    { type: 'main', id: '7', labelFr: 'Ne sait pas', labelAr: 'لا أدري' },
    { type: 'main', id: '8', labelFr: 'Non applicable', labelAr: 'غير منطبق' },
  ];

  return (
    <div className="space-y-4">
      <FieldLabel code={labelCode} fr={labelFr} ar={labelAr} isRTL={isRTL} />
      <p className="text-xs font-medium text-slate-500 mb-2">{isRTL ? 'اختر خانة واحدة' : '(cochez une seule case)'}</p>
      <div className="space-y-2">
        {rows.map((row) => {
          if (row.type === 'main') {
            const checked = mainValue === row.id;
            return (
              <ChoiceButton
                key={row.id}
                checked={checked}
                role="radio"
                ariaLabel={isRTL ? row.labelAr : row.labelFr}
                onClick={() => setMain(row.id)}
                className={`flex w-full min-h-11 items-center gap-3 px-3 py-2 rounded-xl border-2 transition-all ${
                  checked ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                }`}
              >
                <ChoiceNumber value={row.id} isRTL={isRTL} />
                <SquareMark checked={checked} />
                <span className="text-sm">{isRTL ? row.labelAr : row.labelFr}</span>
              </ChoiceButton>
            );
          } else {
            const subVal = String(data[row.subKey] ?? '');
            return (
              <div key={row.id} className="ml-8 mr-8 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700">
                  <span className="text-blue-600 font-black mr-2">[{row.id}]</span>
                  {isRTL ? row.labelAr : row.labelFr}
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name={`${fieldName}_${row.subKey}`}
                      value="1"
                      checked={subVal === '1'}
                      onChange={() => setSuccess(row.subKey, '1')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{isRTL ? 'نعم (1)' : 'Oui (1)'}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name={`${fieldName}_${row.subKey}`}
                      value="2"
                      checked={subVal === '2'}
                      onChange={() => setSuccess(row.subKey, '2')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{isRTL ? 'لا (2)' : 'Non (2)'}</span>
                  </label>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

const CT06Question = ({ title, titleAr, code, items, values = {}, onChange, isRTL }) => {
  const frequency = [
    ['1', 'Chaque fois', 'كل مرة'],
    ['2', 'La plupart du temps', 'معظم الوقت'],
    ['3', 'Quelques fois', 'بضع مرات'],
    ['4', 'Jamais', 'أبداً']
  ];
  const yesNo = [
    ['1', 'Oui', 'نعم'],
    ['2', 'Non', 'لا']
  ];

  const renderTable = (rows, options) => (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse table-fixed text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="w-[62%] px-2 py-2 text-left text-[11px] font-bold text-slate-600">{isRTL ? 'السؤال' : 'Question'}</th>
            {options.map(([val, fr, ar]) => (
              <th key={val} className="px-1 py-2 text-center text-[11px] font-bold text-slate-600">{isRTL ? ar : fr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, label, ar]) => (
            <tr key={key} className="border-b border-slate-200">
              <td className="px-2 py-2.5 font-medium leading-tight text-slate-700">{isRTL ? ar : label}</td>
              {options.map(([val]) => {
                const checked = String(values[key] ?? '') === String(val);
                return (
                  <td key={val} className="px-0 py-0 text-center align-middle">
                    <ChoiceButton
                      checked={checked}
                      role="radio"
                      ariaLabel={`${key} — ${val}`}
                      onClick={() => onChange(key, val)}
                      className="flex h-10 w-full items-center justify-center p-1 hover:bg-slate-50"
                    >
                      <SquareMark checked={checked} />
                    </ChoiceButton>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <FieldLabel code={code} fr={title} ar={titleAr} isRTL={isRTL} />
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            {isRTL ? 'الجزء الأول: التكرار' : 'Partie 1: Fréquence'}
          </h4>
          {renderTable(items.slice(0, 3), frequency)}
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            {isRTL ? 'الجزء الثاني: نعم / لا' : 'Partie 2: Oui / Non'}
          </h4>
          {renderTable(items.slice(3), yesNo)}
        </div>
      </div>
    </div>
  );
};

// ─── Choice Constants ──────────────────────────────────────────────────────────────

const FREQ_LIFETIME = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '1-2 fois', '1-2 مرات'],
  ['3', '3-5 fois', '3-5 مرات'],
  ['4', '6-9 fois', '6-9 مرات'],
  ['5', '10-19 fois', '10-19 مرة'],
  ['6', '20-39 fois', '20-39 مرة'],
  ['7', '40 fois ou plus', '40 مرة أو أكثر'],
];

const FREQ_LIFETIME_CC03 = FREQ_LIFETIME;

const FREQ_30DAYS_CIGS = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '< 1 cigarette par semaine', 'أقل من سيجارة واحدة في الأسبوع'],
  ['3', '< 1 cigarette par jour', 'أقل من سيجارة واحدة في اليوم'],
  ['4', '1-5 par jour', '1-5 سجائر في اليوم'],
  ['5', '6-10 par jour', '6-10 سجائر في اليوم'],
  ['6', '11-20 par jour', '11-20 سيجارة في اليوم'],
  ['7', '> 20 par jour', 'أكثر من 20 سيجارة في اليوم'],
];

const FREQ_30DAYS_VAPE = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '< 1 fois par semaine', 'أقل من مرة في الأسبوع'],
  ['3', 'Au moins 1 fois par semaine', 'مرة واحدة على الأقل في الأسبوع'],
  ['4', 'Tous les jours ou presque', 'يومياً أو تقريباً كل يوم'],
];

const FREQ_30DAYS_HOOKAH = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '< 1 par semaine', 'أقل من مرة في الأسبوع'],
  ['3', '< 1 par jour', 'أقل من شيشة واحدة في اليوم'],
  ['4', '1-5 par jour', '1-5 في اليوم'],
  ['5', '6-10 par jour', '6-10 في اليوم'],
  ['6', '11-20 par jour', '11-20 في اليوم'],
  ['7', '> 20 par jour', 'أكثر من 20 في اليوم'],
];

const FREQ_30DAYS_STANDARD = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '1-2 fois', '1-2 مرات'],
  ['3', '3-5 fois', '3-5 مرات'],
  ['4', '6-9 fois', '6-9 مرات'],
  ['5', '10-19 fois', '10-19 مرة'],
  ['6', '20-39 fois', '20-39 مرة'],
  ['7', '40 fois ou plus', '40 مرة أو أكثر'],
];

const FREQ_ACTIVITIES = [
  ['1', 'Jamais', 'أبداً'],
  ['2', 'Quelques fois par an', 'بضع مرات في السنة'],
  ['3', '1 ou 2 fois par mois', 'مرة أو مرتين في الشهر'],
  ['4', 'Au moins une fois par semaine', 'مرة واحدة على الأقل في الأسبوع'],
  ['5', 'Tous les jours', 'يومياً'],
];

const FREQ_DIGITAL = [
  ['1', 'Aucune', 'لا شيء'],
  ['2', 'Une demi-heure ou moins', 'نصف ساعة أو أقل'],
  ['3', 'Environ 1 heure', 'حوالي ساعة'],
  ['4', 'Environ 2-3 heures', 'حوالي 2-3 ساعات'],
  ['5', 'Environ 4-5 heures', 'حوالي 4-5 ساعات'],
  ['6', '6 heures ou plus', '6 ساعات أو أكثر'],
];

const FREQ_BINGE = [
  ['1', 'Aucune fois', 'ولا مرة'],
  ['2', '1 fois', 'مرة واحدة'],
  ['3', '2 fois', 'مرتان'],
  ['4', '3-5 fois', '3-5 مرات'],
  ['5', '6-9 fois', '6-9 مرات'],
  ['6', '10 fois ou plus', '10 مرات أو أكثر'],
];

const FREQ_3_OPTS = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '1 ou 2 fois', 'مرة أو مرتين'],
  ['3', '3 fois ou plus', '3 مرات أو أكثر'],
];

const FREQ_5_OPTS = [
  ['1', 'Non, jamais', 'لا، أبداً'],
  ['2', 'Rarement', 'نادراً'],
  ['3', 'Parfois', 'أحياناً'],
  ['4', 'Souvent', 'غالباً'],
  ['5', 'Très souvent', 'دائماً أو تقريباً دائماً'],
];

const FREQ_GAMBLING_GRID = [
  ['1', 'Chaque fois', 'كل مرة'],
  ['2', 'La plupart du temps', 'معظم الوقت'],
  ['3', 'Quelques fois', 'بضع مرات'],
  ['4', 'Jamais', 'أبداً'],
];

const AGE_SCALE = [
  ['1', 'Jamais', 'أبداً'],
  ['2', '9 ans ou moins', '9 سنوات أو أقل'],
  ['3', '10 ans', '10 سنوات'],
  ['4', '11 ans', '11 سنة'],
  ['5', '12 ans', '12 سنة'],
  ['6', '13 ans', '13 سنة'],
  ['7', '14 ans', '14 سنة'],
  ['8', '15 ans', '15 سنة'],
  ['9', '16 ans ou plus', '16 سنة أو أكثر'],
];

const DIFFICULTY = [
  ['1', 'Impossible', 'مستحيل'],
  ['2', 'Très difficile', 'صعب جداً'],
  ['3', 'Assez difficile', 'صعب نوعاً ما'],
  ['4', 'Assez facile', 'سهل نوعاً ما'],
  ['5', 'Très facile', 'سهل جداً'],
  ['6', 'Ne sait pas', 'لا أدري'],
];

const DIFFICULTY_LEVELS = DIFFICULTY;

const SATISFACTION_SCALE = [
  ['1', 'Très satisfait(e)', 'راضٍ جداً'],
  ['2', 'Satisfait(e)', 'راضٍ'],
  ['3', 'Ni satisfait(e) ni insatisfait(e)', 'محايد'],
  ['4', 'Pas tellement satisfait(e)', 'غير راضٍ تماماً'],
  ['5', 'Non satisfait(e)', 'غير راضٍ إطلاقاً'],
  ['6', 'Non applicable', 'غير منطبق'],
];

const YES_NO = [
  ['1', 'Oui', 'نعم'],
  ['2', 'Non', 'لا'],
];

const YES_NO_DK = [
  ['1', 'Oui', 'نعم'],
  ['2', 'Non', 'لا'],
  ['3', 'Ne sait pas', 'لا أدري'],
];

const STRESS_FREQ = [
  ['1', 'Jamais', 'أبداً'],
  ['2', 'Presque jamais', 'نادراً جداً'],
  ['3', 'Parfois', 'أحياناً'],
  ['4', 'Assez souvent', 'غالباً'],
  ['5', 'Très souvent', 'دائماً'],
];

const FIGHT_FREQUENCY = [
  ['0', '0 fois', 'ولا مرة'],
  ['1', '1 fois', 'مرة واحدة'],
  ['2_3', '2-3 fois', '2-3 مرات'],
  ['4_5', '4-5 fois', '4-5 مرات'],
  ['6_7', '6-7 fois', '6-7 مرات'],
  ['8_9', '8-9 fois', '8-9 مرات'],
  ['10_11', '10-11 fois', '10-11 مرة'],
  ['12_plus', '12 fois ou plus', '12 مرة أو أكثر'],
];

const AGREEMENT_SCALE_PAPER = [
  ['1', "Tout à fait d'accord", 'أوافق تماماً'],
  ['2', "D'accord", 'أوافق'],
  ['3', "Pas d'accord", 'لا أوافق'],
  ['4', "Pas du tout d'accord", 'لا أوافق تماماً'],
  ['5', 'Je ne sais pas', 'لا أدري'],
];

const AGREEMENT_SCALE_CS03 = [
  ['1', "Tout à fait d'accord", 'أوافق تماماً'],
  ['2', "D'accord", 'أوافق'],
  ['3', "Pas d'accord", 'لا أوافق'],
  ['4', "Pas du tout d'accord", 'لا أوافق تماماً'],
  ['5', 'Ne sait pas', 'لا أدري'],
];

const RISK_LEVELS = [
  ['1', 'Pas de risque', 'لا يوجد خطر'],
  ['2', 'Risque faible', 'خطر ضئيل'],
  ['3', 'Risque moyen', 'خطر متوسط'],
  ['4', 'Grand risque', 'خطر كبير'],
  ['5', 'Ne sait pas', 'لا أدري'],
];

const ECONOMIC = [
  ['1', 'Bien meilleure que la moyenne', 'أفضل بكثير من المتوسط'],
  ['2', 'Meilleure que la moyenne', 'أفضل من المتوسط'],
  ['3', 'À peu près pareille', 'في حدود المتوسط تقريباً'],
  ['4', 'Moins bonne', 'أقل من المتوسط'],
  ['5', 'Bien moins bonne', 'أقل بكثير من المتوسط'],
  ['6', 'Ne sait pas', 'لا أدري'],
];

const JOBS_FATHER = [
  ['1', 'Cadre supérieur / Profession libérale', 'إطار سامي / مهنة حرة'],
  ['2', 'Cadre moyen / Enseignant / Fonctionnaire', 'إطار متوسط / معلم / موظف'],
  ['3', 'Commerçant / Artisan / Chef d’entreprise', 'تاجر / حرفي / صاحب مؤسسة'],
  ['4', 'Employé de bureau / Vendeur / Service', 'موظف مكتب / بائع / خدمات'],
  ['5', 'Ouvrier qualifié / Chauffeur / Technicien', 'عامل مؤهل / سائق / تقني'],
  ['6', 'Ouvrier non qualifié / Journalier / Agricole', 'عامل غير مؤهل / يومي / فلاح'],
  ['7', 'Retraité', 'متقاعد'],
  ['8', 'Sans profession / Au chômage', 'دون مهنة / عاطل عن العمل'],
  ['9', 'Autre', 'أخرى'],
  ['10', 'Ne sait pas', 'لا أدري'],
  ['11', 'Non applicable', 'غير منطبق'],
];

const JOBS_MOTHER = [
  ['1', 'Cadre supérieur / Profession libérale', 'إطار سامي / مهنة حرة'],
  ['2', 'Cadre moyen / Enseignante / Fonctionnaire', 'إطار متوسط / معلمة / موظفة'],
  ['3', 'Commerçante / Artisane / Chef d’entreprise', 'تاجرة / حرفية / صاحبة مؤسسة'],
  ['4', 'Employée de bureau / Vendeuse / Service', 'موظفة مكتب / بائعة / خدمات'],
  ['5', 'Ouvrière qualifiée / Technicienne', 'عاملة مؤهلة / تقنية'],
  ['6', 'Ouvrière non qualifiée / Journalière / Agricole', 'عاملة غير مؤهلة / يومية / فلاحية'],
  ['7', 'Femme au foyer', 'ربة بيت'],
  ['8', 'Retraitée', 'متقاعدة'],
  ['9', 'Sans profession / Au chômage', 'دون مهنة / عاطلة عن العمل'],
  ['10', 'Autre', 'أخرى'],
  ['11', 'Ne sait pas', 'لا أدري'],
  ['12', 'Non applicable', 'غير منطبق'],
];

const PERFORMANCE = [
  ['1', 'En dessous de la moyenne (<10/20)', 'دون المتوسط (أقل من 10)'],
  ['2', 'Moyen [10 – 12]', 'متوسط (10 إلى 12)'],
  ['3', 'En dessus de la moyenne (>12/20)', 'فوق المتوسط (أكثر من 12)'],
];

const HOUSEHOLD = [
  ['father', 'Père', 'الأب'],
  ['mother', 'Mère', 'الأم'],
  ['stepfather', 'Beau-père', 'زوج الأم'],
  ['stepmother', 'Belle-mère', 'زوجة الأب'],
  ['brothers_sisters', 'Frères et/ou sœurs', 'الإخوة و/أو الأخوات'],
  ['grandparents', 'Grands-parents', 'الأجداد'],
  ['other_relatives', 'Autres membres de la famille', 'أقارب آخرون'],
  ['non_relatives', 'Personnes sans lien de parenté', 'أشخاص لا تربطهم قرابة'],
  ['alone', 'Seul(e)', 'بمفردي'],
];

const INITIAL_DATA = {
  section_a: {
    survey_date: new Date().toISOString().split('T')[0],
    gender: '',
    birth_month: '',
    birth_year: '',
    academic_performance: '',
    school_appreciation: '',
    activities_frequency: {},
    school_absences: {},
    household_members: [],
    parents_absence_reason: '',
    parents_absence_reason_other: '',
    nights_out_30days: '',
    family_relationship_satisfaction: {},
  },
  section_b: {
    father_education: '',
    father_primary_success: '',
    father_middle_success: '',
    father_secondary_success: '',
    mother_education: '',
    mother_primary_success: '',
    mother_middle_success: '',
    mother_secondary_success: '',
    father_job: '',
    mother_job: '',
    economic_status: '',
    private_room: '',
  },
  section_c: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    age_daily_use: '',
  },
  section_d: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    age_daily_use: '',
  },
  section_e: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    age_daily_use: '',
  },
  section_g: {
    access_difficulty: {},
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    days_30_by_type: {},
    binge_drinking_30days: '',
    intoxication_lifetime: '',
    intoxication_12months: '',
    intoxication_30days: '',
    age_first_drink: '',
    age_first_intoxication: '',
  },
  section_h: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
  },
  section_i: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    use_last_12months: '',
    cannabis_types_12months: {},
    cannabis_problems_12months: {},
  },
  section_j: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    use_last_12months: '',
  },
  section_k: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    use_last_12months: '',
  },
  section_l: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    use_last_12months: '',
  },
  section_m: {
    access_difficulty: '',
    social_circle: {},
    lifetime_freq: '',
    months_12_freq: '',
    days_30_freq: '',
    age_first_use: '',
    use_last_12months: '',
  },
  section_n: {
    access_difficulty: {},
    lifetime_freq_by_type: {},
    months_12_freq_by_type: {},
    age_first_use_by_type: {},
    forms: {},
    synthetic_cannabinoids: '',
    synthetic_cathinones: '',
  },
  section_p: {
    lifetime_freq: '',
    months_12_freq: '',
    forms: {},
    substances: {},
    fictive_substance_consumption: '',
  },
  section_q: {
    risk_perceptions: {},
    help_sources: {},
  },
  section_r: {
    hours_per_day_breakdown: {},
    agreement: {},
  },
  section_s: {
    hours_per_day: '',
    hours_per_day_school: '',
    hours_per_day_non_school: '',
    days_per_week: '',
    agreement: {},
  },
  section_t: {
    months_12_freq: '',
    offline_games: {},
    online_games: {},
    felt_need_increase: '',
    lied_about_it: '',
    gambling_problems: {},
  },
  section_u: {
    fights_12months: '',
    fight_circumstances: '',
    fight_location: '',
    staff_intervention: '',
    fight_consequences: [],
    serious_injury_12months: '',
    harassment: {},
  },
  section_v: {
    a: '',
    b: '',
    c: '',
    d: '',
    self_esteem: {},
    mental_health_states: {},
    help_seeking: {},
    stress_metrics: {},
  },
  section_z: {
    honesty_level: '',
    honesty_cannabis: '',
    honesty_heroin: '',
  },
};


const QuestionnaireForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportIdParam = searchParams.get('report_id');
  const urlEditMode = searchParams.get('edit') === 'true';

  const localUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [lang, setLang] = useState('fr');
  const [currentUser, setCurrentUser] = useState(localUser);

  // Dynamic Questions config & modal state
  const [dynamicConfigs, setDynamicConfigs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(urlEditMode);
  const [editingItem, setEditingItem] = useState(null);
  const [modalTab, setModalTab] = useState('CONFIG'); // 'CONFIG' | 'PREVIEW'
  const [modalError, setModalError] = useState(null);
  const [savingDynamic, setSavingDynamic] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  // Class report selection & finalization
  const [openReports, setOpenReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // Dynamic answers
  const [extraAnswers, setExtraAnswers] = useState({});

  const isRTL = lang === 'ar';

  useEffect(() => {
    fetchCurrentUser();
    fetchConfig();
    const storedReportId = reportIdParam || localStorage.getItem('sentinelle_active_report_id');
    if (storedReportId) {
      fetchReport(storedReportId);
    } else {
      fetchOpenReports();
    }

    // Restore draft if available
    try {
      const draftKey = `sentinelle_draft_${storedReportId || 'default'}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) setData(parsed.data);
        if (typeof parsed.step === 'number') setStep(parsed.step);
      }
    } catch (err) {
      console.debug('Failed to restore draft', err);
    }
  }, [reportIdParam]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('auth/profile/');
      setCurrentUser(res.data);
      if (urlEditMode) {
        setIsEditMode(true);
      }
    } catch (err) {
      console.error('Failed to load current user', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get('dynamic-questions/');
      setDynamicConfigs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load dynamic question configs', err);
    }
  };

  const fetchOpenReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get('class-reports/');
      const list = Array.isArray(res.data) ? res.data : res.data.results || [];
      const open = list.filter((r) => !r.is_finalized);
      setOpenReports(open);
      if (open.length > 0) {
        setActiveReport(open[0]);
        localStorage.setItem('sentinelle_active_report_id', String(open[0].id));
      }
    } catch (err) {
      console.error('Failed to load open class reports', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchReport = async (id) => {
    try {
      const res = await api.get(`class-reports/${id}/`);
      if (res.data) {
        setActiveReport(res.data);
        localStorage.setItem('sentinelle_active_report_id', String(res.data.id));
      }
    } catch (err) {
      console.error('Failed to load class report', err);
      fetchOpenReports();
    }
  };

  const handleChange = (section) => (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const update = (section, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const updateCheck = (section, group, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [group]: {
          ...(prev[section][group] || {}),
          [key]: value,
        },
      },
    }));
  };

  const handleFinalize = async () => {
    if (!activeReport) return;
    try {
      await api.post(`class-report/${activeReport.id}/finalize/`);
      setShowFinalizeModal(false);
      navigate('/class-report');
    } catch (err) {
      console.error('Error finalizing report:', err);
    }
  };

  const handleSaveDynamic = async () => {
    setModalError(null);
    if (!editingItem?.data?.code || !editingItem?.data?.label_fr) {
      setModalError(isRTL ? 'يرجى ملء الرمز الفريد والنص بالفرنسية.' : 'Veuillez remplir le code unique et le libellé français.');
      return;
    }
    setSavingDynamic(true);
    try {
      let finalOptions = [];
      if (editingItem.type === 'SECTION') {
        finalOptions = [
          editingItem.data.subtitle_fr || '',
          editingItem.data.subtitle_ar || '',
        ];
      } else if (Array.isArray(editingItem.data.options_json)) {
        // Clean and normalize options array: [val, label_fr, label_ar, order]
        finalOptions = editingItem.data.options_json
          .map((opt, idx) => {
            const val = Array.isArray(opt) ? String(opt[0] ?? (idx + 1)).trim() : String(opt).trim();
            const fr = Array.isArray(opt) ? String(opt[1] ?? '').trim() : String(opt).trim();
            const ar = Array.isArray(opt) && opt[2] ? String(opt[2]).trim() : '';
            return [val || String(idx + 1), fr || val || `Option ${idx + 1}`, ar, idx + 1];
          })
          .filter(opt => opt[1] || opt[0]);
      }

      let finalItems = [];
      if (editingItem.type === 'QUESTION' && Array.isArray(editingItem.data.items_json)) {
        finalItems = editingItem.data.items_json
          .map((item, idx) => {
            const key = Array.isArray(item) ? String(item[0] ?? `item_${idx + 1}`).trim() : String(item).trim();
            const fr = Array.isArray(item) ? String(item[1] ?? '').trim() : String(item).trim();
            const ar = Array.isArray(item) && item[2] ? String(item[2]).trim() : '';
            return [key || `item_${idx + 1}`, fr || key || `Élément ${idx + 1}`, ar];
          })
          .filter(item => item[1] || item[0]);
      }

      const payload = {
        ...editingItem.data,
        code: editingItem.data.code.trim().toUpperCase(),
        section: editingItem.type === 'SECTION' ? editingItem.data.code.trim().toLowerCase() : (editingItem.data.section || (currentSection ? currentSection.id : 'section_a')),
        options_json: finalOptions,
        items_json: finalItems,
      };

      const res = await api.post('dynamic-questions/', payload);
      const savedData = res.data || payload;
      
      // Update local state immediately for instant feedback
      setDynamicConfigs((prev) => {
        const list = Array.isArray(prev) ? [...prev] : [];
        const cleanCode = payload.code.replace(/[\s._-]+/g, '').toUpperCase();
        const idx = list.findIndex(
          (q) => String(q.code || '').replace(/[\s._-]+/g, '').toUpperCase() === cleanCode
        );
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...savedData };
        } else {
          list.push(savedData);
        }
        return list;
      });

      await fetchConfig();
      setModalSuccess(true);
      setTimeout(() => {
        setEditingItem(null);
        setSavingDynamic(false);
        setModalSuccess(false);
        setModalError(null);
      }, 500);
    } catch (err) {
      console.error('Error saving dynamic item', err);
      setSavingDynamic(false);
      const detail = err.response?.data?.detail || err.response?.data?.message || (isRTL ? 'فشل حفظ التعديلات. يرجى التحقق من المدخلات.' : 'Erreur de sauvegarde. Vérifiez les informations saisies.');
      setModalError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
  };

  const handleDeleteDynamic = async (code, type) => {
    if (!window.confirm(isRTL ? 'تأكيد الحذف؟' : 'Confirmer la suppression ?')) return;
    try {
      await api.delete(`dynamic-questions/${code}/`);
      fetchConfig();
    } catch (err) {
      console.error('Error deleting question', err);
    }
  };

  const handleSubmit = async () => {
    setStatus({ loading: true, success: false, error: null });

    const finalReportId = reportIdParam || (activeReport ? activeReport.id : null) || localStorage.getItem('sentinelle_active_report_id');

    try {
      const payload = {
        ...data,
        language_used: lang === 'ar' ? 'AR' : 'FR',
        class_report: finalReportId ? Number(finalReportId) : null,
        extra_answers: extraAnswers,
      };

      await api.post('questionnaire/submit/', payload);

      // Clear draft on successful submission
      try {
        const draftKey = `sentinelle_draft_${finalReportId || 'default'}`;
        localStorage.removeItem(draftKey);
      } catch {}

      setStatus({ loading: false, success: true, error: null });
      setTimeout(() => {
        if (finalReportId) {
          navigate(`/session/${finalReportId}/collect`);
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      console.error('Submission failed', err);
      const data = err.response?.data;
      let errMsg = isRTL ? 'حدث خطأ أثناء حفظ الاستبيان.' : 'Une erreur est survenue lors de l’enregistrement.';
      if (typeof data === 'string') {
        errMsg = data;
      } else if (data && typeof data === 'object') {
        errMsg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? JSON.stringify(v) : v)}`)
          .join(' | ');
      }
      setStatus({ loading: false, success: false, error: errMsg });
    }
  };

  const renderDynamicQuestionCard = (q) => (
    <div key={q.code} className={`p-6 rounded-2xl bg-white border-2 ${isEditMode ? 'border-blue-200' : 'border-slate-100'} relative group shadow-sm mb-6`}>
      {isEditMode && (
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button
            onClick={() => setEditingItem({ id: q.code, type: 'QUESTION', section: q.section, data: q })}
            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteDynamic(q.code, 'QUESTION')}
            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <FieldLabel code={q.code} fr={q.label_fr} ar={q.label_ar || q.label_fr} isRTL={isRTL} />

      {q.question_type === 'RADIO' && (
        <RadioGroup
          name={q.code}
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          options={Array.isArray(q.options_json) ? q.options_json : []}
          isRTL={isRTL}
        />
      )}

      {q.question_type === 'NUMBER' && (
        <input
          type="number"
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          className="w-full mt-2 p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 outline-none"
          placeholder="0"
        />
      )}

      {q.question_type === 'TEXT' && (
        <input
          type="text"
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          className="w-full mt-2 p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 outline-none"
          placeholder={isRTL ? 'إجابتك...' : 'Votre réponse...'}
        />
      )}
    </div>
  );

const generateRandomData = () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pickYN = () => pick(['1', '2']);
    const pickYN01 = () => pick(['0', '1']);
    const pickAge = () => pick(['2', '3', '4', '5', '6', '7', '8', '9']); // matches AGE_SCALE 1-indexed ('1'=never)
    const pickDiff = () => pick(['1', '2', '3', '4']); // DIFFICULTY_LEVELS: 1=Impossible, 2=Difficile, 3=Facile, 4=Ne sait pas
    const pickSC = () => pick(['1', '2', '3']);
    const freqOrder = ['1', '2', '3', '4', '5', '6', '7']; // '1'=Jamais matches UI FREQ_LIFETIME
    const freqStress = ['1', '2', '3', '4', '5'];
    const digitalH = ['1', '2', '3', '4', '5', '6'];
    const agreement = ['0', '1', '2', '3', '4'];
    const satOpts = ['1', '2', '3', '4', '5', '6'];
    const freqAct = ['1', '2', '3', '4', '5'];
    const absOpts = ['1', '2', '3', '4', '5', '6'];

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
    const pFreqs = coherentFreqs();

    return {
      section_a: {
        gender: pick(['M', 'F']),
        birth_month: pick(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
        birth_year: pick(['2007', '2008', '2009', '2010', '2011']),
        academic_performance: pick(['1', '2', '3']),      // exact backend choices (1: <10, 2: 10-12, 3: >12)
        activities_frequency: Object.fromEntries(actKeys.map(k => [k, pick(freqAct)])),
        school_absences: Object.fromEntries(absKeys.map(k => [k, pick(absOpts)])),
        household_members: hh,
        parents_absence_reason: pick(['', '1', '2', '3', '4']),
        parents_absence_reason_other: '',
        nights_out_30days: pick(['1', '2', '3', '4', '5', '6', '7', '8']),
        family_relationship_satisfaction: Object.fromEntries(satKeys.map(k => [k, pick(satOpts)])),
      },
      section_b: {
        father_education: pick(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']), // EDUCATION_LEVEL numeric codes
        mother_education: pick(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']),
        father_job: pick(['1', '2', '3', '4', '5', '6']), // EMPLOYMENT_STATUS: 1=plein temps...6=NA
        mother_job: pick(['1', '2', '3', '4', '5', '6']),
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
        binge_drinking_30days: pick(['1', '2', '3', '4', '5', '6']), // 1=Aucune...6=≥10
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
        cannabis_problems_12months: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map(k => [k, pickYN()])),
      },
      section_j: drugSection(),
      section_k: drugSectionSimple(),
      section_l: drugSectionSimple(),
      section_m: drugSectionSimple(),
      section_n: {
        access_difficulty: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, pickDiff()])),
        lifetime_freq_by_type: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, pick(freqOrder)])),
        months_12_freq_by_type: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, pick(freqOrder)])),
        age_first_use_by_type: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, pickAge()])),
      },
      section_p: {
        lifetime_freq: pFreqs.lifetime_freq, months_12_freq: pFreqs.months_12_freq,
        forms: Object.fromEntries(['a', 'b', 'c', 'd'].map(k => [k, pick([true, false])])),
        substances: Object.fromEntries(['cannabinoids', 'cathinones'].map(k => [k, pick(freqOrder)])),
      },
      section_q: {
        risk_perceptions: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'i', 'j', 'k', 'l', 'q2a', 'q2b', 'q2c', 'q2d', 'q2e', 'q2f', 'q2g', 'q2h', 'q2i', 'q2m', 'q2k'].map(k => [k, pick(['1', '2', '3', '4', '5'])])),
        help_sources: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(k => [k, pickYN()])),
        friend_use_risk: pick(['1', '2', '3', '4']),
      },
      section_r: {
        hours_per_day_breakdown: { a: pick(digitalH), b: pick(digitalH) },
        agreement: Object.fromEntries(['a', 'b', 'c'].map(k => [k, pick(agreement)])),
      },
      section_s: {
        hours_per_day: pick(digitalH),
        days_per_week: pick(['0', '1', '2', '3', '4', '5', '6', '7']),
        agreement: Object.fromEntries(['a', 'b'].map(k => [k, pick(agreement)])),
      },
      section_t: {
        months_12_freq: pick(freqOrder),                                     // uses FREQUENCY_LIFETIME_12M
        offline_games: Object.fromEntries(['slot_machines', 'cards_dice', 'lottery', 'sports_betting', 'other'].map(k => [k, pick([true, false])])),
        online_games: Object.fromEntries(['slot_machines', 'cards_dice', 'lottery', 'sports_betting', 'other'].map(k => [k, pick([true, false])])),
        felt_need_increase: pickYN(), lied_about_it: pickYN(),
        gambling_problems: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'].map(k => [k, pickYN01()])),
      },
      section_u: {
        fights_12months: pick(['1', '2', '3', '4', '5', '6', '7', '8']),
        fight_circumstances: pick(['1', '2']),
        fight_location: pick(['1', '2']),
        staff_intervention: pickYN(), // YES_NO: '1'=Oui, '2'=Non
        fight_consequences: [pick(['a', 'b', 'c', 'd', 'e'])],
        serious_injury_12months: pick(['1', '2', '3', '4', '5']),
      },
      section_v: {
        a: pick(freqStress), b: pick(freqStress), c: pick(freqStress), d: pick(freqStress),
        self_esteem: Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map(k => [k, pick(agreement)])),
        mental_health_states: Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map(k => [k, pickYN()])),
        help_seeking: Object.fromEntries(['a', 'b'].map(k => [k, pickYN()])),
      },
      section_z: {
        honesty_level: pick(['1', '2', '3', '4', '5']),
        honesty_cannabis: pick(['1', '2', '3', '4', '5']),
      },
    };
  };

// ─── Intelligent Answer Presets & Question Metadata Registry ──────────────────

const ANSWER_PRESETS = [
  {
    name: 'Oui / Non (نعم / لا)',
    options: [
      ['1', 'Oui', 'نعم', 1],
      ['2', 'Non', 'لا', 2],
    ],
  },
  {
    name: 'Oui / Non / Ne sait pas (نعم / لا / لا أدري)',
    options: [
      ['1', 'Oui', 'نعم', 1],
      ['2', 'Non', 'لا', 2],
      ['3', 'Ne sait pas', 'لا أدري', 3],
    ],
  },
  {
    name: 'Frequence de vie (Jamais a 40+ fois)',
    options: FREQ_LIFETIME,
  },
  {
    name: 'Frequence 30 jours (Cigarettes)',
    options: FREQ_30DAYS_CIGS,
  },
  {
    name: 'Difficulte d\'acces (Impossible a Facile)',
    options: DIFFICULTY_LEVELS,
  },
  {
    name: 'Echelle d\'accord (1 a 4)',
    options: [
      ['1', "Tout a fait d'accord", 'أوافق تماماً', 1],
      ['2', "Plutot d'accord", 'أوافق إلى حد ما', 2],
      ['3', "Plutot pas d'accord", 'لا أوافق إلى حد ما', 3],
      ['4', "Pas du tout d'accord", 'لا أوافق إطلاقاً', 4],
    ],
  },
  {
    name: 'Echelle d\'age (9 ans ou moins a 16 ans ou plus)',
    options: AGE_SCALE,
  },
  {
    name: 'Satisfaction (Tres satisfait a Non satisfait)',
    options: SATISFACTION_SCALE,
  },
];

const QUESTION_METADATA_REGISTRY = {
  'DATE': {
    type: 'NUMBER',
    options: [],
  },
  'C.A01': {
    type: 'RADIO',
    options: [['M', 'Masculin', 'ذكر', 1], ['F', 'Féminin', 'أنثى', 2]],
  },
  'C.A02': {
    type: 'NUMBER',
    options: [],
  },
  'C.A03': {
    type: 'RADIO',
    options: PERFORMANCE,
  },
  'C.A04': {
    type: 'MATRIX',
    options: [
      ['1', 'Jamais', 'أبداً', 1],
      ['2', '1 jour', 'يوم واحد', 2],
      ['3', '2 jours', 'يومان', 3],
      ['4', '3-4 jours', '3-4 أيام', 4],
      ['5', '5-6 jours', '5-6 أيام', 5],
      ['6', '7 jours ou plus', '7 أيام أو أكثر', 6],
    ],
    items: [
      ['a', '(C.A04a) Parce que vous étiez malade', 'بسبب المرض'],
      ['b', "(C.A04b) Parce que vous n'aviez pas envie d'aller au lycée", 'لم تكن راغباً في الذهاب إلى المدرسة'],
      ['c', '(C.A04c) En raison de problèmes avec l’administration ou les enseignants', 'بسبب مشاكل مع الإدارة أو المدرسين'],
      ['d', '(C.A04d) En raison de problèmes avec les ami(e)s au lycée', 'بسبب مشاكل مع الأقران'],
      ['e', '(C.A04e) Parce que vous avez été renvoyé(e)', 'بسبب الطرد'],
    ],
  },
  'C.A05': {
    type: 'RADIO',
    options: [
      ['1', "J'aime beaucoup l'école", 'أحب المدرسة كثيراً', 1],
      ['2', "J'aime assez l'école", 'أحب المدرسة إلى حد ما', 2],
      ['3', "Je n'aime pas tellement l'école", 'لا أحب المدرسة كثيراً', 3],
      ['4', "Je n'aime pas du tout l'école", 'لا أحب المدرسة إطلاقاً', 4],
    ],
  },
  'C.A06': {
    type: 'MATRIX',
    options: FREQ_ACTIVITIES,
    items: [
      ['sports', '(C.A06a) Pratiquer du sport', 'ممارسة الرياضة'],
      ['reading', '(C.A06b) Lire des livres pour le plaisir', 'قراءة الكتب للمطالعة'],
      ['going_out', '(C.A06c) Sortir le soir avec des ami(e)s', 'الخروج في المساء مع الأصدقاء'],
      ['hobbies', "(C.A06d) Pratiquer d'autres loisirs (musique, théâtre...)", 'ممارسة هوايات أخرى (موسيقى، مسرح...)'],
      ['park', '(C.A06e) Passer du temps dans les parcs ou espaces publics', 'قضاء الوقت في الحدائق أو الفضاءات العامة'],
      ['internet', "(C.A06f) Utiliser Internet pour les loisirs", 'استخدام الإنترنت للترفيه'],
      ['tv', "(C.A06g) Regarder la télévision ou des vidéos", 'مشاهدة التلفزيون أو مقاطع الفيديو'],
    ],
  },
  'C.A07': {
    type: 'RADIO',
    options: HOUSEHOLD,
  },
  'C.A08': {
    type: 'RADIO',
    options: [
      ['1', 'Décès', 'وفاة', 1],
      ['2', 'Divorce ou séparation', 'طلاق أو انفصال', 2],
      ['3', 'Travail ou migration dans une autre région / à l’étranger', 'العمل أو الهجرة إلى منطقة أخرى / بالخارج', 3],
      ['4', 'Autre raison', 'سبب آخر', 4],
      ['5', 'Non concerné (mes deux parents vivent avec moi)', 'غير معني (كلا الوالدين يعيشان معي)', 5],
    ],
  },
  'C.A09': {
    type: 'MATRIX',
    options: SATISFACTION_SCALE,
    items: [
      ['parents', '(C.A09a) Vos parents', 'والديك'],
      ['friends', '(C.A09b) Vos ami(e)s', 'أصدقائك'],
      ['teachers', '(C.A09c) Vos enseignant(e)s', 'أساتذتك'],
    ],
  },
  'C.A10': {
    type: 'RADIO',
    options: [
      ['1', 'Aucune nuit', 'ولا ليلة', 1],
      ['2', '1 nuit', 'ليلة واحدة', 2],
      ['3', '2 nuits', 'ليلتان', 3],
      ['4', '3 nuits', '3 ليالٍ', 4],
      ['5', '4 nuits', '4 ليالٍ', 5],
      ['6', '5 nuits', '5 ليالٍ', 6],
      ['7', '6 nuits', '6 ليالٍ', 7],
      ['8', '7 nuits ou plus', '7 ليالٍ أو أكثر', 8],
    ],
  },
  'C.B01': {
    type: 'RADIO',
    options: [
      ['1', 'Non scolarisé', 'غير متمدرس', 1],
      ['2', 'Niveau primaire', 'مستوى ابتدائي', 2],
      ['3', 'Niveau collège', 'مستوى إعدادي', 3],
      ['4', 'Niveau secondaire', 'مستوى ثانوي', 4],
      ['5', 'Niveau universitaire', 'مستوى جامعي', 5],
      ['6', 'Formation professionnelle', 'تكوين مهني', 6],
      ['7', 'Ne sait pas', 'لا أدري', 7],
      ['8', 'Non applicable', 'غير منطبق', 8],
    ],
  },
  'C.B02': {
    type: 'RADIO',
    options: [
      ['1', 'Non scolarisé', 'غير متمدرس', 1],
      ['2', 'Niveau primaire', 'مستوى ابتدائي', 2],
      ['3', 'Niveau collège', 'مستوى إعدادي', 3],
      ['4', 'Niveau secondaire', 'مستوى ثانوي', 4],
      ['5', 'Niveau universitaire', 'مستوى جامعي', 5],
      ['6', 'Formation professionnelle', 'تكوين مهني', 6],
      ['7', 'Ne sait pas', 'لا أدري', 7],
      ['8', 'Non applicable', 'غير منطبق', 8],
    ],
  },
  'C.B03': { type: 'RADIO', options: JOBS_FATHER },
  'C.B04': { type: 'RADIO', options: JOBS_MOTHER },
  'C.B05': { type: 'RADIO', options: ECONOMIC },
  'C.B06': { type: 'RADIO', options: YES_NO },
  'C.C01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.C02': {
    type: 'RADIO',
    options: [
      ['1', 'Aucun', 'لا أحد', 1],
      ['2', 'Quelques-uns', 'البعض', 2],
      ['3', 'La plupart', 'الأغلبية', 3],
      ['4', 'Tous', 'الجميع', 4],
      ['5', 'Ne sait pas', 'لا أدري', 5],
    ],
  },
  'C.C03': { type: 'RADIO', options: FREQ_LIFETIME_CC03 },
  'C.C04': { type: 'RADIO', options: FREQ_LIFETIME_CC03 },
  'C.C05': { type: 'RADIO', options: FREQ_30DAYS_CIGS },
  'C.C06': { type: 'RADIO', options: AGE_SCALE },
  'C.C07': { type: 'RADIO', options: AGE_SCALE },
  'C.D01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.D02': {
    type: 'RADIO',
    options: [
      ['1', 'Aucun', 'لا أحد', 1],
      ['2', 'Quelques-uns', 'البعض', 2],
      ['3', 'La plupart', 'الأغلبية', 3],
      ['4', 'Tous', 'الجميع', 4],
      ['5', 'Ne sait pas', 'لا أدري', 5],
    ],
  },
  'C.D03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.D04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.D05': { type: 'RADIO', options: FREQ_30DAYS_VAPE },
  'C.D06': { type: 'RADIO', options: AGE_SCALE },
  'C.D07': { type: 'RADIO', options: AGE_SCALE },
  'C.E01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.E02': {
    type: 'RADIO',
    options: [
      ['1', 'Aucun', 'لا أحد', 1],
      ['2', 'Quelques-uns', 'البعض', 2],
      ['3', 'La plupart', 'الأغلبية', 3],
      ['4', 'Tous', 'الجميع', 4],
      ['5', 'Ne sait pas', 'لا أدري', 5],
    ],
  },
  'C.E03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.E04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.E05': { type: 'RADIO', options: FREQ_30DAYS_HOOKAH },
  'C.E06': { type: 'RADIO', options: AGE_SCALE },
  'C.G01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.G03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.G04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.G05': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.G07': { type: 'RADIO', options: FREQ_BINGE },
  'C.G08': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.G09': { type: 'RADIO', options: AGE_SCALE },
  'C.H01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.H03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.H04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.H05': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.H06': { type: 'RADIO', options: AGE_SCALE },
  'C.I01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.I03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.I04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.I05': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.I06': { type: 'RADIO', options: AGE_SCALE },
  'C.J01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.J03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.J04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.K01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.K03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.K04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.L01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.L03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.L04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.M01': { type: 'RADIO', options: DIFFICULTY_LEVELS },
  'C.M03': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.M04': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.N01': { type: 'RADIO', options: YES_NO },
  'C.N02': { type: 'RADIO', options: YES_NO },
  'C.P01': { type: 'RADIO', options: YES_NO },
  'C.P02': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.Q01': { type: 'RADIO', options: RISK_LEVELS },
  'C.R01': { type: 'RADIO', options: FREQ_DIGITAL },
  'C.R02': { type: 'RADIO', options: AGREEMENT_SCALE_PAPER },
  'C.S01': { type: 'RADIO', options: FREQ_DIGITAL },
  'C.S02': { type: 'RADIO', options: FREQ_DIGITAL },
  'C.S03': { type: 'RADIO', options: AGREEMENT_SCALE_CS03 },
  'C.T01': { type: 'RADIO', options: FREQ_LIFETIME },
  'C.T02': { type: 'RADIO', options: FREQ_GAMBLING_GRID },
  'C.T03': { type: 'RADIO', options: FREQ_GAMBLING_GRID },
  'C.T04': { type: 'RADIO', options: YES_NO },
  'C.T05': { type: 'RADIO', options: YES_NO },
  'C.T06': {
    type: 'RADIO',
    options: [
      ['1', 'Chaque fois', 'كل مرة', 1],
      ['2', 'La plupart du temps', 'معظم الوقت', 2],
      ['3', 'Quelques fois', 'بضع مرات', 3],
      ['4', 'Jamais', 'أبداً', 4],
    ],
  },
  'C.U01': { type: 'RADIO', options: FIGHT_FREQUENCY },
  'C.U02': {
    type: 'RADIO',
    options: [
      ['1', "Je me battais avec quelqu'un (j'étais l'initiateur)", 'كنت أتشاجر مع شخص (أنا من بدأ)', 1],
      ['2', "Quelqu'un m'a agressé(e) et je me suis défendu(e)", 'اعتدى علي شخص ودافعت عن نفسي', 2],
      ['3', "C'était une bagarre de groupe", 'كان شجاراً جماعياً', 3],
      ['4', "Je ne me suis pas battu(e)", 'لم أتشاجر', 4],
    ],
  },
  'C.U03': {
    type: 'RADIO',
    options: [
      ['1', "Dans l'établissement scolaire", 'داخل المؤسسة التربوية', 1],
      ['2', "Aux alentours du lycée / dans la rue", 'بمحيط المدرسة / في الشارع', 2],
      ['3', "Dans le quartier / près de chez moi", 'في الحي / قرب المنزل', 3],
      ['4', "Ailleurs", 'في مكان آخر', 4],
      ['5', "Non applicable (pas de bagarre)", 'غير منطبق', 5],
    ],
  },
  'C.U04': { type: 'RADIO', options: YES_NO_DK },
  'C.V01': { type: 'RADIO', options: STRESS_FREQ },
  'C.V02': { type: 'RADIO', options: STRESS_FREQ },
  'C.V03': { type: 'RADIO', options: STRESS_FREQ },
  'C.V04': { type: 'RADIO', options: STRESS_FREQ },
  'C.Z01': {
    type: 'RADIO',
    options: [
      ['1', "J'ai déjà déclaré ma consommation avec honnêteté", 'صرحت باستهلاكي بكل صدق', 1],
      ['2', "Oui, sans aucun doute, j'ai répondu honnêtement", 'نعم، بكل تأكيد أجبت بصدق', 2],
      ['3', "Probablement oui", 'على الأرجح نعم', 3],
      ['4', "Probablement pas", 'على الأرجح لا', 4],
      ['5', "Non, je n'ai pas été honnête", 'لا، لم أكن صادقاً', 5],
    ],
  },
  'C.Z02': {
    type: 'RADIO',
    options: [
      ['1', "J'ai déjà déclaré en avoir consommé", 'صرحت بالفعل باستهلاكي له', 1],
      ['2', "Certainement oui", 'نعم بكل تأكيد', 2],
      ['3', "Probablement oui", 'على الأرجح نعم', 3],
      ['4', "Probablement non", 'على الأرجح لا', 4],
      ['5', "Certainement non", 'بالتأكيد لا', 5],
    ],
  },
};

const STATIC_QUESTION_DEFAULTS = QUESTION_METADATA_REGISTRY;

const getQuestionMeta = (code) => {
  if (!code) return null;
  const raw = String(code).trim();
  if (QUESTION_METADATA_REGISTRY[raw]) return QUESTION_METADATA_REGISTRY[raw];
  const clean = raw.replace(/[\s._-]+/g, '').toUpperCase();
  for (const [k, v] of Object.entries(QUESTION_METADATA_REGISTRY)) {
    if (String(k).replace(/[\s._-]+/g, '').toUpperCase() === clean) {
      return v;
    }
  }
  return null;
};

const RAW_SECTIONS = [
    // SECTION A
    {
      id: 'section_a',
      letter: 'A',
      title: 'Informations Générales',
      titleAr: 'معلومات عامة',
      subtitle: 'Les premières questions concernent des informations générales sur vous.',
      subtitleAr: 'تتعلق الأسئلة الأولى بمعلومات عامة عن شخصكم.',
      color: 'bg-slate-900',
      content: (
        <div className="space-y-12">
          {/* Date de l'enquête */}
          <div className="p-5 bg-blue-50/80 border-2 border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <FieldLabel code="DATE" fr="Date de l'enquête" ar="تاريخ الاستبيان" isRTL={isRTL} />
              <p className="text-xs text-slate-500 font-medium">{isRTL ? 'التاريخ المسجل لهذه الجلسة' : 'Date enregistrée pour cette session'}</p>
            </div>
            <input
              type="date"
              name="survey_date"
              value={data.section_a.survey_date || ''}
              onChange={handleChange('section_a')}
              className="px-4 py-2.5 bg-white border-2 border-blue-300 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 outline-none"
            />
          </div>

          {/* C.A01 */}
          <div>
            <FieldLabel code="C.A01" fr="Genre ?" ar="الجنس؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="gender"
              value={data.section_a.gender}
              onChange={handleChange('section_a')}
              options={[
                ['M', 'Masculin', 'ذكر', 1],
                ['F', 'Féminin', 'أنثى', 2],
              ]}
              isRTL={isRTL}
            />
          </div>

          {/* C.A02: Date de naissance */}
          <div>
            <FieldLabel code="C.A02" fr="En quelle année et quel mois êtes-vous né(e) ?" ar="في أي سنة وأي شهر ولدت؟" isRTL={isRTL} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  (C.A02a) {isRTL ? 'الشهر (01 إلى 12)' : 'Mois (01 à 12)'}
                </span>
                <DigitBoxes
                  value={data.section_a.birth_month}
                  length={2}
                  onChange={(val) => update('section_a', 'birth_month', val)}
                  isRTL={isRTL}
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  (C.A02b) {isRTL ? 'السنة (مثال: 2008)' : 'Année (ex: 2008)'}
                </span>
                <DigitBoxes
                  value={data.section_a.birth_year}
                  length={4}
                  onChange={(val) => update('section_a', 'birth_year', val)}
                  isRTL={isRTL}
                />
              </div>
            </div>
          </div>

          {/* C.A03 */}
          <div>
            <FieldLabel code="C.A03" fr="Comment trouvez-vous vos résultats scolaires par rapport aux autres élèves ?" ar="كيف تقيم نتائجك المدرسية مقارنة ببقية التلاميذ؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="academic_performance"
              value={data.section_a.academic_performance}
              onChange={handleChange('section_a')}
              options={PERFORMANCE}
              isRTL={isRTL}
            />
          </div>

          {/* C.A04: Absences */}
          <GridQuestion
            title="Au cours du dernier mois, combien de jours avez-vous manqué le lycée pour l'une des raisons suivantes ?"
            titleAr="خلال الشهر الأخير كم مرة تغيبت عن المدرسة لسبب من الأسباب التالية؟"
            code="C.A04"
            isRTL={isRTL}
            options={[
              ['1', 'Jamais', 'أبداً'],
              ['2', '1 jour', 'يوم واحد'],
              ['3', '2 jours', 'يومان'],
              ['4', '3-4 jours', '3-4 أيام'],
              ['5', '5-6 jours', '5-6 أيام'],
              ['6', '7 jours ou plus', '7 أيام أو أكثر'],
            ]}
            values={data.section_a.school_absences}
            onChange={(key, val) => updateCheck('section_a', 'school_absences', key, val)}
            items={[
              ['a', '(C.A04a) Parce que vous étiez malade', 'بسبب المرض'],
              ['b', "(C.A04b) Parce que vous n'aviez pas envie d'aller au lycée", 'لم تكن راغباً في الذهاب إلى المدرسة'],
              ['c', '(C.A04c) En raison de problèmes avec l’administration ou les enseignants', 'بسبب مشاكل مع الإدارة أو المدرسين'],
              ['d', '(C.A04d) En raison de problèmes avec les ami(e)s au lycée', 'بسبب مشاكل مع الأقران'],
              ['e', '(C.A04e) Parce que vous avez été renvoyé(e)', 'بسبب الطرد'],
            ]}
          />

          {/* C.A05 */}
          <div>
            <FieldLabel code="C.A05" fr="Quel est votre degré d'appréciation de l'école ?" ar="ما مدى إعجابك بالمدرسة؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="school_appreciation"
              value={data.section_a.school_appreciation}
              onChange={handleChange('section_a')}
              options={[
                ['1', "J'aime beaucoup l'école", 'أحب المدرسة كثيراً', 1],
                ['2', "J'aime assez l'école", 'أحب المدرسة إلى حد ما', 2],
                ['3', "Je n'aime pas tellement l'école", 'لا أحب المدرسة كثيراً', 3],
                ['4', "Je n'aime pas du tout l'école", 'لا أحب المدرسة إطلاقاً', 4],
              ]}
              isRTL={isRTL}
            />
          </div>

          {/* C.A06: Activités */}
          <GridQuestion
            title="À quelle fréquence participez-vous aux activités suivantes :"
            titleAr="كم مرة تمارس الأنشطة التالية:"
            code="C.A06"
            isRTL={isRTL}
            options={FREQ_ACTIVITIES}
            values={data.section_a.activities_frequency}
            onChange={(key, val) => updateCheck('section_a', 'activities_frequency', key, val)}
            items={[
              ['sports', '(C.A06a) Pratiquer du sport', 'ممارسة الرياضة'],
              ['reading', '(C.A06b) Lire des livres pour le plaisir', 'قراءة الكتب للمطالعة'],
              ['going_out', '(C.A06c) Sortir le soir avec des ami(e)s', 'الخروج في المساء مع الأصدقاء'],
              ['hobbies', "(C.A06d) Pratiquer d'autres loisirs (musique, théâtre...)", 'ممارسة هوايات أخرى (موسيقى، مسرح...)'],
              ['park', '(C.A06e) Passer du temps dans les parcs ou espaces publics', 'قضاء الوقت في الحدائق أو الفضاءات العامة'],
              ['internet', "(C.A06f) Utiliser Internet pour les loisirs", 'استخدام الإنترنت للترفيه'],
              ['tv', "(C.A06g) Regarder la télévision ou des vidéos", 'مشاهدة التلفزيون أو مقاطع الفيديو'],
            ]}
          />

          {/* C.A07: Membres du foyer */}
          <div>
            <FieldLabel code="C.A07" fr="Quelles sont les personnes qui vivent avec vous dans le même foyer ?" ar="من هم الأشخاص الذين يعيشون معك في نفس المنزل؟" isRTL={isRTL} />
            <p className="text-xs font-medium text-slate-500 mb-2">{isRTL ? 'يمكنك اختيار أكثر من إجابة' : '(Plusieurs choix possibles)'}</p>
            <CheckboxGroup
              values={data.section_a.household_members}
              onChange={(val) => update('section_a', 'household_members', val)}
              options={HOUSEHOLD}
              isRTL={isRTL}
            />
          </div>

          {/* C.A08: Raison absence parents */}
          <div>
            <FieldLabel code="C.A08" fr="Si l'un ou les deux parents ne vivent pas avec vous, quelle en est la raison principale ?" ar="إذا كان أحد الوالدين أو كلاهما لا يعيش معك، ما هو السبب الرئيسي؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="parents_absence_reason"
              value={data.section_a.parents_absence_reason}
              onChange={handleChange('section_a')}
              options={[
                ['1', 'Décès', 'وفاة', 1],
                ['2', 'Divorce ou séparation', 'طلاق أو انفصال', 2],
                ['3', 'Travail ou migration dans une autre région / à l’étranger', 'العمل أو الهجرة إلى منطقة أخرى / بالخارج', 3],
                ['4', 'Autre raison', 'سبب آخر', 4],
                ['5', 'Non concerné (mes deux parents vivent avec moi)', 'غير معني (كلا الوالدين يعيشان معي)', 5],
              ]}
              isRTL={isRTL}
            />
          </div>

          {/* C.A09: Satisfaction relations */}
          <GridQuestion
            title="D'une manière générale, quel est votre degré de satisfaction de votre relation avec :"
            titleAr="كم نسبة رضاك عن علاقتك بــ :"
            code="C.A09"
            isRTL={isRTL}
            options={SATISFACTION_SCALE}
            values={data.section_a.family_relationship_satisfaction}
            onChange={(key, val) => updateCheck('section_a', 'family_relationship_satisfaction', key, val)}
            items={[
              ['a', '(C.A09a) Votre mère', 'أمك'],
              ['b', '(C.A09b) Votre père', 'أبوك'],
              ['c', '(C.A09c) Vos ami(e)s', 'أصدقاؤك'],
            ]}
          />

          {/* C.A10: Sorties nocturnes */}
          <div>
            <FieldLabel code="C.A10" fr="Au cours des 30 DERNIERS JOURS, combien de nuits avez-vous passées hors de chez vous pour vous amuser ?" ar="خلال الـ 30 يوماً الأخيرة، كم ليلة قضيتها خارج المنزل للترفيه؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="nights_out_30days"
              value={data.section_a.nights_out_30days}
              onChange={handleChange('section_a')}
              options={[
                ['1', 'Aucune nuit', 'ولا ليلة', 1],
                ['2', '1 nuit', 'ليلة واحدة', 2],
                ['3', '2 nuits', 'ليلتان', 3],
                ['4', '3 nuits', '3 ليالٍ', 4],
                ['5', '4 nuits', '4 ليالٍ', 5],
                ['6', '5 nuits', '5 ليالٍ', 6],
                ['7', '6 nuits', '6 ليالٍ', 7],
                ['8', '7 nuits ou plus', '7 ليالٍ أو أكثر', 8],
              ]}
              isRTL={isRTL}
            />
          </div>
        </div>
      ),
    },

    // SECTION B
    {
      id: 'section_b',
      letter: 'B',
      title: 'Famille et Situation Socio-Économique',
      titleAr: 'العائلة والوضع الاجتماعي والاقتصادي',
      subtitle: 'Les questions suivantes concernent vos parents. Si vous avez été élevé par des parents adoptifs ou autres personnes, ces questions les concernent. Mais si vous avez à la fois un beau-père ou une belle-mère et un père ou une mère biologique, ces questions concernent celui qui est le plus important pour votre éducation.',
      subtitleAr: 'تتعلق الأسئلة التالية بوالديك. إذا نشأت مع والدين بالتبني أو أشخاص آخرين، فإن هذه الأسئلة تهمهم. ولكن إذا كان لديك زوج أم أو زوجة أب وأب أو أم بيولوجيان في نفس الوقت، فإن هذه الأسئلة تخص الشخص الأكثر أهمية في تربيتك.',
      color: 'bg-emerald-950',
      content: (
        <div className="space-y-12">
          {/* C.B01: Éducation Père */}
          <EducationWithSubQuestions
            fieldName="father_education"
            successFields={{
              primary: 'father_primary_success',
              middle: 'father_middle_success',
              secondary: 'father_secondary_success',
            }}
            labelCode="C.B01"
            labelFr="Quel est le niveau d'instruction le plus élevé atteint par votre PÈRE ?"
            labelAr="ما هو أعلى مستوى تعليمي بلغه والدك؟"
            data={data.section_b}
            update={update}
            isRTL={isRTL}
          />

          {/* C.B02: Éducation Mère */}
          <EducationWithSubQuestions
            fieldName="mother_education"
            successFields={{
              primary: 'mother_primary_success',
              middle: 'mother_middle_success',
              secondary: 'mother_secondary_success',
            }}
            labelCode="C.B02"
            labelFr="Quel est le niveau d'instruction le plus élevé atteint par votre MÈRE ?"
            labelAr="ما هو أعلى مستوى تعليمي بلغته والدتك؟"
            data={data.section_b}
            update={update}
            isRTL={isRTL}
          />

          {/* C.B03: Travail Père */}
          <div>
            <FieldLabel code="C.B03" fr="Quelle est la profession de votre PÈRE ?" ar="ما هي مهنة والدك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="father_job"
              value={data.section_b.father_job}
              onChange={handleChange('section_b')}
              options={JOBS_FATHER}
              isRTL={isRTL}
            />
          </div>

          {/* C.B04: Travail Mère */}
          <div>
            <FieldLabel code="C.B04" fr="Quelle est la profession de votre MÈRE ?" ar="ما هي مهنة والدتك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="mother_job"
              value={data.section_b.mother_job}
              onChange={handleChange('section_b')}
              options={JOBS_MOTHER}
              isRTL={isRTL}
            />
          </div>

          {/* C.B05: Situation Économique */}
          <div>
            <FieldLabel code="C.B05" fr="Par rapport aux autres familles tunisiennes, comment évaluez-vous la situation financière de votre famille ?" ar="مقارنة بالعائلات التونسية الأخرى، كيف تقيم الوضع المالي لعائلتك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="economic_status"
              value={data.section_b.economic_status}
              onChange={handleChange('section_b')}
              options={ECONOMIC}
              isRTL={isRTL}
            />
          </div>

          {/* C.B06: Chambre personnelle */}
          <div>
            <FieldLabel code="C.B06" fr="Avez-vous une chambre individuelle pour vous seul(e) ?" ar="هل لديك غرفة خاصة بك بمفردك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="private_room"
              value={data.section_b.private_room}
              onChange={handleChange('section_b')}
              options={YES_NO}
              isRTL={isRTL}
            />
          </div>
        </div>
      ),
    },

    // SECTION C
    {
      id: 'section_c',
      letter: 'C',
      title: 'Consommation de Cigarettes et Tabac',
      titleAr: 'استهلاك السجائر والتبغ',
      subtitle: 'Les questions suivantes concernent la consommation de CIGARETTES et le TABAC A ROULER, sans compter les cigarettes électroniques.',
      subtitleAr: 'تتعلق الأسئلة التالية باستهلاك السجائر والتبغ الملفوف، دون احتساب السجائر الإلكترونية.',
      color: 'bg-amber-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.C01" fr="À votre avis, s'il vous était possible d'obtenir des cigarettes, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على السجائر، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_c.access_difficulty} onChange={handleChange('section_c')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Parmi les personnes suivantes, combien fument des cigarettes :"
            titleAr="من بين الأشخاص التاليين، كم شخصاً يدخن السجائر:"
            code="C.C02"
            isRTL={isRTL}
            options={[
              ['1', 'Aucun', 'لا أحد'],
              ['2', 'Quelques-uns', 'البعض'],
              ['3', 'La plupart', 'الأغلبية'],
              ['4', 'Tous', 'الجميع'],
              ['5', 'Ne sait pas', 'لا أدري'],
            ]}
            values={data.section_c.social_circle}
            onChange={(key, val) => updateCheck('section_c', 'social_circle', key, val)}
            items={[
              ['friends', '(C.C02a) Vos ami(e)s', 'أصدقاؤك'],
              ['father', '(C.C02b) Votre père (ou tuteur)', 'والدك'],
              ['mother', '(C.C02c) Votre mère (ou tutrice)', 'والدتك'],
              ['siblings', '(C.C02d) Vos frères et sœurs', 'إخوتك وأخواتك'],
            ]}
          />
          <div>
            <FieldLabel code="C.C03" fr="Au cours de votre vie, combien de fois avez-vous fumé des cigarettes ?" ar="خلال حياتك، كم مرة دخنت السجائر؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_c.lifetime_freq} onChange={handleChange('section_c')} options={FREQ_LIFETIME_CC03} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous fumé des cigarettes ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة دخنت السجائر؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_c.months_12_freq} onChange={handleChange('section_c')} options={FREQ_LIFETIME_CC03} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C05" fr="Au cours des 30 DERNIERS JOURS, à quelle fréquence avez-vous fumé des cigarettes ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة دخنت السجائر؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_c.days_30_freq} onChange={handleChange('section_c')} options={FREQ_30DAYS_CIGS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C06" fr="Quel âge aviez-vous quand vous avez fumé une cigarette pour la première fois ?" ar="كم كان عمرك عندما دخنت سيجارة لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_c.age_first_use} onChange={handleChange('section_c')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C07" fr="Quel âge aviez-vous quand vous avez commencé à fumer des cigarettes tous les jours ?" ar="كم كان عمرك عندما بدأت تدخن السجائر يومياً؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_daily_use" value={data.section_c.age_daily_use} onChange={handleChange('section_c')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION D
    {
      id: 'section_d',
      letter: 'D',
      title: 'Cigarettes Électroniques (Vape)',
      titleAr: 'السجائر الإلكترونية (Vape)',
      subtitle: 'Les questions suivantes concernent LES CIGARETTES ELECTRONIQUES (Vape).',
      subtitleAr: 'تتعلق الأسئلة التالية بالسجائر الإلكترونية (الفاب).',
      color: 'bg-teal-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.D01" fr="À votre avis, s'il vous était possible d'obtenir une cigarette électronique, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على سيجارة إلكترونية، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_d.access_difficulty} onChange={handleChange('section_d')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Parmi les personnes suivantes, combien utilisent la cigarette électronique :"
            titleAr="من بين الأشخاص التاليين، كم شخصاً يستعمل السيجارة الإلكترونية:"
            code="C.D02"
            isRTL={isRTL}
            options={[
              ['1', 'Aucun', 'لا أحد'],
              ['2', 'Quelques-uns', 'البعض'],
              ['3', 'La plupart', 'الأغلبية'],
              ['4', 'Tous', 'الجميع'],
              ['5', 'Ne sait pas', 'لا أدري'],
            ]}
            values={data.section_d.social_circle}
            onChange={(key, val) => updateCheck('section_d', 'social_circle', key, val)}
            items={[
              ['friends', '(C.D02a) Vos ami(e)s', 'أصدقاؤك'],
              ['father', '(C.D02b) Votre père (ou tuteur)', 'والدك'],
              ['mother', '(C.D02c) Votre mère (ou tutrice)', 'والدتك'],
              ['siblings', '(C.D02d) Vos frères et sœurs', 'إخوتك وأخواتك'],
            ]}
          />
          <div>
            <FieldLabel code="C.D03" fr="Au cours de votre vie, combien de fois avez-vous utilisé une cigarette électronique ?" ar="خلال حياتك، كم مرة استعملت السيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_d.lifetime_freq} onChange={handleChange('section_d')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous utilisé une cigarette électronique ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استعملت السيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_d.months_12_freq} onChange={handleChange('section_d')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D05" fr="Au cours des 30 DERNIERS JOURS, à quelle fréquence avez-vous utilisé une cigarette électronique ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة استعملت السيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_d.days_30_freq} onChange={handleChange('section_d')} options={FREQ_30DAYS_VAPE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D06" fr="Quel âge aviez-vous lors de votre première utilisation d'une cigarette électronique ?" ar="كم كان عمرك عند أول استعمال للسيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_d.age_first_use} onChange={handleChange('section_d')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D07" fr="Quel âge aviez-vous quand vous avez commencé à utiliser la cigarette électronique tous les jours ?" ar="كم كان عمرك عندما بدأت تستعمل السيجارة الإلكترونية يومياً؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_daily_use" value={data.section_d.age_daily_use} onChange={handleChange('section_d')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION E
    {
      id: 'section_e',
      letter: 'E',
      title: 'Chicha (Narguilé)',
      titleAr: 'الشيشة (النرجيلة)',
      subtitle: 'Les questions suivantes concernent LE NARGUILE (CHICHA).',
      subtitleAr: 'تتعلق الأسئلة التالية باستهلاك النرجيلة (الشيشة).',
      color: 'bg-stone-800',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.E01" fr="À votre avis, s'il vous était possible de fumer la chicha, cela vous serait-il :" ar="حسب رأيك، إذا أردت تدخين الشيشة، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_e.access_difficulty} onChange={handleChange('section_e')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Parmi les personnes suivantes, combien fument la chicha :"
            titleAr="من بين الأشخاص التاليين، كم شخصاً يدخن الشيشة:"
            code="C.E02"
            isRTL={isRTL}
            options={[
              ['1', 'Aucun', 'لا أحد'],
              ['2', 'Quelques-uns', 'البعض'],
              ['3', 'La plupart', 'الأغلبية'],
              ['4', 'Tous', 'الجميع'],
              ['5', 'Ne sait pas', 'لا أدري'],
            ]}
            values={data.section_e.social_circle}
            onChange={(key, val) => updateCheck('section_e', 'social_circle', key, val)}
            items={[
              ['friends', '(C.E02a) Vos ami(e)s', 'أصدقاؤك'],
              ['father', '(C.E02b) Votre père (ou tuteur)', 'والدك'],
              ['mother', '(C.E02c) Votre mère (ou tutrice)', 'والدتك'],
              ['siblings', '(C.E02d) Vos frères et sœurs', 'إخوتك وأخواتك'],
            ]}
          />
          <div>
            <FieldLabel code="C.E03" fr="Au cours de votre vie, combien de fois avez-vous fumé la chicha ?" ar="خلال حياتك، كم مرة دخنت الشيشة؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_e.lifetime_freq} onChange={handleChange('section_e')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.E04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous fumé la chicha ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة دخنت الشيشة؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_e.months_12_freq} onChange={handleChange('section_e')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.E05" fr="Au cours des 30 DERNIERS JOURS, à quelle fréquence avez-vous fumé la chicha ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة دخنت الشيشة؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_e.days_30_freq} onChange={handleChange('section_e')} options={FREQ_30DAYS_HOOKAH} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.E06" fr="Quel âge aviez-vous quand vous avez fumé la chicha pour la première fois ?" ar="كم كان عمرك عندما دخنت الشيشة لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_e.age_first_use} onChange={handleChange('section_e')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION G
    {
      id: 'section_g',
      letter: 'G',
      title: 'Boissons Alcoolisées',
      titleAr: 'المشروبات الكحولية',
      subtitle: 'Les questions suivantes concernent LES BOISSONS ALCOOLISEES.',
      subtitleAr: 'تتعلق الأسئلة التالية بالمشروبات الكحولية وتكرار تناول الكحول.',
      color: 'bg-red-950',
      content: (
        <div className="space-y-12">
          <GridQuestion
            title="À votre avis, s'il vous était possible d'obtenir les boissons suivantes, cela vous serait-il :"
            titleAr="حسب رأيك، إذا أردت الحصول على المشروبات التالية، هل سيكون ذلك:"
            code="C.G01"
            isRTL={isRTL}
            options={DIFFICULTY_LEVELS}
            values={data.section_g.access_difficulty}
            onChange={(key, val) => updateCheck('section_g', 'access_difficulty', key, val)}
            items={[
              ['beer', '(C.G01a) Bière', 'البيرة'],
              ['cider', '(C.G01b) Cidre', 'عصير التفاح المخمر'],
              ['wine', '(C.G01c) Vin', 'النبيذ'],
              ['spirits', '(C.G01d) Spiritueux / Alcool fort', 'المشروبات الروحية القوية'],
            ]}
          />
          <div>
            <FieldLabel code="C.G03" fr="Au cours de votre vie, combien de fois avez-vous bu de l'alcool ?" ar="خلال حياتك، كم مرة شربت الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_g.lifetime_freq} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous bu de l'alcool ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة شربت الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_g.months_12_freq} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G05" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous bu de l'alcool ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة شربت الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_g.days_30_freq} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G07" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous bu 5 verres d'alcool ou plus en une même occasion (Binge drinking) ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة شربت 5 كؤوس أو أكثر في مناسبة واحدة؟" isRTL={isRTL} />
            <VerticalChoiceList name="binge_drinking_30days" value={data.section_g.binge_drinking_30days} onChange={handleChange('section_g')} options={FREQ_BINGE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G08" fr="Au cours de votre vie, combien de fois avez-vous été ivre (au point de tituber ou d'avoir des difficultés d'élocution) ?" ar="خلال حياتك، كم مرة سكرت (لدرجة الترنح أو صعوبة الكلام)؟" isRTL={isRTL} />
            <VerticalChoiceList name="intoxication_lifetime" value={data.section_g.intoxication_lifetime} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G09" fr="Quel âge aviez-vous quand vous avez bu votre premier verre d'alcool ?" ar="كم كان عمرك عندما شربت أول كأس كحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_drink" value={data.section_g.age_first_drink} onChange={handleChange('section_g')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION H
    {
      id: 'section_h',
      letter: 'H',
      title: 'Médicaments Tranquillisants / Sédatifs',
      titleAr: 'المهدئات والمنومات',
      subtitle: 'Certains médicaments comme les tranquillisants ou les sédatifs qui sont utilisés à des fins non médicales. Ces médicaments sont utilisés pour apaiser / relaxer, ce qui aide les gens à dormir, connus par exemple sous le nom de « comprimés ». Les pharmacies n’ont généralement pas le droit de les vendre sans prescription médicale.',
      subtitleAr: 'تتعلق الأسئلة التالية ببعض الأدوية مثل المهدئات أو المنومات المستخدمة لأغراض غير طبية (الحرابش). تستخدم هذه الأدوية للتهدئة والمساعدة على النوم، ولا يحق للصيدليات بيعها بدون وصفة طبية.',
      color: 'bg-purple-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.H01" fr="À votre avis, s'il vous était possible d'obtenir des tranquillisants ou sédatifs sans ordonnance, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على مهدئات بدون وصفة طبية، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_h.access_difficulty} onChange={handleChange('section_h')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H03" fr="Au cours de votre vie, combien de fois avez-vous pris des tranquillisants/sédatifs sans ordonnance ?" ar="خلال حياتك، كم مرة تناولت مهدئات بدون وصفة طبية؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_h.lifetime_freq} onChange={handleChange('section_h')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous pris des tranquillisants/sédatifs sans ordonnance ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة تناولت مهدئات بدون وصفة طبية؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_h.months_12_freq} onChange={handleChange('section_h')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H05" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous pris des tranquillisants/sédatifs sans ordonnance ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة تناولت مهدئات بدون وصفة طبية؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_h.days_30_freq} onChange={handleChange('section_h')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H06" fr="Quel âge aviez-vous quand vous avez pris des tranquillisants sans ordonnance pour la première fois ?" ar="كم كان عمرك عندما تناولت مهدئات بدون وصفة طبية لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_h.age_first_use} onChange={handleChange('section_h')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION I
    {
      id: 'section_i',
      letter: 'I',
      title: 'Cannabis (Zatla, Marihuana, Haschich)',
      titleAr: 'القنب الهندي (الزطلة، الماريجوانا، الحشيش)',
      subtitle: 'Les questions suivantes concernent le cannabis (zatla, marijuana, haschich...).',
      subtitleAr: 'تتعلق الأسئلة التالية بالقنب الهندي (الزطلة، الماريجوانا، الحشيش...).',
      color: 'bg-emerald-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.I01" fr="À votre avis, s'il vous était possible d'obtenir du cannabis (Zatla), cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الزطلة (القنب)، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_i.access_difficulty} onChange={handleChange('section_i')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I03" fr="Au cours de votre vie, combien de fois avez-vous consommé du cannabis (Zatla) ?" ar="خلال حياتك، كم مرة استهلكت القنب الهندي (الزطلة)؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_i.lifetime_freq} onChange={handleChange('section_i')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé du cannabis ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت القنب الهندي؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_i.months_12_freq} onChange={handleChange('section_i')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I05" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous consommé du cannabis ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة استهلكت القنب الهندي؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_i.days_30_freq} onChange={handleChange('section_i')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I06" fr="Quel âge aviez-vous quand vous avez consommé du cannabis pour la première fois ?" ar="كم كان عمرك عندما استهلكت القنب الهندي لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_i.age_first_use} onChange={handleChange('section_i')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION J, K, L, M (Autres Substances)
    {
      id: 'section_j',
      letter: 'J',
      title: 'Cocaïne et Crack',
      titleAr: 'الكوكايين والكراك',
      subtitle: 'Les questions suivantes concernent la COCAÏNE.',
      subtitleAr: 'تتعلق الأسئلة التالية بالكوكايين ومشتقاتها.',
      color: 'bg-cyan-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.J01" fr="À votre avis, s'il vous était possible d'obtenir de la cocaïne, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الكوكايين، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_j.access_difficulty} onChange={handleChange('section_j')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.J03" fr="Au cours de votre vie, combien de fois avez-vous consommé de la cocaïne ?" ar="خلال حياتك، كم مرة استهلكت الكوكايين؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_j.lifetime_freq} onChange={handleChange('section_j')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.J04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé de la cocaïne ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت الكوكايين؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_j.months_12_freq} onChange={handleChange('section_j')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },
    {
      id: 'section_k',
      letter: 'K',
      title: 'Ecstasy (MDMA)',
      titleAr: 'الإكستاسي (MDMA)',
      subtitle: 'Les questions suivantes concernent l’ECSTASY (EXTA).',
      subtitleAr: 'تتعلق الأسئلة التالية بالإكستاسي (EXTA).',
      color: 'bg-pink-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.K01" fr="À votre avis, s'il vous était possible d'obtenir de l'ecstasy, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الإكستاسي، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_k.access_difficulty} onChange={handleChange('section_k')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.K03" fr="Au cours de votre vie, combien de fois avez-vous consommé de l'ecstasy ?" ar="خلال حياتك، كم مرة استهلكت الإكستاسي؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_k.lifetime_freq} onChange={handleChange('section_k')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.K04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé de l'ecstasy ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت الإكستاسي؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_k.months_12_freq} onChange={handleChange('section_k')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },
    {
      id: 'section_l',
      letter: 'L',
      title: 'Héroïne et Opioïdes',
      titleAr: 'الهيروين والأفيونيات',
      subtitle: 'Les questions suivantes concernent l’HEROINE.',
      subtitleAr: 'تتعلق الأسئلة التالية بالهيروين والأفيونيات.',
      color: 'bg-zinc-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.L01" fr="À votre avis, s'il vous était possible d'obtenir de l'héroïne, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الهيروين، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_l.access_difficulty} onChange={handleChange('section_l')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.L03" fr="Au cours de votre vie, combien de fois avez-vous consommé de l'héroïne ?" ar="خلال حياتك، كم مرة استهلكت الهيروين؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_l.lifetime_freq} onChange={handleChange('section_l')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.L04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé de l'héroïne ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت الهيروين؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_l.months_12_freq} onChange={handleChange('section_l')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },
    {
      id: 'section_m',
      letter: 'M',
      title: 'Substances Inhalées (Colle, Solvants)',
      titleAr: 'المواد المستنشقة (السيليسيون، المذيبات)',
      subtitle: 'Les questions suivantes concernent les INHALANTS narcotiques (colle, gaz, essence, etc.).',
      subtitleAr: 'تتعلق الأسئلة التالية بالمواد المستنشقة (السيليسيون، الغراء، الغاز، البنزين، إلخ).',
      color: 'bg-rose-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.M01" fr="À votre avis, s'il vous était possible d'obtenir des solvants/colles pour les inhaler, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على السيليسيون/المذيبات للاستنشاق، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_m.access_difficulty} onChange={handleChange('section_m')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.M03" fr="Au cours de votre vie, combien de fois avez-vous inhalé des solvants ou colles pour vous droguer ?" ar="خلال حياتك، كم مرة استنشقت السيليسيون أو الغراء للانتشاء؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_m.lifetime_freq} onChange={handleChange('section_m')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.M04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous inhalé des solvants ou colles ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استنشقت المواد المذيبة؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_m.months_12_freq} onChange={handleChange('section_m')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION N
    {
      id: 'section_n',
      letter: 'N',
      title: 'Autres Substances Narcotiques',
      titleAr: 'مواد مخدرة أخرى',
      subtitle: 'Les questions suivantes concernent autres substances narcotiques.',
      subtitleAr: 'تتعلق الأسئلة التالية بالمواد المخدرة والأدوية الأخرى.',
      color: 'bg-teal-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.N01" fr="Avez-vous déjà consommé des cannabinoïdes de synthèse (Spice, K2...) ?" ar="هل سبق لك استهلاك القنب الاصطناعي (Spice, K2...)؟" isRTL={isRTL} />
            <VerticalChoiceList name="synthetic_cannabinoids" value={data.section_n.synthetic_cannabinoids} onChange={handleChange('section_n')} options={YES_NO} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.N02" fr="Avez-vous déjà consommé des cathinones de synthèse (sels de bain...) ?" ar="هل سبق لك استهلاك الكاثينونات الاصطناعية؟" isRTL={isRTL} />
            <VerticalChoiceList name="synthetic_cathinones" value={data.section_n.synthetic_cathinones} onChange={handleChange('section_n')} options={YES_NO} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION P
    {
      id: 'section_p',
      letter: 'P',
      title: 'Nouvelles Substances Psychoactives (NSP)',
      titleAr: 'المواد النفسية الجديدة (NSP)',
      subtitle: 'Les questions suivantes concernent les nouvelles substances narcotiques, qui sont aussi efficaces que les drogues interdites comme le cannabis ou l’ecstasy, et qui sont maintenant disponibles. Ces substances sont appelées drogues légales ou préparations chimiques (keta, spica, Meo Meo, Flakka, superman...). Nous pouvons les trouver sous différentes formes comme les mélanges à base de plantes, poudres, cristaux, pilules, encens.',
      subtitleAr: 'تتعلق الأسئلة التالية بالمواد النفسية والمخدرة الجديدة (NPS) مثل الخلطات العشبية والبلورات والمستحضرات الكيميائية (سبايس، كيتامين، إلخ).',
      color: 'bg-slate-800',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.P01" fr="Au cours de votre vie, avez-vous consommé une substance fictive (Mebrobamate/Relevin) ?" ar="خلال حياتك، هل استهلكت مادة وهمية (Mebrobamate/Relevin)؟" isRTL={isRTL} />
            <VerticalChoiceList name="fictive_substance_consumption" value={data.section_p.fictive_substance_consumption} onChange={handleChange('section_p')} options={YES_NO} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.P02" fr="Au cours de votre vie, combien de fois avez-vous pris d'autres médicaments ou drogues illicites ?" ar="خلال حياتك، كم مرة تناولت أدوية أخرى أو مخدرات غير قانونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_p.lifetime_freq} onChange={handleChange('section_p')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION Q
    {
      id: 'section_q',
      letter: 'Q',
      title: 'Perception des Risques et Demande d’Aide',
      titleAr: 'إدراك المخاطر وطلب المساعدة',
      subtitle: 'Les questions suivantes concernent votre avis sur la consommation de substances narcotiques.',
      subtitleAr: 'تتعلق الأسئلة التالية برأيك وتقييمك لمخاطر استهلاك المواد المخدرة ومصادر طلب المساعدة.',
      color: 'bg-indigo-950',
      content: (
        <div className="space-y-12">
          <GridQuestion
            title="À votre avis, quel est le niveau de risque pour une personne qui :"
            titleAr="حسب رأيك، ما هو مستوى الخطر على شخص يقوم بــ:"
            code="C.Q01"
            isRTL={isRTL}
            options={RISK_LEVELS}
            values={data.section_q.risk_perceptions}
            onChange={(key, val) => updateCheck('section_q', 'risk_perceptions', key, val)}
            items={[
              ['cigs_regular', '(C.Q01a) Fume un ou plusieurs paquets de cigarettes par jour', 'يدخن علبة سجائر أو أكثر يومياً'],
              ['alcohol_weekend', '(C.Q01b) Boit 4 ou 5 verres d\'alcool presque chaque week-end', 'يشرب 4 أو 5 كؤوس كحول كل عطلة أسبوع تقريباً'],
              ['cannabis_try', '(C.Q01c) Essaie le cannabis (Zatla) une ou deux fois', 'يجرب الزطلة مرة أو مرتين'],
              ['cannabis_regular', '(C.Q01d) Fume du cannabis régulièrement', 'يدخن الزطلة بانتظام'],
              ['ecigs_regular', '(C.Q01e) Utilise la cigarette électronique tous les jours', 'يستعمل السيجارة الإلكترونية يومياً'],
            ]}
          />
        </div>
      ),
    },

    // SECTION R
    {
      id: 'section_r',
      letter: 'R',
      title: 'Réseaux Sociaux et Internet',
      titleAr: 'شبكات التواصل الاجتماعي والإنترنت',
      subtitle: 'Les questions suivantes concernent les RESEAUX SOCIAUX (WhatsApp, Instagram, Facebook, Blogs, Snapchat, Skype, Twitter, Hangouts, etc.).',
      subtitleAr: 'تتعلق الأسئلة التالية باستخدام شبكات التواصل الاجتماعي (واتساب، إنستغرام، فيسبوك، سناب شات، تيك توك، إلخ).',
      color: 'bg-blue-950',
      content: (
        <div className="space-y-12">
          <GridQuestion
            title="Au cours des 30 DERNIERS JOURS, combien d'heures par jour avez-vous passées sur les réseaux sociaux :"
            titleAr="خلال الـ 30 يوماً الأخيرة، كم ساعة في اليوم قضيتها على شبكات التواصل:"
            code="C.R01"
            isRTL={isRTL}
            options={FREQ_DIGITAL}
            values={data.section_r.hours_per_day_breakdown}
            onChange={(key, val) => updateCheck('section_r', 'hours_per_day_breakdown', key, val)}
            items={[
              ['school_days', "(C.R01a) Les jours d'école (du lundi au vendredi)", 'أيام الدراسة'],
              ['non_school_days', "(C.R01b) Les jours de congé ou week-ends", 'أيام العطل ونهاية الأسبوع'],
            ]}
          />
          <GridQuestion
            title="Dans quelle mesure êtes-vous d'accord avec les affirmations suivantes :"
            titleAr="إلى أي مدى توافق على العبارات التالية:"
            code="C.R02"
            isRTL={isRTL}
            options={AGREEMENT_SCALE_PAPER}
            values={data.section_r.agreement}
            onChange={(key, val) => updateCheck('section_r', 'agreement', key, val)}
            items={[
              ['preoccupied', "(C.R02a) Je ne peux pas m'empêcher de penser aux réseaux sociaux", 'لا أستطيع التوقف عن التفكير في شبكات التواصل'],
              ['neglect', "(C.R02b) J'ai négligé d'autres activités à cause des réseaux sociaux", 'أهملت أنشطة أخرى بسبب شبكات التواصل'],
              ['bad_mood', '(C.R02c) Je me sens irritable ou contrarié(e) si je ne peux pas y accéder', 'أشعر بالغضب أو الانزعاج إذا لم أتمكن من الدخول'],
            ]}
          />
        </div>
      ),
    },

    // SECTION S
    {
      id: 'section_s',
      letter: 'S',
      title: 'Jeux Vidéo (Gaming)',
      titleAr: 'ألعاب الفيديو (Gaming)',
      subtitle: 'Les questions suivantes concernent les JEUX VIDEOS (stratégie, puzzle, aventure, football, guerre, etc.) que vous pouvez jouer sur ordinateur, tablette, console, smartphone ou autre appareil électronique.',
      subtitleAr: 'تتعلق الأسئلة التالية بألعاب الفيديو (استراتيجية، مغامرات، كرة قدم، حرب، إلخ) على الحاسوب أو الهاتف أو المنصات.',
      color: 'bg-cyan-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.S01" fr="Au cours des 30 DERNIERS JOURS, combien d'heures en moyenne par jour avez-vous passé sur les jeux vidéo les JOURS D'ÉCOLE ?" ar="خلال الـ 30 يوماً الأخيرة، كم ساعة في اليوم قضيتها في ألعاب الفيديو أيام الدراسة؟" isRTL={isRTL} />
            <VerticalChoiceList name="hours_per_day_school" value={data.section_s.hours_per_day_school} onChange={handleChange('section_s')} options={FREQ_DIGITAL} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.S02" fr="Au cours des 30 DERNIERS JOURS, combien d'heures en moyenne par jour avez-vous passé sur les jeux vidéo les JOURS DE CONGÉ / WEEK-END ?" ar="خلال الـ 30 يوماً الأخيرة، كم ساعة في اليوم قضيتها في ألعاب الفيديو أيام العطل ونهاية الأسبوع؟" isRTL={isRTL} />
            <VerticalChoiceList name="hours_per_day_non_school" value={data.section_s.hours_per_day_non_school} onChange={handleChange('section_s')} options={FREQ_DIGITAL} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Dans quelle mesure êtes-vous d'accord ou en désaccord avec les avis suivants concernant les jeux vidéo :"
            titleAr="إلى أي مدى أنت ضد أو مع الآراء الموالية عن ألعاب الفيديو؟"
            code="C.S03"
            isRTL={isRTL}
            options={AGREEMENT_SCALE_CS03}
            values={data.section_s.agreement}
            onChange={(key, val) => updateCheck('section_s', 'agreement', key, val)}
            items={[
              ['a', '(C.S03a) Je pense que je passe trop de temps sur les jeux vidéo', 'أعتقد أني أقضي وقتاً كبيراً في ألعاب الفيديو'],
              ['b', '(C.S03b) Je deviens de mauvaise humeur si je ne peux pas jouer', 'أصبح سيء المزاج إذا لم أتمكن من اللعب'],
              ['c', '(C.S03c) Mes parents me reprochent de trop jouer', 'يعاتبني والداي على قضاء وقت طويل في اللعب'],
            ]}
          />
        </div>
      ),
    },

    // SECTION T
    {
      id: 'section_t',
      letter: 'T',
      title: 'Jeux d’Argent et de Hasard (Gambling)',
      titleAr: 'ألعاب الحظ والمراهنات',
      subtitle: 'Les questions suivantes Concernent les jeux d’argent – jeux de chance pour gagner de l’argent (machine à sous, jeu de cartes, dés, Lotterie, paris sportifs, etc.) que ce soit virtuellement, sur Internet si vous utilisez un appareil personnel, un téléphone mobile, une tablette, etc., ou réellement : promosport ou les espaces de jeux d’argent (Gambling Terminals).',
      subtitleAr: 'تتعلق الأسئلة التالية بألعاب القمار والرهان لكسب المال (البروموسبور، الرهانات الرياضية، ألعاب الورق، إلخ) سواء عبر الإنترنت أو في المحلات.',
      color: 'bg-orange-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.T01" fr="Combien de fois avez-vous joué à des jeux d'argent durant les 12 DERNIERS MOIS ?" ar="كم مرة لعبت القمار / شاركت في مراهنات خلال الـ 12 شهراً الأخيرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_t.months_12_freq} onChange={handleChange('section_t')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à ces jeux d’argent EN RÉEL (kiosques, locaux...) :"
            titleAr="خلال الـ 12 شهراً الأخيرة، كم مرة شاركت في هذه الألعاب واقعياً (محلات، كشك...):"
            code="C.T02"
            isRTL={isRTL}
            options={FREQ_GAMBLING_GRID}
            values={data.section_t.offline_games}
            onChange={(key, val) => updateCheck('section_t', 'offline_games', key, val)}
            items={[
              ['promosport', '(C.T02a) Promosport / Paris sportifs réels', 'بروموسبور / رهانات رياضية واقعية'],
              ['cards_dice', '(C.T02b) Jeux de cartes ou de dés avec argent', 'ألعاب الورق أو النرد بالمال'],
              ['lottery', '(C.T02c) Loterie / Grattage (Hadh...)', 'اليانصيب / أوراق الحك'],
            ]}
          />
          <GridQuestion
            title="Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à des jeux d’argent EN LIGNE (Internet, téléphone) :"
            titleAr="خلال الـ 12 شهراً الأخيرة، كم مرة شاركت في هذه الألعاب على الإنترنت (هاتف، حاسوب):"
            code="C.T03"
            isRTL={isRTL}
            options={FREQ_GAMBLING_GRID}
            values={data.section_t.online_games}
            onChange={(key, val) => updateCheck('section_t', 'online_games', key, val)}
            items={[
              ['online_sports', '(C.T03a) Paris sportifs en ligne (sites web, applications)', 'مراهنات رياضية عبر الإنترنت'],
              ['online_casino', '(C.T03b) Casino / Poker en ligne', 'كازينو أو بوكر عبر الإنترنت'],
            ]}
          />
          <div>
            <FieldLabel code="C.T04" fr="Avez-vous déjà ressenti le besoin de parier des sommes d'argent de plus en plus importantes ?" ar="هل شعرت يوماً بالحاجة إلى المراهنة بمبالغ مالية متزايدة؟" isRTL={isRTL} />
            <VerticalChoiceList name="felt_need_increase" value={data.section_t.felt_need_increase} onChange={handleChange('section_t')} options={YES_NO} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.T05" fr="Avez-vous déjà menti à vos parents ou à vos amis sur l'argent que vous aviez parié ?" ar="هل كذبت يوماً على والديك أو أصدقائك حول الأموال التي راهنت بها؟" isRTL={isRTL} />
            <VerticalChoiceList name="lied_about_it" value={data.section_t.lied_about_it} onChange={handleChange('section_t')} options={YES_NO} isRTL={isRTL} />
          </div>
          <CT06Question
            title="Questions d'évaluation sur les habitudes de jeu :"
            titleAr="أسئلة تقييمية حول عادات المقامرة واللعب بالمال:"
            code="C.T06"
            isRTL={isRTL}
            values={data.section_t.gambling_problems}
            onChange={(key, val) => updateCheck('section_t', 'gambling_problems', key, val)}
            items={[
              ['a', '(C.T06a) Combien de fois avez-vous rejoué pour vous refaire après avoir perdu ?', 'كم مرة أعدت اللعب لتعويض الخسارة؟'],
              ['b', "(C.T06b) Combien de fois avez-vous dépensé plus d'argent que prévu dans les paris ?", 'كم مرة أنفقت مالاً أكثر مما خططت له في الرهان؟'],
              ['c', "(C.T06c) Combien de fois vous êtes-vous senti coupable d'avoir parié ?", 'كم مرة شعرت بالذنب بسبب المراهنة؟'],
              ['d', "(C.T06d) Le jeu d'argent a-t-il déjà causé des disputes avec vos proches ?", 'هل تسببت ألعاب الحظ في خلافات مع أقاربك؟'],
              ['e', "(C.T06e) Avez-vous déjà emprunté de l'argent pour parier ?", 'هل اقترضت يوماً المال للمراهنة؟'],
            ]}
          />
        </div>
      ),
    },

    // SECTION U
    {
      id: 'section_u',
      letter: 'U',
      title: 'Violence et Sécurité',
      titleAr: 'العنف والسلامة',
      subtitle: 'Les questions suivantes concernent la violence :',
      subtitleAr: 'تتعلق الأسئلة التالية بحالات العنف والسلامة داخل وخارج المؤسسة التربوية :',
      color: 'bg-red-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.U01" fr="Au cours des 12 derniers mois, combien de fois vous êtes-vous battu(e) physiquement avec d'autres personnes ?" ar="كم مرة تشاجرت جسدياً خلال الـ 12 شهراً الماضية؟" isRTL={isRTL} />
            <VerticalChoiceList name="fights_12months" value={data.section_u.fights_12months} onChange={handleChange('section_u')} options={FIGHT_FREQUENCY} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.U02" fr="Quelles étaient les circonstances de la dernière bagarre ?" ar="ما هي ظروف الشجار الأخير؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="fight_circumstances"
              value={data.section_u.fight_circumstances}
              onChange={handleChange('section_u')}
              options={[
                ['1', "Je me battais avec quelqu'un (j'étais l'initiateur)", 'كنت أتشاجر مع شخص (أنا من بدأ)', 1],
                ['2', "Quelqu'un m'a agressé(e) et je me suis défendu(e)", 'اعتدى علي شخص ودافعت عن نفسي', 2],
                ['3', "C'était une bagarre de groupe", 'كان شجاراً جماعياً', 3],
                ['4', "Je ne me suis pas battu(e)", 'لم أتشاجر', 4],
              ]}
              isRTL={isRTL}
            />
          </div>
          <div>
            <FieldLabel code="C.U03" fr="Où s'est déroulée la dernière bagarre ?" ar="أين حدث الشجار الأخير؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="fight_location"
              value={data.section_u.fight_location}
              onChange={handleChange('section_u')}
              options={[
                ['1', "Dans l'établissement scolaire", 'داخل المؤسسة التربوية', 1],
                ['2', "Aux alentours du lycée / dans la rue", 'بمحيط المدرسة / في الشارع', 2],
                ['3', "Dans le quartier / près de chez moi", 'في الحي / قرب المنزل', 3],
                ['4', "Ailleurs", 'في مكان آخر', 4],
                ['5', "Non applicable (pas de bagarre)", 'غير منطبق', 5],
              ]}
              isRTL={isRTL}
            />
          </div>
          <div>
            <FieldLabel code="C.U04" fr="Le personnel éducatif est-il intervenu lors de cette bagarre ?" ar="هل تدخل الإطار التربوي لفض هذا الشجار؟" isRTL={isRTL} />
            <VerticalChoiceList name="staff_intervention" value={data.section_u.staff_intervention} onChange={handleChange('section_u')} options={YES_NO_DK} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION V
    {
      id: 'section_v',
      letter: 'V',
      title: 'Niveau de Stress Perçu (PSS-4)',
      titleAr: 'مستوى التوتر المدرك (PSS-4)',
      subtitle: 'Les questions suivantes concernent le niveau de stress perçu :',
      subtitleAr: 'تتعلق الأسئلة التالية بمستوى الضغط النفسي والشعور العام بالرفاه (مقياس PSS-4) :',
      color: 'bg-violet-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.V01" fr="Durant le mois passé, combien de fois avez-vous eu le sentiment de ne pas pouvoir contrôler les aspects importants de votre vie ?" ar="خلال الشهر الماضي، كم مرة شعرت بعدم القدرة على التحكم في الأمور المهمة في حياتك؟" isRTL={isRTL} />
            <VerticalChoiceList name="a" value={data.section_v.a} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.V02" fr="Durant le mois passé, combien de fois avez-vous eu confiance en votre capacité à gérer vos problèmes personnels ?" ar="خلال الشهر الماضي، كم مرة شعرت بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟" isRTL={isRTL} />
            <VerticalChoiceList name="b" value={data.section_v.b} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.V03" fr="Durant le mois passé, combien de fois avez-vous senti que les choses allaient selon vos désirs ?" ar="خلال الشهر الماضي، كم مرة شعرت بأن الأمور تسير وفق رغباتك؟" isRTL={isRTL} />
            <VerticalChoiceList name="c" value={data.section_v.c} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.V04" fr="Durant le mois passé, combien de fois avez-vous senti que les difficultés s’accumulaient au point de ne plus pouvoir les surmonter ?" ar="خلال الشهر الماضي، كم مرة شعرت بأن الصعوبات تتراكم لدرجة أنك لا تستطيع التغلب عليها؟" isRTL={isRTL} />
            <VerticalChoiceList name="d" value={data.section_v.d} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION Z
    {
      id: 'section_z',
      letter: 'Z',
      title: 'Validation de l\'Honnêteté',
      titleAr: 'تأكيد الصدق والصراحة',
      subtitle: 'Vous avez presque terminé de répondre à ce questionnaire, nous vous demandons de répondre le plus franchement possible aux deux questions restantes.',
      subtitleAr: 'لقد أوشكت على الانتهاء من ملء الاستبيان، نرجو منك الإجابة بكل صدق وصراحة على الأسئلة المتبقية.',
      color: 'bg-emerald-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.Z01" fr="Dans quelle mesure avez-vous répondu honnêtement aux questions concernant votre consommation d'alcool ?" ar="إلى أي مدى كنت صادقاً في إجاباتك المتعلقة باستهلاك الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="honesty_level"
              value={data.section_z.honesty_level}
              onChange={handleChange('section_z')}
              options={[
                ['1', "J'ai déjà déclaré ma consommation avec honnêteté", 'صرحت باستهلاكي بكل صدق', 1],
                ['2', "Oui, sans aucun doute, j'ai répondu honnêtement", 'نعم، بكل تأكيد أجبت بصدق', 2],
                ['3', "Probablement oui", 'على الأرجح نعم', 3],
                ['4', "Probablement pas", 'على الأرجح لا', 4],
                ['5', "Non, je n'ai pas été honnête", 'لا، لم أكن صادقاً', 5],
              ]}
              isRTL={isRTL}
            />
          </div>
          <div>
            <FieldLabel code="C.Z02" fr="Si vous aviez consommé du cannabis (Zatla), l'auriez-vous dit dans ce questionnaire ?" ar="لو أنك استهلكت القنب الهندي (الزطلة)، هل كنت ستصرح بذلك في هذا الاستبيان؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="honesty_cannabis"
              value={data.section_z.honesty_cannabis}
              onChange={handleChange('section_z')}
              options={[
                ['1', "J'ai déjà déclaré en avoir consommé", 'صرحت بالفعل باستهلاكي له', 1],
                ['2', "Certainement oui", 'نعم بكل تأكيد', 2],
                ['3', "Probablement oui", 'على الأرجح نعم', 3],
                ['4', "Probablement non", 'على الأرجح لا', 4],
                ['5', "Certainement non", 'بالتأكيد لا', 5],
              ]}
              isRTL={isRTL}
            />
          </div>
        </div>
      ),
    },
  ];

  const isHidden = (code) => {
    return Array.isArray(dynamicConfigs) && dynamicConfigs.some((q) => q.code === code && q.is_hidden);
  };

  const staticProcessed = RAW_SECTIONS.filter((s) => s.id === 'section_z' || !isHidden(s.id)).map((s) => {
    const sectionDynQuestions = Array.isArray(dynamicConfigs)
      ? dynamicConfigs.filter((q) => q.is_dynamic && !q.is_hidden && q.question_type !== 'SECTION' && q.section === s.id)
      : [];

    let contentNode = s.content;
    if (sectionDynQuestions.length > 0 || isEditMode) {
      contentNode = (
        <>
          {s.content}
          {(sectionDynQuestions.length > 0 || isEditMode) && (
            <div className={`mt-12 pt-12 border-t-2 border-dashed ${isEditMode ? 'border-blue-200' : 'border-slate-200'}`}>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-slate-500">
                {isRTL ? 'أسئلة إضافية' : 'Questions Personnalisées'}
              </h4>
              {sectionDynQuestions.map((q) => renderDynamicQuestionCard(q))}
              {isEditMode && (
                <button
                  onClick={() =>
                    setEditingItem({
                      id: null,
                      type: 'QUESTION',
                      section: s.id,
                      data: { code: '', label_fr: '', question_type: 'TEXT', section: s.id, is_dynamic: true, options_json: [] },
                    })
                  }
                  className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} /> {isRTL ? 'إضافة سؤال جديد في هذا القسم' : 'Ajouter une question dans cette section'}
                </button>
              )}
            </div>
          )}
        </>
      );
    }

    const overriddenTitle = Array.isArray(dynamicConfigs)
      ? dynamicConfigs.find((q) => 
          (q.code?.toLowerCase() === s.id?.toLowerCase() || 
           q.code?.toLowerCase() === s.letter?.toLowerCase() || 
           q.code?.toLowerCase() === `sec_${s.letter?.toLowerCase()}`) && 
          q.question_type === 'SECTION'
        )
      : null;

    const customSubtitleFr = (overriddenTitle && Array.isArray(overriddenTitle.options_json) && overriddenTitle.options_json[0])
      ? overriddenTitle.options_json[0]
      : s.subtitle;

    const customSubtitleAr = (overriddenTitle && Array.isArray(overriddenTitle.options_json) && overriddenTitle.options_json[1])
      ? overriddenTitle.options_json[1]
      : s.subtitleAr;

    return {
      ...s,
      title: overriddenTitle ? overriddenTitle.label_fr : s.title,
      titleAr: overriddenTitle && overriddenTitle.label_ar ? overriddenTitle.label_ar : s.titleAr,
      subtitle: customSubtitleFr,
      subtitleAr: customSubtitleAr,
      actionButtons: isEditMode ? (
        <button
          onClick={() => {
            setModalTab('CONFIG');
            setEditingItem({
              id: s.id,
              type: 'SECTION',
              section: s.id,
              data: {
                code: s.id,
                label_fr: overriddenTitle?.label_fr || s.title,
                label_ar: overriddenTitle?.label_ar || s.titleAr,
                subtitle_fr: customSubtitleFr,
                subtitle_ar: customSubtitleAr,
                question_type: 'SECTION',
                section: s.id,
                is_dynamic: false,
              },
            });
          }}
          className="px-3 py-1.5 bg-white text-slate-900 rounded-lg shadow font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
        >
          <Pencil size={13} /> {isRTL ? 'تعديل العنوان والوصف' : 'Modifier titre & description'}
        </button>
      ) : null,
      content: contentNode,
    };
  });

  const dynamicSections = Array.isArray(dynamicConfigs)
    ? dynamicConfigs.filter((q) => q.is_dynamic && !q.is_hidden && q.question_type === 'SECTION' && q.code.toLowerCase() !== 'section_z' && q.code.toLowerCase() !== 'z')
    : [];

  const dynamicProcessed = dynamicSections.map((sec) => {
    const secQuestions = Array.isArray(dynamicConfigs)
      ? dynamicConfigs.filter((q) => q.is_dynamic && !q.is_hidden && q.question_type !== 'SECTION' && q.section === sec.code)
      : [];

    return {
      id: sec.code,
      letter: sec.code.replace('SEC_', '').replace('section_', '').toUpperCase(),
      title: sec.label_fr,
      titleAr: sec.label_ar || sec.label_fr,
      color: 'bg-indigo-950',
      actionButtons: isEditMode ? (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingItem({ id: sec.code, type: 'SECTION', section: sec.code, data: sec })}
            className="px-3 py-1.5 bg-white text-slate-900 rounded-lg shadow font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
          >
            <Edit2 size={13} /> {isRTL ? 'تعديل' : 'Modifier'}
          </button>
          <button
            onClick={() => handleDeleteDynamic(sec.code, 'SECTION')}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg shadow font-bold text-xs flex items-center gap-1.5 hover:bg-rose-700 cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) : null,
      content: (
        <div className="space-y-6">
          {secQuestions.map((q) => renderDynamicQuestionCard(q))}
          {isEditMode && (
            <button
              onClick={() =>
                setEditingItem({
                  id: null,
                  type: 'QUESTION',
                  section: sec.code,
                  data: { code: '', label_fr: '', question_type: 'TEXT', section: sec.code, is_dynamic: true, options_json: [] },
                })
              }
              className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> {isRTL ? 'إضافة سؤال جديد' : 'Ajouter une question'}
            </button>
          )}
        </div>
      ),
    };
  });

  const filteredSections = [...staticProcessed, ...dynamicProcessed];

  if (isEditMode) {
    filteredSections.push({
      id: 'add_section',
      letter: '+',
      title: isRTL ? 'قسم جديد' : 'Nouvelle Section',
      titleAr: 'قسم جديد',
      color: 'bg-slate-700',
      content: (
        <div className="p-12 border-4 border-dashed border-slate-300 rounded-3xl flex items-center justify-center">
          <button
            onClick={() =>
              setEditingItem({
                id: null,
                type: 'SECTION',
                section: '',
                data: { code: '', label_fr: '', label_ar: '', question_type: 'SECTION', is_dynamic: true },
              })
            }
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> {isRTL ? 'إنشاء قسم جديد' : 'Créer une nouvelle section'}
          </button>
        </div>
      ),
    });
  }

  const SECTIONS = filteredSections;
  const currentSection = SECTIONS[step] || SECTIONS[0];
  const progressPercent = Math.round(((step + 1) / SECTIONS.length) * 100);

  const editContextValue = {
    isEditMode,
    dynamicConfigs,
    onEditQuestion: (code, labelFr, labelAr, defaultOptions = [], defaultType, defaultItems = []) => {
      const cleanCode = String(code || '').replace(/[\s._-]+/g, '').toUpperCase();
      const overridden = Array.isArray(dynamicConfigs)
        ? dynamicConfigs.find((q) => String(q.code || '').replace(/[\s._-]+/g, '').toUpperCase() === cleanCode)
        : null;
      const meta = getQuestionMeta(code);

      // 1. Resolve Initial Options (Columns)
      let initialOptions = [];
      if (overridden && Array.isArray(overridden.options_json) && overridden.options_json.length > 0) {
        initialOptions = overridden.options_json;
      } else if (Array.isArray(defaultOptions) && defaultOptions.length > 0) {
        initialOptions = defaultOptions;
      } else if (meta && Array.isArray(meta.options) && meta.options.length > 0) {
        initialOptions = meta.options;
      }

      // 2. Resolve Initial Items (Rows)
      let initialItems = [];
      if (overridden && Array.isArray(overridden.items_json) && overridden.items_json.length > 0) {
        initialItems = overridden.items_json;
      } else if (Array.isArray(defaultItems) && defaultItems.length > 0) {
        initialItems = defaultItems;
      } else if (meta && Array.isArray(meta.items) && meta.items.length > 0) {
        initialItems = meta.items;
      }

      // 3. Resolve Question Nature / Type
      let detectedType = 'RADIO';
      if (overridden?.question_type) {
        detectedType = overridden.question_type;
      } else if (defaultType) {
        detectedType = defaultType;
      } else if (meta?.type) {
        detectedType = meta.type;
      } else if (initialItems.length > 0) {
        detectedType = 'MATRIX';
      } else if (initialOptions.length > 0) {
        detectedType = 'RADIO';
      } else if (cleanCode === 'DATE' || cleanCode.includes('DATE') || cleanCode === 'CA02' || cleanCode.includes('MONTH') || cleanCode.includes('YEAR')) {
        detectedType = 'NUMBER';
      } else {
        detectedType = 'TEXT';
      }

      // Guarantee non-empty defaults if RADIO or MATRIX
      if (detectedType === 'RADIO' && initialOptions.length === 0) {
        if (meta && Array.isArray(meta.options) && meta.options.length > 0) {
          initialOptions = meta.options;
        } else {
          initialOptions = [
            ['1', 'Oui', 'نعم', 1],
            ['2', 'Non', 'لا', 2],
          ];
        }
      }
      if (detectedType === 'MATRIX') {
        if (initialOptions.length === 0) {
          initialOptions = (meta && Array.isArray(meta.options) && meta.options.length > 0) ? meta.options : [
            ['1', 'Jamais', 'أبداً', 1],
            ['2', 'Parfois', 'أحياناً', 2],
            ['3', 'Souvent', 'غالباً', 3],
          ];
        }
        if (initialItems.length === 0) {
          initialItems = (meta && Array.isArray(meta.items) && meta.items.length > 0) ? meta.items : [
            ['a', 'Élément A', 'عنصر أ'],
            ['b', 'Élément B', 'عنصر ب'],
          ];
        }
      }

      setModalTab('CONFIG');
      setEditingItem({
        id: code,
        type: 'QUESTION',
        section: currentSection?.id || '',
        data: {
          code: overridden?.code || code,
          label_fr: overridden?.label_fr || labelFr,
          label_ar: overridden?.label_ar || labelAr || '',
          question_type: detectedType,
          section: overridden?.section || currentSection?.id || '',
          options_json: initialOptions,
          items_json: initialItems,
          is_dynamic: overridden?.is_dynamic ?? false,
          is_hidden: overridden?.is_hidden ?? false,
          order: overridden?.order ?? 100,
        },
      });
    },
    onDeleteQuestion: async (code) => {
      if (!window.confirm(isRTL ? `هل تريد إخفاء السؤال "${code}"؟` : `Voulez-vous masquer la question "${code}" ?`)) return;
      try {
        await api.post('dynamic-questions/', {
          code,
          label_fr: code,
          question_type: 'TEXT',
          section: currentSection.id,
          is_hidden: true,
          is_dynamic: false,
        });
        fetchConfig();
      } catch (err) {
        console.error(err);
      }
    },
  };


  return (
    <EditModeContext.Provider value={editContextValue}>
      <div className={`min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <ChoiceInteractionStyles />

        <div className="max-w-4xl mx-auto">
          {/* Top Bar with Back button, Mode Édition Toggle, Active Report, Language Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
              {isRTL ? 'رجوع' : 'Retour'}
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {/* Always visible Mode Édition Button */}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  isEditMode
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
                title="Activer ou désactiver le mode édition des questions"
              >
                <Pencil size={14} /> {isEditMode ? (isRTL ? 'إلغاء وضع التعديل' : 'Quitter Édition') : (isRTL ? 'وضع التعديل' : 'Mode Édition')}
              </button>

              {activeReport && (
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800">
                  {isRTL ? 'التقرير النشط:' : 'Rapport actif :'} {activeReport.establishment_name}
                </div>
              )}

              <button
                onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                className="px-4 py-2 bg-white text-blue-600 font-black text-sm rounded-xl border-2 border-blue-200 shadow-sm hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {lang === 'fr' ? 'العربية' : 'Français'}
              </button>
            </div>
          </div>

          {/* Edit Mode Top Banner */}
          {isEditMode && (
            <div className="mb-6 p-6 bg-blue-600 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/15 rounded-2xl shrink-0">
                  <Pencil size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-wider">
                    {isRTL ? 'وضع التعديل النشط' : 'Mode Édition Dynamique Actif'}
                  </h3>
                  <p className="text-xs text-white/80 font-medium mt-0.5">
                    {isRTL
                      ? 'يمكنك تعديل أي سؤال، تغيير الخيارات، أو إضافة أسئلة جديدة.'
                      : "Vous pouvez éditer n'importe quelle question (libellé FR/AR, type), modifier les sections ou ajouter de nouvelles questions."}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setEditingItem({
                    id: null,
                    type: 'QUESTION',
                    section: currentSection.id,
                    data: { code: '', label_fr: '', question_type: 'TEXT', section: currentSection.id, is_dynamic: true, options_json: [] },
                  })
                }
                className="px-4 py-3 bg-white text-blue-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-blue-50 shadow-md flex items-center gap-2 shrink-0 transition-all hover:scale-105 cursor-pointer"
              >
                <Plus size={16} /> {isRTL ? 'إضافة سؤال' : 'Ajouter une question'}
              </button>
            </div>
          )}

          {/* Section Progress Dots Bar (Clickable for free navigation) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                {isRTL ? `القسم ${step + 1} من ${SECTIONS.length}` : `Section ${step + 1} sur ${SECTIONS.length}`}
              </span>
              <span className="text-xs font-bold text-blue-600">{progressPercent}%</span>
            </div>

            {/* Linear Progress Bar */}
            <div className="h-1.5 bg-slate-100 rounded-full w-full mb-3 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Clickable Dots / Section Pills */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
              {SECTIONS.map((s, i) => {
                const isActive = i === step;
                const isPassed = i < step;
                return (
                  <button
                    key={s.id || i}
                    onClick={() => {
                      setStep(i);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={isRTL ? s.titleAr : s.title}
                    className={`h-7 px-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                        : isPassed
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {s.letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questionnaire Form Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 sm:p-8">
              <SectionHeader
                letter={currentSection.letter}
                title={isRTL ? currentSection.titleAr : currentSection.title}
                subtitle={isRTL ? currentSection.subtitleAr : currentSection.subtitle}
                color={currentSection.color}
                actionButtons={currentSection.actionButtons}
              />

              {/* Content */}
              <div className="mt-8">
                {currentSection.content}
              </div>
            </div>

            {/* Error display */}
            {status.error && (
              <div className="mx-6 sm:mx-8 mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 font-bold text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <span>{status.error}</span>
              </div>
            )}

            {/* Success display */}
            {status.success && (
              <div className="mx-6 sm:mx-8 mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
                <CheckCircle2 size={20} className="shrink-0" />
                <span>{isRTL ? 'تم حفظ الاستبيان بنجاح!' : 'Questionnaire enregistré avec succès !'}</span>
              </div>
            )}

            {/* Navigation footer */}
            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setStep((prev) => Math.max(0, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft size={18} className={isRTL ? 'rotate-180' : ''} />
                  {isRTL ? 'السابق' : 'Précédent'}
                </button>

                {/* Save Draft Button */}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const draftKey = `sentinelle_draft_${reportIdParam || 'default'}`;
                      localStorage.setItem(draftKey, JSON.stringify({ data, step, timestamp: new Date().toISOString() }));
                      alert(isRTL ? 'تم حفظ المسودة بنجاح في المتصفح' : 'Brouillon sauvegardé avec succès.');
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 border-2 border-amber-300 bg-amber-50 text-amber-900 rounded-xl font-bold hover:bg-amber-100 transition-all text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                  title="Sauvegarder le questionnaire incomplet pour reprendre plus tard"
                >
                  <Save size={16} />
                  {isRTL ? 'حفظ مسودة' : 'Brouillon'}
                </button>
              </div>

              {step < SECTIONS.length - 1 ? (
                <button
                  onClick={() => {
                    setStep((prev) => Math.min(SECTIONS.length - 1, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
                >
                  {isRTL ? 'التالي' : 'Suivant'}
                  <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit()}
                  disabled={status.loading}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send size={18} />
                  {status.loading ? (isRTL ? 'جاري الإرسال...' : 'Envoi en cours...') : (isRTL ? 'تأكيد وإرسال' : 'Valider & Transmettre')}
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── DEV / ADMIN: Auto-fill floating button ─────────────────────────────── */}
        <div className="fixed bottom-6 left-6 z-[300]">
          <button
            onClick={() => setData(generateRandomData())}
            className="group flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-sm text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: '2px dashed rgba(255,255,255,0.3)' }}
            title="Outil de développement - Génère des réponses aléatoires cohérentes"
          >
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
            <span>{isRTL ? 'ملء تلقائي' : 'Auto-remplir'}</span>
          </button>
        </div>

        {/* Dynamic Question / Section Intelligent Editing Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-xs">
                    <Pencil size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900">
                        {editingItem.id ? (isRTL ? 'تعديل متقدم' : 'Édition Avancée') : (isRTL ? 'إنشاء جديد' : 'Nouvel Élément')}{' '}
                        {editingItem.type === 'SECTION' ? (isRTL ? 'للقسم' : 'de Section') : (isRTL ? 'للسؤال وخيارات الإجابة' : 'de Question & Réponses')}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        {editingItem.data.code || (isRTL ? 'جديد' : 'Nouveau')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {editingItem.type === 'SECTION'
                        ? (isRTL ? 'تعديل عنوان القسم والفقرة التعريفية' : 'Modifier le titre et le paragraphe d’introduction')
                        : (isRTL ? 'تعديل نص السؤال ونوعه وخيارات الإجابة المرتبطة به' : 'Gérer l’énoncé, la nature du champ et toutes les propositions de réponses')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setModalError(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Tabs (Only for Questions) */}
              {editingItem.type === 'QUESTION' && (
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalTab('CONFIG')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      modalTab === 'CONFIG'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Pencil size={14} /> {isRTL ? 'الإعدادات والخيارات' : 'Configuration & Réponses'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('PREVIEW')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      modalTab === 'PREVIEW'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 size={14} /> {isRTL ? 'معاينة حية' : 'Aperçu en Direct'}
                  </button>
                </div>
              )}

              {/* Modal Body */}
              <div className="space-y-6 flex-1">
                {/* SECTION FORM */}
                {editingItem.type === 'SECTION' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {isRTL ? 'الرمز التعريفي للقسم' : 'Code Section'}
                        </label>
                        <input
                          type="text"
                          maxLength={50}
                          value={editingItem.data.code}
                          disabled={!!editingItem.id}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, code: e.target.value.toLowerCase() },
                            })
                          }
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {isRTL ? 'الترتيب' : 'Ordre'}
                        </label>
                        <input
                          type="number"
                          value={editingItem.data.order || 100}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, order: parseInt(e.target.value) || 100 },
                            })
                          }
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {isRTL ? 'عنوان القسم (Français)' : 'Titre de la Section (Français)'}
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.label_fr}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, label_fr: e.target.value },
                          })
                        }
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none"
                        placeholder="ex: Consommation de Cigarettes et Tabac"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {isRTL ? 'عنوان القسم (العربية)' : 'Titre de la Section (Arabe)'}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={editingItem.data.label_ar || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, label_ar: e.target.value },
                          })
                        }
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none text-right"
                        placeholder="مثال: استهلاك السجائر والتبغ"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {isRTL ? 'الفقرة التمهيدية للقسم (Français)' : 'Paragraphe d\'introduction / Description (Français)'}
                      </label>
                      <textarea
                        rows={3}
                        value={editingItem.data.subtitle_fr || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, subtitle_fr: e.target.value },
                          })
                        }
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm focus:border-blue-600 outline-none"
                        placeholder="Les questions suivantes concernent..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {isRTL ? 'الفقرة التمهيدية للقسم (العربية)' : 'Paragraphe d\'introduction / Description (Arabe)'}
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={editingItem.data.subtitle_ar || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, subtitle_ar: e.target.value },
                          })
                        }
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm focus:border-blue-600 outline-none text-right"
                        placeholder="تتعلق الأسئلة التالية بـ..."
                      />
                    </div>
                  </div>
                )}

                {/* QUESTION FORM - TAB CONFIG */}
                {editingItem.type === 'QUESTION' && modalTab === 'CONFIG' && (
                  <div className="space-y-6">
                    {/* Identification & Interactive Question Nature Selector */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {isRTL ? 'الرمز الفريد (Code Unique)' : 'Code Unique (ex: C.A01, C.C01)'}
                        </label>
                        <input
                          type="text"
                          maxLength={50}
                          value={editingItem.data.code}
                          disabled={!!editingItem.id}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, code: e.target.value.toUpperCase() },
                            })
                          }
                          className="w-full sm:w-1/2 border-2 border-slate-200 rounded-xl px-3.5 py-2 font-mono font-bold text-sm focus:border-blue-600 outline-none disabled:bg-slate-100 disabled:text-slate-600"
                          placeholder="C.A01"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">
                          {isRTL ? 'طبيعة ونوع السؤال' : 'Nature / Type de Question'}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {/* Segment 1: Choix Multiples */}
                          <button
                            type="button"
                            onClick={() => {
                              let nextOpts = editingItem.data.options_json;
                              if (!Array.isArray(nextOpts) || nextOpts.length === 0) {
                                const meta = getQuestionMeta(editingItem.data.code);
                                nextOpts = (meta && meta.options && meta.options.length > 0)
                                  ? meta.options
                                  : [
                                      ['1', 'Oui', 'نعم', 1],
                                      ['2', 'Non', 'لا', 2],
                                    ];
                              }
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, question_type: 'RADIO', options_json: nextOpts },
                              });
                            }}
                            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 ${
                              editingItem.data.question_type === 'RADIO'
                                ? 'border-blue-600 bg-blue-50/90 text-blue-950 shadow-sm ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold flex items-center gap-1.5">
                                <Layers size={14} className={editingItem.data.question_type === 'RADIO' ? 'text-blue-600' : 'text-slate-400'} />
                                Choix Multiples
                              </span>
                              {editingItem.data.question_type === 'RADIO' && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold leading-tight">
                              Choix horizontaux simples
                            </span>
                          </button>

                          {/* Segment 2: Grille / Matrice */}
                          <button
                            type="button"
                            onClick={() => {
                              let nextOpts = editingItem.data.options_json;
                              if (!Array.isArray(nextOpts) || nextOpts.length === 0) {
                                const meta = getQuestionMeta(editingItem.data.code);
                                nextOpts = (meta && meta.options && meta.options.length > 0) ? meta.options : [
                                  ['1', 'Jamais', 'أبداً', 1],
                                  ['2', 'Parfois', 'أحياناً', 2],
                                  ['3', 'Souvent', 'غالباً', 3],
                                ];
                              }
                              let nextItems = editingItem.data.items_json;
                              if (!Array.isArray(nextItems) || nextItems.length === 0) {
                                const meta = getQuestionMeta(editingItem.data.code);
                                nextItems = (meta && meta.items && meta.items.length > 0) ? meta.items : [
                                  ['a', 'Élément A', 'عنصر أ'],
                                  ['b', 'Élément B', 'عنصر ب'],
                                ];
                              }
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, question_type: 'MATRIX', options_json: nextOpts, items_json: nextItems },
                              });
                            }}
                            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 ${
                              editingItem.data.question_type === 'MATRIX'
                                ? 'border-blue-600 bg-blue-50/90 text-blue-950 shadow-sm ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold flex items-center gap-1.5">
                                <Grid size={14} className={editingItem.data.question_type === 'MATRIX' ? 'text-blue-600' : 'text-slate-400'} />
                                Grille / Matrice
                              </span>
                              {editingItem.data.question_type === 'MATRIX' && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold leading-tight">
                              Tableau lignes & colonnes
                            </span>
                          </button>

                          {/* Segment 3: Champ Numérique */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, question_type: 'NUMBER' },
                              });
                            }}
                            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 ${
                              editingItem.data.question_type === 'NUMBER'
                                ? 'border-blue-600 bg-blue-50/90 text-blue-950 shadow-sm ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold flex items-center gap-1.5">
                                <HelpCircle size={14} className={editingItem.data.question_type === 'NUMBER' ? 'text-blue-600' : 'text-slate-400'} />
                                Champ Numérique
                              </span>
                              {editingItem.data.question_type === 'NUMBER' && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold leading-tight">
                              Date, Année, Compteurs
                            </span>
                          </button>

                          {/* Segment 4: Champ Texte Libre */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, question_type: 'TEXT' },
                              });
                            }}
                            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 ${
                              editingItem.data.question_type === 'TEXT'
                                ? 'border-blue-600 bg-blue-50/90 text-blue-950 shadow-sm ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold flex items-center gap-1.5">
                                <Edit2 size={14} className={editingItem.data.question_type === 'TEXT' ? 'text-blue-600' : 'text-slate-400'} />
                                Texte Libre
                              </span>
                              {editingItem.data.question_type === 'TEXT' && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold leading-tight">
                              Saisie manuelle texte
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Question Labels */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {isRTL ? 'نص السؤال بالفرنسية (Français)' : 'Énoncé de la question (Français)'}
                        </label>
                        <textarea
                          rows={2}
                          value={editingItem.data.label_fr}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, label_fr: e.target.value },
                            })
                          }
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none"
                          placeholder="Intitulé exact de la question..."
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {isRTL ? 'نص السؤال بالعربية (Arabe)' : 'Énoncé de la question (Arabe)'}
                        </label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          value={editingItem.data.label_ar || ''}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, label_ar: e.target.value },
                            })
                          }
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none text-right"
                          placeholder="نص السؤال بالعربية..."
                        />
                      </div>
                    </div>

                    {/* CHOIX MULTIPLES (RADIO) EDITOR */}
                    {editingItem.data.question_type === 'RADIO' && (
                      <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">
                        {/* Refined Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <h4 className="font-black text-sm text-slate-800">
                                {isRTL ? 'خيارات الإجابة (المقترحات)' : 'Propositions de réponses'}
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 whitespace-nowrap">
                                {Array.isArray(editingItem.data.options_json) ? editingItem.data.options_json.length : 0} {isRTL ? 'خيارات' : 'options'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {isRTL ? 'قم بتعديل الرمز، النصوص بالفرنسية والعربية، الترتيب أو الحذف.' : 'Modifiez le code, les libellés FR/AR, réordonnez ou supprimez chaque choix.'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const current = Array.isArray(editingItem.data.options_json) ? [...editingItem.data.options_json] : [];
                                const nextNum = current.length + 1;
                                const newOpt = [String(nextNum), `Option ${nextNum}`, `خيار ${nextNum}`, nextNum];
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, options_json: [...current, newOpt] },
                                });
                              }}
                              className="h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer transition-all"
                            >
                              <Plus size={16} /> {isRTL ? 'إضافة خيار' : 'Ajouter une option'}
                            </button>
                          </div>
                        </div>

                        {/* Options List */}
                        {Array.isArray(editingItem.data.options_json) && editingItem.data.options_json.length > 0 ? (
                          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            {editingItem.data.options_json.map((opt, idx) => {
                              const val = Array.isArray(opt) ? opt[0] : String(idx + 1);
                              const labelFr = Array.isArray(opt) ? opt[1] : String(opt);
                              const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : '';
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                                >
                                  {/* Order indicator & Reorder buttons */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => {
                                          const next = [...editingItem.data.options_json];
                                          const temp = next[idx - 1];
                                          next[idx - 1] = next[idx];
                                          next[idx] = temp;
                                          setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                        }}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                        title="Monter"
                                      >
                                        <ArrowUp size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === editingItem.data.options_json.length - 1}
                                        onClick={() => {
                                          const next = [...editingItem.data.options_json];
                                          const temp = next[idx + 1];
                                          next[idx + 1] = next[idx];
                                          next[idx] = temp;
                                          setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                        }}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                        title="Descendre"
                                      >
                                        <ArrowDown size={12} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Value Code Input */}
                                  <div className="shrink-0">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) => {
                                        const next = [...editingItem.data.options_json];
                                        next[idx] = [e.target.value, labelFr, labelAr, idx + 1];
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                      }}
                                      className="w-16 px-2.5 py-2 border-2 border-slate-200 rounded-xl text-xs font-mono font-black text-center bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                                      placeholder="Code"
                                      title="Code/Valeur (ex: 1, 2, M)"
                                    />
                                  </div>

                                  {/* French Label Input */}
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={labelFr}
                                      onChange={(e) => {
                                        const next = [...editingItem.data.options_json];
                                        next[idx] = [val, e.target.value, labelAr, idx + 1];
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                      }}
                                      className="w-full px-3.5 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-600 outline-none"
                                      placeholder="Libellé FR (ex: Oui, Jamais)"
                                    />
                                  </div>

                                  {/* Arabic Label Input */}
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      dir="rtl"
                                      value={labelAr}
                                      onChange={(e) => {
                                        const next = [...editingItem.data.options_json];
                                        next[idx] = [val, labelFr, e.target.value, idx + 1];
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                      }}
                                      className="w-full px-3.5 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-600 outline-none text-right"
                                      placeholder="النص بالعربية"
                                    />
                                  </div>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = editingItem.data.options_json.filter((_, i) => i !== idx);
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                    }}
                                    className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors cursor-pointer shrink-0"
                                    title="Supprimer cette réponse"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
                            <p className="text-xs font-bold text-slate-500">
                              {isRTL ? 'لم يتم تحديد خيارات إجابة لهذا السؤال بعد.' : 'Aucune proposition de réponse définie pour ce champ.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* GRILLE / MATRICE (MATRIX) DUAL EDITOR */}
                    {editingItem.data.question_type === 'MATRIX' && (
                      <div className="space-y-6">
                        {/* PART 1: HORIZONTAL COLUMNS (OPTIONS / SCALE) */}
                        <div className="p-5 bg-blue-50/50 rounded-2xl border-2 border-blue-200 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-200">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <h4 className="font-black text-sm text-blue-950 flex items-center gap-1.5">
                                  <Layers size={16} className="text-blue-600" />
                                  Colonnes Horizontales (Échelle des choix)
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-200 text-blue-900 whitespace-nowrap">
                                  {Array.isArray(editingItem.data.options_json) ? editingItem.data.options_json.length : 0} colonnes
                                </span>
                              </div>
                              <p className="text-xs text-blue-700 font-medium">
                                Les options qui s'affichent en haut du tableau en colonnes (ex: Jamais, 1-2 jours, 3-4 jours...).
                              </p>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = Array.isArray(editingItem.data.options_json) ? [...editingItem.data.options_json] : [];
                                  const nextNum = current.length + 1;
                                  const newOpt = [String(nextNum), `Option ${nextNum}`, `خيار ${nextNum}`, nextNum];
                                  setEditingItem({
                                    ...editingItem,
                                    data: { ...editingItem.data, options_json: [...current, newOpt] },
                                  });
                                }}
                                className="h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer transition-all"
                              >
                                <Plus size={16} /> Ajouter une colonne
                              </button>
                            </div>
                          </div>

                          {/* Columns List */}
                          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                            {Array.isArray(editingItem.data.options_json) && editingItem.data.options_json.map((opt, idx) => {
                              const val = Array.isArray(opt) ? opt[0] : String(idx + 1);
                              const labelFr = Array.isArray(opt) ? opt[1] : String(opt);
                              const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : '';
                              return (
                                <div key={idx} className="flex items-center gap-2 p-2.5 bg-white rounded-2xl border border-blue-200 shadow-xs">
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black text-[11px] flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => {
                                          const next = [...editingItem.data.options_json];
                                          const temp = next[idx - 1];
                                          next[idx - 1] = next[idx];
                                          next[idx] = temp;
                                          setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      >
                                        <ArrowUp size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === editingItem.data.options_json.length - 1}
                                        onClick={() => {
                                          const next = [...editingItem.data.options_json];
                                          const temp = next[idx + 1];
                                          next[idx + 1] = next[idx];
                                          next[idx] = temp;
                                          setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      >
                                        <ArrowDown size={11} />
                                      </button>
                                    </div>
                                  </div>

                                  <input
                                    type="text"
                                    value={val}
                                    onChange={(e) => {
                                      const next = [...editingItem.data.options_json];
                                      next[idx] = [e.target.value, labelFr, labelAr, idx + 1];
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                    }}
                                    className="w-16 px-2 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-mono font-bold text-center bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                                    placeholder="Code"
                                  />
                                  <input
                                    type="text"
                                    value={labelFr}
                                    onChange={(e) => {
                                      const next = [...editingItem.data.options_json];
                                      next[idx] = [val, e.target.value, labelAr, idx + 1];
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                    }}
                                    className="flex-1 px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-600 outline-none"
                                    placeholder="Libellé FR colonne"
                                  />
                                  <input
                                    type="text"
                                    dir="rtl"
                                    value={labelAr}
                                    onChange={(e) => {
                                      const next = [...editingItem.data.options_json];
                                      next[idx] = [val, labelFr, e.target.value, idx + 1];
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                    }}
                                    className="flex-1 px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-600 outline-none text-right"
                                    placeholder="النص بالعربية"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = editingItem.data.options_json.filter((_, i) => i !== idx);
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: next } });
                                    }}
                                    className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors cursor-pointer shrink-0"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* PART 2: VERTICAL ROWS (SUB-QUESTIONS / ITEMS) */}
                        <div className="p-5 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <h4 className="font-black text-sm text-emerald-950 flex items-center gap-1.5">
                                  <Grid size={16} className="text-emerald-600" />
                                  Lignes Verticales (Sous-questions à évaluer)
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-200 text-emerald-900 whitespace-nowrap">
                                  {Array.isArray(editingItem.data.items_json) ? editingItem.data.items_json.length : 0} lignes
                                </span>
                              </div>
                              <p className="text-xs text-emerald-700 font-medium">
                                Les éléments ou sous-questions évalués ligne par ligne (ex: a. Bière, b. Vin, c. Alcools forts...).
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const currentItems = Array.isArray(editingItem.data.items_json) ? [...editingItem.data.items_json] : [];
                                const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
                                const nextKey = letters[currentItems.length] || `item_${currentItems.length + 1}`;
                                const newItem = [nextKey, `Élément ${nextKey.toUpperCase()}`, `عنصر ${nextKey}`];
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, items_json: [...currentItems, newItem] },
                                });
                              }}
                              className="h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer transition-all"
                            >
                              <Plus size={16} /> Ajouter une ligne
                            </button>
                          </div>

                          {/* Rows List */}
                          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                            {Array.isArray(editingItem.data.items_json) && editingItem.data.items_json.map((item, idx) => {
                              const key = Array.isArray(item) ? item[0] : `item_${idx + 1}`;
                              const itemFr = Array.isArray(item) ? item[1] : String(item);
                              const itemAr = Array.isArray(item) && item[2] ? item[2] : '';
                              return (
                                <div key={idx} className="flex items-center gap-2 p-2.5 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => {
                                          const next = [...editingItem.data.items_json];
                                          const temp = next[idx - 1];
                                          next[idx - 1] = next[idx];
                                          next[idx] = temp;
                                          setEditingItem({ ...editingItem, data: { ...editingItem.data, items_json: next } });
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      >
                                        <ArrowUp size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === editingItem.data.items_json.length - 1}
                                        onClick={() => {
                                          const next = [...editingItem.data.items_json];
                                          const temp = next[idx + 1];
                                          next[idx + 1] = next[idx];
                                          next[idx] = temp;
                                          setEditingItem({ ...editingItem, data: { ...editingItem.data, items_json: next } });
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      >
                                        <ArrowDown size={11} />
                                      </button>
                                    </div>
                                  </div>

                                  <input
                                    type="text"
                                    value={key}
                                    onChange={(e) => {
                                      const next = [...editingItem.data.items_json];
                                      next[idx] = [e.target.value, itemFr, itemAr];
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, items_json: next } });
                                    }}
                                    className="w-16 px-2 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-mono font-bold text-center bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                                    placeholder="Clé"
                                  />
                                  <input
                                    type="text"
                                    value={itemFr}
                                    onChange={(e) => {
                                      const next = [...editingItem.data.items_json];
                                      next[idx] = [key, e.target.value, itemAr];
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, items_json: next } });
                                    }}
                                    className="flex-1 px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-600 outline-none"
                                    placeholder="Libellé FR ligne"
                                  />
                                  <input
                                    type="text"
                                    dir="rtl"
                                    value={itemAr}
                                    onChange={(e) => {
                                      const next = [...editingItem.data.items_json];
                                      next[idx] = [key, itemFr, e.target.value];
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, items_json: next } });
                                    }}
                                    className="flex-1 px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-600 outline-none text-right"
                                    placeholder="النص بالعربية"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = editingItem.data.items_json.filter((_, i) => i !== idx);
                                      setEditingItem({ ...editingItem, data: { ...editingItem.data, items_json: next } });
                                    }}
                                    className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors cursor-pointer shrink-0"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FALLBACK FOR NUMBER OR TEXT */}
                    {(editingItem.data.question_type === 'NUMBER' || editingItem.data.question_type === 'TEXT') && (
                      <div className="p-5 bg-amber-50/70 border-2 border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h5 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                            <HelpCircle size={15} className="text-amber-600" />
                            {editingItem.data.question_type === 'NUMBER' ? 'Mode Numérique Sélectionné' : 'Mode Saisie Libre Sélectionné'}
                          </h5>
                          <p className="text-xs text-amber-700 mt-0.5">
                            {editingItem.data.question_type === 'NUMBER'
                              ? 'Ce champ attend une saisie de nombre (ex: date, mois, année, compteur).'
                              : 'Ce champ attend une saisie texte libre par l\'utilisateur.'}{' '}
                            Pour configurer des choix prédéfinis ou une matrice de réponses, choisissez l'un des modes ci-contre.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const meta = getQuestionMeta(editingItem.data.code);
                              const defaultOpts = (meta && meta.options && meta.options.length > 0) ? meta.options : [
                                ['1', 'Oui', 'نعم', 1],
                                ['2', 'Non', 'لا', 2],
                              ];
                              setEditingItem({
                                ...editingItem,
                                data: {
                                  ...editingItem.data,
                                  question_type: 'RADIO',
                                  options_json: (Array.isArray(editingItem.data.options_json) && editingItem.data.options_json.length > 0)
                                    ? editingItem.data.options_json
                                    : defaultOpts,
                                },
                              });
                            }}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Layers size={14} /> Choix Multiples
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const meta = getQuestionMeta(editingItem.data.code);
                              setEditingItem({
                                ...editingItem,
                                data: {
                                  ...editingItem.data,
                                  question_type: 'MATRIX',
                                  options_json: (meta && meta.options && meta.options.length > 0) ? meta.options : [
                                    ['1', 'Jamais', 'أبداً', 1],
                                    ['2', 'Parfois', 'أحياناً', 2],
                                  ],
                                  items_json: (meta && meta.items && meta.items.length > 0) ? meta.items : [
                                    ['a', 'Élément A', 'عنصر أ'],
                                    ['b', 'Élément B', 'عنصر ب'],
                                  ],
                                },
                              });
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Grid size={14} /> Grille / Matrice
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* QUESTION FORM - TAB PREVIEW */}
                {editingItem.type === 'QUESTION' && modalTab === 'PREVIEW' && (
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        {isRTL ? 'معاينة تجريبية لشكل السؤال' : 'Rendu interactif du questionnaire'}
                      </span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {editingItem.data.question_type}
                      </span>
                    </div>

                    {/* Render live card preview */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-1">
                          {editingItem.data.code || 'CODE'}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900">
                          {isRTL
                            ? (editingItem.data.label_ar || editingItem.data.label_fr || 'نص السؤال')
                            : (editingItem.data.label_fr || 'Énoncé de la question')}
                        </h4>
                      </div>

                      {editingItem.data.question_type === 'RADIO' && Array.isArray(editingItem.data.options_json) && (
                        <div className="space-y-1.5 pt-2">
                          {editingItem.data.options_json.map((opt, idx) => {
                            const val = Array.isArray(opt) ? opt[0] : String(idx + 1);
                            const label = isRTL ? (Array.isArray(opt) && opt[2] ? opt[2] : opt[1]) : (Array.isArray(opt) ? opt[1] : String(opt));
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                              >
                                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                                  {val}
                                </span>
                                <div className="w-4 h-4 rounded border-2 border-slate-400 bg-white" />
                                <span className="text-xs font-bold text-slate-800">{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {editingItem.data.question_type === 'MATRIX' && (
                        <div className="mt-3 overflow-x-auto border-2 border-slate-100 rounded-2xl bg-white shadow-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 bg-slate-50/75">
                                <th className="p-3 text-xs font-black uppercase tracking-wider text-slate-500 w-1/3">
                                  {isRTL ? 'العنصر' : 'Élément'}
                                </th>
                                {(editingItem.data.options_json || []).map((opt, i) => {
                                  const val = Array.isArray(opt) ? opt[0] : opt;
                                  const labelFr = Array.isArray(opt) ? opt[1] : opt;
                                  const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
                                  return (
                                    <th key={val || i} className="p-2.5 text-center text-xs font-bold text-slate-600">
                                      {isRTL ? labelAr : labelFr}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(editingItem.data.items_json || []).map((item, rowIdx) => {
                                const key = Array.isArray(item) ? item[0] : item;
                                const itemFr = Array.isArray(item) ? item[1] : item;
                                const itemAr = Array.isArray(item) && item[2] ? item[2] : itemFr;
                                return (
                                  <tr key={key || rowIdx} className="hover:bg-slate-50/50">
                                    <td className="p-3 text-xs font-semibold text-slate-700">
                                      {isRTL ? itemAr : itemFr}
                                    </td>
                                    {(editingItem.data.options_json || []).map((opt, colIdx) => (
                                      <td key={colIdx} className="p-2.5 text-center">
                                        <input
                                          type="radio"
                                          disabled
                                          className="w-3.5 h-3.5 text-blue-600 border-slate-300"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {editingItem.data.question_type === 'TEXT' && (
                        <input
                          type="text"
                          disabled
                          placeholder={isRTL ? 'إدخال نص حر...' : 'Champ de saisie texte...'}
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 text-slate-500"
                        />
                      )}

                      {editingItem.data.question_type === 'NUMBER' && (
                        <input
                          type="number"
                          disabled
                          placeholder="0"
                          className="w-32 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 text-slate-500 font-bold"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* VISIBILITY & ORDER */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!editingItem.data.is_hidden}
                        onChange={() =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, is_hidden: !editingItem.data.is_hidden },
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {isRTL ? 'إظهار هذا العنصر في الاستبيان' : 'Actif et visible dans le questionnaire'}
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{isRTL ? 'الترتيب:' : 'Ordre:'}</span>
                    <input
                      type="number"
                      value={editingItem.data.order || 100}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, order: parseInt(e.target.value) || 100 },
                        })
                      }
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Alerts */}
                {modalError && (
                  <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3.5 flex items-center gap-2 text-rose-700 text-xs font-bold animate-shake">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {modalSuccess && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2 text-emerald-700 text-xs font-bold animate-fade-in">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{isRTL ? 'تم حفظ التعديلات بنجاح!' : 'Modifications enregistrées avec succès !'}</span>
                  </div>
                )}

                {/* Footer Action Buttons: Annuler & Enregistrer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null);
                      setModalError(null);
                    }}
                    className="px-5 py-2.5 border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={15} /> {isRTL ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    type="button"
                    disabled={savingDynamic}
                    onClick={handleSaveDynamic}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={15} /> {savingDynamic ? (isRTL ? 'جاري الحفظ...' : 'Enregistrement...') : (isRTL ? 'حفظ التعديلات' : 'Enregistrer les modifications')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Finalize Modal */}
        {showFinalizeModal && activeReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                {isRTL ? 'تم تسجيل الاستبيان!' : 'Questionnaire Enregistré !'}
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {isRTL
                  ? 'هل ترغب في إنهاء وإغلاق تقرير القسم الآن، أم إضافة استبيان آخر؟'
                  : 'Souhaitez-vous clôturer ce rapport de classe ou continuer à saisir d’autres questionnaires ?'}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFinalize}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors cursor-pointer"
                >
                  {isRTL ? 'إغلاق وتأكيد تقرير القسم' : 'Clôturer et Finaliser le Rapport'}
                </button>
                <button
                  onClick={() => {
                    setData(INITIAL_DATA);
                    setStep(0);
                    setShowFinalizeModal(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  {isRTL ? 'إدخال استبيان جديد لنفس القسم' : 'Saisir un autre élève pour cette classe'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EditModeContext.Provider>
  );
};

export default QuestionnaireForm;
