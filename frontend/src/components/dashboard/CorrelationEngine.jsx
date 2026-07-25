import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radar, Gamepad2, Swords, Flame, Sparkles,
    Beer, Award, AlertTriangle, HelpCircle,
    ArrowUpRight, ArrowDownRight, Thermometer, ShieldAlert, Smartphone
} from 'lucide-react';
import api from '../../api';
import EditableLabel from './EditableLabel';

const CorrelationEngine = ({ activeScope, activeScopeId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCorrelations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('stats/correlations/', {
                    params: {
                        scope_type: activeScope,
                        scope_id: activeScopeId
                    }
                });
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch correlation engine stats", err);
                setError("Impossible de charger le moteur de corrélation.");
            } finally {
                setLoading(false);
            }
        };

        fetchCorrelations();
    }, [activeScope, activeScopeId]);

    const getIcon = (id, color) => {
        switch (id) {
            case 'gaming_violence':
                return (
                    <div className="flex gap-1 items-center">
                        <Gamepad2 size={18} className="text-white" />
                        <span className="text-white/40 font-black">×</span>
                        <Swords size={18} className="text-white" />
                    </div>
                );
            case 'smoking_cannabis':
                return (
                    <div className="flex gap-1 items-center">
                        <Flame size={18} className="text-white" />
                        <span className="text-white/40 font-black">×</span>
                        <Sparkles size={18} className="text-white" />
                    </div>
                );
            case 'alcohol_grades':
                return (
                    <div className="flex gap-1 items-center">
                        <Beer size={18} className="text-white" />
                        <span className="text-white/40 font-black">×</span>
                        <Award size={18} className="text-white" />
                    </div>
                );
            case 'stress_meds':
                return (
                    <div className="flex gap-1 items-center">
                        <Thermometer size={18} className="text-white" />
                        <span className="text-white/40 font-black">×</span>
                        <ShieldAlert size={18} className="text-white" />
                    </div>
                );
            case 'social_stress':
                return (
                    <div className="flex gap-1 items-center">
                        <Smartphone size={18} className="text-white" />
                        <span className="text-white/40 font-black">×</span>
                        <Thermometer size={18} className="text-white" />
                    </div>
                );
            case 'gambling_grades':
                return (
                    <div className="flex gap-1 items-center">
                        <Flame size={18} className="text-white" />
                        <span className="text-white/40 font-black">×</span>
                        <Award size={18} className="text-white" />
                    </div>
                );
            case 'vape_smoke':
                return (
                    <div className="flex gap-1 items-center">
                        <Sparkles size={18} className="text-white" />
                        <span className="text-white/40 font-black">×</span>
                        <Flame size={18} className="text-white" />
                    </div>
                );
            default:
                return <Radar size={18} className="text-white" />;
        }
    };

    const getGradient = (id) => {
        switch (id) {
            case 'gaming_violence': return 'from-rose-500 to-purple-600 shadow-rose-500/20';
            case 'smoking_cannabis': return 'from-orange-500 to-red-600 shadow-orange-500/20';
            case 'alcohol_grades': return 'from-amber-500 to-yellow-600 shadow-amber-500/20';
            case 'stress_meds': return 'from-indigo-500 to-sky-600 shadow-indigo-500/20';
            case 'social_stress': return 'from-violet-500 to-fuchsia-600 shadow-violet-500/20';
            case 'gambling_grades': return 'from-amber-500 to-red-600 shadow-amber-500/20';
            case 'vape_smoke': return 'from-cyan-500 to-teal-600 shadow-cyan-500/20';
            default: return 'from-brand-500 to-brand-600 shadow-brand-500/20';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-card p-10 md:p-14 rounded-[56px] border border-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] bg-white/70 backdrop-blur-3xl relative overflow-hidden group"
        >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url(/noise.png)] opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                            <Radar size={18} className="animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-widest drop-shadow-sm">
                            <EditableLabel termKey="corr_engine_title" defaultValue="Moteur de Corrélation" />
                        </h3>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] italic">
                        <EditableLabel termKey="corr_engine_sub" defaultValue="Analyse Croisée de Comportement Clinique" />
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[350px] flex flex-col items-center justify-center gap-4"
                    >
                        <div className="w-10 h-10 border-4 border-slate-50 border-t-rose-500 rounded-full animate-spin shadow-md" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] italic"><EditableLabel termKey="corr_engine_loading" defaultValue="Calcul des matrices..." /></p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-[250px] flex flex-col items-center justify-center gap-4 text-center"
                    >
                        <AlertTriangle size={36} className="text-rose-500" />
                        <p className="text-sm font-black text-slate-700 uppercase italic">{error}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {data?.correlations?.map((item) => {
                            const isHighDev = item.deviation > 0.0;
                            const isNegDev = item.deviation < 0.0;
                            const absDeviation = Math.abs(item.deviation);

                            return (
                                <div
                                    key={item.id}
                                    className="p-8 rounded-[36px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col gap-6 group/card relative overflow-hidden"
                                >
                                    {/* Subtle gradient glow */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getGradient(item.id)} opacity-[0.03] group-hover/card:opacity-[0.08] blur-xl rounded-full transition-opacity duration-700 pointer-events-none`} />

                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(item.id)} flex items-center justify-center shadow-lg group-hover/card:scale-105 transition-transform duration-500`}>
                                                {getIcon(item.id)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight mb-0.5 leading-snug">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none italic">
                                                    {item.condition_label} → {item.outcome_label}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic opacity-90">
                                        {item.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5"><EditableLabel termKey="corr_local_rate" defaultValue="Taux Local" /></span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black italic tracking-tighter text-slate-900">
                                                    {item.rate}%
                                                </span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                    ({item.correlation_size}/{item.cohort_size})
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5"><EditableLabel termKey="corr_national_rate" defaultValue="Moyenne Nationale" /></span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black italic tracking-tighter text-slate-500">
                                                    {item.national_rate}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.rate}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            className={`h-full bg-gradient-to-r ${getGradient(item.id)}`}
                                        />
                                    </div>

                                    {/* Deviation Badge */}
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50/50">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]"><EditableLabel termKey="corr_deviation" defaultValue="Écart National" /></span>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[1px] flex items-center gap-1.5 italic ${isHighDev ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : isNegDev ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                            {isHighDev ? (
                                                <>
                                                    <ArrowUpRight size={12} className="stroke-[3]" />
                                                    +{absDeviation}%
                                                </>
                                            ) : isNegDev ? (
                                                <>
                                                    <ArrowDownRight size={12} className="stroke-[3]" />
                                                    -{absDeviation}%
                                                </>
                                            ) : (
                                                'Égal'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CorrelationEngine;
