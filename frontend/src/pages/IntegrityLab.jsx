import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Target, Activity, LucideArrowLeft, Info, HelpCircle, AlertOctagon, Fingerprint, Award, CheckCircle2, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const IntegrityLab = ({ profile }) => {
    const navigate = useNavigate();
    const [labData, setLabData] = useState(null);
    const [loading, setLoading] = useState(true);

    const isSuperAdmin = profile?.role === 'SUPERADMIN';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('lab-stats/');
                setLabData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Integrity Sync Failure:", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const integrityStats = labData?.integrity || [];
    const nationalTrust = labData?.national_avg?.trust || 92.4;

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
                        <Fingerprint size={14} className="animate-pulse text-brand-500" />
                        Laboratoire de Validation & Intégrité
                    </div>
                </div>
            </div>

            {/* 🌌 Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1400px] mx-auto pro-card p-16 rounded-[64px] border-l-[16px] border-brand-600 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 relative overflow-hidden mb-12"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldCheck size={280} strokeWidth={1} className="text-brand-600" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-8">
                        Audit <span className="text-brand-600">d'Intégrité</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-bold italic leading-relaxed opacity-80 mb-10">
                        Protocoles de surveillance cognitive et détection des anomalies statistiques pour garantir la véracité médicale de chaque dossier MedSPAD.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="px-6 py-2.5 bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] italic shadow-xl shadow-brand-500/20">
                            Protocol Alpha-2026 Active
                        </div>
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-[4px] italic opacity-60">Validation Algorithmique Niveau 4</span>
                    </div>
                </div>
            </motion.div>

            {/* 📈 Methodology View */}
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* 📋 Audit Methodology (Calculation Logic) */}
                <motion.div 
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-4 p-10 rounded-[48px] border border-slate-900 bg-slate-900 text-white shadow-xl flex flex-col justify-between"
                >
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[4px] mb-10 italic">Protocole d'Audit Z</h4>
                        <div className="space-y-8">
                            <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 group hover:border-brand-500/40 transition-all">
                                <h5 className="text-[11px] font-black text-brand-500 uppercase italic mb-4">Algorithme de Pondération</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Complètement', val: '100%' },
                                        { label: 'En grande partie', val: '75%' },
                                        { label: 'Partiellement', val: '50%' },
                                        { label: 'Pas du tout', val: '0%' }
                                    ].map((w, i) => (
                                        <div key={i} className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-slate-500 italic mb-1">{w.label}</span>
                                            <span className="text-xl font-black italic tracking-tighter text-white">{w.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 italic leading-relaxed px-2">
                                L'indice de confiance régional est calculé par la moyenne pondérée des déclarations d'honnêteté (Section Z). Un score inférieur à 65% déclenche automatiquement un audit manuel approfondi de la cohorte.
                            </p>
                        </div>
                    </div>
                    <div className="mt-10 p-6 rounded-[24px] bg-brand-500 text-white text-[10px] font-black uppercase tracking-[3px] italic text-center shadow-2xl shadow-brand-500/20">
                        Consulter la documentation
                    </div>
                </motion.div>

                {/* 🛡️ National Trust Leaderboard (Logically-Validated Registry) */}
                <motion.div 
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 pro-card p-10 rounded-[48px] border border-slate-100 bg-white shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-10 px-2">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Régistre d'Audit Logique</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] italic mt-2">Validation Algorithmique par Gouvernorat (N=24)</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-brand-600 uppercase italic tracking-[2px]">Moyenne Nationale : {nationalTrust}%</span>
                        </div>
                    </div>

                    <div className="h-[460px] overflow-y-auto pr-4 space-y-2 custom-scrollbar px-1">
                        {integrityStats.map((reg, idx) => (
                            <div key={reg.gov_name} className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all group">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-xs bg-slate-900 text-white">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 grid grid-cols-12 items-center gap-4">
                                    <div className="col-span-3 min-w-[120px]">
                                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-[1px] italic">{reg.gov_name}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${
                                                reg.logical_anomalies > 0 ? 'bg-rose-500 animate-pulse' :
                                                reg.status === 'Optimal' ? 'bg-emerald-500' :
                                                reg.status === 'Audit Pending' ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} />
                                            <span className={`text-[9px] font-black uppercase italic ${reg.logical_anomalies > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                {reg.logical_anomalies > 0 ? 'Forensic Alert' : reg.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-4 flex items-center gap-6 justify-end">
                                        <div className="text-right">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Self-Flg.</span>
                                            <span className={`text-[11px] font-black italic ${reg.self_anomalies > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{reg.self_anomalies}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Log-Err.</span>
                                            <span className={`text-[11px] font-black italic ${reg.logical_anomalies > 0 ? 'text-rose-500' : 'text-slate-300'}`}>{reg.logical_anomalies}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Trust</span>
                                            <span className="text-[11px] font-black text-brand-600 italic">{reg.trust_index}%</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        {reg.logical_anomalies === 0 && reg.trust_index > 90 ? (
                                            <div className="flex flex-col items-end">
                                                <Award size={14} className="text-emerald-500 mb-1" />
                                                <span className="text-[7px] font-black text-emerald-600 uppercase italic">Certified</span>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-300 italic">N={reg.submissions}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 🧪 Forensic Checkpoints Card (Superadmin Only) */}
                {isSuperAdmin ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-12 p-14 rounded-[64px] border border-slate-900 bg-slate-900 shadow-2xl relative overflow-hidden text-white mb-12"
                    >
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-16">
                                <div className="flex items-center gap-6 text-brand-500">
                                    <ShieldCheck size={40} className="glow-brand" />
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Prévue de Validation Algorithmique</h3>
                                </div>
                                <div className="px-6 py-2 bg-brand-500 text-white rounded-full text-[10px] font-black uppercase tracking-[3px] italic">
                                    Forensic Suite v2.0
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-12 relative">
                                {(labData?.forensic_checkpoints || []).map((cp, i) => (
                                    <div key={i} className="p-8 rounded-[40px] bg-white/5 border border-white/10 group hover:bg-brand-500/10 transition-all duration-500">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
                                                <Target size={20} />
                                            </div>
                                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-[3px] italic">{cp.weight}</span>
                                        </div>
                                        <h4 className="text-xl font-black italic uppercase mb-4 tracking-tighter">{cp.label}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 italic leading-relaxed">
                                            {cp.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="lg:col-span-12 p-8 rounded-[40px] bg-brand-500/5 border border-brand-500/20 text-center mb-12">
                        <p className="text-sm font-black text-brand-500 uppercase tracking-[2px] italic">
                            🛡️ Diagnostic Régional Sécurisé : Les poids algorithmiques sont réservés à la supervision nationale.
                        </p>
                    </div>
                )}


            </div>
        </div>
    );
};

export default IntegrityLab;
