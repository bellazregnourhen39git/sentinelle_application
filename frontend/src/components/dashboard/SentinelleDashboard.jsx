import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Shield as ShieldCheck, Shield, AlertTriangle, Zap, ArrowRight, Info, Plus
} from 'lucide-react';
import api from '../../api';
import RadialSectionWheel from './RadialSectionWheel';
import SectionDetailPanel from './SectionDetailPanel';

const SentinelleDashboard = () => {
    const [selectedSection, setSelectedSection] = useState(null);
    const [homepageData, setHomepageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHomepage = async () => {
        try {
            setLoading(true);
            const res = await api.get('homepage/', { params: { scope_type: 'national' } });
            setHomepageData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des données. Veuillez réessayer.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomepage();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px] w-full bg-slate-50/50 backdrop-blur-sm rounded-3xl border border-slate-200/50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-brand-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-brand-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Synchronisation...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[600px] w-full bg-red-50 rounded-[40px] border border-red-100 p-8">
            <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-red-900 mb-2">Accès Interrompu</h3>
                <p className="text-red-600 mb-6 font-medium text-sm">{error}</p>
                <button onClick={fetchHomepage} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                    Réessayer la connexion
                </button>
            </div>
        </div>
    );

    const intensityData = homepageData?.top_sections?.reduce((acc, s) => {
        acc[s.section_id] = 0.8;
        return acc;
    }, {}) || {};

    return (
        <div className="flex flex-col lg:flex-row w-full gap-10">
            {/* LEFT: Signature Visual - Compass Wheel */}
            <div className="lg:w-[45%] flex flex-col items-center justify-center sticky top-24 h-[calc(100vh-140px)] bg-white rounded-[50px] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="absolute top-10 left-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-200">
                            <Shield size={16} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900">
                            SENTINELLE
                        </h2>
                    </div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[5px] mt-1 pl-1">
                        Intelligence Santé 2026
                    </p>
                </div>
                
                <RadialSectionWheel 
                    intensityData={intensityData}
                    activeSection={selectedSection}
                    onSectionClick={setSelectedSection}
                    totalSubmissions={homepageData?.headline?.n_submissions}
                />

                <div className="absolute bottom-12 px-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 mb-4">
                        <Info size={10} className="text-brand-600" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Guide d'exploration</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-xs">
                        Cliquez sur un segment pour analyser une section spécifique. La croissance radiale indique le volume de données collectées.
                    </p>
                </div>
            </div>

            {/* RIGHT: Dynamic Intelligence Panel */}
            <div className="lg:w-[55%] min-h-[calc(100vh-140px)]">
                <AnimatePresence mode="wait">
                    {selectedSection ? (
                        <motion.div 
                            key="section"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                        >
                            <SectionDetailPanel 
                                sectionId={selectedSection} 
                                onBack={() => setSelectedSection(null)} 
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="homepage"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            className="flex flex-col gap-10"
                        >
                            {/* Row 1 — Scope Headline */}
                            <div className="bg-white p-12 rounded-[50px] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col gap-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                                    <Shield size={120} className="text-brand-600" />
                                </div>
                                <div className="relative">
                                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                                        {homepageData.headline.scope_label}
                                        <br/>
                                        <span className="text-brand-600 text-3xl opacity-80">{homepageData.headline.n_submissions} Dossiers Analysés</span>
                                    </h1>
                                    <p className="mt-8 text-slate-400 font-bold tracking-tight text-xl flex items-center gap-4">
                                        <span className="text-slate-900">Vague 2026</span>
                                        <span className="text-slate-200">/</span>
                                        <span>Fiabilité: {homepageData.headline.reliability_rate}%</span>
                                        <span className="text-slate-200">/</span>
                                        <span>Complétion: {homepageData.headline.completion_rate}%</span>
                                    </p>
                                    <div className="mt-8 flex items-start gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <Zap size={16} className="text-brand-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Résumé Exécutif</p>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                                "{homepageData.headline.desc}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 — Global KPI Strip (5 cards) */}
                            <div className="grid grid-cols-5 gap-5">
                                {homepageData.kpis.map((kpi, idx) => (
                                    <div key={idx} className="group bg-white p-6 rounded-[32px] shadow-lg shadow-slate-100 border border-slate-50 hover:border-brand-200 transition-all hover:-translate-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 h-8">
                                            {kpi.label}
                                        </p>
                                        <p className="text-2xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                                            {kpi.value}
                                        </p>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-4 pt-4 border-t border-slate-50">
                                            <p className="text-[8px] font-bold text-slate-400 leading-tight uppercase tracking-tighter">
                                                {kpi.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Row 3 — Group Prevalence (Explaining Behaviors) */}
                            <div className="bg-white p-12 rounded-[50px] shadow-xl shadow-slate-100 border border-slate-50">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">PRÉVALENCE PAR CATÉGORIE</h3>
                                        <p className="text-sm text-slate-400 font-bold tracking-tight">Analyse comparative des comportements déclarés au sein du périmètre.</p>
                                    </div>
                                    <div className="p-4 bg-brand-50 rounded-[20px] text-brand-600 uppercase font-black text-[10px] tracking-widest">
                                        Vue Groupée
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-10">
                                    {homepageData.group_prevalence.map((item, idx) => (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between items-end mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border border-slate-100 bg-slate-50 text-slate-400 group-hover:text-slate-900 transition-colors">
                                                        0{idx + 1}
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">{item.group}</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium mt-1">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-slate-900">{item.prevalence}%</span>
                                                </div>
                                            </div>
                                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.prevalence}%` }}
                                                    transition={{ duration: 1.5, delay: idx * 0.1, ease: "circOut" }}
                                                    className="h-full rounded-full shadow-inner"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Row 4 — Top 5 Findings (Actionable Entries) */}
                            <div className="grid grid-cols-5 gap-5">
                                {homepageData.top_sections.map((section, idx) => (
                                    <div key={idx} 
                                         onClick={() => setSelectedSection(section.section_id)}
                                         className="group cursor-pointer bg-white p-8 rounded-[40px] shadow-lg shadow-slate-100 border border-slate-50 hover:border-slate-200 transition-all hover:scale-[1.05] hover:shadow-2xl active:scale-95">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg mb-6 group-hover:rotate-12 transition-transform" 
                                             style={{ backgroundColor: '#D85A30' }}>
                                            {section.section_id}
                                        </div>
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter mb-4 leading-tight">
                                            {section.section_name}
                                        </h4>
                                        <div className="mb-6">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">
                                                {section.headline_kpi.label}
                                            </p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-brand-600 transition-colors">
                                                {section.headline_kpi.value}
                                            </p>
                                        </div>
                                        <div className="h-10 flex items-end gap-1 mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                            {section.mini_chart.values.map((v, i) => (
                                                <div key={i} className="flex-1 bg-slate-50 rounded-md overflow-hidden relative h-full">
                                                    <motion.div 
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${v}%` }}
                                                        className="absolute bottom-0 w-full bg-slate-300 group-hover:bg-brand-400 transition-colors"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button className="flex items-center justify-center w-full py-4 rounded-2xl bg-slate-50 group-hover:bg-brand-600 group-hover:text-white transition-all">
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Row 6 — System Health Indicators */}
                            {homepageData.quality && (
                                <div className="bg-slate-900 p-12 rounded-[50px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-brand-400 shadow-inner">
                                            <Shield size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-[3px] text-white">INTEGRITÉ SYSTÈME</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">{homepageData.quality.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-12 border-l border-slate-800 pl-12 h-full py-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-black text-brand-400 leading-none">{homepageData.quality.completion_rate}%</span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] mt-2">Complétude</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-black text-brand-400 leading-none">{homepageData.quality.reliability_rate}%</span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] mt-2">Corpus</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-black text-red-500 leading-none">{homepageData.quality.flagged_count}</span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] mt-2">Alertes</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SentinelleDashboard;
