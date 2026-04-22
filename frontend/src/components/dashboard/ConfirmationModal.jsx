import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, AlertTriangle, Trash2, Edit3, X } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirmation", 
    message = "Êtes-vous sûr de vouloir effectuer cette action ?",
    confirmText = "Oui, Confirmer",
    cancelText = "Non, Annuler",
    type = 'info' // info, danger, warning
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-10 flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-lg ${
                                type === 'danger' ? 'bg-rose-50 text-rose-500 shadow-rose-200' : 
                                type === 'warning' ? 'bg-amber-50 text-amber-500 shadow-amber-200' : 
                                'bg-brand-50 text-brand-600 shadow-brand-200'
                            }`}>
                                {type === 'danger' ? <Trash2 size={32} /> : 
                                 type === 'warning' ? <AlertTriangle size={32} /> : 
                                 <HelpCircle size={32} />}
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">{title}</h2>
                            <p className="text-sm font-bold text-slate-500 italic mb-10 leading-relaxed px-4">
                                {message}
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button 
                                    onClick={onClose}
                                    className="h-14 rounded-2xl bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all italic border border-slate-100"
                                >
                                    {cancelText}
                                </button>
                                <button 
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`h-14 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest transition-all italic shadow-lg ${
                                        type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' :
                                        'bg-brand-500 hover:bg-brand-600 shadow-brand-200'
                                    }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
