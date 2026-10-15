import React, { useState, useEffect } from 'react'; 
import { 
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Send, X, LogOut, ArrowLeft, 
  Pencil, Plus, Trash2, Edit2, Save, LayoutDashboard 
} from 'lucide-react'; 
import { motion } from 'framer-motion'; 
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import api from '../api'; 
import LocationSelectionModal from './dashboard/LocationSelectionModal'; 
 
// ─── Shared UI Components 
─────────────────────────────────────────────────────── 
 
const toArabicNumeral = (num) => { 
  const arabicNumbers = ['٠,' '١,' '٢,' '٣,' '٤,' '٥,' '٦,' '٧,' '٨,' '٩']; 
  return String(num).replace(/[0-9]/g, w => arabicNumbers[+w]); 
}; 
 
const SectionHeader = ({ letter, title, subtitle, color = 'bg-slate-900', actionButtons }) => ( 
  <div className={`${color} text-white rounded-2xl p-8 mb-8 relative overflow-hidden flex 
items-center justify-between`}> 
    <div className="absolute right-6 top-6 text-7xl font-black opacity-10 
select-none">{letter}</div> 
    <div className="relative z-10"> 
      <span className="text-xs font-black uppercase tracking-[3px] text-white/50 mb-2 
block">Section {letter}</span> 
      <h2 className="text-3xl font-extrabold leading-tight">{title}</h2> 
      {subtitle && <p className="text-white/60 mt-2 text-sm font-medium 
leading-relaxed">{subtitle}</p>} 
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
 
const FieldLabel = ({ code, fr, ar, isRTL }) => ( 
  <label className="block mb-3"> 
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block 
mb-1">{code}</span> 
    <span className="text-base font-semibold text-slate-800">{isRTL ? ar : fr}</span> 
  </label> 
); 
 
// ─── Paper-faithful square choice controls 
───────────────────────────────────── 
const ChoiceNumber = ({ value, isRTL }) => ( 
  <span className="font-mono text-[11px] font-bold text-slate-500 min-w-[1.25rem] 
text-center shrink-0"> 
    {isRTL ? toArabicNumeral(value) : value} 
  </span> 
); 
 
const SquareMark = ({ checked, size = 'md' }) => { 
  const cls = size === 'sm' ? 'h-[18px] w-[18px]' : 'h-5 w-5'; 
  return ( 
    <span 
      aria-hidden="true" 
      className={`${cls} shrink-0 inline-flex items-center justify-center border-2 rounded-none 
text-[10px] font-black leading-none 
transition-[background-color,border-color,transform,box-shadow] duration-100 ease-out 
${checked ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105' : 
'border-slate-700 bg-white text-transparent'}`} 
    >✓</span> 
  ); 
}; 
 
const ChoiceButton = ({ checked, onClick, ariaLabel, role = 'checkbox', children, className 
= '' }) => ( 
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

    className={`relative z-20 cursor-pointer touch-manipulation select-none border-0 
bg-transparent p-0 m-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
${className}`} 
  > 
    {children} 
  </button> 
); 
 
const SquareCheckbox = ({ checked, onChange, size = 'md', ariaLabel, name }) => ( 
  <ChoiceButton 
    checked={checked} 
    onClick={onChange} 
    ariaLabel={ariaLabel || name} 
    role="checkbox" 
    className="inline-flex min-h-10 min-w-10 items-center justify-center p-2" 
  > 
    <SquareMark checked={!!checked} size={size} /> 
  </ChoiceButton> 
); 
 
const RadioGroup = ({ name, value, onChange, options = [], isRTL, horizontal = true, hint = 
null, showNumbers = true }) => { 
  const selected = Array.isArray(value) ? String(value[0] ?? '') : String(value ?? ''); 
  return ( 
    <div className="w-full"> 
      {hint && <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? hint.ar : 
hint.fr}</p>} 
      <div 
        dir="ltr" 
        role="radiogroup" 
        aria-label={name} 
        className={horizontal 
          ? 'flex flex-nowrap items-end gap-x-2 sm:gap-x-3 max-w-full overflow-x-auto pb-1' 
          : 'flex flex-col items-stretch gap-y-1'} 
      > 
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
              className={horizontal 

                ? `group flex min-w-[58px] max-w-[150px] shrink-0 flex-col items-center justify-end 
gap-1 rounded-none px-1 py-1 text-center transition-colors ${checked ? 'bg-blue-50' : 
'hover:bg-slate-50'}` 
                : `group flex w-full min-h-10 items-center gap-2 rounded-none px-1.5 py-1 text-left 
transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}` 
              } 
            > 
              {horizontal ? ( 
                <> 
                  <span className="min-h-[2.5rem] text-[11px] font-semibold leading-tight 
text-slate-600 break-words">{label}</span> 
                  <SquareMark checked={checked} size="sm" /> 
                  {showNumbers && <span className="text-[9px] font-mono 
text-slate-500">{isRTL ? toArabicNumeral(numVal) : numVal}</span>} 
                </> 
              ) : ( 
                <> 
                  <ChoiceNumber value={numVal} isRTL={isRTL} /> 
                  <SquareMark checked={checked} /> 
                  <span className={`text-sm leading-tight ${checked ? 'font-bold text-slate-900' : 
'font-medium text-slate-700'}`}>{label}</span> 
                </> 
              )} 
            </ChoiceButton> 
          ); 
        })} 
      </div> 
    </div> 
  ); 
}; 
 
const CheckboxGroup = ({ name, values = {}, onChange, options = [], isRTL, horizontal = 
false }) => ( 
  <div 
    dir="ltr" 
    className={horizontal 
      ? 'flex flex-nowrap items-center gap-x-3 max-w-full overflow-x-auto pb-1' 
      : 'flex flex-col items-stretch gap-y-1'} 
  > 
    {options.map((opt, idx) => { 
      const numVal = opt[3] ?? idx + 1; 
      const checked = !!values[opt[0]]; 
      const label = isRTL && opt[2] ? opt[2] : opt[1]; 
 
      return ( 
        <ChoiceButton 
          key={opt[0]} 
          checked={checked} 

          role="checkbox" 
          ariaLabel={`${label} — ${numVal}`} 
          onClick={() => onChange(name, opt[0], !checked)} 
          className={`group flex ${horizontal ? 'shrink-0' : 'w-full'} items-center gap-1.5 
min-h-10 rounded-none px-1.5 py-1 text-left transition-colors ${checked ? 'bg-blue-50' : 
'hover:bg-slate-50'}`} 
        > 
          <ChoiceNumber value={numVal} isRTL={isRTL} /> 
          <SquareMark checked={checked} size="sm" /> 
          <span className="text-sm font-medium leading-tight text-slate-700">{label}</span> 
        </ChoiceButton> 
      ); 
    })} 
  </div> 
); 
 
/* ─── GRID QUESTION ─── corrigée pour une meilleure cliquabilité */ 
const GridQuestion = ({ title, titleAr, code, options = [], items = [], values = {}, onChange, 
isRTL }) => ( 
  <section className="mt-8 w-full"> 
    <FieldLabel code={code} fr={title} ar={titleAr || title} isRTL={isRTL} /> 
    <p className="mb-3 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة لكل سطر' : 
'Cochez une seule case pour chaque ligne'}</p> 
    <div className="w-full overflow-x-auto xl:overflow-x-visible"> 
      <table className="w-full min-w-[680px] xl:min-w-0 border-collapse table-fixed text-sm"> 
        <thead> 
          <tr className="border-b border-slate-300 align-bottom"> 
            <th className="w-[40%] min-w-[230px] px-2 py-2 text-left font-bold text-slate-600 
leading-tight">{isRTL ? 'العنصر' : 'Élément'}</th> 
            {options.map((opt) => ( 
              <th key={opt[0]} className="px-1 py-2 text-center font-bold text-slate-600 
align-bottom"> 
                <div className="flex min-h-[3.5rem] flex-col items-center justify-end gap-1 
leading-tight"> 
                  <span className="text-[11px] font-semibold break-words">{isRTL && opt[2] ? 
opt[2] : opt[1]}</span> 
                </div> 
              </th> 
            ))} 
          </tr> 
        </thead> 
        <tbody> 
          {items.map(([key, label, ar], rowIndex) => { 
            const selected = String(values[key] ?? ''); 
            const isLastRow = rowIndex === items.length - 1; 
            return ( 
              <tr key={key} className="border-b border-slate-200 align-middle 
hover:bg-slate-50/70"> 

                <td className="px-2 py-2.5 font-medium text-slate-700 leading-tight 
break-words">{isRTL ? ar : label}</td> 
                {options.map((opt, idx) => { 
                  const val = String(opt[0]); 
                  const checked = selected === val; 
                  const numVal = opt[3] ?? idx + 1; 
                  return ( 
                    <td key={opt[0]} className="px-0 py-0 text-center align-middle"> 
                      <ChoiceButton 
                        checked={checked} 
                        role="radio" 
                        ariaLabel={`${isRTL && opt[2] ? opt[2] : opt[1]} — ${numVal}`} 
                        onClick={() => onChange(key, val)} 
                        className="flex w-full h-full min-h-[40px] items-center justify-center 
rounded-none p-0 active:scale-95 transition-transform duration-75" 
                      > 
                        <span className="inline-flex flex-col items-center justify-center gap-0.5"> 
                          <SquareMark checked={checked} size="sm" /> 
                          {isLastRow && <span className="text-[9px] font-mono 
text-slate-500">{isRTL ? toArabicNumeral(numVal) : numVal}</span>} 
                        </span> 
                      </ChoiceButton> 
                    </td> 
                  ); 
                })} 
              </tr> 
            ); 
          })} 
        </tbody> 
      </table> 
    </div> 
  </section> 
); 
 
// ─── CB01 / CB02 — exact paper numbering and structure 
───────────────────────── 
const EducationWithSubQuestions = ({ fieldName, successFields, labelCode, labelFr, 
labelAr, data, update, isRTL }) => { 
  const mainValue = String(data[fieldName] ?? ''); 
  const setMain = (val) => update('section_b', fieldName, String(val)); 
  const setSuccess = (subField, val) => update('section_b', subField, String(val)); 
  const isMother = fieldName === 'mother_education'; 
 
  const rows = [ 
    { type: 'main', id: '1', labelFr: 'Non scolarisé', labelAr: 'غير متمدرس' }, 
    { type: 'main', id: '2', labelFr: 'Niveau primaire', labelAr: 'مستوى ابتدائي' }, 

    { type: 'sub', id: 'A', labelFr: isMother ? 'At-elle réussi en sixième année ?' : 'At-il réussi en 
sixième année ?', labelAr: isMother ? 'هل نجحت في السنة 
'السادسة؟ : 'هل نجح في السنة السادسة؟', subKey: 
successFields.primary }, 
    { type: 'main', id: '3', labelFr: 'Niveau collège', labelAr: 'مستوى إعدادي' }, 
    { type: 'sub', id: 'B', labelFr: isMother ? 'At-elle réussi en neuvième année ?' : 'At-il réussi 
en neuvième année?', labelAr: isMother ? 'هل نجحت في السنة 
'التاسعة؟ : 'هل نجح في السنة التاسعة؟', 
subKey: successFields.middle }, 
    { type: 'main', id: '4', labelFr: 'Niveau secondaire', labelAr: 'مستوى ثانوي' }, 
    { type: 'sub', id: 'C', labelFr: isMother ? 'At-elle obtenu le baccalauréat ?' : 'At-il obtenu le 
baccalauréat ?', labelAr: isMother ? 'هل حصلت على 
'البكالوريا؟ : 'هل حصل على البكالوريا؟', subKey: 
successFields.secondary }, 
    { type: 'main', id: '5', labelFr: 'Niveau universitaire ou plus', labelAr: 'مستوى جامعي أو أكثر' }, 
    { type: 'main', id: '6', labelFr: 'Ne sait pas', labelAr: 'ال أعرف' }, 
    { type: 'main', id: '7', labelFr: 'Non applicable', labelAr: 'غير قابل للتطبيق' }, 
    { type: 'main', id: '8', labelFr: 'Formation professionnelle', labelAr: 'تكوين مهني' }, 
  ]; 
  const yesNoDk = [['1', 'Oui', '
,]'نعم '[
2
', 'Non', '
,]'ال '[
3
', 'Ne sait pas', 'ال أعلم']]; 
 
  return ( 
    <section className="w-full"> 
      <FieldLabel code={labelCode} fr={labelFr} ar={labelAr} isRTL={isRTL} /> 
      <p className="mb-3 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(cochez une seule case)'}</p> 
      <div className="w-full border-y border-slate-200"> 
        {rows.map((row) => { 
          if (row.type === 'main') { 
            const checked = mainValue === row.id; 
            return ( 
              <button key={row.id} type="button" role="radio" aria-checked={checked} onClick={() 
=> setMain(row.id)} 
                className={`grid w-full grid-cols-[2rem_2rem_minmax(0,1fr)] items-center gap-2 
border-b border-slate-200 py-2 text-left transition-colors focus:outline-none 
focus-visible:ring-2 focus-visible:ring-blue-500 ${checked ? 'bg-blue-50' : 
'hover:bg-slate-50'}`}> 
                <span className="text-center text-sm font-bold text-slate-600">{row.id}</span> 
                <SquareMark checked={checked} size="sm" /> 
                <span className={`text-sm leading-tight ${checked ? 'font-bold text-slate-900' : 
'font-medium text-slate-700'}`}>{isRTL ? row.labelAr : row.labelFr}</span> 
              </button> 
            ); 
          } 
          return ( 
            <div key={row.id} dir="ltr" className="grid 
grid-cols-[2rem_minmax(0,1fr)_minmax(250px,320px)] items-center gap-2 border-b 
border-slate-200 py-2"> 
              <span className="text-center text-sm font-bold text-slate-600">{row.id}</span> 
              <span className="text-sm font-medium leading-tight text-slate-700">{isRTL ? 
row.labelAr : row.labelFr}</span> 

              <div className="flex items-center justify-end gap-3 whitespace-nowrap"> 
                {yesNoDk.map(([val, fr, ar]) => { 
                  const checked = String(data[row.subKey] ?? '') === val; 
                  return ( 
                    <button key={val} type="button" role="radio" aria-checked={checked} 
onClick={() => setSuccess(row.subKey, val)} 
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-none px-1.5 
py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 
focus-visible:ring-blue-500 ${checked ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}> 
                      <span>{isRTL ? ar : fr}</span><SquareMark checked={checked} size="sm" /> 
                    </button> 
                  ); 
                })} 
              </div> 
            </div> 
          ); 
        })} 
      </div> 
    </section> 
  ); 
}; 
 
/* ─── INLINE CHOICE ROW corrigée ─── */ 
const InlineChoiceRow = ({ code, label, labelAr, value, onChange, options = [], isRTL }) => { 
  const selected = String(value ?? ''); 
  return ( 
    <div className="w-full overflow-x-auto"> 
      <table className="w-full min-w-[760px] border-collapse table-fixed text-sm"> 
        <thead> 
          <tr className="border-b border-slate-300"> 
            <th className="w-[42%] px-2 py-2 text-left text-[11px] font-bold 
text-slate-600">{isRTL ? 'العنصر' : 'Élément'}</th> 
            {options.map((opt) => ( 
              <th key={opt[0]} className="px-1 py-2 text-center text-[10px] font-bold 
leading-tight text-slate-600">{isRTL && opt[2] ? opt[2] : opt[1]}</th> 
            ))} 
          </tr> 
        </thead> 
        <tbody> 
          <tr className="align-middle"> 
            <td className="px-2 py-2.5 font-medium leading-tight text-slate-700 
break-words">({code}) {isRTL ? labelAr : label}</td> 
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
                    className="flex w-full h-full min-h-[40px] items-center justify-center 
rounded-none p-0 active:scale-95 transition-transform duration-75" 
                  > 
                    <span className="inline-flex flex-col items-center justify-center gap-0.5"> 
                      <SquareMark checked={checked} size="sm" /> 
                      <span className="text-[9px] font-mono text-slate-500">{isRTL ? 
toArabicNumeral(numVal) : numVal}</span> 
                    </span> 
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
            className={`flex w-full min-h-11 items-center gap-3 rounded-none px-2 py-1.5 
transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`} 
          > 
            <ChoiceNumber value={numVal} isRTL={isRTL} /> 
            <SquareMark checked={checked} /> 
            <span className={`text-sm leading-tight ${checked ? 'font-bold text-slate-900' : 
'font-medium text-slate-700'}`}>{label}</span> 
          </ChoiceButton> 
        ); 
      })} 

    </div> 
  ); 
}; 
 
/* ─── CT06 QUESTION corrigée ─── */ 
const CT06Question = ({ title, titleAr, code, items, values = {}, onChange, isRTL }) => { 
  const frequency = [['1', 'Chaque fois', 'كل 
,]'مرة '[
2
', 'La plupart du temps', 'معظم 
,]'الوقت '[
3
', 
'Quelques fois', 'بضع 
,]'مرات '[
4
', 'Jamais', 'ًأبدا']]; 
  const yesNo = [['1', 'Oui', '
,]'نعم '[
2
', 'Non', 'ال']]; 
  const renderTable = (rows, options) => ( 
    <div className="w-full overflow-x-auto xl:overflow-x-visible"> 
      <table className="w-full min-w-[680px] xl:min-w-0 border-collapse table-fixed text-sm"> 
        <thead><tr className="border-b border-slate-300"> 
          <th className="w-[62%] px-2 py-2 text-left text-[11px] font-bold 
text-slate-600">{isRTL ? 'السؤال' : 'Question'}</th> 
          {options.map(([val, fr, ar]) => <th key={val} className="px-1 py-2 text-center 
text-[11px] font-bold text-slate-600">{isRTL ? ar : fr}</th>)} 
        </tr></thead> 
        <tbody> 
          {rows.map(([key, label, ar], rowIndex) => { 
            const last = rowIndex === rows.length - 1; 
            return ( 
              <tr key={key} className="border-b border-slate-200"> 
                <td className="px-2 py-2.5 font-medium leading-tight text-slate-700">{isRTL ? ar 
: label}</td> 
                {options.map(([val], idx) => { 
                  const checked = String(values[key] ?? '') === String(val); 
                  return ( 
                    <td key={val} className="px-0 py-0 text-center align-middle"> 
                      <ChoiceButton 
                        checked={checked} 
                        role="radio" 
                        ariaLabel={`${isRTL ? val : val}`} 
                        onClick={() => onChange(key, String(val))} 
                        className="flex w-full h-full min-h-[40px] items-center justify-center 
rounded-none p-0 active:scale-95 transition-transform duration-75" 
                      > 
                        <span className="inline-flex flex-col items-center justify-center gap-0.5"> 
                          <SquareMark checked={checked} size="sm" /> 
                          {last && <span className="text-[9px] font-mono text-slate-500">{isRTL ? 
toArabicNumeral(idx + 1) : idx + 1}</span>} 
                        </span> 
                      </ChoiceButton> 
                    </td> 
                  ); 
                })} 
              </tr> 
            ); 

          })} 
        </tbody> 
      </table> 
    </div> 
  ); 
  return <section className="mt-8 w-full"><FieldLabel code={code} fr={title} ar={titleAr} 
isRTL={isRTL} /><p className="mb-3 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة 
واحدة لكل سطر' : 'Cochez une seule case pour chaque ligne'}</p>{renderTable(items.filter(([key]) 
=> key === 'a'), frequency)}<div className="mt-4">{renderTable(items.filter(([key]) => key 
!== 'a'), yesNo)}</div></section>; 
}; 
 
const DigitBoxes = ({ value = '', length, onChange, isRTL }) => { 
  const normalized = String(value || '').slice(0, length).padEnd(length, ''); 
  const setDigit = (index, raw) => { 
    const digit = String(raw).replace(/\D/g, '').slice(-1); 
    const chars = normalized.split(''); chars[index] = digit; onChange(chars.join('')); 
  }; 
  return <div className="flex items-center gap-1" dir="ltr">{Array.from({ length }, (_, index) 
=> ( 
    <input key={index} type="text" inputMode="numeric" maxLength={1} 
value={normalized[index] || ''} onChange={(e) => setDigit(index, e.target.value)} 
      aria-label={isRTL ? `الخانة ${index + 1}` : `Case ${index + 1}`} className="h-9 w-8 
rounded-none border-2 border-slate-700 bg-white text-center font-bold text-slate-800 
outline-none transition-colors focus:border-blue-600 sm:h-10 sm:w-9" /> 
  ))}</div>; 
}; 
 
 
// ─── Choice Constants 
─────────────────────────────────────────────────────────
─── 
 
const FREQ_3_OPTS = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '1-2', '1-2 مرة'], 
  ['3', '3 ou plus', '3 مرات أو أكثر'] 
]; 
 
const FREQ_5_OPTS = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', 'Rarement', 'ًنادرا'], 
  ['3', 'De temps en temps', 'من حين آلخر'], 
  ['4', 'Assez souvent', 'ًغالبا'], 
  ['5', 'Très souvent', '
ًكثيرا 
ًجدا'] 
]; 
 
const AGREEMENT_SCALE_PAPER = [ 

  ['1', "Tout à fait d'accord", 'أوافق بشدة'], 
  ['2', "Partiellement d'accord", 'أوافق'], 
  ['3', "Ni d'accord ni pas d'accord", 'محايد'], 
  ['4', "Partiellement en désaccord", 'ال أوافق'], 
  ['5', "Pas du tout d'accord", 'ال أوافق بشدة'] 
]; 
 
const AGREEMENT_SCALE_CS03 = [ 
  ['1', "Tout à fait d'accord", 'أوافق بشدة'], 
  ['2', "Plutôt d'accord", 'أوافق إلى حد ما'], 
  ['3', "Ni d'accord ni pas d'accord", 'ال أوافق وال ال أوافق'], 
  ['4', "Plutôt en désaccord", 'ال أوافق إلى حد ما'], 
  ['5', "Pas du tout d'accord", 'ال أوافق بشدة'] 
]; 
 
const FREQ_GAMBLING_GRID = [ 
  ['1', "Je n’ai pas joué", 'لم ألعب'], 
  ['2', "1 fois par mois ou moins", 'مرة في الشهر أو أقل'], 
  ['3', "2-4 fois par mois", '2-4 مرات في الشهر'], 
  ['4', "2-3 fois par semaine", '2-3 مرات في األسبوع'], 
  ['5', "4-5 fois par semaine", '4-5 مرات في األسبوع'], 
  ['6', "6 fois par semaine ou plus", '6 مرات أو أكثر في األسبوع'] 
]; 
 
const FREQ_LIFETIME_CC03 = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '1-2 fois', '1-2 مرة'], 
  ['3', '3-5 fois', '3-5 مرات'], 
  ['4', '6-9 fois', '6-9 مرات'], 
  ['5', '10-19 fois', '10-19 مرة'], 
  ['6', '20-39 fois', '20-39 مرة'], 
  ['7', '40 ou plus', '40 أو أكثر'] 
]; 
 
const FREQ_LIFETIME = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '1-2 ', '1-2 مرة'], 
  ['3', '3-5 ', '3-5 مرات'], 
  ['4', '6-9 ', '6-9 مرات'], 
  ['5', '10-19 ', '10-19 مرة'], 
  ['6', '20-39 ', '20-39 مرة'], 
  ['7', '40  ou plus', '40  أو أكثر'], 
]; 
 
const FREQ_30DAYS_CIGS = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '< 1 cigarette par semaine', 'أقل من سيجارة واحدة في األسبوع'], 
  ['3', '< 1 cigarette par jour', 'أقل من سيجارة واحدة في اليوم'], 

  ['4', '1-5 cigarettes par jour', '1-5 سجائر في اليوم'], 
  ['5', '6-10 cigarettes par jour', '6-10 سجائر في اليوم'], 
  ['6', '11-20 cigarettes par jour', '11-20 سيجارة في اليوم'], 
  ['7', '> 20 cigarettes par jour', 'أكثر من 
20
 سيجارة في اليوم'], 
]; 
 
const FREQ_30DAYS_VAPE = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '< 1 fois par semaine', 'أقل من مرة في األسبوع'], 
  ['3', 'Au moins 1 fois par semaine', 'على األقل مرة واحدة في األسبوع'], 
  ['4', 'Tous les jours ou presque tous les jours', '
ًيوميا أو 
ًتقريبا كل يوم'], 
]; 
 
const FREQ_30DAYS_HOOKAH = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '< 1 par semaine', 'أقل من مرة في األسبوع'], 
  ['3', '< 1 par jour', 'أقل من مرة في اليوم'], 
  ['4', '1-5 par jour', '1-5 في اليوم'], 
  ['5', '6-10 par jour', '6-10 في اليوم'], 
  ['6', '11-20 par jour', '11-20 في اليوم'], 
  ['7', '> 20 par jour', 'أكثر من 
20
 في اليوم'], 
]; 
 
const FREQ_30DAYS_STANDARD = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '1-2 fois', '1-2 مرة'], 
  ['3', '3-5 fois', '3-5 مرات'], 
  ['4', '6-9 fois', '6-9 مرات'], 
  ['5', '10-19', '10-19'], 
  ['6', '20-39', '20-39'], 
  ['7', '≥ 40', '≥ 40'], 
]; 
 
const RISK_LEVELS = [ 
  ['1', 'Sans risque', 'بدون خطر'], 
  ['2', 'Léger risque', 'خطر خفيف'], 
  ['3', 'Risque modéré', 'خطر متوسط'], 
  ['4', 'Grand risque', 'خطر كبير'], 
  ['5', 'Ne sait pas', 'ال أعرف'], 
]; 
 
const FREQ_ACTIVITIES = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', 'Quelques fois par an', 'بعض المرات سنويا'], 
  ['3', '1 ou 2 fois par mois', 'مرة/مرتان شهريا'], 
  ['4', 'Au moins une fois par semaine', 'مرة في األسبوع على األقل'], 
  ['5', 'tous les jours', 'يوميا'], 
]; 

 
const FREQ_DIGITAL = [ 
  ['1', 'aucune', 'ال شيء'], 
  ['2', 'Une demi-heure ou moins', 'نصف ساعة أو أقل'], 
  ['3', 'Environ 1 heure', 'قرابة الساعة'], 
  ['4', 'Environ 2-3 heures', 'قرابة 
2
-
3
 ساعات'], 
  ['5', 'Environ 4-5 heures', 'قرابة 
4
-
5
 ساعات'], 
  ['6', '6 heures ou plus', '6 ساعات أو أكثر'], 
]; 
 
const DIFFICULTY = [ 
  ['1', 'Impossible', 'مستحيل'], 
  ['2', 'Difficile', 'صعب'], 
  ['3', 'Facile', 'سهل'], 
  ['4', 'Ne sait pas', 'ال أعرف'], 
]; 
 
const FREQ_BINGE = [ 
  ['1', 'Aucune fois', 'وال مرة'], 
  ['2', '1', '1'], 
  ['3', '2', '2'], 
  ['4', '3-5', '3-5'], 
  ['5', '6-9', '6-9'], 
  ['6', '≥ 10', '≥ 10'], 
]; 
 
const AGE_SCALE = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', '<=9 ans', '<=9 سنوات '], 
  ['3', '10 ans', '10 سنوات'], 
  ['4', '11 ans', '11 سنوات'], 
  ['5', '12 ans', '12 سنوات'], 
  ['6', '13 ans', '13 سنوات'], 
  ['7', '14 ans', '14 سنوات'], 
  ['8', '15 ans', '15 سنوات'], 
  ['9', '>=16 ans ', '>=16 سنة'], 
]; 
 
const YES_NO = [['1', 'Oui', '
,]'نعم '[
2
', 'Non', 'ال']]; 
const YES_NO_DK = [['1', 'Oui', '
,]'نعم '[
2
', 'Non', '
,]'ال '[
3
', 'Ne sait pas', 'ال أعلم']]; 
 
const STRESS_FREQ = [ 
  ['1', 'Jamais', 'ًأبدا'], 
  ['2', 'Presque jamais', 'ًنادرا'], 
  ['3', 'Parfois', 'ًأحيانا'], 
  ['4', 'Assez souvent', 'في أغلب األحيان'], 
  ['5', 'Très souvent', 'ًدائما'], 
]; 

 
const SATISFACTION_SCALE = [ 
  ['1', 'Très satisfait(e)', 'راضي جدا'], 
  ['2', 'Satisfait(e)', 'راضي'], 
  ['3', 'Ni satisfait(e) ni insatisfait(e)', 'بدون رأي'], 
  ['4', 'Pas tellement satisfait(e)', 'غير راضي'], 
  ['5', 'Non satisfait(e)', 'غير راضي بالمرة'], 
  ['6', 'Non applicable', 'ال ينطبق'], 
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
 
const ECONOMIC = [ 
  ['1', 'Supérieure aux autres familles', 'أحسـن حـ ال'], 
  ['2', 'Identique aux autres familles', 'مثـل أغلب األسـر'], 
  ['3', 'Inférieure aux autres familles', 'أقــل حـ ال'], 
]; 
 
const JOBS_FATHER = [ 
  ['1', 'Oui, à plein temps', '
،نعم كامل اليوم (وقت كامل)'], 
  ['2', 'Oui, temps partiel', '
،نعم جزء من اليوم (وقت جزئي)'], 
  ['3', 'Ne travaille pas', 'ال يعمل'], 
  ['4', 'Je ne sais pas', 'ال أعلم'], 
  ['5', 'Non applicable', 'ال ينطبق'], 
  ['6', 'retraité', 'متقاعد'], 
]; 
 
const JOBS_MOTHER = [ 
  ['1', 'Oui, à plein temps', '
،نعم كامل اليوم (وقت كامل)'], 
  ['2', 'Oui, temps partiel', '
،نعم جزء من اليوم (وقت جزئي)'], 
  ['3', 'Ne travaille pas', 'ال تعمل'], 
  ['4', 'Je ne sais pas', 'ال أعلم'], 
  ['5', 'Non applicable', 'ال ينطبق'], 
  ['6', 'retraitée', 'متقاعدة'], 
]; 
 
const PERFORMANCE = [ 
  ['1', 'En dessous de la moyenne (<10/20)', 'دون المتوسط (أقل من 
10
)'], 
  ['2', 'Moyen [10 – 12]', 'متوسط (بين 
10
 و 
12
)'], 

  ['3', 'En dessus de la moyenne (>12/20)', 'فوق المتوسط (فوق 
12
)'], 
]; 
 
const HOUSEHOLD = [ 
  ['1', 'Père', 'والدي'], 
  ['2', 'Mère', 'والدتي'], 
  ['3', 'Beau-père', 'زوج أمي'], 
  ['4', 'Belle-mère', 'زوجة أبي'], 
  ['5', 'Frère(s)', '
/أخي إخوتي'], 
  ['6', 'Sœur(s)', '
/إختي أخواتي'], 
  ['7', 'Grand parent(s)', 'جدتي/أجدادي'], 
  ['8', 'Autres proches', 'أقارب آخرين'], 
  ['9', 'Je ne vis avec aucun de mes proches (un internat ou équivalent)', 'ال أعيش مع أي من أقاربي 
(مبيت مدرسي أو ما شابه)'], 
]; 
 
const DIFFICULTY_LEVELS = DIFFICULTY; 
const FREQ_30DAYS = FREQ_30DAYS_STANDARD; 
 
// ─── Initial State 
─────────────────────────────────────────────────────────
───── 
 
const INITIAL_DATA = { 
  section_a: { 
    gender: '', birth_month: '', birth_year: '', academic_performance: '', 
    school_appreciation: '', 
    activities_frequency: {}, school_absences: {}, household_members: [], 
    parents_absence_reason: '', parents_absence_reason_other: '', nights_out_30days: '', 
    family_relationship_satisfaction: {} 
  }, 
  section_b: { 
    father_education: '', mother_education: '', 
    father_primary_success: '', father_middle_success: '', father_secondary_success: '', 
    mother_primary_success: '', mother_middle_success: '', mother_secondary_success: '', 
    father_job: '', mother_job: '', economic_status: '', private_room: '' 
  }, 
  section_c: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', age_daily_use: '' }, 
  section_d: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', age_daily_use: '' }, 
  section_e: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', age_daily_use: '' }, 
  section_g: { access_difficulty: {}, social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', days_30_by_type: {}, binge_drinking_30days: '', intoxication_lifetime: '', 
intoxication_12months: '', intoxication_30days: '', age_first_drink: '', age_first_intoxication: '' }, 
  section_h: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '' }, 

  section_i: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', use_last_12months: '', cannabis_types_12months: {}, 
cannabis_problems_12months: {} }, 
  section_j: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', use_last_12months: '' }, 
  section_k: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', use_last_12months: '' }, 
  section_l: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', use_last_12months: '' }, 
  section_m: { access_difficulty: '', social_circle: {}, lifetime_freq: '', months_12_freq: '', 
days_30_freq: '', age_first_use: '', use_last_12months: '' }, 
  section_n: { access_difficulty: {}, lifetime_freq_by_type: {}, months_12_freq_by_type: {}, 
age_first_use_by_type: {} }, 
  section_p: { lifetime_freq: '', months_12_freq: '', forms: {}, substances: {} }, 
  section_q: { risk_perceptions: {}, help_sources: {}, friend_use_risk: '' }, 
  section_r: { hours_per_day_breakdown: {}, agreement: {} }, 
  section_s: { hours_per_day_school: '', hours_per_day_non_school: '', days_per_week: '', 
agreement: {} }, 
  section_t: { months_12_freq: '', offline_games: {}, online_games: {}, felt_need_increase: '', 
lied_about_it: '', gambling_problems: {} }, 
  section_u: { fights_12months: '', fight_circumstances: '', fight_location: '', staff_intervention: 
'', fight_consequences: [], serious_injury_12months: [] }, 
  section_v: { a: '', b: '', c: '', d: '' }, 
  section_z: { honesty_level: '', honesty_cannabis: '' }, 
}; 
 
// ─── The Form Component 
───────────────────────────────────────────────────────── 
 
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
 
  const localUser = JSON.parse(localStorage.getItem('user') || '{}'); 
  const isOperator = localUser.role === 'OPERATOR'; 
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false); 
  const [operatorGovId, setOperatorGovId] = useState(null); 
  const [operatorEstId, setOperatorEstId] = useState(null); 
 
  const update = (section, field, value) => { 
    setData(prev => { 

      const sectionData = { ...prev[section], [field]: value }; 
      return { ...prev, [section]: sectionData }; 
    }); 
  }; 
 
  const updateCheck = (section, field, key, checked) => { 
    setData(prev => { 
      const current = prev[section][field] || {}; 
      const updatedField = { ...current, [key]: checked }; 
      const sectionData = { ...prev[section], [field]: updatedField }; 
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
 
  const handleSubmit = async (overrideGovId = null, overrideEstId = null) => { 
    if (isOperator && !overrideGovId && !overrideEstId) { 
      setIsLocationModalOpen(true); 
      return; 
    } 
 
    setStatus('submitting'); 
    setErrors(null); 
 
    try { 
      await api.post('questionnaire/submit/', { 
        class_report: reportId, 
        language_used: lang.toUpperCase(), 
        ...(overrideGovId && { governorate: overrideGovId }), 
        ...(overrideEstId && { establishment: overrideEstId }), 
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
 
  // ── DEV: Random data generator 
────────────────────────────────────────────── 
  const generateRandomData = () => { 
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]; 
    const pickYN = () => pick(['1', '2']); 
    const pickYN01 = () => pick(['0', '1']); 
    const pickAge = () => pick(['2', '3', '4', '5', '6', '7', '8', '9']); 
    const pickDiff = () => pick(['1', '2', '3', '4']); 
    const pickSC = () => pick(['1', '2', '3']); 
    const freqOrder = ['1', '2', '3', '4', '5', '6', '7']; 
    const freqStress = ['1', '2', '3', '4', '5']; 
    const digitalH = ['1', '2', '3', '4', '5', '6']; 
    const agreement = ['0', '1', '2', '3', '4']; 
    const satOpts = ['1', '2', '3', '4', '5', '6']; 
    const freqAct = ['1', '2', '3', '4', '5']; 
    const absOpts = ['1', '2', '3', '4', '5', '6']; 
 
    const socialCircle = () => ({ a: pickSC(), b: pickSC(), c: pickSC(), d: pickSC(), e: pickSC() 
}); 
    const coherentFreqs = () => { 
      const li = Math.floor(Math.random() * freqOrder.length); 
      const yi = Math.floor(Math.random() * (li + 1)); 
      const mi = Math.floor(Math.random() * (yi + 1)); 
      return { lifetime_freq: freqOrder[li], months_12_freq: freqOrder[yi], days_30_freq: 
freqOrder[mi], _never: freqOrder[li] === '1' }; 
    }; 
    const smokeSection = () => { 
      const f = coherentFreqs(); 
      return { 
        access_difficulty: pickDiff(), social_circle: socialCircle(), 
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: 
f.days_30_freq, 
        age_first_use: f._never ? '1' : pickAge(), 
        age_daily_use: f._never ? '1' : pickAge(), 
      }; 
    }; 
    const drugSection = () => { 
      const f = coherentFreqs(); 
      return { 

        access_difficulty: pickDiff(), social_circle: socialCircle(), 
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: 
f.days_30_freq, 
        age_first_use: f._never ? '1' : pickAge(), 
        use_last_12months: f._never ? '2' : pickYN(), 
      }; 
    }; 
    const drugSectionSimple = () => { 
      const f = coherentFreqs(); 
      return { 
        access_difficulty: pickDiff(), social_circle: socialCircle(), 
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: 
f.days_30_freq, 
        age_first_use: f._never ? '1' : pickAge(), 
      }; 
    }; 
    const drugSectionH = () => { 
      const f = coherentFreqs(); 
      return { 
        access_difficulty: pickDiff(), social_circle: socialCircle(), 
        lifetime_freq: f.lifetime_freq, months_12_freq: f.months_12_freq, days_30_freq: 
f.days_30_freq, 
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
        academic_performance: pick(['1', '2', '3']), 
        activities_frequency: Object.fromEntries(actKeys.map(k => [k, pick(freqAct)])), 
        school_absences: Object.fromEntries(absKeys.map(k => [k, pick(absOpts)])), 
        household_members: hh, 
        parents_absence_reason: pick(['', '1', '2', '3', '4']), 
        parents_absence_reason_other: '', 
        nights_out_30days: pick(['1', '2', '3', '4', '5', '6', '7', '8']), 
        family_relationship_satisfaction: Object.fromEntries(satKeys.map(k => [k, 
pick(satOpts)])), 

      }, 
      section_b: { 
        father_education: pick(['1', '2', '4', '6', '8', '9', '10', '11']), 
        mother_education: pick(['1', '2', '4', '6', '8', '9', '10', '11']), 
        father_primary_success: pick(['1', '2', '3']), 
        father_middle_success: pick(['1', '2', '3']), 
        father_secondary_success: pick(['1', '2', '3']), 
        mother_primary_success: pick(['1', '2', '3']), 
        mother_middle_success: pick(['1', '2', '3']), 
        mother_secondary_success: pick(['1', '2', '3']), 
        father_job: pick(['1', '2', '3', '4', '5', '6']), 
        mother_job: pick(['1', '2', '3', '4', '5', '6']), 
        economic_status: pick(['1', '2', '3']), 
      }, 
      section_c: smokeSection(), 
      section_d: smokeSection(), 
      section_e: smokeSection(), 
      section_g: { 
        access_difficulty: { beer: pickDiff(), wine: pickDiff(), spirits: pickDiff() }, 
        social_circle: socialCircle(), 
        lifetime_freq: gFreqs.lifetime_freq, months_12_freq: gFreqs.months_12_freq, 
days_30_freq: gFreqs.days_30_freq, 
        days_30_by_type: { beer: pick(freqOrder), wine: pick(freqOrder), spirits: pick(freqOrder) 
}, 
        binge_drinking_30days: pick(['1', '2', '3', '4', '5', '6']), 
        intoxication_lifetime: pick(freqOrder), intoxication_12months: pick(freqOrder), 
intoxication_30days: pick(freqOrder), 
        age_first_drink: gFreqs._never ? '1' : pickAge(), 
        age_first_intoxication: gFreqs._never ? '1' : pickAge(), 
      }, 
      section_h: drugSectionH(), 
      section_i: { 
        access_difficulty: pickDiff(), social_circle: socialCircle(), 
        lifetime_freq: iFreqs.lifetime_freq, months_12_freq: iFreqs.months_12_freq, 
days_30_freq: iFreqs.days_30_freq, 
        age_first_use: iFreqs._never ? '1' : pickAge(), 
        use_last_12months: iFreqs._never ? '2' : pickYN(), 
        cannabis_types_12months: { resin: pick([true, false]), leaves: pick([true, false]) }, 
        cannabis_problems_12months: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map(k => [k, 
pickYN()])), 
      }, 
      section_j: drugSection(), 
      section_k: drugSectionSimple(), 
      section_l: drugSectionSimple(), 
      section_m: drugSectionSimple(), 
      section_n: { 
        access_difficulty: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, pickDiff()])), 

        lifetime_freq_by_type: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, 
pick(freqOrder)])), 
        months_12_freq_by_type: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, 
pick(freqOrder)])), 
        age_first_use_by_type: Object.fromEntries(['a', 'd', 'f', 'g', 'h', 'j', 'k'].map(k => [k, 
pickAge()])), 
      }, 
      section_p: { 
        lifetime_freq: pFreqs.lifetime_freq, months_12_freq: pFreqs.months_12_freq, 
        forms: Object.fromEntries(['a', 'b', 'c', 'd'].map(k => [k, pick([true, false])])), 
        substances: Object.fromEntries(['cannabinoids', 'cathinones'].map(k => [k, 
pick(freqOrder)])), 
      }, 
      section_q: { 
        risk_perceptions: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'i', 'j', 'k', 'l', 'q2a', 'q2b', 'q2c', 
'q2d', 'q2e', 'q2f', 'q2g', 'q2h', 'q2i', 'q2m', 'q2k'].map(k => [k, pick(['1', '2', '3', '4', '5'])])), 
        help_sources: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(k => [k, pickYN()])), 
        friend_use_risk: pick(['1', '2', '3', '4']), 
      }, 
      section_r: { 
        hours_per_day_breakdown: { a: pick(digitalH), b: pick(digitalH) }, 
        agreement: Object.fromEntries(['a', 'b', 'c'].map(k => [k, pick(agreement)])), 
      }, 
      section_s: { 
        hours_per_day_school: pick(digitalH), 
        hours_per_day_non_school: pick(digitalH), 
        days_per_week: pick(['0', '1', '2', '3', '4', '5', '6', '7']), 
        agreement: Object.fromEntries(['a', 'b'].map(k => [k, pick(agreement)])), 
      }, 
      section_t: { 
        months_12_freq: pick(freqOrder), 
        offline_games: Object.fromEntries(['slot_machines', 'cards_dice', 'lottery', 
'sports_betting', 'other'].map(k => [k, pick([true, false])])), 
        online_games: Object.fromEntries(['slot_machines', 'cards_dice', 'lottery', 
'sports_betting', 'other'].map(k => [k, pick([true, false])])), 
        felt_need_increase: pickYN(), lied_about_it: pickYN(), 
        gambling_problems: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'].map(k 
=> [k, pickYN01()])), 
      }, 
      section_u: { 
        fights_12months: pick(['1', '2', '3', '4', '5', '6', '7', '8']), 
        fight_circumstances: pick(['1', '2']), 
        fight_location: pick(['1', '2']), 
        staff_intervention: pickYN(), 
        fight_consequences: [pick(['a', 'b', 'c', 'd', 'e'])], 
        serious_injury_12months: pick(['1', '2', '3', '4', '5']), 
      }, 
      section_v: { 

        a: pick(freqStress), b: pick(freqStress), c: pick(freqStress), d: pick(freqStress), 
      }, 
      section_z: { 
        honesty_level: pick(['1', '2', '3', '4', '5']), 
        honesty_cannabis: pick(['1', '2', '3', '4', '5']), 
      }, 
    }; 
  }; 
 
  // ─── SECTIONS 
─────────────────────────────────────────────────────────
───────── 
 
  const SECTIONS = [ 
    // SECTION A 
    { 
      id: 'section_a', 
      letter: 'A', 
      title: 'Informations Générales', 
      titleAr: 'معلومات عامة', 
      subtitle: 'Les premières questions concernent des informations générales sur vous.', 
      subtitleAr: 'تتعلق األسئلة األولى بمعلومات عامة عن شخصكم.', 
      color: 'bg-slate-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.A01" fr="Genre?" ar="الجنس؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="gender" hint={{ fr: "Cochez une seule case", 
ar: "اختر خانة واحدة" }} value={data.section_a.gender} onChange={handleChange('section_a')} 
              options={[['1', 'Masculin', '
,]'ذكر '[
2
', 'Féminin', 'أنثى']]} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.A02" fr="Date de naissance :" ar="تاريخ الوالدة :" isRTL={isRTL} /> 
            <div className="flex items-end gap-8 pb-1" dir={isRTL ? 'rtl' : 'ltr'}> 
              <div className="flex items-end gap-3"> 
                <DigitBoxes 
                  value={data.section_a.birth_month} 
                  length={2} 
                  onChange={(value) => update('section_a', 'birth_month', value)} 
                  isRTL={isRTL} 
                /> 
                <span className="text-sm font-semibold text-slate-600">{isRTL ? 'الشهر' : 
'Mois'}</span> 
              </div> 
              <div className="flex items-end gap-3"> 
                <DigitBoxes 
                  value={data.section_a.birth_year} 
                  length={4} 

                  onChange={(value) => update('section_a', 'birth_year', value)} 
                  isRTL={isRTL} 
                /> 
                <span className="text-sm font-semibold text-slate-600">{isRTL ? 'السنة' : 
'Année'}</span> 
              </div> 
            </div> 
          </div> 
          <GridQuestion title="À Quelle fréquence pratiquez-vous chacune des activités 
suivantes ?" titleAr="كم من مرة تقوم عادة باألنشطة التالية؟" code="C.A03" isRTL={isRTL} 
            options={FREQ_ACTIVITIES} values={data.section_a.activities_frequency} 
            onChange={(key, val) => updateCheck('section_a', 'activities_frequency', key, val)} 
            items={[ 
              ['a', '(C.A03a) Activité sportive de tout type', 'نشاط رياضي مهما كان نوعه'], 
              ['b', '(C.A03b) Lire des livres pour le plaisir (sans compter les livres scolaires)', 'مطالعة 
الكتب لإلستمتاع (دون احتساب الكتب المدرسية)'], 
              ['c', '(C.A03c) Sortir le soir (dans une discothèque, un bar, une fête organisée, etc.)', 
'السهر خارج البيت 
،(مرقص 
،حانة حفل منظم)'], 
              ['d', '(C.A03d) Autres loisirs (jouer un instrument, chanter, peindre, écrire, etc.)', 
'هوايات أخرى 
،(عزف 
،غناء 
،رسم كتابة...)'], 
              ['e', '(C.A03e) Se retrouver entre amis dans les centres commerciaux (dans la rue, 
dans un parc)', 'مالقاة األصدقاء في مراكز التسوق (الشارع /المنتزهات)'], 
              ['f', "(C.A03f) Utiliser l'internet pour vous amuser (chats, musique, jeux, réseaux 
sociaux, etc.)", 'استعمال اإلنترنات للمتعة 
،(محادثات ألعاب 
،إلكترونية شبكات التواصل اإلجتماعي..)'], 
              ['g', '(C.A03g) Regarder la télévision', 'مشاهدة التلفاز'] 
            ]} /> 
          <GridQuestion title="Au cours du dernier mois, combien de jours avez-vous manqué 
le lycée pour l'une des raisons suivantes ?" titleAr="خالل الشهر األخير كم مرة تغيبت عن المدرسة لسبب من 
األسباب التالية؟" code="C.A04" isRTL={isRTL} 
            options={[['1', 'Jamais', 'ال 
,]'أبدا '[
2
,' '1
 jour', 'يوم 
,]'واحد '[
3
,' '2
 jours', '
,]'يومان '[
4
,' '3
-
4
 jours', 
'3-4 
,]'أيام '[
5
,' '5
-
6
 jours', '5-6 
,]'أيام '[
6
,' '7
 jours ou plus', '7 أيام أو أكثر']]} 
            values={data.section_a.school_absences} 
            onChange={(key, val) => updateCheck('section_a', 'school_absences', key, val)} 
            items={[ 
              ['a', '(C.A04a) Parce que vous étiez malade', 'بسبب المرض'], 
              ['b', '(C.A04b) Parce que vous n\'aviez pas envie d\'aller au lycée', 'لم تكن راغبا في الذهاب 
إلى المدرسة'], 
              ['c', '(C.A04c) En raison de problèmes avec l’administration de l’établissement ou 
les enseignants', 'بسبب مشاكل مع اإلدارة أو المدرسين'], 
              ['d', '(C.A04d) En raison de problèmes avec les amis(e)s au lycée', 'بسبب مشاكل مع 
األقران'], 
              ['e', '(C.A04e) Parce que vous avez été renvoyé.', 'بسبب الطرد'], 
              ['f', '(C.A04f) Pour d’autres raisons.', 'ألسباب أخرى'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.A05" fr="Comment évaluez-vous votre rendement scolaire à la 
fin du dernier trimestre ?" ar="ما هو معدلك الدراسي في نهاية الثالثية األخيرة؟" isRTL={isRTL} /> 

            <RadioGroup horizontal={false} name="academic_performance" hint={{ fr: "Cochez 
une seule case", ar: "اختر خانة واحدة" }} value={data.section_a.academic_performance} 
onChange={handleChange('section_a')} isRTL={isRTL} options={PERFORMANCE} /> 
          </div> 
          <div> 
            <FieldLabel code="C.A06" fr="Comment trouvez-vous l'école/le lycée de manière 
générale ?" ar="كيف تجد المعهد بشكل عام؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <VerticalChoiceList name="school_appreciation" 
value={data.section_a.school_appreciation} onChange={handleChange('section_a')} 
isRTL={isRTL} 
              options={[['1', "Je l'aime beaucoup", 'أحبه 
,]'ًكثيرا '[
2
', "Je l'aime un peu", 'أحبه 
,]'ًقليال '[
3
', 
"Je ne l'aime pas beaucoup", 'ال أحبه 
,]'ًكثيرا '[
4
', "Je ne l'aime pas du tout", 'ال أحبه على اإلطالق']]} /> 
          </div> 
          <div> 
            <FieldLabel code="C.A07" fr="Laquelle/lesquelles des personnes suivantes vit avec 
vous dans la même maison?" ar="أي من األشخاص التاليين يقيم معك في نفس المنزل ؟" isRTL={isRTL} /> 
            <p className="mb-3 text-xs font-medium text-slate-500">{isRTL ? 'اختر العدد الضروري 
من الخانات' : 'Cochez autant de cases que nécessaire'}</p> 
            <div className="w-full border-t border-slate-200"> 
              {[ 
                ['1', 'C.A07b', 'Père', 'والدك'], 
                ['2', 'C.A07d', 'Mère', 'والدتك'], 
                ['3', 'C.A07c', 'Beau-père', 'زوج أمك'], 
                ['4', 'C.A07e', 'Belle-mère', 'زوجة أبيك'], 
                ['5', 'C.A07f', 'Frère(s)', '
/أخوك إخوتك'], 
                ['6', 'C.A07g', 'Sœur(s)', '
/أختك أخواتك'], 
                ['7', 'C.A07h', 'Grand parent(s)', '
/جدك أجدادك'], 
                ['8', 'C.A07i', 'Autres proches', 'أقارب آخرون'], 
                ['9', 'C.A07j', 'Je ne vis avec aucun de mes proches (un internat ou équivalent)', 'ال 
أعيش مع أي من أقاربي (مبيت مدرسي أو ما شابه)'], 
              ].map(([key, code, fr, ar]) => { 
                const checked = data.section_a.household_members.includes(key); 
                return ( 
                  <button key={key} type="button" role="checkbox" aria-checked={checked} 
                    onClick={() => toggleList('section_a', 'household_members', key)} 
                    className="flex w-full items-center gap-2 border-b border-slate-200 py-2 
text-left min-h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"> 
                    <span className="text-[10px] font-semibold text-slate-400">({code})</span> 
                    <span className="text-xs font-bold text-slate-500">1</span> 
                    <SquareMark checked={checked} size="sm" /> 
                    <span className="text-sm font-medium leading-tight text-slate-700">{isRTL ? 
ar : fr}</span> 
                  </button> 
                ); 
              })} 
            </div> 

          </div> 
          <div> 
            <FieldLabel code="C.A07/2 Q11.a)" fr="Si vous n’habitez pas avec vos parents 
ensemble, précisez pourquoi ?" ar="إذا كنت ال تعيش مع 
،والديك وضح السبب" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="parents_absence_reason" 
value={data.section_a.parents_absence_reason} onChange={handleChange('section_a')} 
              options={[ 
                ['1', "Décès de l’un des parents ou bien les deux", 'وفاة أحد الوالدين أو كليهما'], 
                ['2', 'Divorce', 'طالق'], 
                ['3', 'Migration', 'هجرة'], 
                ['4', 'Autres causes', 'أسباب أخرى'], 
                ['5', 'Préciser', 'تحديد'] 
              ]} isRTL={isRTL} /> 
            {data.section_a.parents_absence_reason === '5' && ( 
              <label className="mt-3 block text-sm font-medium text-slate-700"> 
                {isRTL ? 'تحديد' : 'Préciser'} 
                <input type="text" name="parents_absence_reason_other" 
value={data.section_a.parents_absence_reason_other} 
                  onChange={handleChange('section_a')} className="mt-1 w-full border-b-2 
border-slate-300 bg-transparent py-2 outline-none focus:border-blue-600" /> 
              </label> 
            )} 
          </div> 
          <div> 
            <FieldLabel code="C.A08" fr="Durant les 30 derniers jours, combien de nuits avez 
vous passé en dehors de la maison ?" ar="خالل الثالثين يوم 
،األخيرة كم ليلة قضيت خارج البيت؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.A08" label="Les nuits passées en dehors de la la 
maison" labelAr="الليالي التي قضيتها خارج المنزل" value={data.section_a.nights_out_30days} 
onChange={handleChange('section_a')} isRTL={isRTL} 
              options={[ 
                ['1', 'Aucune nuit', 'وال 
,]'ليلة '[
2
,' '1
 nuit', 'ليلة 
,]'واحدة '[
3
,' '2
 nuits', '
,]'ليلتان '[
4
,' '3
 nuits', '3 
ليالي'], 
                ['5', '4 nuits', '4 
,]'ليالي '[
6
,' '5
 nuits', '5 
,]'ليالي '[
7
,' '6
 nuits', '6 
,]'ليالي '[
8
,' '7
 nuits ou plus', 
'7 ليالي أو أكثر'] 
              ]} /> 
          </div> 
          <GridQuestion title="D’une manière générale, quel est votre degré de satisfaction de 
votre relation avec :" titleAr="كم نسبة رضاك عن عالقتك بــ :" code="C.A09" isRTL={isRTL} 
            options={SATISFACTION_SCALE} 
values={data.section_a.family_relationship_satisfaction} 
            onChange={(key, val) => updateCheck('section_a', 'family_relationship_satisfaction', 
key, val)} 
            items={[ 
              ['a', '(C.A09a) votre mère', 'أمك'], 
              ['b', '(C.A09b) votre père', 'أبيك'], 

              ['h', '(C.A09h) votre Belle-mère', 'زوجة أبيك'], 
              ['i', '(C.A09i) votre Beau-père', 'زوج أمك'], 
              ['c', '(C.A09c) votre fratrie', 'إخوتك'], 
              ['d', '(C.A09d) vos ami(e)s', 'أصدقائك'], 
              ['e', '(C.A09e) vos camarades de classe', 'زمالئك بالقسم'], 
              ['f', '(C.A09f) vos enseignants', 'مدرسيك'], 
              ['g', '(C.A09g) l’administration du lycée', 'إدارة المدرسة'] 
            ]} /> 
          <p className="mt-2 text-xs font-medium text-slate-500">{isRTL ? '* شخص غير موجود أو 
متوفى' : 'Non applicable :* Personne non présente ou décédée'}</p> 
        </div> 
      ) 
    }, 
    // SECTION B 
    { 
      id: 'section_b', 
      letter: 'B', 
      title: 'Famille & Situation Socio-Économique', 
      titleAr: 'العائلة والوضع الجتماعي - القتصادي', 
      subtitle: 'Les questions suivantes concernent vos parents. Si vous avez été élevé par 
des parents adoptifs ou autres personnes, ces questions les concernent. Mais si vous avez 
à la fois un beau-père ou une belle-mère et un père ou une mère biologique, ces questions 
concernent celui qui est le plus important pour votre éducation.', 
      subtitleAr: 'تتعلق األسئلة الموالية 
،بوالديك وإذا كنت من والدين بالتبني أو غير 
،ذلك أجب 
،عنها وإذا كان لك في نفس 
الوقت زوج أمك أو زوجة أبيك وأب أو أم 
،بيولوجيان أجب عمّن تراه أكثر أهمية في حياتك.', 
      color: 'bg-blue-900', 
      content: ( 
        <div className="space-y-12"> 
          <EducationWithSubQuestions 
            fieldName="father_education" 
            successFields={{ 
              primary: 'father_primary_success', 
              middle: 'father_middle_success', 
              secondary: 'father_secondary_success' 
            }} 
            labelCode="C.B01" 
            labelFr="Quel est le plus haut niveau de scolarité atteint par votre père ?" 
            labelAr="ما هو أعلى مستوى تعليمي أحرزه والدك؟" 
            data={data.section_b} 
            update={update} 
            isRTL={isRTL} 
          /> 
          <EducationWithSubQuestions 
            fieldName="mother_education" 
            successFields={{ 
              primary: 'mother_primary_success', 
              middle: 'mother_middle_success', 
              secondary: 'mother_secondary_success' 

            }} 
            labelCode="C.B02" 
            labelFr="Quel est le plus haut niveau de scolarité atteint par votre mère ?" 
            labelAr="ما هو أعلى مستوى تعليمي أحرزته والدتك؟" 
            data={data.section_b} 
            update={update} 
            isRTL={isRTL} 
          /> 
          <div> 
            <FieldLabel code="C.B03" fr="Votre père a-t-il un emploi ?" ar="هل والدك يعمل؟" 
isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="father_job" hint={{ fr: "Cochez une seule 
case", ar: "اختر خانة واحدة" }} value={data.section_b.father_job} 
onChange={handleChange('section_b')} options={JOBS_FATHER} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.B04" fr="Votre mère a-t-elle un emploi ?" ar="هل والدتك تعمل؟" 
isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="mother_job" hint={{ fr: "Cochez une seule 
case", ar: "اختر خانة واحدة" }} value={data.section_b.mother_job} 
onChange={handleChange('section_b')} options={JOBS_MOTHER} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.B05" fr="Comment décrivez-vous la situation économique de 
votre famille par rapport au niveau économique des autres familles en Tunisie ?" ar="كيف 
تصف الحالة المادية ألسرتك مقارنة بالحالة المادية لباقي األسر في بلدك؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="economic_status" hint={{ fr: "Cochez une 
seule case", ar: "اختر خانة واحدة" }} value={data.section_b.economic_status} 
onChange={handleChange('section_b')} options={ECONOMIC} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.B06" fr="Avez-vous une chambre à vous seul(e) ?" ar="هل لديك 
غرفة خاصة بك؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <VerticalChoiceList name="private_room" value={data.section_b.private_room} 
onChange={handleChange('section_b')} isRTL={isRTL} options={YES_NO} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION C 
    { 
      id: 'section_c', 
      letter: 'C', 
      title: 'Consommation de Tabac', 
      titleAr: 'استهالك التبغ', 

      subtitle: 'Les questions suivantes concernent la consommation de CIGARETTES et le 
TABAC A ROULER, sans compter les cigarettes électroniques.', 
      subtitleAr: 'تتعلق األسئلة الموالية بتدخين السجائر والسجائر 
،الملفوفة دون اعتبار السجائر اإللكترونية.', 
      color: 'bg-amber-600', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.C01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer des cigarettes si vous le vouliez?" ar="ما هي درجة صعوبة الحصول على السجائر إذا رغبت في 
ذلك؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.C01" label="Procurer des cigarettes" labelAr="توفير 
السجائر" value={data.section_c.access_difficulty} onChange={handleChange('section_c')} 
options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui fume des cigarettes?" titleAr="هل هناك البعض من أصدقائك من يدخن السجائر ؟ هل هناك أحد من أفراد أسرتك 
من يدخن السجائر ؟" code="C.C02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_c.social_circle} 
            onChange={(key, val) => updateCheck('section_c', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.C02a) Quelqu\'un dans votre entourage familial qui fume des cigarettes', 'في 
العائلة'], 
              ['b', '(C.C02b) Quelqu\'un parmi vos ami(e)s qui fume des cigarettes', 'ضمن األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous fumé des cigarettes (sans compter 
les cigarettes électroniques)?" titleAr="كم مرة دخنت السجائر؟" code="C.C03" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_c} 
            onChange={(key, val) => update('section_c', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.C03a) Nombre de fois où vous avez fumé durant votre vie', 'عدد 
مرات التدخين في حياتك'], 
              ['months_12_freq', '(C.C03b) Nombre de fois où vous avez fumé durant les 12 
derniers mois', 'عدد مرات التدخين في 
12
 شهرا األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.C04" fr="Combien de fois avez-vous fumé des cigarettes au 
cours des 30 DERNIERS JOURS? (sans compter les cigarettes électroniques)" ar="كم مرة 
خالل الثالثين يوما 
،األخيرة دخنت السجائر؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={true} name="days_30_freq" hint={{ fr: "Cochez une seule 
case", ar: "اختر خانة واحدة" }} value={data.section_c.days_30_freq} 
onChange={handleChange('section_c')} options={FREQ_30DAYS_CIGS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit?" titleAr="كم 
كان عمرك عندما قمت بما يلي؟" code="C.C05" isRTL={isRTL} 
            options={AGE_SCALE} values={data.section_c} 
            onChange={(key, val) => update('section_c', key, val)} 

            items={[ 
              ['age_first_use', '(C.C05a) Votre âge lorsque vous avez fumé la première cigarette 
(sans compter les cigarettes électroniques)', 'عمرك عند تدخين أول سيجارة (دون احتساب السجائر 
اإللكترونية)'], 
              ['age_daily_use', '(C.C05b) Votre âge lorsque vous avez commencé à fumer tous 
les jours (sans compter les cigarettes électroniques)', 'عمرك عندما بدأت التدخين يوميا (دون احتساب 
السجائر اإللكترونية)'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION D 
    { 
      id: 'section_d', 
      letter: 'D', 
      title: 'Cigarettes Électroniques', 
      titleAr: 'السجائر اإللكترونية', 
      subtitle: 'Les questions suivantes concernent LES CIGARETTES ELECTRONIQUES 
(Vape).', 
      subtitleAr: 'تتعلق األسئلة الموالية بتدخين السجائر اإللكترونية.', 
      color: 'bg-emerald-600', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.D01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer des cigarettes électroniques si vous le vouliez?" ar="ما هي درجة صعوبة الحصول على 
السجائر اإللكترونية إذا رغبت فيها؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.D01" label="procurer des cigarettes électroniques" 
labelAr="توفير السجائر اإللكترونية" value={data.section_d.access_difficulty} 
onChange={handleChange('section_d')} options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui fume des cigarettes électroniques?" titleAr="هل يوجد في محيطك العائلي أو ضمن أصدقائك من يدخن 
السجائر اإللكترونية؟" code="C.D02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_d.social_circle} 
            onChange={(key, val) => updateCheck('section_d', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.D02a) Quelqu\'un dans votre entourage familial qui fume des cigarettes 
électroniques', 'في العائلة'], 
              ['b', '(C.D02b) Quelqu\'un parmi vos ami(e)s qui fume des cigarettes électroniques', 
'ضمن األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous fumé des cigarettes électroniques?" 
titleAr="كم مرة في حياتك دخنت السجائر اإللكترونية؟" code="C.D03" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_d} 
            onChange={(key, val) => update('section_d', key, val)} 

            items={[ 
              ['lifetime_freq', '(C.D03a) Nombre de fois où vous avez fumé des cigarettes 
électroniques durant votre VIE', 'عدد المرات في حياتك'], 
              ['months_12_freq', '(C.D03b) Nombre de fois où vous avez fumé des cigarettes 
électroniques durant les 12 DERNIERS MOIS', 'خالل الـ12
 شهرا األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.D04" fr="Combien de fois avez-vous fumé des cigarettes 
électroniques au cours des 30 DERNIERS JOURS?" ar="كم مرة خالل الثالثين يوما األخيرة دخنت 
السجائر اإللكترونية؟" isRTL={isRTL} /> 
            <InlineChoiceRow code="C.D04" label="Nombre de fois où vous avez fumé des 
cigarettes électroniques au cours des 30 DERNIERS JOURS" labelAr="عدد مرات تدخين السجائر 
اإللكترونية خالل الثالثين يوما األخيرة" value={data.section_d.days_30_freq} 
onChange={handleChange('section_d')} isRTL={isRTL} options={FREQ_30DAYS_VAPE} /> 
          </div> 
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit ?" titleAr="كم 
كان عمرك عندما قمت ألول مرة بهذه األشياء؟" code="C.D05" isRTL={isRTL} 
            options={AGE_SCALE} values={data.section_d} 
            onChange={(key, val) => update('section_d', key, val)} 
            items={[ 
              ['age_first_use', '(C.D05a) Votre âge lorsque vous avez fumé la première cigarette 
électronique', 'عمرك عند تدخين أول سيجارة إلكترونية'], 
              ['age_daily_use', '(C.D05b) Votre âge lorsque vous avez commencé à fumer 
cigarettes électroniques tous les jours', 'عمرك عندما بدأت تدخين السجائر اإللكترونية يوميا'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION E 
    { 
      id: 'section_e', 
      letter: 'E', 
      title: 'Consommation de Narguilé (Chicha)', 
      titleAr: 'استهالك النرجيلة (شيشة)', 
      subtitle: 'Les questions suivantes concernent LE NARGUILE.', 
      subtitleAr: 'تتعلق األسئلة الموالية بتدخين الشيشة.', 
      color: 'bg-orange-600', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.E01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer un narguilé si vous le vouliez ?" ar="ما هي درجة صعوبة الحصول على شيشة إذا رغبت فيها؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.E01" label="Procurer un narguilé" labelAr="توفير النرجيلة" 
value={data.section_e.access_difficulty} onChange={handleChange('section_e')} 
options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 

          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui fume le narguilé?" titleAr="هل يوجد في محيطك العائلي أو ضمن أصدقائك من يدخن الشيشة؟" code="C.E02" 
isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_e.social_circle} 
            onChange={(key, val) => updateCheck('section_e', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.E02a) Quelqu\'un dans votre entourage familial qui fume le narguilé', 'في 
العائلة'], 
              ['b', '(C.E02b) Quelqu\'un parmi vos ami(e)s qui fume le narguilé', 'ضمن األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous fumé narguilé?" titleAr="كم مرة دخنت 
الشيشة؟" code="C.E03" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_e} 
            onChange={(key, val) => update('section_e', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.E03a) Au cours de votre vie', 'عدد المرات في حياتك'], 
              ['months_12_freq', '(C.E03b) Au cours des 12 derniers mois', 'خالل 
12
 شهرا األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.E04" fr="Combien de fois avez-vous fumé le narguilé au cours 
des 30 DERNIERS JOURS ?" ar="كم مرة دخنت النرجيلة خالل الثالثين يوما األخيرة؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.E04" label="Nombre de fois où vous avez fumé le  
narguilé durant les 30 DERNIERS JOURS" labelAr="عدد مرات تدخين النرجيلة خالل الثالثين يوما األخيرة" 
value={data.section_e.days_30_freq} onChange={handleChange('section_e')} 
isRTL={isRTL} options={FREQ_30DAYS_HOOKAH} /> 
          </div> 
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit?" titleAr="كم 
كان عمرك عندما قمت باألشياء التالية؟" code="C.E05" isRTL={isRTL} 
            options={AGE_SCALE} values={data.section_e} 
            onChange={(key, val) => update('section_e', key, val)} 
            items={[ 
              ['age_first_use', '(C.E05a) Votre âge lorsque vous avez fumé le premier narguilé', 
'سن تدخين أول نرجيلة'], 
              ['age_daily_use', '(C.E05b) Votre âge lorsque vous avez commencé à fumer le 
narguilé tous les jours', 'سن تدخين النرجيلة يوميا'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION G 
    { 
      id: 'section_g', 
      letter: 'G', 
      title: 'Boissons Alcoolisées', 
      titleAr: 'المشروبات الكحولية', 

      subtitle: 'Les questions suivantes concernent LES BOISSONS ALCOOLISEES.', 
      subtitleAr: 'تتعلق األسئلة الموالية بالمشروبات الكحولية.', 
      color: 'bg-amber-800', 
      content: ( 
        <div className="space-y-12"> 
          <GridQuestion title="À quel point pensez-vous qu'il serait difficile de vous procurer les 
boissons suivantes si vous le vouliez ?" titleAr="ما هي درجة صعوبة الحصول على المشروبات التالية إذا 
رغبت فيها؟" code="C.G01" isRTL={isRTL} 
            options={DIFFICULTY_LEVELS} values={data.section_g.access_difficulty} 
            onChange={(key, val) => updateCheck('section_g', 'access_difficulty', key, val)} 
            items={[ 
              ['a', '(C.G01a) Obtenir la bière', 'البيرة'], 
              ['b', '(C.G01b) Obtenir les cocktails', 'الكوكتالت'], 
              ['c', '(C.G01c) Obtenir les vins (Une boisson alcoolisée extraite du raisin)', 'الخمر'], 
              ['d', '(C.G01d) Obtenir les eaux-de-vie (Whisky, Vodka…)', 'المشروبات الروحية 
،(وسكي 
فودكا...)'], 
              ['e', '(O.G01e) Obtenir autres boissons alcoolisées', 'مشروبات أخرى تفضلها'] 
            ]} /> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui consomme les boissons alcoolisées?" titleAr="هل يوجد في محيطك العائلي أو ضمن أصدقائك من يستهلك 
المشروبات الكحولية؟" code="C.G02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_g.social_circle} 
            onChange={(key, val) => updateCheck('section_g', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.G02a) Quelqu’un dans votre entourage familial qui consomme les boissons 
alcoolisées', 'في العائلة'], 
              ['b', '(C.G02b) Quelqu‘un parmi vos ami(e)s qui consomme les boissons 
alcoolisées', 'ضمن األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé des boissons alcoolisées 
?" titleAr="كم مرة استهلكت المشروبات الكحولية؟" code="C.G03" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_g} 
            onChange={(key, val) => update('section_g', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.G03a) Nombre de fois où vous avez consommé les boissons 
alcoolisées durant votre VIE', 'عدد المرات في حياتك'], 
              ['months_12_freq', '(C.G03b) Nombre de fois où vous avez consommé les boissons 
alcoolisées durant les 12 DERNIERS MOIS', 'خالل الـ12
 شهرا األخيرة'], 
              ['days_30_freq', '(C.G03c) Nombre de fois où vous avez consommé les boissons 
alcoolisées durant les 30 DERNIERS JOURS', 'عدد المرات خالل الـ30
 يوما األخيرة'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé les boissons alcoolisées 
suivantes au cours des 30 DERNIERS JOURS ?" titleAr="كم 
،مرة خالل الثالثين يوما 
،األخيرة استهلكت 
واحدا من المشروبات الكحولية التالية؟" code="C.G04" isRTL={isRTL} 
            options={FREQ_30DAYS} values={data.section_g.days_30_by_type} 
            onChange={(key, val) => updateCheck('section_g', 'days_30_by_type', key, val)} 
            items={[ 

              ['a', '(C.G04a) Nombre de fois où vous avez consommé la bière durant les 30 
derniers jours', 'البيرة'], 
              ['b', '(C.G04b) Nombre de fois où vous avez consommé les cocktails durant les 30 
derniers jours', 'الكوكتالت'], 
              ['c', '(C.G04c) Nombre de fois où vous avez consommé les vins durant les 30 
derniers jours', 'الخمر'], 
              ['d', '(C.G04d) Nombre de fois où vous avez consommé les eaux-de-vie (Whisky, 
Vodka…)durant les 30 derniers jours', 'المشروبات الروحية 
،(وسكي فودكا...)'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.G05" fr="Durant les 30 DERNIERS JOURS, combien de fois 
avez-vous consommé 5 boissons alcoolisées ou plus à la même occasion (par exemple 
durant un samedi) ? (Notez qu'une seule boisson alcoolisée correspond à un verre de bière 
de 200 ml, un verre de vin, un demi-verre de cocktails longs (rhum et coca, gin et tonic, 
etc.)?(Cochez une seule case)" ar="بالرجوع إلى الثالثين يوما 
،األخيرة كم مرة استهلكت 
5
 أنواع من المشروبات 
الكحولية في نفس المناسبة (مثال كل يوم 
،)سبت مع مالحظة أن المشروب الواحد يعني كأس بيرة سعة 
200
 
/مل كأس خمر/نصف 
كأس كوكتال RHUM (روم مع 
/كوكاكوال دجين) (GIN) مع TONIC (مشروب غازي)...؟" isRTL={isRTL} /> 
            <InlineChoiceRow code="C.G05" label="Nombre de fois où vous avez consommé 5 
boissons alcoolisées ou plus à la même occasion" labelAr="عدد المرات التي استهلكت فيها 
5
 مشروبات 
كحولية أو أكثر في نفس المناسبة" value={data.section_g.binge_drinking_30days} 
onChange={handleChange('section_g')} isRTL={isRTL} options={FREQ_BINGE} /> 
          </div> 
          <GridQuestion title="Combien de fois (éventuellement) avez-vous été intoxiqué par la 
consommation des boissons alcoolisées, par exemple vous avez titubé en marchant, vous 
ne pouvait pas parler clairement, vous avez perdu la capacité de vous souvenir des 
événements ou vous avez vomi ?" titleAr="في كم من مناسبة أثرت فيك المشروبات الكحولية كأن تتمايل في 
المشي أو تتلعثم في الكالم أو تخرج ما في بطنك أو تنسى ما حدث؟" code="C.G06" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_g} 
            onChange={(key, val) => update('section_g', key, val)} 
            items={[ 
              ['intoxication_lifetime', '(C.G06a) Nombre de fois d’intoxication durant votre VIE', 'عدد 
مرات اإلنتشاء في حياتك'], 
              ['intoxication_12months', '(C.G06b) Nombre de fois d’intoxication durant les 12 
DERNIERS MOIS', 'خالل الـ 
12
 شهرا األخيرة'], 
              ['intoxication_30days', '(C.G06c) Nombre de fois d’intoxication durant les 30 
DERNIERS JOURS', 'خالل الثالثين يوم األخيرة'] 
            ]} /> 
          <GridQuestion title="À quel âge avez-vous commencé à faire ce qui suit pour la 
première fois ?" titleAr="كم كان عمرك عندما قمت بهذه األشياء ألول مرة؟" code="C.G07" isRTL={isRTL} 
            options={AGE_SCALE} values={data.section_g} 
            onChange={(key, val) => update('section_g', key, val)} 
            items={[ 
              ['age_first_drink', '(C.G07a) Votre âge lorsque vous avez consommé la première 
boisson alcoolisée', 'سن احتساء أول مشروب كحولي'], 
              ['age_first_intoxication', '(C.G07b) Votre âge lorsque vous avez atteint un état 
d’ivresse pour la première fois', 'سن احتساء أول مشروب'] 
            ]} /> 
        </div> 

      ) 
    }, 
    // SECTION H 
    { 
      id: 'section_h', 
      letter: 'H', 
      title: 'Tranquillisants ou Sédatifs (sans ordonnance)', 
      titleAr: 'المهدئات أو المنومات (بدون وصفة طبية)', 
      subtitle: 'Certains médicaments comme les tranquillisants ou les sédatifs qui sont utilisés 
à des fins non médicales. Ces médicaments sont utilisés pour apaiser / relaxer, ce qui aide 
les gens à dormir, connus par exemple sous le nom de « comprimés ». Les pharmacies 
n\'ont généralement pas le droit de les vendre sans prescription médicale.', 
      subtitleAr: 'األدوية المهدئة أو المنومة تستعمل لغايات غير 
،طبية واألصل أنها أدوية تستعمل في العالج النفسي للتهدئة من 
روع المرضى ومساعدتهم على النوم 
،المريح وفي العادة ال تستعمل وال تباع إال بوصفة طبية.', 
      color: 'bg-purple-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.H01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer des tranquillisants ou sédatifs sans prescription médicale si vous le vouliez?" ar="ما 
هي درجة صعوبة الحصول على األدوية المهدئة أو المنومة دون وصفة طبية إذا رغبت فيها؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.H01" label="Accès aux tranquillisants ou sédatifs sans 
prescription médicale" labelAr="الوصول إلى المهدئات أو المنومات دون وصفة طبية" 
value={data.section_h.access_difficulty} onChange={handleChange('section_h')} 
isRTL={isRTL} options={DIFFICULTY_LEVELS} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui consomme des tranquillisants ou sédatifs, sans prescription médicale?" titleAr="هل يوجد في 
محيطك العائلي أو ضمن أصدقائك من يتناول األدوية المهدئة أو المنومة دون وصفة طبية؟" code="C.H02" 
isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_h.social_circle} 
            onChange={(key, val) => updateCheck('section_h', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.H02a) Quelqu’un dans votre entourage familial qui consomme des 
tranquillisants ou sédatifs, sans prescription médicale', 'في العائلة'], 
              ['b', '(C.H02b) Quelqu‘un parmi vos ami(e)s qui consomme des tranquillisants ou 
sédatifs, sans prescription médicale', 'ضمن األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé des tranquillisants ou 
sédatifs sans prescription médicale?" titleAr="كم مرة تناولت أدوية مهدئة أو منومة دون وصفة طبية؟" 
code="C.H03" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_h} 
            onChange={(key, val) => update('section_h', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.H03a) Nombre de fois de consommation durant votre VIE', 'األدوية 
المهدئة في حياتك'], 

              ['months_12_freq', '(C.H03b) Nombre de fois de consommation durant les 12 
DERNIERS MOIS', 'األدوية المنومة خالل الـ12
 شهرا األخيرة'], 
              ['days_30_freq', '(C.H03c) Nombre de fois de consommation durant les 30 
DERNIERS JOURS', 'المنومات/المهدئات خالل الـ30
 يوما األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.H04" fr="À quel âge avez-vous consommé pour la première 
fois des tranquillisants ou sédatifs sans prescription médicale ?" ar="في أي سن تناولت األدوية المهدئة 
أو المنومة دون وصفة طبية؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.H04" label="Votre âge à la première consommation de 
sédatifs / tranquillisants sans prescription médicale" labelAr="سنك عند تناول المهدئات أو المنومات ألول 
مرة دون وصفة طبية" value={data.section_h.age_first_use} 
onChange={handleChange('section_h')} isRTL={isRTL} options={AGE_SCALE} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION I 
    { 
      id: 'section_i', 
      letter: 'I', 
      title: 'Cannabis (Zatla, Marihuana...)', 
      titleAr: 'القنب الهندي 
،(زطلة 
،ماريجوانا حشيش...)', 
      subtitle: 'Les questions suivantes concernent le cannabis (zatla, marijuana, haschich...).', 
      subtitleAr: 'تتعلق األسئلة الموالية بالقنب الهندي 
،(الزطلة 
،الماريخوانا الحشيش...).', 
      color: 'bg-green-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.I01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer du cannabis si vous le vouliez?" ar="ما هي درجة صعوبة الحصول على الزطلة إذا رغبت فيها؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.I01" label="Procurer du cannabis" labelAr="توفير القنب 
الهندي" value={data.section_i.access_difficulty} onChange={handleChange('section_i')} 
options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui consomme le cannabis?" titleAr="هل يوجد في عائلتك أو ضمن أصدقائك من يستهلك الزطلة؟" 
code="C.I02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_i.social_circle} 
            onChange={(key, val) => updateCheck('section_i', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.I02a) Quelqu\'un dans votre entourage familial qui consomme le cannabis', 
'في العائلة'], 

              ['b', '(C.I02b) Quelqu\'un parmi vos ami(e)s qui consomme le cannabis', 'ضمن 
األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé du cannabis?" titleAr="كم 
مرة استهلكت الزطلة؟" code="C.I03" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_i} 
            onChange={(key, val) => update('section_i', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.I03a) Nombre de fois de consommation durant votre VIE', 'عدد 
المرات في حياتك'], 
              ['months_12_freq', '(C.I03b) Nombre de fois de consommation durant les 12 
DERNIERS MOIS', 'عدد المرات خالل الـ12
 شهرا األخيرة'], 
              ['days_30_freq', '(C.I03c) Nombre de fois de consommation durant les 30 
DERNIERS JOURS', 'عدد المرات خالل الـ30
 يوما األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.I04" fr="À quel âge avez-vous consommé du cannabis pour la 
première fois ?" ar="كم كان سنك عندما استهلكت الزطلة ألول مرة؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.I04" label="Votre âge quand vous avez consommé du 
cannabis pour la première fois" labelAr="سنك عندما استهلكت القنب الهندي ألول مرة" 
value={data.section_i.age_first_use} onChange={handleChange('section_i')} isRTL={isRTL} 
options={AGE_SCALE} /> 
          </div> 
          <GridQuestion title="Durant les DERNIERS 12 MOIS, avez-vous pris l'un des types de 
cannabis suivants?" titleAr="خالل الـ12
 شهرا 
،األخيرة هل تناولت واحدا من أنواع القنب الهندي الموالية؟" 
code="C.I05" isRTL={isRTL} 
            options={FREQ_5_OPTS} values={data.section_i.cannabis_types_12months} 
            onChange={(key, val) => updateCheck('section_i', 'cannabis_types_12months', key, 
val)} 
            items={[ 
              ['resin', '(C.I05a) Résine de Zatla', 'الزطلة'], 
              ['leaves', '(C.I05b) Feuilles du Zatla (marijuana)', 'الحشيش'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.I06" fr="Avez-vous consommé du cannabis durant les 12 
DERNIERS MOIS ?" ar="هل استهلكت الزطلة خالل الـ12
 شهرا األخيرة؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'Cochez une seule case'}</p> 
            <RadioGroup horizontal={false} name="use_last_12months" 
value={data.section_i.use_last_12months} onChange={handleChange('section_i')} 
options={YES_NO} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Si la réponse est oui, l'une des choses suivantes vous est-elle 
arrivée au cours des 12 derniers mois?" titleAr="إذا كانت اإلجابة نعم ، هل حدثت معك واحدة من هذه األشياء 
خالل الـ12
 شهرا األخيرة؟" code="" isRTL={isRTL} 
            options={FREQ_5_OPTS} values={data.section_i.cannabis_problems_12months} 

            onChange={(key, val) => updateCheck('section_i', 'cannabis_problems_12months', 
key, val)} 
            items={[ 
              ['a', '(C.I06a) Avez-vous fumé du cannabis avant midi ?', 'هل استهلكت الزطلة قبل منتصف 
النهار؟'], 
              ['b', '(C.I06b) Avez-vous déjà fumé du cannabis seul (sans compagnie) ?', 'هل استهلكت 
الزطلة بمفردك؟'], 
              ['c', '(C.I06c) Avez-vous été exposé à des troubles de la mémoire suite à la 
consommation du cannabis ?', 'هل حصلت معك اضطرابات في الذاكرة بعد استهالك الزطلة؟'], 
              ['d', '(C.I06d) Un membre de la famille ou un ami vous a-t-il conseillé de réduire ou 
d\'arrêter de consommer du cannabis ?', 'هل نصحك أحد أفراد العائلة أو األصدقاء بالتقل؟'], 
              ['e', '(C.I06e) Avez-vous essayé de réduire ou d\'arrêter votre consommation du 
cannabis sans succès ?', 'هل حاولت التوقف أو التقليل دون نجاح؟'], 
              ['f', '(C.I06f) Avez-vous été exposé à des problèmes dus à la consommation de 
cannabis (disputes, désaccords, conflits, accident, détérioration des résultats scolaires ...) ?', 
'هل تعرضت لمشاكل بسبب استهالك الزطلة 
،(خالفات 
،حوادث تدهور النتائج الدراسية ...)؟'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION J 
    { 
      id: 'section_j', 
      letter: 'J', 
      title: 'Cocaïne', 
      titleAr: 'الكوكايين', 
      subtitle: 'Les questions suivantes concernent la COCAÏNE.', 
      subtitleAr: 'تتعلق األسئلة الموالية بالكوكايين.', 
      color: 'bg-red-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.J01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer de la cocaïne si vous le vouliez?" ar="ما هي درجة صعوبة الحصول على الكوكايين إذا رغبت فيه؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.J01" label="Procurer de la cocaïne" labelAr="توفير الكوكايين" 
value={data.section_j.access_difficulty} onChange={handleChange('section_j')} 
options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui consomme de la cocaïne?" titleAr="هل يوجد في محيطك العائلي أو ضمن أصدقائك من يستهلك الكوكايين؟" 
code="C.J02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_j.social_circle} 
            onChange={(key, val) => updateCheck('section_j', 'social_circle', key, val)} 
            items={[ 

              ['a', '(C.J02a) Quelqu\'un dans votre entourage familial qui consomme de la 
cocaïne', 'في العائلة'], 
              ['b', '(C.J02b) Quelqu\'un parmi vos ami(e)s qui consomme de la cocaïne', 'ضمن 
األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé la cocaïne?" titleAr="كم مرة 
استهلكت الكوكايين؟" code="C.J03" isRTL={isRTL} 
            options={FREQ_3_OPTS} values={data.section_j} 
            onChange={(key, val) => update('section_j', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.J03a) Nombre de fois de consommation de la cocaïne durant 
votre VIE', 'عدد المرات في حياتك'], 
              ['months_12_freq', '(C.J03b) Nombre de fois de consommation de la cocaïne durant 
les 12 DERNIERS MOIS', 'خالل الـ12
 شهرا األخيرة'], 
              ['days_30_freq', '(C.J03c) Nombre de fois de consommation de la cocaïne durant 
les 30 DERNIERS JOURS', 'خالل الـ30
 يوما األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.J04" fr="À quel âge avez-vous consommé de la cocaïne pour 
la première fois ?" ar="كم كان عمرك عندما استهلكت الكوكايين ألول مرة؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.J04" label="Votre âge quand vous avez consommé de la 
cocaïne pour la première fois" labelAr="سنك عندما استهلكت الكوكايين ألول مرة" 
value={data.section_j.age_first_use} onChange={handleChange('section_j')} isRTL={isRTL} 
options={AGE_SCALE} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION K 
    { 
      id: 'section_k', 
      letter: 'K', 
      title: "Consommation d'Ecstasy", 
      titleAr: 'اإلكستازي', 
      subtitle: 'Les questions suivantes concernent l\'ECSTASY (EXTA).', 
      subtitleAr: 'تتعلق األسئلة التالية باإلكستازي.', 
      color: 'bg-pink-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.K01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer de l'Ecstasy si vous le vouliez?" ar="ما هي درجة صعوبة الحصول على اإلكستازي إذا رغبت فيه؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 

            <InlineChoiceRow code="C.K01" label="Procurer de l'Ecstasy" labelAr="توفير اإلكستازي" 
value={data.section_k.access_difficulty} onChange={handleChange('section_k')} 
options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui consomme de l'Ecstasy?" titleAr="هل يوجد في عائلتك أو ضمن أصدقائك من يستهلك اإلكستازي؟" 
code="C.K02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_k.social_circle} 
            onChange={(key, val) => updateCheck('section_k', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.K02a) Quelqu\'un dans votre entourage familial qui consomme de 
l\'Ecstasy', 'في العائلة'], 
              ['b', '(C.K02b) Quelqu\'un parmi vos ami(e)s qui consomme de l\'Ecstasy', 'ضمن 
األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé de l'Ecstasy?" titleAr="كم 
مرة استهلكت اإلكستازي؟" code="C.K03" isRTL={isRTL} 
            options={FREQ_3_OPTS} values={data.section_k} 
            onChange={(key, val) => update('section_k', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.K03a) Nombre de fois de consommation de l\'Ecstasy durant 
votre VIE', 'عدد المرات في حياتك'], 
              ['months_12_freq', '(C.K03b) Nombre de fois de consommation de l\'Ecstasy durant 
les 12 DERNIERS MOIS', 'خالل الـ12
 شهرا األخيرة'], 
              ['days_30_freq', '(C.K03c) Nombre de fois de consommation de l\'Ecstasy durant 
les 30 DERNIERS JOURS', 'خالل الـ30
 يوما األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.K04" fr="À quel âge avez-vous consommé de l’Ecstasy pour la 
première fois?" ar="كم كان عمرك عندما استهلكت اإلكستازي ألول مرة؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.K04" label="Votre âge quand vous avez consommé de 
l’Ecstasy pour la première fois" labelAr="سنك عندما استهلكت اإلكستازي ألول مرة" 
value={data.section_k.age_first_use} onChange={handleChange('section_k')} isRTL={isRTL} 
options={AGE_SCALE} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION L 
    { 
      id: 'section_l', 
      letter: 'L', 
      title: "Héroïne", 
      titleAr: 'الهيروين', 
      subtitle: 'Les questions suivantes concernent l\'HEROINE.', 
      subtitleAr: 'تتعلق األسئلة الموالية بالهيروين.', 

      color: 'bg-stone-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.L01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer de l'Héroïne si vous le vouliez?" ar="ما هي درجة صعوبة الحصول على الهيروين إذا رغبت فيه؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.L01" label="Procurer de l’Héroïne" labelAr="توفير الهيروين" 
value={data.section_l.access_difficulty} onChange={handleChange('section_l')} 
options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui consomme de l'Héroïne?" titleAr="هل يوجد في عائلتك أو ضمن أصدقائك من يستهلك الهيروين؟" 
code="C.L02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_l.social_circle} 
            onChange={(key, val) => updateCheck('section_l', 'social_circle', key, val)} 
            items={[ 
              ['a', '(C.L02a) Quelqu\'un dans votre entourage familial qui consomme de 
l\'Héroïne', 'في العائلة'], 
              ['b', '(C.L02b) Quelqu\'un parmi vos ami(e)s qui consomme de l\'Héroïne', 'ضمن 
األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé de l'Héroïne?" titleAr="كم 
مرة استهلكت الهيروين؟" code="C.L03" isRTL={isRTL} 
            options={FREQ_3_OPTS} values={data.section_l} 
            onChange={(key, val) => update('section_l', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.L03a) Nombre de fois de consommation de l\'Héroïne durant 
votre VIE', 'عدد المرات في حياتك'], 
              ['months_12_freq', '(C.L03b) Nombre de fois de consommation de l\'Héroïne durant 
les 12 DERNIERS MOIS', 'خالل الـ12
 شهرا األخيرة'], 
              ['days_30_freq', '(C.L03c) Nombre de fois de consommation de l\'Héroïne durant les 
30 DERNIERS JOURS', 'خالل الـ30
 يوما األخيرة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.L04" fr="À quel âge avez-vous consommé pour la première fois 
de l’Héroïne?" ar="كم كان عمرك عندما استهلكت الهيروين ألول مرة؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.L04" label="Votre âge quand vous avez consommé de 
l’Héroïne pour la première fois" labelAr="سنك عندما استهلكت الهيروين ألول مرة" 
value={data.section_l.age_first_use} onChange={handleChange('section_l')} isRTL={isRTL} 
options={AGE_SCALE} /> 
          </div> 
        </div> 
      ) 

    }, 
    // SECTION M 
    { 
      id: 'section_m', 
      letter: 'M', 
      title: 'Inhalants narcotiques (colle, gaz, essence, etc.)', 
      titleAr: 'المذيبات والمستنشقات 
،(غراء 
،غاز بنزين...)', 
      subtitle: 'Les questions suivantes concernent les INHALANTS narcotiques (colle, gaz, 
essence, etc.).', 
      subtitleAr: 'تتعلق األسئلة الموالية بالمواد المستنشقة 
،(اللصاق 
،الغاز 
)...البنزين بغاية اإلنتشاء.', 
      color: 'bg-blue-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="O.M01" fr="À quel point pensez-vous qu'il serait difficile de vous 
procurer des inhalants narcotiques si vous le vouliez?" ar="ما هي درجة صعوبة الحصول على المواد 
المستنشقة/المخدرة إذا رغبت فيها؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="O.M01" label="Procurer des inhalants narcotiques" 
labelAr="توفير المواد المستنشقة" value={data.section_m.access_difficulty} 
onChange={handleChange('section_m')} options={DIFFICULTY_LEVELS} isRTL={isRTL} /> 
          </div> 
          <GridQuestion title="Y a-t-il quelqu'un parmi les membres de votre famille ou vos amis 
qui consomme des inhalants narcotiques?" titleAr="هل يوجد في عائلتك أو ضمن أصدقائك من يستهلك المواد 
المستنشقة/المخدرة ؟" code="O.M02" isRTL={isRTL} 
            options={YES_NO_DK} values={data.section_m.social_circle} 
            onChange={(key, val) => updateCheck('section_m', 'social_circle', key, val)} 
            items={[ 
              ['a', '(O.M02a) Quelqu\'un dans votre entourage familial qui consomme des 
inhalants narcotiques', 'في العائلة'], 
              ['b', '(O.M02b) Quelqu\'un parmi vos ami(e)s qui consomme des inhalants 
narcotiques', 'ضمن األصدقاء'] 
            ]} /> 
          <GridQuestion title="Combien de fois avez-vous consommé des inhalants 
narcotiques?" titleAr="كم مرة استهلكت هذه المواد ؟" code="O.M03" isRTL={isRTL} 
            options={FREQ_3_OPTS} values={data.section_m} 
            onChange={(key, val) => update('section_m', key, val)} 
            items={[ 
              ['lifetime_freq', '(O.M03a) Nombre de fois de consommation d\'inhalants narcotiques 
durant votre VIE', 'عدد المرات في حياتك'], 
              ['months_12_freq', '(O.M03b) Nombre de fois de consommation d\'inhalants 
narcotiques durant les 12 DERNIERS MOIS', 'خالل الـ12
 شهرا األخيرة'], 
              ['days_30_freq', '(O.M03c) Nombre de fois de consommation d\'inhalants 
narcotiques durant les 30 DERNIERS JOURS', 'خالل الـ30
 يوما األخيرة'] 
            ]} /> 
          <div> 

            <FieldLabel code="O.M04" fr="À quel âge avez-vous consommé des inhalants 
narcotiques pour la première fois?" ar="كم كان عمرك عندما استهلكت هذه المواد ألول مرة؟" isRTL={isRTL} 
/> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="O.M04" label="Votre âge quand vous avez consommé des 
inhalants narcotiques pour la première fois" labelAr="سنك عندما استهلكت المواد المستنشقة ألول مرة" 
value={data.section_m.age_first_use} onChange={handleChange('section_m')} 
isRTL={isRTL} options={AGE_SCALE} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION N 
    { 
      id: 'section_n', 
      letter: 'N', 
      title: 'Autres Substances Narcotiques', 
      titleAr: 'مواد مخدرة أخرى', 
      subtitle: 'Les questions suivantes concernent les autres substances narcotiques.', 
      subtitleAr: 'تتعلق األسئلة الموالية بمواد مخدرة أخرى.', 
      color: 'bg-yellow-800', 
      content: ( 
        <div className="space-y-12"> 
          <GridQuestion title="À quel point pensez-vous qu'il serait difficile de vous procurer les 
substances suivantes si vous le vouliez ?" titleAr="ما هي درجة صعوبة الحصول على المواد المخدرة الموالية 
إذا رغبت فيها؟" code="C.N01" isRTL={isRTL} 
            options={DIFFICULTY_LEVELS} values={data.section_n.access_difficulty} 
            onChange={(key, val) => updateCheck('section_n', 'access_difficulty', key, val)} 
            items={[ 
              ['a', '(O.N01a) Obtenir des Amphétamines', 'األمفيتامين'], 
              ['d', '(C.N01d) Obtenir du dipaje', 'المنشطات / الهرمونات'], 
              ['f', '(O.N01f) Obtenir des hallucinogènes (LSD, champignons hallucinogènes, etc.)', 
'حبوب الهلوسة (LSD، الفطر المهلوس...)'], 
              ['g', '(C.N01g) Obtenir des methamphétamines', 'الميثومفيتامين'], 
              ['h', '(O.N01h) Obtenir des antalgiques (Tramadol, Tramadis, Codéine.)', 'مسكنات األلم 
(ترامادول...)'], 
              ['j', '(O.N01j) Obtenir du subutex', 'سوبوتيكس'], 
              ['k', '(O.N01k) Obtenir du speed', 'سبيد'] 
            ]} /> 
          <GridQuestion title="Combien de fois dans VOTRE VIE avez-vous utilisé chacune des 
substances suivantes ?" titleAr="كم مرة في حياتك استهلكت كل نوع من أنواع المواد المخدرة الموالية؟" 
code="C.N02" isRTL={isRTL} 
            options={FREQ_3_OPTS} values={data.section_n.lifetime_freq_by_type} 
            onChange={(key, val) => updateCheck('section_n', 'lifetime_freq_by_type', key, val)} 
            items={[ 
              ['a', '(O.N02a) Amphétamines dans votre vie', 'األمفيتامين'], 
              ['d', '(O.N02d) Dipaje dans votre vie', 'المنشطات / الهرمونات'], 

              ['f', '(O.N02f) Hallucinogènes (LSD, champignons hallucinogènes…) dans votre vie', 
'حبوب الهلوسة'], 
              ['g', '(C.N02g) Methamphetamines dans votre vie', 'الميثومفيتامين'], 
              ['h', '(O.N02h) Antalgiques (Tramadol, Tramadis, Codéine) dans votre vie', 'مسكنات 
األلم'], 
              ['j', '(O.N02j) Subutex dans votre vie', 'سوبوتيكس'], 
              ['k', '(O.N02k) Speed dans votre vie', 'سبيد'] 
            ]} /> 
          <GridQuestion title="Au cours des12 DERNIERS MOIS, combien de fois avez-vous 
utilisé chacune des substances suivantes ?" titleAr="هل استهلكت المواد المخدرة الموالية خالل الـ 
12
 شهرا 
األخيرة؟" code="C.N03" isRTL={isRTL} 
            options={FREQ_3_OPTS} values={data.section_n.months_12_freq_by_type} 
            onChange={(key, val) => updateCheck('section_n', 'months_12_freq_by_type', key, 
val)} 
            items={[ 
              ['a', '(O.N03a) Amphétamines au cours des 12 derniers mois', 'األمفيتامين'], 
              ['d', '(O.N03d) Dipaje au cours des 12 derniers mois', 'المنشطات / الهرمونات'], 
              ['f', '(O.N03f) Hallucinogènes (LSD, champignons hallucinogènes…) au cours des 
12 derniers mois', 'حبوب الهلوسة'], 
              ['g', '(O.N03g) Methamphetamines au cours des 12 derniers mois', 'الميثومفيتامين'], 
              ['h', '(O.N03h) Antalgiques (Tramadol, Tramadis, Codéine) au cours des 12 derniers 
mois', 'مسكنات األلم'], 
              ['j', '(O.N03j) Subutex au cours des 12 derniers mois', 'سوبوتيكس'], 
              ['k', '(O.N03k) Speed au cours des 12 derniers mois', 'سبيد'] 
            ]} /> 
          <GridQuestion title="À quel âge avez-vous consommé pour la première fois chacune 
des substances suivantes ?" titleAr="كم كان عمرك عندما استهلكت كل نوع من أنواع المواد؟" code="C.N04" 
isRTL={isRTL} 
            options={AGE_SCALE} values={data.section_n.age_first_use_by_type} 
            onChange={(key, val) => updateCheck('section_n', 'age_first_use_by_type', key, val)} 
            items={[ 
              ['a', '(O.N04a) Amphétamines pour la première fois', 'األمفيتامين'], 
              ['d', '(O.N04d) Dipage pour la première fois', 'المنشطات / الهرمونات'], 
              ['f', '(O.N04f) Hallucinogènes (LSD, champignons hallucinogènes…) pour la 
première fois', 'حبوب الهلوسة'], 
              ['g', '(O.N04g) Methamphetamines pour la première fois', 'الميثومفيتامين'], 
              ['h', '(O.N04h) Antalgiques (Tramadol, Tramadis, codéine…) pour la première fois', 
'مسكنات األلم'], 
              ['j', '(O.N04j) Subutex pour la première fois', 'سوبوتيكس'], 
              ['k', '(O.N04k) Speed pour la première fois', 'سبيد'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION P 
    { 
      id: 'section_p', 
      letter: 'P', 

      title: 'Nouvelles Substances Narcotiques (NSP)', 
      titleAr: 'المواد المخدرة الجديدة (NSP)', 
      subtitle: 'Les questions suivantes concernent les nouvelles substances narcotiques, qui 
sont aussi efficaces que les drogues interdites comme le cannabis ou l\'ecstasy, et qui sont 
maintenant disponibles. Ces substances sont appelées drogues légales ou préparations 
chimiques (keta, spica, Meo Meo, Flakka, superman...). Nous pouvons les trouver sous 
différentes formes comme les mélanges à base de plantes, poudres, cristaux, pilules, 
encens.', 
      subtitleAr: 'تتعلق األسئلة الموالية بالمواد المخدرة 
،الجديدة/المستحدثة التي تضاهي في مفعولها المخدرات الممنوعة مثل 
القنب الهندي أو 
،اإلكستازي وأصبحت 
.متوفرة وتسمى هذه المواد بالمخدرات الشرعية أو المستحضرات الكيميائية 
،(الكيتا 
،المفوح 
ميو 
،ميو 
،الفالكا الرجل 
)...الخارق ويمكن أن نجدها في أشكال مختلفة مثل خلطات 
،األعشاب 
،المساحيق 
،البلوريات 
،الحبوب 
البخور.', 
      color: 'bg-indigo-900', 
      content: ( 
        <div className="space-y-12"> 
          <GridQuestion title="Combien de fois avez-vous consommé l'une de ces substances 
?" titleAr="كم مرة استهلكت واحدة من / إحدى هذه المواد؟" code="C.P01" isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_p} 
            onChange={(key, val) => update('section_p', key, val)} 
            items={[ 
              ['lifetime_freq', '(C.P01a) Nombre de fois de consommation durant votre vie', 'عدد 
المرات في حياتك'], 
              ['months_12_freq', '(C.P01b) Nombre de fois de consommation durant les 12 
DERNIERS MOIS', 'عدد المرات خالل الـ12
 شهرا األخيرة'] 
            ]} /> 
          <div className="w-full"> 
            <FieldLabel code="C.P02" fr="Si vous avez consommé l'une de ces nouvelles 
substances au cours des 12 derniers mois, quelle forme avaient-elles ?" ar="تحت أي شكل كانت 
هذه المواد خالل الـ 
12
 
ًشهرا األخيرة؟" isRTL={isRTL} /> 
            <p className="mb-3 text-xs font-medium text-slate-500">{isRTL ? 'يمكنك اختيار خانة 
واحدة أو أكثر' : 'Cochez une ou plusieurs case(s)'}</p> 
            <div className="w-full border-t border-slate-200"> 
              {[ 
                ['a', "C.P02a", "Je n'ai pris aucune de ces substances au cours des 12 DERNIERS 
MOIS", 'لم أستهلك وال واحدة من هذه المواد خالل الـ12
 شهرا األخيرة'], 
                ['b', "C.P02b", "Mélanges d'herbes ayant des effets similaires à ceux des drogues", 
'خليط أعشاب له نفس مفعول المخدرات'], 
                ['c', "C.P02c", "Poudres, cristaux ou pilules ayant des effets similaires à ceux des 
drogues", '
،مساحيق 
،بلوريات أو حبوب لها نفس مفعول المخدرات'], 
                ['d', "C.P02d", "Liquides ayant des effets similaires à ceux des drogues", 'سوائل لها 
نفس مفعول المخدرات'], 
                ['e', "C.P02e", "Autres", 'أنواع أخرى'], 
              ].map(([key, code, fr, ar]) => { 
                const checked = !!data.section_p.forms[key]; 
                return ( 
                  <button key={key} type="button" role="checkbox" aria-checked={checked} 
                    onClick={() => updateCheck('section_p', 'forms', key, !checked)} 

                    className="flex w-full items-center gap-2 border-b border-slate-200 py-2 
text-left min-h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"> 
                    <span className="text-[10px] font-semibold text-slate-400">({code})</span> 
                    <span className="text-xs font-bold text-slate-500">1</span> 
                    <SquareMark checked={checked} size="sm" /> 
                    <span className="text-sm font-medium leading-tight text-slate-700">{isRTL ? 
ar : fr}</span> 
                  </button> 
                ); 
              })} 
            </div> 
          </div> 
          <GridQuestion title="Combien de fois DANS VOTRE VIE avez-vous consommé l'une 
des substances suivantes ?" titleAr="كم مرة في حياتك استهلكت إحدى المواد الموالية:" code="C.P03" 
isRTL={isRTL} 
            options={FREQ_LIFETIME} values={data.section_p.substances} 
            onChange={(key, val) => updateCheck('section_p', 'substances', key, val)} 
            items={[ 
              ['cannabinoids', '(C.P03a) Cannabinoïdes synthétiques dans votre vie', 'القنب الهندي 
المصنع (Synthetie cannabinoids)'], 
              ['cathinones', '(C.P03b) Cathinones synthétiques dans votre vie', 'المصنع اإلصطناعي 
(Cathinones)'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION Q 
    { 
      id: 'section_q', 
      letter: 'Q', 
      title: 'Perception des Risques et Aide', 
      titleAr: 'إدراك المخاطر والمساعدة', 
      subtitle: 'Les questions suivantes concernent votre avis sur la consommation de 
substances narcotiques.', 
      subtitleAr: 'تتعلق األسئلة الموالية بمعرفة رأيك في األخطار الناجمة عن استهالك هذه المواد.', 
      color: 'bg-emerald-800', 
      content: ( 
        <div className="space-y-12"> 
          <GridQuestion title="À quel point pensez-vous que les gens risquent de s'exposer au 
danger (physique ou autre) si...?" titleAr="ما هي درجة الخطورة 
)(جسدية/غيرها التي يعرّض الناس أنفسهم إليها 
إذا...؟" code="C.Q01" isRTL={isRTL} 
            options={RISK_LEVELS} values={data.section_q.risk_perceptions} 
            onChange={(key, val) => updateCheck('section_q', 'risk_perceptions', key, val)} 
            items={[ 
              ['a', '(C.Q01a) Ils fument des cigarettes OCCASIONNELLEMENT', 'دخنوا السجائر 
أحيانا؟'], 
              ['b', '(C.Q01b) Ils fument un paquet de cigarettes ou plus par jour 
REGULIEREMENT', 'دخنوا بانتظام علبة سجائر أو أكثر يوميا؟'], 

              ['c', '(C.Q01c) Ils fument les cigarettes électroniques OCCASIONNELLEMENT', 
'دخنوا السجائر اإللكترونية أحيانا؟'], 
              ['d', '(C.Q01d) Ils fument les cigarettes électroniques REGULIEREMENT', 'دخنوا 
السجائر اإللكترونية بانتظام؟'], 
              ['e', '(C.Q01e) Ils fument le narguilé OCCASIONNELLEMENT', 'دخنوا الشيشة أحيانا؟'], 
              ['f', '(C.Q01f) Ils fument le narguilé REGULIEREMENT', 'دخنوا الشيشة بانتظام؟'], 
              ['i', '(C.Q01i) Ils consomment les boissons alcoolisées OCCASIONNELLEMENT', 
'استهلكوا المشروبات الكحولية أحيانا؟'], 
              ['j', '(C.Q01j) Ils consomment les boissons alcoolisées presque tous les jours à 
raison d’un verre ou 2', 'استهلكوا المشروبات الكحولية تقريبا كل يوم بمعدل كأس أو 
2؟'], 
              ['k', '(C.Q01k) Ils consomment 3 verres ou plus de boissons alcoolisées presque 
tous les jours', 'استهلكوا 
3
 كؤوس أو أكثر من المشروبات الكحولية تقريبا كل يوم؟'], 
              ['l', '(C.Q01l) Ils consomment 5 verres ou plus de boissons alcoolisées à la même 
occasion presque chaque weekend (consommation excessive d’alcool)', 'استهلكوا 
5
 أو أكثر 
مشروبات كحولية بنفس المناسبة أي كل نهاية أسبوع تقريبا (شرب حتى الثمالة)؟'] 
            ]} /> 
          <GridQuestion title="À quel point pensez-vous que les gens risquent de s'exposer au 
danger (physique ou autre) si...?" titleAr="ما هي درجة الخطورة 
)(جسدية/غيرها التي يعرّض الناس أنفسهم إليها 
إذا...؟" code="C.Q02" isRTL={isRTL} 
            options={RISK_LEVELS} values={data.section_q.risk_perceptions} 
            onChange={(key, val) => updateCheck('section_q', 'risk_perceptions', key, val)} 
            items={[ 
              ['q2a', '(C.Q02a) Ils consomment des tranquillisants sans prescription médicale 
OCCASIONNELLEMENT', 'استهلكوا المهدئات دون وصفة طبية أحيانا؟'], 
              ['q2b', '(C.Q02b) Ils consomment des tranquillisants sans prescription médicale 
REGULIEREMENT', 'استهلكوا المهدئات دون وصفة طبية بانتظام؟'], 
              ['q2c', '(C.Q02c) Ils consomment du cannabis OCCASIONNELLEMENT', 'استهلكوا 
الزطلة أحيانا؟'], 
              ['q2d', '(C.Q02d) Ils consomment du cannabis REGULIEREMENT', 'استهلكوا الزطلة 
بانتظام؟'], 
              ['q2e', '(C.Q02e) Ils consomment de la cocaïne OCCASIONNELLEMENT', 'استهلكوا 
الكوكايين أحيانا؟'], 
              ['q2f', '(C.Q02f) Ils consomment de l’ecstasy OCCASIONNELLEMENT', 'استهلكوا 
اإلكستازي أحيانا؟'], 
              ['q2g', '(C.Q02g) Ils consommer de l’héroïne OCCASIONNELLEMENT', 'استهلكوا 
الهيروين أحيانا؟'], 
              ['q2h', '(C.Q02h) Ils consomment des inhalants narcotiques 
OCCASIONNELLEMENT', 'استهلكوا المستنشقات أحيانا؟'], 
              ['q2i', '(C.Q02i) Ils consomment des amphétamines OCCASIONNELLEMENT', 
'استهلكوا األمفيتامين أحيانا؟'], 
              ['q2m', '(C.Q02m) Ils consomment Subutex OCCASIONNELLEMENT', 'استهلكوا 
سوبوتيكس أحيانا؟'], 
              ['q2k', '(C.Q02k) Ils consomment des cannabinoïdes synthétiques 
OCCASIONNELLEMENT', 'استهلكوا القنب الهندي الصناعي أحيانا؟'] 
            ]} /> 
          <GridQuestion title="Si vous avez eu un problème à cause de l'alcool/ des drogues, 
savez-vous à qui vous adresser pour obtenir de l'aide?" titleAr="إذا واجهت مشاكل بسبب الكحول/أو 
،المخدرات هل تعرف إلى من تلجأ لطلب المساعدة؟" code="C.Q03" isRTL={isRTL} 

            options={YES_NO_DK} values={data.section_q.help_sources} 
            onChange={(key, val) => updateCheck('section_q', 'help_sources', key, val)} 
            items={[ 
              ['a', '(C.Q03a) Membre(s) de la famille', 'أفراد العائلة'], 
              ['b', '(C.Q03b) Ami(e)s', 'األصدقاء'], 
              ['c', '(C.Q03c) Enseignants ou autres responsables du lycée', 'المدرسون أو اإلطار 
اإلداري'], 
              ['d', '(C.Q03d) Médecin, psychologue...', '
،األطباء علماء النفس'], 
              ['e', '(C.Q03e) Une personne de religion', 'رجال الدين'], 
              ['f', '(C.Q03f) Centres de traitement de la toxicomanie', 'مراكز معالجة اإلدمان'], 
              ['g', '(C.Q03g) Associations (Organisation Non Gouvernementale)', 'المنظمات غير 
الحكومية'], 
              ['h', '(C.Q03h) Autre option pertinente à l\'échelle nationale', 'مصالح وطنية أخرى مختصة'] 
            ]} /> 
          <div> 
            <FieldLabel code="C.Q04" fr="Pensez-vous que vous fumeriez du cannabis si l'un 
de vos meilleurs amis vous en proposait ?" ar="هل تعتقد أنك ستدخن القنب الهندي إذا عرضه عليك أحد أعز 
أصدقائك؟" isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <VerticalChoiceList name="friend_use_risk" value={data.section_q.friend_use_risk} 
onChange={handleChange('section_q')} isRTL={isRTL} 
              options={[['1', 'Certainement non', 'بالتأكيد 
,]'ال '[
2
', 'Probablement non', 'على األرجح 
,]'ال 
'[
3 ', 'Probablement oui', 'على األرجح 
,]'نعم '[
4
', 'Certainement oui', 'بالتأكيد نعم']]} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION R 
    { 
      id: 'section_r', 
      letter: 'R', 
      title: 'Réseaux Sociaux', 
      titleAr: 'وسائل التواصل الجتماعي', 
      subtitle: 'Les questions suivantes concernent les RESEAUX SOCIAUX (WhatsApp, 
Instagram, Facebook, Blogs, Snapchat, Skype, Twitter, Hangouts, etc.).', 
      subtitleAr: 'تتعلق األسئلة الموالية بمواقع التواصل اإلجتماعي 
،(الواتساب 
،اإلنستغرام 
،الفايسبوك 
،البلوقس 
،السنابشات 
،السكايب 
،التويتر الهنقاوتس...).', 
      color: 'bg-indigo-800', 
      content: ( 
        <div className="space-y-12"> 
          <GridQuestion title="Durant les 7 DERNIERS JOURS, combien d'heures avez-vous 
passé sur les réseaux sociaux en communiquant avec les autres sur internet?" titleAr="خالل 
السبعة أيام 
،األخيرة كم قضيت من ساعة على شبكات التواصل اإلجتماعي متفاعال مع اآلخرين على األنترنات؟" 
code="C.R01" isRTL={isRTL} 
            options={FREQ_DIGITAL} values={data.section_r.hours_per_day_breakdown} 
            onChange={(key, val) => updateCheck('section_r', 'hours_per_day_breakdown', key, 
val)} 

            items={[ 
              ['a', '(C.R01a) Durant un jour scolaire (un jour où vous devez aller au lycée)', 'أثناء يوم 
دراسي (يوم يجب الذهاب فيه إلى المدرسة)'], 
              ['b', '(C.R01b) Un jour non scolaire (un weekend ou des vacances)', 'أثناء يوم عطلة'] 
            ]} /> 
          <GridQuestion title="Dans quelle mesure êtes-vous d'accord ou en désaccord avec 
les avis suivants concernant l'utilisation des réseaux sociaux pour communiquer avec les 
autres sur internet?" titleAr="إلى أي مدى توافق أم ال اآلراء الموالية عن استعمال شبكات التواصل اإلجتماعي للتفاعل 
مع اآلخرين على األنترنات؟" code="C.R02" isRTL={isRTL} 
            options={AGREEMENT_SCALE_PAPER} values={data.section_r.agreement} 
            onChange={(key, val) => updateCheck('section_r', 'agreement', key, val)} 
            items={[ 
              ['a', '(C.R02a) Je pense que je passe trop de temps sur les réseaux sociaux', 'أعتقد 
أني أقضي كثيرا من الوقت على شبكات التواصل'], 
              ['b', '(C.R02b) Je deviens de mauvaise humeur quand je ne peux pas passer du 
temps sur les réseaux sociaux', 'أكون في مزاج متعكر عندما ال أقضي وقتا على شبكات التواصل'], 
              ['c', '(C.R02c) Mes parents disent que je passe trop de temps sur les réseaux 
sociaux', 'يرى والداي أنني أقضي كثيرا من الوقت على شبكات التواصل'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION S 
    { 
      id: 'section_s', 
      letter: 'S', 
      title: 'Jeux Vidéo', 
      titleAr: 'ألعاب الفيديو', 
      subtitle: 'Les questions suivantes concernent les JEUX VIDEOS (stratégie, puzzle, 
aventure, football, guerre, etc.) que vous pouvez jouer sur ordinateur, tablette, console, 
smartphone ou autre appareil électronique.', 
      subtitleAr: 'تتعلق األسئلة الموالية بألعاب الفيديو (لعبة 
،اإلستراتيجيا تركيب 
،القطع 
،المغامرة كرة 
،القدم 
)...الحرب التي 
يمكن أن تمارسها على 
،حاسوب لوحة 
،رقمية جهاز 
،تحكم هاتف ذكي أو أي جهاز آخر إلكتروني.', 
      color: 'bg-sky-900', 
      content: ( 
        <div className="space-y-12"> 
          <GridQuestion title="Durant les 30 DERNIERS JOURS, combien d’heures avez-vous 
passé sur les jeux vidéo ?" titleAr="خالل الثالثين يوم 
،األخيرة كم ساعة قضيت في ألعاب الفيديو؟" 
code="C.S01" isRTL={isRTL} 
            options={FREQ_DIGITAL} values={data.section_s} 
            onChange={(key, val) => update('section_s', key, val)} 
            items={[ 
              ['hours_per_day_school', '(C.S01a) Durant un jour d’école (un jour où vous devez 
aller au lycée)', 'أثناء يوم دراسي (يوم يجب الذهاب فيه إلى المعهد)'], 
              ['hours_per_day_non_school', '(C.S01b) un jour non scolaire (un weekend ou des 
vacances)', 'يوم غير دراسي (عطلة نهاية األسبوع أو العطل)'] 
            ]} /> 
          <div> 

            <FieldLabel code="C.S02" fr="Durant les 7 DERNIERS JOURS, combien de jours 
avez-vous passé sur les jeux vidéo?" ar="خالل السبعة أيام 
،األخيرة كم 
ًيوما لعبت فيها ألعاب الفيديو؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(Cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.S02" label="Nombre de jours passés sur les jeux vidéos" 
labelAr="عدد األيام التي قضيتها في ألعاب الفيديو" value={data.section_s.days_per_week} 
onChange={handleChange('section_s')} isRTL={isRTL} 
              options={[['0', 'Aucun jour', 'ال 
,]'يوم '[
1
,' '1
 jour', 'يوم 
,]'واحد '[
2
,' '2
 jours', '
,]'يومان '[
3
,' '3
 
jours', '3 
,]'أيام '[
4
,' '4
 jours', '4 
,]'أيام '[
5
,' '5
 jours', '5 
,]'أيام '[
6
,' '6
 jours', '6 
,]'أيام '[
7
,' '7
 jours', '7 
أيام']]} /> 
          </div> 
          <GridQuestion title="Dans quelle mesure êtes-vous d’accord ou en désaccord avec 
les avis suivants concernant les jeux vidéo :" titleAr="إلى أي مدى أنت ضد أو مع اآلراء الموالية عن ألعاب 
الفيديو؟" code="C.S03" isRTL={isRTL} 
            options={AGREEMENT_SCALE_CS03} values={data.section_s.agreement} 
            onChange={(key, val) => updateCheck('section_s', 'agreement', key, val)} 
            items={[ 
              ['a', '(C.S03a) Je pense que je passe trop de temps sur les jeux vidéo', 'أعتقد أني قضيت 
وقتا كثيرا في ألعاب الفيديو'], 
              ['b', '(C.S03b) Je deviens de mauvaise humeur si je ne peux pas passer du temps à 
jouer aux jeux vidéo', 'أكون في مزاج عكر عندما ال أستطيع تمضية الوقت في ألعاب الفيديو'], 
              ['c', '(C.S03c) Mes parents disent que je passe trop de temps sur les jeux vidéo', 
'يرى والداي أنني أقضي كثيرا من الوقت في ألعاب الفيديو'] 
            ]} /> 
        </div> 
      ) 
    }, 
    // SECTION T 
    { 
      id: 'section_t', 
      letter: 'T', 
      title: "Jeux d'Argent", 
      titleAr: 'ألعاب الحظ', 
      subtitle: "Les questions suivantes Concernent les jeux d'argent – jeux de chance pour 
gagner de l'argent (machine à sous, jeu de cartes, dés, Lotterie, paris sportifs, etc.) que ce 
soit virtuellement, sur Internet si vous utilisez un appareil personnel, un téléphone mobile, 
une tablette, etc., ou réellement : promosport ou les espaces de jeux d'argent (Gambling 
Terminals).", 
      subtitleAr: 'تتعلق األسئلة الموالية بالقمار وألعاب الحظ لربح المال (آالت 
،القمار ألعاب الورق أو 
،النرد 
،الياناصيب 
الرهانات 
)...الرياضية سواء افتراضيا على األنترنات إذا استعملت جهازا 
،خاصا هاتفا 
،جو ال لوحة 
...ذكية أو واقعيا بارتياد محل 
القمار أو كازينو أو وحدات القمار في الحانات.', 
      color: 'bg-orange-900', 
      content: ( 
        <div className="space-y-12"> 
          <div> 

            <FieldLabel code="C.T01" fr="Combien de fois avez-vous joué aux jeux d’argent 
durant les 12 DERNIERS MOIS?" ar="كم مرة لعبت القمار /قامرت خالل الـ12
 شهرا األخيرة؟" 
isRTL={isRTL} /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر خانة واحدة' : 
'(cochez une seule case)'}</p> 
            <InlineChoiceRow code="C.T01" label="Le nombre de fois où des jeux d’argent ont 
été joués durant les 12 DERNIERS MOIS" labelAr="عدد المرات التي تم فيها لعب ألعاب القمار خالل الـ12
 
شهرا األخيرة" value={data.section_t.months_12_freq} onChange={handleChange('section_t')} 
isRTL={isRTL} options={FREQ_GAMBLING_GRID} /> 
          </div> 
          <GridQuestion title="Si vous avez joué aux jeux d'argent durant les 12 DERNIERS 
MOIS, quel type de jeu avez-vous joué dans les espaces de jeux d'argent (HORS LIGNE)" 
titleAr="إذا قامرت خارج نطاق األنترنات خالل الـ12
 شهرا 
،األخيرة ما هي األلعاب التي مارستها؟" code="C.T02" 
isRTL={isRTL} 
            options={FREQ_GAMBLING_GRID} values={data.section_t.offline_games} 
            onChange={(key, val) => updateCheck('section_t', 'offline_games', key, val)} 
            items={[ 
              ['a', '(C.T02a) machines à sous', 'آالت القمار'], 
              ['b', '(C.T02b) Jeux de cartes ou de dés', 'ألعاب الورق أو النّرد'], 
              ['c', '(C.T02c) Loterie/jeux de hasard', 'الياناصيب / ألعاب الحظ'], 
              ['d', '(C.T02d) Les paris sportifs « promosport » ou sur les animaux (Chevaux, 
Chiens)', 'الرهانات الرياضية (كرة 
،القدم سباق الخيل)'] 
            ]} /> 
          <GridQuestion title="Si vous avez joué aux jeux d'argent sur internet durant les 12 
DERNIERS MOIS, à quels jeux avez-vous joué?" titleAr="إذا قامرت على األنترنات خالل الـ12
 شهرا 
،األخيرة فما هي األلعاب التي مارستها؟" code="C.T03" isRTL={isRTL} 
            options={FREQ_GAMBLING_GRID} values={data.section_t.online_games} 
            onChange={(key, val) => updateCheck('section_t', 'online_games', key, val)} 
            items={[ 
              ['a', '(C.T03a) machines à sous', 'آالت القمار'], 
              ['b', '(C.T03b) Jeux de cartes ou de dés', 'ألعاب الورق أو النّرد'], 
              ['c', '(C.T03c) Loterie/jeux de hasard', 'الياناصيب / ألعاب الحظ'], 
              ['d', '(C.T03d) Les paris sportifs « promosport » ou sur les animaux (Chevaux, 
Chiens)', 'الرهانات الرياضية (كرة 
،القدم سباق الخيل)'] 
            ]} /> 
          <div className="w-full border-t border-slate-200 pt-6"> 
            <p className="mb-5 text-sm font-semibold text-slate-700">{isRTL ? '
،اآلن فكر في ألعاب 
الحظ بصفة عامة' : "Maintenant, repensez aux jeux d’argent en général"}</p> 
            <div className="space-y-8"> 
              <div> 
                <FieldLabel code="C.T04" fr="Avez-vous ressenti le besoin de multiplier de plus 
en plus la valeur de vos mises?" ar="هل شعرت بالحاجة إلى مضاعفة المبالغ التي تراهن بها أكثر فأكثر؟" 
isRTL={isRTL} /> 
                <RadioGroup horizontal={false} name="felt_need_increase" 
value={data.section_t.felt_need_increase} onChange={handleChange('section_t')} 
options={YES_NO} isRTL={isRTL} /> 
              </div> 
              <div> 

                <FieldLabel code="C.T05" fr="Avez-vous déjà dû mentir à des personnes 
importantes pour vous sur le montant de vos mises?" ar="هل اضطررت إلى الكذب على أشخاص مهمين 
بالنسبة لك بشأن مبلغ رهاناتك؟" isRTL={isRTL} /> 
                <RadioGroup horizontal={false} name="lied_about_it" 
value={data.section_t.lied_about_it} onChange={handleChange('section_t')} 
options={YES_NO} isRTL={isRTL} /> 
              </div> 
            </div> 
          </div> 
          <CT06Question title="Si vous avez joué aux jeux d'argent durant les 12 DERNIERS 
MOIS… :" titleAr="إذا قامرت خالل الـ12
 شهرا األخيرة...:" code="C.T06" isRTL={isRTL} 
            values={data.section_t.gambling_problems} 
            onChange={(key, val) => updateCheck('section_t', 'gambling_problems', key, val)} 
            items={[ 
              ['a', '(C.T06a) Combien de fois êtes-vous retourné un autre jour pour essayer de 
gagner l’argent que vous avez perdu?', 'كم مرة عدت اليوم الموالي لمحاولة استرجاع األموال التي خسرتها؟'], 
              ['b', '(C.T06b) Quand vous jouiez à des jeux d’argent, avez-vous dit aux autres que 
vous gagniez de l’argent, alors qu’en réalité, vous perdiez?', 'عندما كنت 
،تقامر هل كنت تخبر اآلخرين 
بأنك 
،رابح والواقع أنك خاسر؟'], 
              ['c', '(C.T06c) Jouer aux jeux d’argent vous a-t-il déjà causé des problèmes tels que 
des disputes avec votre famille et vos ami(e)s, ou des problèmes au lycée ?', 'هل تسببت لك 
األموال التي تقامر بها في مشاكل مع العائلة أو األصدقاء أو في المدرسة أو مكان العمل؟'], 
              ['d', '(C.T06d) Avez-vous joué aux jeux d’argent plus que vous ne l’aviez prévu au 
début?', 'هل صادف أن قامرت أكثر مما خططت له؟'], 
              ['e', '(C.T06e) Est-ce que quelqu’un vous a critiqué à propos des jeux d’argent ou 
est-ce que vous a fait savoir que vous étiez accro à ces jeux, que vous pensiez que c’était 
vrai ou non?', 'هل انتقد أحد بسبب القمار أو أعلمك بأنك متورط في القمار سواء اعترفت بذلك أم لم تعترف؟'], 
              ['f', '(C.T06f) Avez-vous déjà senti mal à propos de combien d’argent vous pariez ou 
de ce qui se passe ensuite?', 'هل شعرت مرة بالندم على مبالغ األموال التي قامرت بها أو أحسست بما يحدث لك 
عندما تصرف األموال في القمار؟'], 
              ['g', '(C.T06g) Avez-vous déjà eu envie d’arrêter de jouer, mais vous ne pensiez pas 
que vous le pouviez?', 'هل شعرت مرة بالرغبة في الكف عن 
،المراهنة/القمار ولم تفكر في أنك تستطيع؟'], 
              ['h', '(C.T06h) Avez-vous déjà caché à votre famille ou amis des cartes de pari, 
billets de loterie, argent que vous avez gagné ou toute preuve de vos jeux d’argent ?', 'هل 
أخفيت مرة عن عائلتك أو أصدقائك بطاقات 
،مراهنة تذاكر 
،يناصيب م ال ربحته أو أي دليل على أنك تراهن/تقامر؟'], 
              ['i', '(C.T06i) Avez-vous déjà eu des conflits financiers avec votre famille ou vos 
amis autour de jeux d’argent, principalement causés par les jeux d’argent?', 'هل حدثت لك خالفات 
مالية مع العائلة أو 
،األصدقاء سببها الرئيسي المراهنة/القمار؟'], 
              ['j', '(C.T06j) Avez-vous emprunté de l’argent pour parier avec et vous ne l’avez pas 
rendu?', 'هل استلفت أمو ال لتراهن بها ولم تردها ألصحابها؟'], 
              ['k', '(C.T06k) Avez-vous déjà manqué l’école en raison des activités des jeux 
d’argent ?', 'هل سبق لك أن تغيبت عن المدرسة بسبب انشغالك بالمراهنة/القمار؟'], 
              ['l', '(C.T06l) Avez-vous emprunté ou volé de l’argent pour parier avec ou pour 
couvrir des activités des jeux d’argent ?', 'هل استلفت أمو ال أو سرقتها لتراهن بها أو لتغطي بها أنشطتك في 
المراهنة/القمار؟'] 
            ]} /> 
        </div> 
      ) 

    }, 
    // SECTION U 
    { 
      id: 'section_u', 
      letter: 'U', 
      title: 'Violence', 
      titleAr: 'العنف', 
      subtitle: 'Les questions suivantes concernent la violence :', 
      subtitleAr: 'تتعلق األسئلة الموالية بالعنف :', 
      color: 'bg-red-800', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.U01" fr="Au cours des 12 derniers mois, combien de fois t'es-tu 
battu physiquement avec une ou plusieurs autres personnes ?" ar="كم مرة تشاجرت خالل الـ 
12
 
ًشهرا الماضية؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="fights_12months" 
value={data.section_u.fights_12months} onChange={handleChange('section_u')} 
              options={FIGHT_FREQUENCY} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.U02" fr="Quelles étaient les circonstances de la dernière 
bagarre ?" ar="ما هي ظروف الشجار األخير؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="fight_circumstances" 
value={data.section_u.fight_circumstances} onChange={handleChange('section_u')} 
              options={[ 
                ['1', "Je me battais avec quelqu'un (J'étais l'initiateur)", 'كنت أتشاجر مع شخص (كنت 
البادئ)'], 
                ['2', "J'ai été attaqué, agressé ou maltraité par une (plusieurs) personne(s)", 'تم 
مهاجمتي أو اعتدائي من قبل شخص (أشخاص)'] 
              ]} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.U03" fr="Quel était le lieu de la bagarre ?" ar="أين وقع الشجار؟" 
isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="fight_location" 
value={data.section_u.fight_location} onChange={handleChange('section_u')} 
              options={[ 
                ['1', 'Au sein du lycée', 'داخل المعهد'], 
                ['2', "A l'extérieur du lycée", 'خارج المعهد'] 
              ]} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.U04" fr="En cas de problème(s) telle qu’une bagarre entre toi 
et un ou plusieurs autres élèves, est ce que les personnels du lycée (Enseignants, 
surveillant, directeur) interviennent pour t’aider ?" ar="في حالة حدوث مشكلة مثل شجار بينك وبين طالب أو 
،أكثر هل يتدخل موظفو المعهد 
،(أساتذة 
،مراقبون 
)مدير للمساعدة؟" isRTL={isRTL} /> 

            <RadioGroup horizontal={true} showNumbers={false} name="staff_intervention" 
value={data.section_u.staff_intervention} onChange={handleChange('section_u')} 
              options={YES_NO} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.U05" fr="Avez-vous vécu ou ressenti, suite à une bagarre, une 
ou plusieurs conséquences de ce genre ? (Vous pouvez choisir une ou plusieurs 
propositions)" ar="هل عانيت أو 
،شعرت بعد 
،الشجار بواحدة أو أكثر من العواقب التالية؟ (يمكنك اختيار اقتراح واحد أو 
أكثر)" isRTL={isRTL} /> 
            <div className="space-y-2 mt-4"> 
              {[ 
                ['1', 'Absentéisme du lycée', 'التغيب عن المعهد'], 
                ['2', 'Défaut de concentration aux études', 'ضعف التركيز في الدراسة'], 
                ['3', 'Anxiété et peur', 'القلق والخوف'], 
                ['4', 'Cauchemars', 'الكوابيس'], 
                ['5', 'Insomnie', 'األرق'] 
              ].map(([key, fr, ar]) => ( 
                <button key={key} type="button" role="checkbox" 
aria-checked={!!(data.section_u.fight_consequences && 
data.section_u.fight_consequences.includes(key))} 
                  onClick={() => toggleList('section_u', 'fight_consequences', key)} 
                  className={`flex w-full items-center gap-3 py-2 text-left cursor-pointer group 
transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
${data.section_u.fight_consequences && data.section_u.fight_consequences.includes(key) 
? 'bg-slate-50' : 'hover:bg-slate-50'}`}> 
                  <span className="w-5 shrink-0 text-center text-sm font-bold 
text-slate-600">{key}</span> 
                  <SquareMark checked={!!(data.section_u.fight_consequences && 
data.section_u.fight_consequences.includes(key))} /> 
                  <span className="font-medium text-slate-700">{isRTL ? ar : fr}</span> 
                </button> 
              ))} 
            </div> 
          </div> 
          <div> 
            <p className="mb-3 text-sm font-medium leading-relaxed text-slate-600">{isRTL ? 
'السؤال التالي يتعلق بأخطر إصابة تعرضت لها خالل الـ 
12
 
ًشهرا 
.الماضية اإلصابة خطيرة إذا تسببت في تغيبك عن أنشطتك 
اليومية (مثل الذهاب إلى 
،المعهد 
)الرياضة لمدة يوم كامل على األقل وتتطلب رعاية طبية.' : "La question suivante 
porte sur la blessure la plus grave que vous ayez eue au cours des 12 derniers mois. Une 
blessure est grave lorsqu'elle vous fait manquer au moins un jour entier de vos activités 
quotidiennes (tels que d'aller au lycée, le sport) et exige des soins médicaux."}</p> 
            <FieldLabel code="C.U06" fr="Au cours des 12 derniers mois, dans quelle 
circonstance avez-vous été très gravement blessé ?" ar="خالل الـ12
 
ًشهرا الماضية، dans quelle 
circonstance avez-vous été très gravement blessé ?" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="serious_injury_12months" 
value={data.section_u.serious_injury_12months} onChange={handleChange('section_u')} 
              options={[ 

                ['1', "Je n'ai pas été très gravement blessé au cours des 12 derniers mois", 'لم أصب 
بإصابة خطيرة خالل الـ 
12
 
ًشهرا الماضية'], 
                ['2', 'Je me suis blessé accidentellement', 'أصبت عن طريق الخطأ'], 
                ['3', "Quelqu'un d'autre m'a blessé accidentellement", 'أصابني شخص آخر عن طريق الخطأ'], 
                ['4', 'Je me suis blessé délibérément', 'أصبت نفسي 
ًعمدا'], 
                ['5', "Quelqu'un d'autre m'a blessé délibérément", 'أصابني شخص آخر 
ًعمدا'] 
              ]} isRTL={isRTL} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION V 
    { 
      id: 'section_v', 
      letter: 'V', 
      title: 'Niveau de stress perçu', 
      titleAr: 'مستوى التوتر المدرك', 
      subtitle: 'Les questions suivantes concernent le niveau de stress perçu :', 
      subtitleAr: 'تتعلق األسئلة الموالية بمستوى التوتر المدرك :', 
      color: 'bg-violet-800', 
      content: ( 
        <div className="space-y-12"> 
          <div> 
            <FieldLabel code="C.V01" fr="Durant le mois passé, combien de fois avez-vous eu 
le sentiment de ne pas pouvoir contrôler les aspects importants de votre vie ?" ar="خالل الشهر 
،الماضي كم مرة شعرت بعدم القدرة على التحكم في األمور المهمة في حياتك؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="a" value={data.section_v.a} 
onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.V02" fr="Durant le mois passé, combien de fois avez-vous eu 
confiance en votre capacité à gérer vos problèmes personnels ?" ar="خالل الشهر 
،الماضي كم مرة 
شعرت بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="b" value={data.section_v.b} 
onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.V3" fr="Durant le mois passé, combien de fois avez-vous eu le 
sentiment que les choses allaient comme vous le vouliez ?" ar="خالل الشهر 
،الماضي كم مرة شعرت 
بأن األمور تسير كما تريد؟" isRTL={isRTL} /> 
            <RadioGroup horizontal={false} name="c" value={data.section_v.c} 
onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} /> 
          </div> 
          <div> 
            <FieldLabel code="C.V04" fr="Durant le mois passé, combien de fois avez-vous eu 
le sentiment que les difficultés s'accumulaient tellement que vous ne pourriez pas les 
surmonter ?" ar="خالل الشهر 
،الماضي كم مرة شعرت بأن الصعوبات تتراكم لدرجة أنك ال تستطيع التغلب عليها؟" 
isRTL={isRTL} /> 

            <RadioGroup horizontal={false} name="d" value={data.section_v.d} 
onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} /> 
          </div> 
        </div> 
      ) 
    }, 
    // SECTION Z — present in the paper and always kept as the final static section 
    { 
      id: 'section_z', 
      letter: 'Z', 
      title: 'Validation (Honnêteté)', 
      titleAr: 'التحقق (الصدق)', 
      subtitle: "Vous avez presque terminé de répondre à ce questionnaire, nous vous 
demandons de répondre le plus franchement possible aux deux questions restantes.", 
      subtitleAr: 'بعد أن انتهيت من اإلجابة عن هذا 
،الستبيان نرجو منك أن تجيب عن السؤالين المتبقيين بكل صراحة قدر 
اإلمكان.', 
      color: 'bg-slate-900', 
      content: ( 
        <div className="space-y-10"> 
          <div> 
            <FieldLabel 
              code="C.Z01" 
              fr="Si vous étiez un consommateur d'alcool, pensez-vous que vous auriez répondu 
à ce questionnaire comme vous l'avez fait?" 
              ar="إذا كنت من مستهلكي 
،الكحول هل تعتقد أنك كنت لتجيب عن هذا الستبيان بالشكل الذي فعلت؟" 
              isRTL={isRTL} 
            /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر إجابة واحدة' : 
'(Choisissez une seule réponse)'}</p> 
            <RadioGroup 
              horizontal={false} 
              name="honesty_level" 
              value={data.section_z.honesty_level} 
              onChange={handleChange('section_z')} 
              options={[ 
                ['1', "J'ai déjà déclaré avoir consommé de l'alcool", 'لقد سبق وأكدت أنني استهلكت الكحول'], 
                ['2', 'Oui, sans aucun doute.', 'نعم دون شك'], 
                ['3', 'Probablement oui', 'يمكن نعم'], 
                ['4', 'Probablement pas', 'يمكن ال'], 
                ['5', 'Non, sans aucun doute', 'ال دون شك'], 
              ]} 
              isRTL={isRTL} 
            /> 
          </div> 
          <div> 
            <FieldLabel 
              code="C.Z02" 

              fr="Si vous étiez un consommateur de cannabis, pensez-vous que vous répondriez 
à ce questionnaire comme vous l’avez fait?" 
              ar="إذا كنت من مستهلكي القنب 
،الهندي هل تعتقد أنك كنت ستجيب عن هذا الستبيان بالشكل الذي فعلت؟" 
              isRTL={isRTL} 
            /> 
            <p className="mb-2 text-xs font-medium text-slate-500">{isRTL ? 'اختر إجابة واحدة' : 
'(Choisissez une seule réponse)'}</p> 
            <RadioGroup 
              horizontal={false} 
              name="honesty_cannabis" 
              value={data.section_z.honesty_cannabis} 
              onChange={handleChange('section_z')} 
              options={[ 
                ['1', "J'ai déjà déclaré avoir consommé du cannabis", 'لقد سبق وأكدت أنني استهلكت القنب 
الهندي'], 
                ['2', 'Oui, sans aucun doute.', 'نعم دون شك'], 
                ['3', 'Probablement oui', 'يمكن نعم'], 
                ['4', 'Probablement pas', 'يمكن ال'], 
                ['5', 'Non, sans aucun doute', 'ال دون شك'], 
              ]} 
              isRTL={isRTL} 
            /> 
          </div> 
        </div> 
      ) 
    }, 
  ]; 
 
  // ─── Dynamic sections and logic 
──────────────────────────────────────────── 
 
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
      try { setCurrentUser(JSON.parse(u)); } catch (e) { } 
    } 
    fetchActiveReport(); 
  }, []); 
 
  const isSuperAdmin = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' || 
currentUser?.role?.toUpperCase() === 'GLOBAL_ADMIN'; 
 
  const isHidden = (code) => { 
    return dynamicConfigs.find(q => q.code === code && q.is_hidden); 
  }; 
 
  const handleDeleteDynamic = async (code, type) => { 
    if (!window.confirm(isRTL ? 'تأكيد الحذف؟' : 'Confirmer la suppression ?')) return; 
    try { 
      await api.delete(`dynamic-questions/${code}/`); 
      fetchConfig(); 
    } catch (err) { console.error(err); } 
  }; 
 
  const renderDynamicQuestion = (q, extraAnswers, setExtraAnswers, isRTL) => ( 
    <div key={q.code} className={`p-6 bg-slate-50 rounded-3xl border-2 ${isEditMode ? 
'border-brand-200' : 'border-slate-100'} relative group`}> 
      {isEditMode && ( 
        <div className="absolute top-4 right-4 flex gap-2 z-50"> 
          <button onClick={() => setEditingItem({ id: q.code, type: 'QUESTION', section: 
q.section, data: q })} className="p-2 text-slate-400 hover:text-brand-600 bg-white 
rounded-lg shadow-sm border border-slate-100"><Edit2 size={14} /></button> 
          <button onClick={() => handleDeleteDynamic(q.code, 'QUESTION')} className="p-2 
text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm border 
border-slate-100"><Trash2 size={14} /></button> 
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
          className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-white 
focus:border-brand-500 outline-none transition-all ${isEditMode ? 'opacity-50 
pointer-events-none' : ''}`} 
          placeholder={isRTL ? 'إجابتك...' : 'Votre réponse...'} 
        /> 
      )} 
    </div> 
  ); 
 
  const staticProcessed = SECTIONS.filter(s => s.id === 'section_z' || !isHidden(s.id)).map(s 
=> { 
    const sectionDynQuestions = dynamicConfigs.filter(q => q.is_dynamic && !q.is_hidden && 
q.question_type !== 'SECTION' && q.section === s.id); 
    let contentNode = s.content; 
    if (sectionDynQuestions.length > 0 || isEditMode) { 
      contentNode = ( 
        <> 
          {s.content} 
          <div className={`mt-12 pt-12 border-t-2 border-dashed ${isEditMode ? 
'border-brand-200' : 'border-slate-200'}`}> 
            <h4 className={`font-bold mb-8 uppercase tracking-widest text-sm ${isEditMode ? 
'text-brand-600' : 'text-slate-800'}`}> 
              {isRTL ? 'أسئلة إضافية' : 'Questions Supplémentaires'} 
            </h4> 
            <div className="space-y-10"> 
              {sectionDynQuestions.map(q => renderDynamicQuestion(q, extraAnswers, 
setExtraAnswers, isRTL))} 
              {isEditMode && ( 
                <button onClick={() => setEditingItem({ id: null, type: 'QUESTION', section: s.id, 
data: { code: '', label_fr: '', question_type: 'TEXT', section: s.id, is_dynamic: true, 
options_json: [] } })} className="w-full py-4 border-2 border-dashed border-brand-200 
text-brand-600 rounded-3xl flex items-center justify-center gap-2 hover:bg-brand-50 
transition-colors font-bold text-sm"> 
                  <Plus size={16} /> Ajouter une question 
                </button> 
              )} 

            </div> 
          </div> 
        </> 
      ); 
    } 
    const overriddenTitle = s.id === 'section_z' ? null : dynamicConfigs.find(q => q.code === 
s.id && q.question_type === 'SECTION'); 
    return { 
      ...s, 
      title: overriddenTitle ? overriddenTitle.label_fr : s.title, 
      titleAr: overriddenTitle ? (overriddenTitle.label_ar || overriddenTitle.label_fr) : s.titleAr, 
      content: contentNode, 
      actionButtons: isEditMode ? ( 
        <> 
          <button onClick={() => setEditingItem({ id: s.id, type: 'SECTION', section: s.id, data: 
overriddenTitle || { code: s.id, label_fr: s.title, question_type: 'SECTION', section: s.id, 
is_dynamic: false } })} className="px-4 py-2 text-slate-900 bg-white rounded-lg shadow-xl 
flex items-center gap-2 text-xs font-bold uppercase tracking-widest 
hover:bg-slate-50"><Edit2 size={14} /> Éditer</button> 
          <button onClick={async () => { 
            if (!window.confirm('Voulez-vous masquer cette section entière ?')) return; 
            try { 
              await api.post('dynamic-questions/', { code: s.id, label_fr: s.title, question_type: 
'SECTION', section: s.id, is_hidden: true, is_dynamic: false }); 
              fetchConfig(); 
            } catch (err) { alert("Erreur."); } 
          }} className="px-4 py-2 text-white bg-rose-600 rounded-lg shadow-xl flex 
items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-rose-700"><Trash2 
size={14} /> Masquer</button> 
        </> 
      ) : null 
    }; 
  }); 
 
  const dynamicSectionsList = dynamicConfigs.filter(q => q.is_dynamic && !q.is_hidden && 
q.question_type === 'SECTION' && q.code.toLowerCase() !== 'section_z' && 
q.code.toLowerCase() !== 'z'); 
  const dynamicProcessed = dynamicSectionsList.map(sec => { 
    const sectionDynQuestions = dynamicConfigs.filter(q => q.is_dynamic && !q.is_hidden && 
q.question_type !== 'SECTION' && q.section === sec.code); 
    return { 
      id: sec.code, 
      letter: sec.code.replace(/^section_/i, '').toUpperCase(), 
      title: sec.label_fr, 
      titleAr: sec.label_ar || sec.label_fr, 
      color: 'bg-brand-800', 
      actionButtons: isEditMode ? ( 
        <> 

          <button onClick={() => setEditingItem({ id: sec.code, type: 'SECTION', section: 
sec.code, data: sec })} className="px-4 py-2 text-slate-900 bg-white rounded-lg shadow-xl 
flex items-center gap-2 text-xs font-bold uppercase tracking-widest 
hover:bg-slate-50"><Edit2 size={14} /> Éditer</button> 
          <button onClick={() => handleDeleteDynamic(sec.code, 'SECTION')} 
className="px-4 py-2 text-white bg-rose-600 rounded-lg shadow-xl flex items-center gap-2 
text-xs font-bold uppercase tracking-widest hover:bg-rose-700"><Trash2 size={14} /> 
Supprimer</button> 
        </> 
      ) : null, 
      content: ( 
        <div className="space-y-10 relative"> 
          {sectionDynQuestions.length > 0 ? ( 
            sectionDynQuestions.map(q => renderDynamicQuestion(q, extraAnswers, 
setExtraAnswers, isRTL)) 
          ) : ( 
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 
border-dashed border-slate-200 font-medium"> 
              {isRTL ? 'هذا القسم فارغ 
ًحاليا.' : 'Cette section est vide pour le moment.'} 
            </div> 
          )} 
          {isEditMode && ( 
            <button onClick={() => setEditingItem({ id: null, type: 'QUESTION', section: sec.code, 
data: { code: '', label_fr: '', question_type: 'TEXT', section: sec.code, is_dynamic: true, 
options_json: [] } })} className="w-full py-4 border-2 border-dashed border-brand-200 
text-brand-600 rounded-3xl flex items-center justify-center gap-2 hover:bg-brand-50 
transition-colors font-bold text-sm mt-8"> 
              <Plus size={16} /> Ajouter une question 
            </button> 
          )} 
        </div> 
      ) 
    }; 
  }); 
 
  const SECTION_ORDER = [ 
    'section_a', 'section_b', 'section_c', 'section_d', 'section_e', 
    'section_g', 'section_h', 'section_i', 'section_j', 'section_k', 'section_l', 'section_m', 
    'section_n', 'section_p', 'section_q', 'section_r', 'section_s', 'section_t', 'section_u', 
'section_v', 'section_z' 
  ]; 
  const allProcessed = [...staticProcessed, ...dynamicProcessed]; 
  allProcessed.sort((a, b) => { 
    const idA = String(a.id).toLowerCase(); 
    const idB = String(b.id).toLowerCase(); 
    const ia = SECTION_ORDER.indexOf(idA); 
    const ib = SECTION_ORDER.indexOf(idB); 
    if (ia !== -1 && ib !== -1) return ia - ib; 

    if (ia !== -1) return -1; 
    if (ib !== -1) return 1; 
    return idA.localeCompare(idB); 
  }); 
 
  const filteredSections = allProcessed.filter(s => !['test', 
'section_test'].includes(String(s.id).toLowerCase())); 
  if (isEditMode) { 
    filteredSections.push({ 
      id: 'add_section', 
      letter: '+', 
      title: 'Nouvelle Section', 
      color: 'bg-slate-200 !text-slate-800', 
      content: ( 
        <div className="p-12 border-4 border-dashed border-slate-200 rounded-[48px] flex 
items-center justify-center"> 
          <button onClick={() => setEditingItem({ id: null, type: 'SECTION', section: '', data: { 
code: 'section_', label_fr: '', question_type: 'SECTION', section: 'section_', is_dynamic: true, 
options_json: [] } })} className="flex flex-col items-center gap-4 text-slate-400 
hover:text-brand-600 transition-colors group"> 
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-brand-100 flex 
items-center justify-center transition-colors"><Plus size={32} /></div> 
            <span className="font-black uppercase tracking-widest text-sm">Ajouter une 
Section Dynamique</span> 
          </button> 
        </div> 
      ) 
    }); 
  } 
 
  const currentSection = filteredSections[step] || filteredSections[0]; 
  const progress = ((step + 1) / filteredSections.length) * 100; 
 
  if (status === 'success') { 
    const isPractitioner = ['PRACTITIONER', 'OPERATOR', 'ADMIN', 'SUPER_ADMIN', 
'GLOBAL_ADMIN'].includes(currentUser?.role?.toUpperCase()); 
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 
text-center px-8"> 
        <motion.div 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: 'spring', damping: 12 }} 
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center 
mb-8" 
        > 
          <CheckCircle2 size={48} className="text-green-500" /> 
        </motion.div> 
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 
tracking-tight">Questionnaire soumis !</h1> 
        <p className="text-slate-500 text-xl mb-12 max-w-md leading-relaxed"> 
          {isRTL ? '
ًشكرا على 
.مشاركتك بياناتك محمية بالكامل.' : 'Merci pour votre participation. Vos 
données sont entièrement protégées.'} 
        </p> 
        <div className="flex flex-col gap-4 w-full max-w-xs"> 
          <button 
            onClick={() => { setStatus(null); setStep(0); setData(INITIAL_DATA); 
window.scrollTo(0, 0); }} 
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl 
hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center 
gap-3" 
          > 
            Nouveau questionnaire 
          </button> 
          {currentUser && ( 
            <> 
              <div className="relative py-4"> 
                <div className="absolute inset-0 flex items-center"><div className="w-full 
border-t border-slate-200"></div></div> 
                <div className="relative flex justify-center text-xs uppercase font-black 
tracking-widest text-slate-400"><span className="bg-slate-50 px-3">{isRTL ? 'إجراءات 
الممارس' : 'Actions Praticien'}</span></div> 
              </div> 
              <button 
                onClick={() => handleFinalize('/class-report')} 
                className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl 
hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-lg 
shadow-brand-100" 
              > 
                <Plus size={20} /> 
                {isRTL ? 'إغالق وفصل جديد' : 'Clôturer et Nouvelle Classe'} 
              </button> 
              <button 

                onClick={() => handleFinalize('/user')} 
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 
font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3" 
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
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl 
font-arabic' : 'ltr'}`}> 
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm"> 
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center 
justify-between"> 
          <div className="flex items-center gap-4"> 
            <button 
              onClick={() => onClose ? onClose() : navigate(-1)} 
              className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 
hover:text-slate-900 transition-all border border-slate-100" 
              title="Retour" 
            > 
              <ArrowLeft size={18} /> 
            </button> 
            <div> 
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest 
block leading-none mb-1">MedSPAD 2026</span> 
              <span className="font-bold text-slate-700 text-sm">{step + 1} / 
{filteredSections.length} — {currentSection?.title}</span> 
            </div> 
          </div> 
          <div className="flex items-center gap-3"> 
            {isSuperAdmin && ( 
              <button onClick={() => setIsEditMode(!isEditMode)} className={`px-5 py-2 
text-[10px] font-black uppercase tracking-widest border-2 rounded-xl transition-all flex 
items-center gap-2 ${isEditMode ? 'bg-brand-50 text-brand-600 border-brand-200 
shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-50 text-slate-600 border-slate-200 
hover:bg-brand-50 hover:text-brand-600'}`}> 
                <Pencil size={14} /> {isEditMode ? 'Quitter Édition' : 'Mode Édition'} 
              </button> 
            )} 
            <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} 

              className="px-4 py-2 text-sm font-bold border-2 border-slate-200 rounded-xl 
hover:bg-slate-100 transition-all"> 
              {lang === 'fr' ? 'arabe' : 'الفرنسية'} 
            </button> 
          </div> 
        </div> 
        <div className="h-1 bg-slate-100 w-full"> 
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: 
`${progress}%` }}></div> 
        </div> 
      </div> 
 
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10"> 
        <SectionHeader letter={currentSection.letter} title={currentSection.title} 
subtitle={currentSection.subtitle} color={currentSection.color} 
actionButtons={currentSection.actionButtons} /> 
        <div className="animate-fade-in"> 
          {currentSection.content} 
        </div> 
      </div> 
 
      <div className="sticky bottom-0 bg-white border-t border-slate-100 shadow-lg"> 
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center 
justify-between gap-4"> 
          <button 
            onClick={() => setStep(s => Math.max(0, s - 1))} 
            disabled={step === 0} 
            className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl 
font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed 
transition-all" 
          > 
            <ChevronLeft size={20} /> 
            {isRTL ? 'السابق' : 'Précédent'} 
          </button> 
          <div className="flex gap-1.5"> 
            {filteredSections.map((_, i) => ( 
              <div key={i} onClick={() => setStep(i)} className={`h-2 rounded-full cursor-pointer 
transition-all ${i === step ? 'w-6 bg-blue-600' : i < step ? 'w-2 bg-blue-200' : 'w-2 
bg-slate-200'}`}></div> 
            ))} 
          </div> 
          {step === filteredSections.length - 1 ? ( 
            <button 
              onClick={handleSubmit} 
              disabled={status === 'submitting'} 
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 
text-white font-bold rounded-xl shadow-xl shadow-blue-100 transition-all 
disabled:opacity-70" 

            > 
              {status === 'submitting' ? <div className="w-5 h-5 border-2 border-white/30 
border-t-white rounded-full animate-spin"></div> : <><Send size={18} />{isRTL ? 'إرسال' : 
'Soumettre'}</>} 
            </button> 
          ) : ( 
            <button 
              onClick={() => setStep(s => Math.min(filteredSections.length - 1, s + 1))} 
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-700 
text-white font-bold rounded-xl transition-all" 
            > 
              {isRTL ? 'التالي' : 'Suivant'} 
              <ChevronRight size={20} /> 
            </button> 
          )} 
        </div> 
        {status === 'error' && ( 
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-4"> 
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6"> 
              <div className="flex items-center gap-3 text-red-700 mb-4 font-black uppercase 
tracking-tighter text-sm"> 
                <AlertCircle size={20} /> 
                {isRTL ? 'حدث خطأ أثناء اإلرسال' : 'Erreurs de validation'} 
              </div> 
              <ul className="space-y-3"> 
                {errors ? ( 
                  Object.entries(errors).map(([key, value]) => { 
                    const renderErrorValue = (val) => { 
                      if (Array.isArray(val)) { 
                        return val.map(v => typeof v === 'object' ? renderErrorValue(v) : 
String(v)).join(', '); 
                      } 
                      if (typeof val === 'object' && val !== null) { 
                        return Object.entries(val) 
                          .map(([k, v]) => `${k}: ${typeof v === 'object' ? renderErrorValue(v) : 
String(v)}`) 
                          .join(' | '); 
                      } 
                      return String(val); 
                    }; 
                    return ( 
                      <li key={key} className="flex flex-col gap-1"> 
                        <span className="text-[10px] font-black text-red-400 uppercase 
tracking-widest"> 
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
                    {isRTL ? 'يرجى التحقق من التصال والمحاولة مرة أخرى.' : 'Veuillez vérifier votre connexion 
et réessayer.'} 
                  </li> 
                )} 
              </ul> 
            </div> 
          </div> 
        )} 
      </div> 
 
      <div className="fixed bottom-6 left-6 z-[300]"> 
        <button 
          onClick={() => setData(generateRandomData())} 
          className="group flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-sm 
text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95" 
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: '2px dashed 
rgba(255,255,255,0.3)' }} 
          title="Outil de développement — Génère des réponses aléatoires cohérentes" 
        > 
          <span className="text-lg group-hover:animate-spin" style={{ display: 'inline-block' 
}}>🎲</span> 
          <span>Auto-remplir</span> 
        </button> 
      </div> 
 
      {editingItem && ( 
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"> 
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
onClick={() => setEditingItem(null)} className="absolute inset-0 bg-slate-900/60 
backdrop-blur-md" /> 
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 
}} className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-8 border 
border-slate-100"> 
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 
pb-6"> 
              <div> 
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest 
italic">{editingItem.id ? 'Éditer' : 'Créer'} {editingItem.type === 'SECTION' ? 'Section' : 
'Question'}</h3> 
                <p className="text-[10px] font-bold text-slate-400 uppercase 
tracking-[2px]">{editingItem.section}</p> 
              </div> 

              <button onClick={() => setEditingItem(null)} className="p-3 bg-slate-50 
text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"><X 
size={20} /></button> 
            </div> 
            <div className="space-y-6"> 
              <div> 
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest 
mb-2 block">Code Unique (obligatoire, max 10 chars pour section)</label> 
                <input type="text" maxLength={editingItem.type === 'SECTION' ? 10 : 50} 
value={editingItem.data.code} disabled={!!editingItem.id} onChange={(e) => setEditingItem({ 
...editingItem, data: { ...editingItem.data, code: e.target.value.toUpperCase() } })} 
className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm 
focus:border-brand-500 outline-none disabled:opacity-50" placeholder={editingItem.type === 
'SECTION' ? 'SEC_W' : 'W.01'} /> 
              </div> 
              <div> 
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest 
mb-2 block">Libellé (Français)</label> 
                <input type="text" value={editingItem.data.label_fr} onChange={(e) => 
setEditingItem({ ...editingItem, data: { ...editingItem.data, label_fr: e.target.value } })} 
className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm 
focus:border-brand-500 outline-none" /> 
              </div> 
              <div> 
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest 
mb-2 block">Libellé (Arabe)</label> 
                <input type="text" dir="rtl" value={editingItem.data.label_ar || ''} onChange={(e) => 
setEditingItem({ ...editingItem, data: { ...editingItem.data, label_ar: e.target.value } })} 
className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm 
focus:border-brand-500 outline-none text-right" /> 
              </div> 
              {editingItem.type === 'QUESTION' && ( 
                <> 
                  <div> 
                    <label className="text-[10px] font-black text-slate-400 uppercase 
tracking-widest mb-2 block">Type de question</label> 
                    <select value={editingItem.data.question_type} onChange={(e) => 
setEditingItem({ ...editingItem, data: { ...editingItem.data, question_type: e.target.value } })} 
className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm 
focus:border-brand-500 outline-none"> 
                      <option value="TEXT">Texte</option> 
                      <option value="NUMBER">Nombre</option> 
                      <option value="RADIO">Choix Multiple (Radio)</option> 
                    </select> 
                  </div> 
                  {editingItem.data.question_type === 'RADIO' && ( 
                    <div> 

                      <label className="text-[10px] font-black text-slate-400 uppercase 
tracking-widest mb-2 block">Options (séparées par des virgules)</label> 
                      <input type="text" value={Array.isArray(editingItem.data.options_json) ? 
editingItem.data.options_json.map(o => o[0]).join(', ') : ''} onChange={(e) => { 
                        const opts = e.target.value.split(',').map(o => [o.trim(), o.trim(), o.trim()]); 
                        setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: opts } 
}); 
                      }} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 
font-medium text-sm focus:border-brand-500 outline-none" placeholder="Oui, Non, 
Peut-être" /> 
                    </div> 
                  )} 
                </> 
              )} 
              <div className="flex items-center gap-6 pt-2"> 
                <div className="flex-1"> 
                  <label className="text-[10px] font-black text-slate-400 uppercase 
tracking-widest mb-2 block">Ordre d'affichage</label> 
                  <input type="number" value={editingItem.data.order || 100} onChange={(e) => 
setEditingItem({ ...editingItem, data: { ...editingItem.data, order: parseInt(e.target.value) } })} 
className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm 
focus:border-brand-500 outline-none" /> 
                </div> 
                <div className="flex-1"> 
                  <label className="text-[10px] font-black text-slate-400 uppercase 
tracking-widest mb-2 block">Visibilité</label> 
                  <label className="flex items-center gap-3 mt-4 cursor-pointer"> 
                    <SquareCheckbox 
                      checked={!editingItem.data.is_hidden} 
                      onChange={() => setEditingItem({ ...editingItem, data: { ...editingItem.data, 
is_hidden: !editingItem.data.is_hidden } })} 
                      ariaLabel="Afficher au public" 
                    /> 
                    <span className="text-sm font-bold text-slate-700">Afficher au public</span> 
                  </label> 
                </div> 
              </div> 
              {modalError && ( 
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 flex gap-3 
text-rose-700"> 
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
                    if (editingItem.type === 'SECTION') { 
                      payload.section = payload.code; 
                    } 
                    if (editingItem.id) { 
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
                  } catch (err) { 
                    if (err.response && err.response.data) { 
                      const errs = Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(' 
| '); 
                      setModalError(errs); 
                    } else { 
                      setModalError("Erreur de sauvegarde. Vérifiez le code unique."); 
                    } 
                  } 
                }} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black 
uppercase tracking-widest text-xs hover:bg-brand-700 transition-colors flex items-center 
justify-center gap-2"> 
                  <Save size={16} /> Sauvegarder 
                </button> 
              </div> 
            </div> 
          </motion.div> 
        </div> 
      )} 
 
      <LocationSelectionModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        isRTL={isRTL} 
        onConfirm={(govId, estId) => { 
          setOperatorGovId(govId); 
          setOperatorEstId(estId); 
          setIsLocationModalOpen(false); 
          handleSubmit(govId, estId); 

        }} 
      /> 
    </div> 
  ); 
}; 
 
export default QuestionnaireForm; 
 

