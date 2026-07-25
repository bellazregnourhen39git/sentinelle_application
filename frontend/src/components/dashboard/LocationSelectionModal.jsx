import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Building, Check } from 'lucide-react';
import api from '../../api';

const LocationSelectionModal = ({ isOpen, onClose, onConfirm, isRTL = false }) => {
    const [governorates, setGovernorates] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    
    const [govId, setGovId] = useState('');
    const [estId, setEstId] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [estSearch, setEstSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            api.get('geography/governorates/').then(res => setGovernorates(res.data)).catch(console.error);
            api.get('geography/establishments/').then(res => setEstablishments(res.data)).catch(console.error);
        }
    }, [isOpen]);

    const handleEstablishmentChange = (e) => {
        const val = e.target.value;
        setEstSearch(val);
        setEstId(''); // reset specific ID
        
        if (val.length > 2) {
            let filtered = establishments.filter(est => 
                est.name.toLowerCase().includes(val.toLowerCase())
            );
            if (govId) {
                filtered = filtered.filter(est => est.governorate == govId);
            }
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (est) => {
        setEstId(est.id);
        setEstSearch(est.name);
        setGovId(est.governorate);
        setSuggestions([]);
    };

    const handleConfirm = () => {
        if (!govId || !estId) return;
        onConfirm(govId, estId);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-visible border border-slate-100"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-slate-900 uppercase italic">
                                    {isRTL ? 'تحديد الموقع' : 'Sélection du Lieu'}
                                </h2>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <p className="text-sm text-slate-500 mb-6">
                                {isRTL 
                                    ? 'الرجاء تحديد الولاية والمؤسسة الخاصة بهذا الاستبيان قبل الحفظ.' 
                                    : 'Veuillez sélectionner le gouvernorat et l\'établissement pour ce questionnaire avant de l\'enregistrer.'}
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الولاية' : 'Gouvernorat'}</label>
                                    <div className="relative">
                                        <MapPin size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                                        <select 
                                            value={govId} 
                                            onChange={e => setGovId(e.target.value)} 
                                            className={`w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 outline-none font-bold text-sm text-slate-700 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} appearance-none`}
                                        >
                                            <option value="">-- {isRTL ? 'اختر الولاية' : 'Choisir'} --</option>
                                            {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المؤسسة' : 'Établissement'}</label>
                                    <div className="relative">
                                        <Building size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                                        <input 
                                            type="text"
                                            value={estSearch}
                                            onChange={handleEstablishmentChange}
                                            placeholder={isRTL ? 'ابحث عن المؤسسة...' : 'Rechercher un établissement...'}
                                            className={`w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 outline-none font-bold text-sm text-slate-700 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                        />
                                    </div>
                                    {suggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                                            {suggestions.map(est => (
                                                <div 
                                                    key={est.id}
                                                    className="p-3 hover:bg-brand-50 cursor-pointer text-sm border-b border-slate-100 last:border-0"
                                                    onClick={() => selectSuggestion(est)}
                                                >
                                                    <div className="font-bold text-slate-800">{est.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{est.governorate_name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={handleConfirm}
                                disabled={!govId || !estId}
                                className="w-full h-12 mt-8 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-brand-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30"
                            >
                                <Check size={16} />
                                {isRTL ? 'تأكيد وحفظ' : 'Confirmer et Enregistrer'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LocationSelectionModal;
