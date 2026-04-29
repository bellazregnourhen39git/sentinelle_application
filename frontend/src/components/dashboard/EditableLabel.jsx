import React, { useState } from 'react';
import { useTerminology } from '../../TerminologyContext';
import { Edit2, Check, X } from 'lucide-react';

const EditableLabel = ({ termKey, defaultValue, className = "" }) => {
    const { t_dyn, updateTerm, isEditMode } = useTerminology();
    const value = t_dyn(termKey, defaultValue);
    const [tempValue, setTempValue] = useState(value);

    // Sync tempValue when value changes (e.g. from backend load)
    React.useEffect(() => {
        setTempValue(value);
    }, [value]);

    if (!isEditMode) {
        return <span className={className}>{value}</span>;
    }

    const handleFocus = (e) => {
        e.target.select();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        } else if (e.key === 'Escape') {
            setTempValue(value);
            // We need to blur without triggering updateTerm
            // Or change updateTerm to handle non-changes gracefully
            // Actually, if we set tempValue back to value, updateTerm will do nothing (see TerminologyContext)
            e.target.blur();
        }
    };

    return (
        <div className={`relative inline-flex items-center group/edit ${className}`}>
            <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => {
                    // We don't trigger updateTerm on blur if we want a manual "OK" button
                    // But if the user wants it fast, blur is usually enough.
                    // To follow "Clique sur OK", I'll add a button.
                }}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                className="bg-brand-50 border-b-2 border-brand-500 outline-none w-full px-1 italic transition-all min-w-[50px] pr-8"
                autoFocus
            />
            <div className="absolute right-0 flex items-center gap-1">
                <button 
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur before click
                        e.stopPropagation();
                        updateTerm(termKey, tempValue);
                    }}
                    className="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm"
                >
                    <Check size={12} />
                </button>
            </div>
        </div>
    );
};

export default EditableLabel;
