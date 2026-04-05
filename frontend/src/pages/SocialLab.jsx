import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, TrendingUp, Activity, LucideArrowLeft, Info, HelpCircle, Target, Layers, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SocialLab = () => {
    const navigate = useNavigate();
    const [labData, setLabData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('lab-stats/');
                setLabData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Lab Sync Failure:", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const socialStats = labData?.social || [];
    const nationalAvg = labData?.national_avg?.stress || 33.5;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-12">
            {/* 🔬 Navigation Header */}
            <div className="max-w-[1400px] mx-auto mb-12 flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-500 font-black uppercase tracking-[2px] text-[10px] italic hover:bg-slate-50 transition-all shadow-sm group"
                >
                    <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Retour au Hub
                </button>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-[10px] font-black text-brand-600 uppercase tracking-[3px] italic flex items-center gap-2 shadow-sm">
                        <Activity size={14} className="animate-pulse" />
                        Laboratoire de Phénoménologie Sociale
                    </div>
                </div>
            </div>

            {/* 🌌 Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1400px] mx-auto pro-card p-16 rounded-[64px] border-l-[16px] border-brand-500 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 relative overflow-hidden mb-12"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldAlert size={280} strokeWidth={1} className="text-brand-500" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-8">
                        Vecteurs <span className="text-brand-600">Sociaux</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-bold italic leading-relaxed opacity-80 mb-10">
                        Dissection algorithmique des contraintes psychologiques et des indices de conflictualité structurels au sein de la cohorte MedSPAD.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 italic">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] italic">Système Multi-Vecteurs Activé</span>
                    </div>
                </div>
            </motion.div>

            {/* 📊 Science Grid */}
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Methodology Breakdown */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-12 pro-card p-12 rounded-[56px] border border-brand-50 bg-white shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500">
                            <Info size={20} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Méthodologie de Calcul</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-brand-500/20 transition-all group">
                                <h4 className="text-[12px] font-black text-brand-600 uppercase tracking-[3px] mb-3 italic">Index de Stress (Contrainte)</h4>
                                <p className="text-[14px] text-slate-600 font-bold leading-relaxed mb-6 italic group-hover:text-slate-900 transition-colors">
                                    Calculé à partir d'un set de 8 questions traitant de la perception des pressions académiques, familiales et sociales. Une pondération spécifique est appliquée aux réponses "Toujours" (1.0) et "Souvent" (0.6).
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black text-slate-400 italic">Σ (Poids * Réponse) / N</div>
                                    <HelpCircle size={14} className="text-slate-300" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-rose-500/20 transition-all group">
                                <h4 className="text-[12px] font-black text-rose-500 uppercase tracking-[3px] mb-3 italic">Index de Conflictualité</h4>
                                <p className="text-[14px] text-slate-600 font-bold leading-relaxed mb-6 italic group-hover:text-slate-900 transition-colors">
                                    Corrélation directe entre les violences verbales et physiques rapportées. Ce vecteur mesure l'exposition immédiate à des environnements instables augmentant la vulnérabilité aux substances.
                                </p>
                                <div className="flex items-center gap-2 text-rose-500">
                                    <TrendingUp size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[2px] italic">Corrélation de Risque : 0.82</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 📊 National Stress Ranking (The "Regional Covering" requested) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 pro-card p-12 rounded-[56px] border border-slate-100 bg-white shadow-2xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Classement National de la Contrainte</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] italic mt-2">Répartition des 24 Gouvernorats (Vague 2026)</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[2px] italic">National Avg: {nationalAvg}%</div>
                            </div>
                        </div>
                        
                        <div className="h-[500px] overflow-y-auto pr-6 space-y-4 custom-scrollbar">
                            {socialStats.map((reg, idx) => (
                                <div key={reg.gov_name} className="flex items-center gap-6 p-5 rounded-[28px] bg-slate-50 border border-slate-100 group hover:bg-brand-50 hover:border-brand-500/20 transition-all">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic ${idx < 3 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2 px-1">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-[2px] italic">{reg.gov_name}</span>
                                            <span className="text-[11px] font-black text-brand-600 italic">{reg.stress_index}% Stress</span>
                                        </div>
                                        <div className="w-full h-2 bg-white rounded-full border border-slate-100 overflow-hidden p-0.5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${reg.stress_index}%` }}
                                                className={`h-full rounded-full ${reg.stress_index > 40 ? 'bg-rose-500' : 'bg-brand-500'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] italic">Conflits</p>
                                        <p className="text-sm font-black text-rose-500 italic">{reg.conflict_rate}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 🔬 The Science: PSS-4 Equation */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 pro-card p-12 rounded-[56px] border border-brand-100 bg-slate-900 shadow-xl flex flex-col justify-between relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Award size={120} className="text-brand-500" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[4px] mb-8 italic">Le Protocole PSS-4</h4>
                        <div className="space-y-10">
                            <div className="p-8 rounded-[40px] bg-white text-slate-900 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                                    <Target size={40} />
                                </div>
                                <h5 className="text-[11px] font-black uppercase tracking-[2px] mb-4 italic text-brand-600">Équation Clinique</h5>
                                <div className="text-2xl font-black italic tracking-tighter mb-4 text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                   IS = Σ(V1, V4 + V2R, V3R)
                                </div>
                                <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">
                                    La Perceived Stress Scale (PSS-4) est calculée en sommant les scores des 4 items, avec inversion des items 2 et 3. Un score {'>'} 8/16 indique une détresse psychologique modérée à sévère.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-500">1</div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] italic">V1: Perte de Contrôle</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-500">2</div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] italic">V2: Capacité à Gérer (R)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-500">3</div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] italic">V3: Succès Perçu (R)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-500">4</div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] italic">V4: Accumulation Difficultés</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-10 py-5 bg-brand-500 text-white rounded-[24px] font-black uppercase tracking-[4px] text-[10px] italic shadow-2xl hover:bg-brand-600 transition-all border-none">
                        Documentation Psychométrique
                    </button>
                </motion.div>

            </div>
        </div>
    );
};

export default SocialLab;
