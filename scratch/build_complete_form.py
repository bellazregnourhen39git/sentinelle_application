import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

form_code = r'''import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Send, X, LogOut, ArrowLeft,
  Pencil, Plus, Trash2, Edit2, Save, LayoutDashboard, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import LocationSelectionModal from './dashboard/LocationSelectionModal';

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

const SquareMark = ({ checked, size = 18 }) => (
  <div
    className={`flex items-center justify-center border-2 border-slate-700 bg-white transition-colors duration-100 ${checked ? 'bg-slate-900 border-slate-900 text-white' : 'text-transparent'}`}
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <span className={`text-[12px] font-black leading-none ${checked ? 'opacity-100' : 'opacity-0'}`}>✕</span>
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

const VerticalChoiceList = ({ name, value, onChange, options = [], isRTL }) => {
  const selected = String(value ?? '');
  return (
    <div role="radiogroup" aria-label={name} className="mt-2 flex w-full flex-col gap-1">
      {options.map((opt, idx) => {
        const numVal = opt[3] ?? idx + 1;
        const checked = selected === String(opt[0]);
        const label = isRTL && opt[2] ? opt[2] : opt[1];
        return (
          <ChoiceButton
            key={opt[0]}
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
  const selected = String(value ?? '');
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse table-fixed text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="w-[42%] px-2 py-2 text-left text-[11px] font-bold text-slate-600">{isRTL ? 'العنصر' : 'Élément'}</th>
            {options.map((opt) => (
              <th key={opt[0]} className="px-1 py-2 text-center text-[10px] font-bold leading-tight text-slate-600">{isRTL && opt[2] ? opt[2] : opt[1]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="align-middle">
            <td className="px-2 py-2.5 font-medium leading-tight text-slate-700 break-words">({code}) {isRTL ? labelAr : label}</td>
            {options.map((opt, idx) => {
              const checked = selected === String(opt[0]);
              const numVal = opt[3] ?? idx + 1;
              return (
                <td key={opt[0]} className="px-0 py-0 text-center align-middle">
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

const FieldLabel = ({ code, fr, ar, isRTL }) => (
  <div className="mb-2">
    <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 inline-block">
      {code}
    </span>
    <span className="font-bold text-slate-800 text-base">
      {isRTL ? ar : fr}
    </span>
  </div>
);

const RadioGroup = ({ name, value, onChange, options, isRTL, horizontal = false }) => (
  <div className={`flex ${horizontal ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'} mt-2`}>
    {options.map((opt) => {
      const val = Array.isArray(opt) ? opt[0] : opt;
      const labelFr = Array.isArray(opt) ? opt[1] : opt;
      const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
      const checked = String(value) === String(val);
      return (
        <label
          key={val}
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

const CheckboxGroup = ({ values = [], onChange, options, isRTL }) => (
  <div className="flex flex-col gap-2 mt-2">
    {options.map((opt) => {
      const val = Array.isArray(opt) ? opt[0] : opt;
      const labelFr = Array.isArray(opt) ? opt[1] : opt;
      const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
      const checked = values.includes(val);
      return (
        <label
          key={val}
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
              if (e.target.checked) {
                onChange([...values, val]);
              } else {
                onChange(values.filter(v => v !== val));
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

const SelectField = ({ name, value, onChange, options, isRTL }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full mt-2 p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 focus:outline-none transition-colors"
  >
    <option value="">{isRTL ? '-- اختر إجابة --' : '-- Sélectionnez une réponse --'}</option>
    {options.map((opt) => {
      const val = Array.isArray(opt) ? opt[0] : opt;
      const labelFr = Array.isArray(opt) ? opt[1] : opt;
      const labelAr = Array.isArray(opt) && opt[2] ? opt[2] : labelFr;
      return (
        <option key={val} value={val}>
          {isRTL ? labelAr : labelFr}
        </option>
      );
    })}
  </select>
);

const GridQuestion = ({ title, titleAr, code, items, options, values = {}, onChange, isRTL }) => (
  <div className="mt-6 mb-8">
    <FieldLabel code={code} fr={title} ar={titleAr} isRTL={isRTL} />
    <div className="mt-3 overflow-x-auto border-2 border-slate-100 rounded-2xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/75">
            <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 w-1/3">
              {isRTL ? 'العنصر' : 'Élément'}
            </th>
            {options.map((opt) => {
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
          {items.map((item) => {
            const key = Array.isArray(item) ? item[0] : item;
            const itemFr = Array.isArray(item) ? item[1] : item;
            const itemAr = Array.isArray(item) && item[2] ? item[2] : itemFr;
            return (
              <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-700">
                  {isRTL ? itemAr : itemFr}
                </td>
                {options.map((opt) => {
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
'''

with open('scratch/merged_header_constants.js', 'w', encoding='utf-8') as f:
    f.write(form_code)

print("Saved header and constants successfully!")
