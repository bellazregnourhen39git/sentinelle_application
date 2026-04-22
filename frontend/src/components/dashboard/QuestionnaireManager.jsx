import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Eye, EyeOff, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api';

const QuestionnaireManager = ({ isOpen, onClose }) => {
    const [dynamicQuestions, setDynamicQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // New question form state
    const [newQuestion, setNewQuestion] = useState({
        code: '',
        label_fr: '',
        label_ar: '',
        question_type: 'TEXT',
        section: 'Z',
        options_json: [],
        is_dynamic: true,
        is_hidden: false
    });

    const staticSections = [
        { id: 'section_a', letter: 'A', name: 'Profil' },
        { id: 'section_b', letter: 'B', name: 'Famille' },
        { id: 'section_c', letter: 'C', name: 'Cigarettes' },
        { id: 'section_d', letter: 'D', name: 'E-cigarettes' },
        { id: 'section_e', letter: 'E', name: 'Narguilé' },
        { id: 'section_g', letter: 'G', name: 'Alcool' },
        { id: 'section_h', letter: 'H', name: 'Tranquillisants' },
        { id: 'section_i', letter: 'I', name: 'Cannabis' },
        { id: 'section_j', letter: 'J', name: 'Cocaïne' },
        { id: 'section_k', letter: 'K', name: 'Extasy' },
        { id: 'section_l', letter: 'L', name: 'Héroïne' },
        { id: 'section_m', letter: 'M', name: 'Inhalants' },
        { id: 'section_n', letter: 'N', name: 'Autres Substances' },
        { id: 'section_p', letter: 'P', name: 'Substances NPS' },
        { id: 'section_q', letter: 'Q', name: 'Perception' },
        { id: 'section_r', letter: 'R', name: 'Réseaux Sociaux' },
        { id: 'section_s', letter: 'S', name: 'Jeux Vidéo' },
        { id: 'section_t', letter: 'T', name: "Jeux d'Argent" },
        { id: 'section_u', letter: 'U', name: 'Violence' },
        { id: 'section_v', letter: 'V', name: 'Stress' },
        { id: 'section_z', letter: 'Z', name: 'Validation' },
    ];

    useEffect(() => {
        if (isOpen) fetchQuestions();
    }, [isOpen]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await api.get('dynamic-questions/');
            setDynamicQuestions(res.data);
        } catch (err) {
            console.error("Failed to fetch questionnaire config", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async () => {
        if (!newQuestion.code || !newQuestion.label_fr) return;
        setSaving(true);
        try {
            await api.post('dynamic-questions/', newQuestion);
            setSuccess(true);
            setNewQuestion({
                code: '',
                label_fr: '',
                label_ar: '',
                question_type: 'TEXT',
                section: 'Z',
                options_json: [],
                is_dynamic: true,
                is_hidden: false
            });
            fetchQuestions();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Creation failed", err);
            alert("Erreur lors de la création de la question. Vérifiez que le code est unique.");
        } finally {
            setSaving(false);
        }
    };

    const toggleHideSection = async (sectionId) => {
        const existing = dynamicQuestions.find(q => q.code === sectionId);
        if (existing) {
            // Update
            try {
                await api.patch(`dynamic-questions/${sectionId}/`, { is_hidden: !existing.is_hidden });
                fetchQuestions();
            } catch (err) { console.error(err); }
        } else {
            // Create override
            const sectionInfo = staticSections.find(s => s.id === sectionId);
            try {
                await api.post('dynamic-questions/', {
                    code: sectionId,
                    label_fr: sectionInfo.name,
                    is_hidden: true,
                    is_dynamic: false
                });
                fetchQuestions();
            } catch (err) { console.error(err); }
        }
    };

    const deleteQuestion = async (code) => {
        if (!window.confirm("Supprimer définitivement cette question ?")) return;
        try {
            await api.delete(`dynamic-questions/${code}/`);
            fetchQuestions();
        } catch (err) { console.error(err); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={onClose} 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 italic uppercase flex items-center gap-3">
                            Configurateur de Questionnaire
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Modification dynamique du référentiel MEDSPAD
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT: STATIC SECTIONS CONTROL */}
                    <div className="lg:w-1/3 flex flex-col">
                        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2 italic">Sections Fixes (Statiques)</h3>
                             <p className="text-[10px] text-slate-500 font-medium">Masquez des sections entières du questionnaire standard.</p>
                        </div>
                        
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {staticSections.map(section => {
                                const isHidden = dynamicQuestions.find(q => q.code === section.id && q.is_hidden);
                                return (
                                    <div key={section.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isHidden ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 hover:border-brand-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isHidden ? 'bg-slate-200 text-slate-400' : 'bg-brand-50 text-brand-600'}`}>
                                                {section.letter}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{section.name}</span>
                                        </div>
                                        <button 
                                            onClick={() => toggleHideSection(section.id)}
                                            className={`p-2 rounded-xl transition-all ${isHidden ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}
                                        >
                                            {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CENTER/RIGHT: NEW QUESTIONS BUILDER */}
                    <div className="lg:w-2/3 space-y-8">
                        
                        {/* Builder Form */}
                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-40 blur-3xl"></div>
                            
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 italic">Ajouter une Question</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code Unique (ex: Z.10)</label>
                                    <input 
                                        type="text" 
                                        value={newQuestion.code}
                                        onChange={(e) => setNewQuestion({...newQuestion, code: e.target.value.toUpperCase()})}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none transition-all text-sm font-bold"
                                        placeholder="CODE_UNIQUE"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de Réponse</label>
                                    <select 
                                        value={newQuestion.question_type}
                                        onChange={(e) => setNewQuestion({...newQuestion, question_type: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none transition-all text-sm font-bold bg-white"
                                    >
                                        <option value="TEXT">Texte Libre</option>
                                        <option value="NUMBER">Nombre</option>
                                        <option value="RADIO">Choix Multiples (Radio)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Libellé (Français)</label>
                                    <input 
                                        type="text" 
                                        value={newQuestion.label_fr}
                                        onChange={(e) => setNewQuestion({...newQuestion, label_fr: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none transition-all text-sm font-bold"
                                        placeholder="Ex: Avez-vous déjà... ?"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2 text-right">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الإجابة (العربية)</label>
                                    <input 
                                        type="text" 
                                        dir="rtl"
                                        value={newQuestion.label_ar}
                                        onChange={(e) => setNewQuestion({...newQuestion, label_ar: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none transition-all text-sm font-bold text-right"
                                        placeholder="هل سبقت..."
                                    />
                                </div>
                            </div>

                            {newQuestion.question_type === 'RADIO' && (
                                <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Options (Séparez par des virgules : oui,non,peut-être)</p>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 text-sm font-medium"
                                        placeholder="Option1, Option2..."
                                        onBlur={(e) => {
                                            const options = e.target.value.split(',').map(o => [o.trim(), o.trim(), o.trim()]);
                                            setNewQuestion({...newQuestion, options_json: options});
                                        }}
                                    />
                                </div>
                            )}

                            <div className="mt-8 flex items-center justify-between">
                                {success && (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs animate-fade-in">
                                        <CheckCircle size={16} /> Sucess! Question ajoutée.
                                    </div>
                                )}
                                {!success && <div></div>}
                                <button 
                                    onClick={handleCreateQuestion}
                                    disabled={saving || !newQuestion.code || !newQuestion.label_fr}
                                    className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 flex items-center gap-3"
                                >
                                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Ajouter au Questionnaire
                                </button>
                            </div>
                        </div>

                        {/* Current Dynamic Questions */}
                        <div>
                             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[4px] mb-6 italic">Questions Personnalisées Actives</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dynamicQuestions.length === 0 ? (
                                    <div className="md:col-span-2 p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
                                        <AlertCircle size={32} className="text-slate-200 mx-auto mb-4" />
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Aucune question additionnelle</p>
                                    </div>
                                ) : dynamicQuestions.map(q => (
                                    <div key={q.code} className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-[9px] font-black uppercase tracking-widest italic">{q.code}</span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{q.question_type}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800 line-clamp-2">{q.label_fr}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-end">
                                            <button 
                                                onClick={() => deleteQuestion(q.code)}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>

                </div>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                `}</style>
            </motion.div>
        </div>
    );
};

export default QuestionnaireManager;
