import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# Read header & constants from merged_header_constants.js
with open('scratch/merged_header_constants.js', 'r', encoding='utf-8') as f:
    header = f.read()

# Let's extract generateRandomData from scratch/old_QuestionnaireForm.jsx
with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old_code = f.read()

rand_start = old_code.find('const generateRandomData = () => {')
rand_end = old_code.find('const isHidden = (code) => {')
if rand_end == -1:
    rand_end = old_code.find('const dynamicProcessed =')

rand_func_code = old_code[rand_start:rand_end]

# Let's make sure EditModeContext is defined
context_def = """
const EditModeContext = React.createContext({
  isEditMode: false,
  dynamicConfigs: [],
  onEditQuestion: () => {},
  onDeleteQuestion: () => {},
});
"""

# Replace FieldLabel with the one that consumes EditModeContext
field_label_code = """
const FieldLabel = ({ code, fr, ar, isRTL }) => {
  const { isEditMode, onEditQuestion, onDeleteQuestion } = React.useContext(EditModeContext);

  return (
    <div className={`relative ${isEditMode ? 'p-3 bg-blue-50/60 border-2 border-dashed border-blue-300 rounded-2xl mb-3 shadow-sm group' : 'mb-2'}`}>
      {isEditMode && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 bg-slate-900 text-white px-2 py-1 rounded-xl shadow-md border border-slate-800">
          <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">{code}</span>
          <button
            type="button"
            onClick={() => onEditQuestion?.(code, fr, ar)}
            className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-600 shadow-xs"
            title="Éditer cette question"
          >
            <Pencil size={12} /> Éditer
          </button>
          <button
            type="button"
            onClick={() => onDeleteQuestion?.(code)}
            className="p-1 text-rose-400 hover:text-rose-300"
            title="Masquer la question"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">
          {code}
        </span>
        <span className="font-bold text-slate-800 text-base">
          {isRTL ? ar : fr}
        </span>
      </div>
    </div>
  );
};
"""

print("Context & FieldLabel prepared!")
