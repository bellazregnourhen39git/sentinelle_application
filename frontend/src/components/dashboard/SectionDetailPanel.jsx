import React from 'react';
import { motion } from 'framer-motion';
import { 
    X, 
    TrendingUp, 
    AlertTriangle, 
    Users, 
    ArrowLeft, 
    Globe, 
    BarChart, 
    Zap,
    Brain,
    Activity,
    ShieldCheck
} from 'lucide-react';
import TunisiaSVGMap from './TunisiaSVGMap';

const SectionDetailPanel = ({ sectionId, onBack, data, initialScope }) => {
    // Helper to normalize prevalence for map intensity
    const getIntensity = (val) => {
        if (!val) return 1.0;
        const num = parseFloat(val);
        if (isNaN(num)) return 1.0;
        // Scale 0-100 to 0.5-2.5 range for map colors
        return 0.5 + (num / 100) * 2.0;
    };

    if (!data) return null;

    return (
        <div className="flex flex-col gap-10 pb-24 animate-in fade-in slide-in-from-right-10 duration-700">
            {/* Context Navigation */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-3 text-slate-400 hover:text-brand-600 font-black text-[11px] uppercase tracking-[0.2em] transition-all bg-white/80 px-6 py-3 rounded-2xl border border-slate-100 hover:shadow-lg active:scale-95"
                >
                    <ArrowLeft size={16} /> Dashboard Principal
                </button>
                <div className="flex items-center gap-3 bg-brand-600 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-brand-100">
                    <ShieldCheck size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Périmètre Analysé</span>
                </div>
            </div>

            {/* PRIMARY KPIs GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* PREVALENCE */}
                <div className="bg-white p-8 rounded-[45px] shadow-2xl shadow-slate-100 border border-slate-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} className="text-brand-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Prévalence</p>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums">
                                {data?.prevalence || "0"}
                            </h2>
                            <span className="text-xl font-bold text-slate-300">%</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Population Locale
                        </div>
                    </div>
                </div>

                {/* ECHANTILLON */}
                <div className="bg-white p-8 rounded-[45px] shadow-2xl shadow-slate-100 border border-slate-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-brand-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Échantillon</p>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums">
                                {data?.echantillon || "0"}
                            </h2>
                            <span className="text-xs font-black text-slate-300 uppercase ml-2">Sujets</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Taille de l'Étude
                        </div>
                    </div>
                </div>

                {/* INDICE ALERTE */}
                <div className="bg-slate-900 p-8 rounded-[45px] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={100} className="text-brand-400" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] mb-4">Niveau de Risque</p>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-6">
                                {data?.indiceAlerte || "Normal"}
                            </h2>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-[10px] font-black text-brand-200 uppercase tracking-widest">Surveillance Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOCK 2 — INDICATEURS SPÉCIFIQUES & DISTRIBUTION */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* INDICATEURS TABLE */}
                <div className="bg-white p-10 rounded-[50px] shadow-2xl shadow-slate-100 border border-slate-50">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-brand-50 rounded-2xl">
                            <Zap className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Dimensions de Vigilance</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Impact comportemental direct</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {data?.specificInsights?.map((insight, idx) => (
                            <div key={idx} className="group p-5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-[30px] transition-all border border-transparent hover:border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{insight?.label}</span>
                                    <span className="text-base font-black text-slate-900">{insight?.value}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${parseFloat(insight?.value) || 0}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-brand-600 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMPARATIVE DISTRIBUTION (Enhanced visibility) */}
                <div className="bg-white p-10 rounded-[50px] shadow-2xl shadow-slate-100 border border-slate-50">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Analyse Inter-Groupes</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Distribution comparative %</p>
                        </div>
                        <div className="p-3 bg-brand-600 rounded-2xl shadow-lg shadow-brand-100 text-white">
                            <BarChart size={20} />
                        </div>
                    </div>
                    
                    <div className="h-[280px] flex items-end justify-between gap-6 px-4 bg-slate-50/50 rounded-[40px] border border-slate-100 border-dashed p-8">
                        {data?.distributionComparative?.labels?.map((label, idx) => {
                            const localVal = data?.distributionComparative?.local?.[idx] || 0;
                            const nationalVal = data?.distributionComparative?.national?.[idx] || 0;
                            
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group">
                                    <div className="w-full flex items-end justify-center gap-2 h-full relative">
                                        {/* NATIONAL BAR (Background Benchmark) */}
                                        <div className="w-4 flex flex-col items-center justify-end h-full relative group/nat">
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(5, nationalVal)}%` }}
                                                transition={{ duration: 1, delay: idx * 0.1 + 0.2 }}
                                                className="w-full bg-slate-200 rounded-t-lg shadow-sm relative"
                                            >
                                                <span className="absolute -top-6 text-[8px] font-black text-slate-400 opacity-0 group-hover/nat:opacity-100 transition-opacity">
                                                    {nationalVal}% NAT
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* LOCAL BAR (Primary Data) */}
                                        <div className="w-6 flex flex-col items-center justify-end h-full relative group/loc">
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(5, localVal)}%` }}
                                                transition={{ duration: 1, delay: idx * 0.1 }}
                                                className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-xl shadow-xl shadow-brand-100 relative"
                                            >
                                                <span className="absolute -top-8 text-[10px] font-black text-brand-600 opacity-0 group-hover/loc:opacity-100 transition-all group-hover/loc:-translate-y-1">
                                                    {localVal}% LOC
                                                </span>
                                            </motion.div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* BLOCK 3 — SPATIAL ANALYSIS (Tunisia Map) — ONLY FOR SUPERADMIN (National) */}
            {initialScope === 'national' && (
                <div className="bg-white p-2 rounded-[60px] shadow-2xl shadow-slate-100 border border-slate-50 overflow-hidden relative">
                    <div className="absolute top-10 left-12 z-20">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-6 h-6 text-brand-600" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">INTELLIGENCE TERRITORIALE</h3>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] ml-9">Gouvernorats de Tunisie</p>
                    </div>
                    
                    <div className="min-h-[550px] bg-slate-50/50 flex items-center justify-center rounded-[55px] overflow-visible">
                        <TunisiaSVGMap 
                            sectionId={data?.title} 
                            intensity={getIntensity(data?.prevalence)} 
                        />
                    </div>
                </div>
            )}

            {/* BLOCK 3 — GENDER DISTRIBUTION — ONLY FOR ADMIN & USER */}
            {initialScope !== 'national' && (
                <div className="bg-white p-12 rounded-[60px] shadow-2xl shadow-slate-100 border border-slate-50 overflow-hidden relative mb-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-brand-50 rounded-2xl">
                            <Users className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Répartition par Genre</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[5px] mt-1">Analyse de la cohorte locale</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Boys Card */}
                        <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest text-blue-600">Garçons</span>
                                <span className="text-3xl font-black text-slate-900">{data?.genderDistribution?.male || 50}%</span>
                            </div>
                            <div className="h-4 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data?.genderDistribution?.male || 50}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-blue-500 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Girls Card */}
                        <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest text-pink-500">Filles</span>
                                <span className="text-3xl font-black text-slate-900">{data?.genderDistribution?.female || 50}%</span>
                            </div>
                            <div className="h-4 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data?.genderDistribution?.female || 50}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-pink-500 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BLOCK 3.5 — ACADEMIC PERFORMANCE — ONLY FOR ADMIN & USER */}
            {initialScope !== 'national' && (
                <div className="bg-white p-12 rounded-[60px] shadow-2xl shadow-slate-100 border border-slate-50 overflow-hidden relative">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-amber-50 rounded-2xl">
                            <Activity className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Rendement Scolaire</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[5px] mt-1">Impact sur la réussite académique (Question C.A05)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Excellents', val: data?.academicPerformance?.excellent, color: 'bg-emerald-500' },
                            { label: 'Bons', val: data?.academicPerformance?.good, color: 'bg-blue-500' },
                            { label: 'Moyens', val: data?.academicPerformance?.average, color: 'bg-amber-500' },
                            { label: 'Faibles', val: data?.academicPerformance?.low, color: 'bg-red-500' }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{item.label}</span>
                                <span className="text-2xl font-black text-slate-900 mb-4">{item.val}%</span>
                                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.val}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className={`h-full ${item.color} rounded-full`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BLOCK 4 — INTERPRETATION IA & CORRÉLATIONS */}
            <div className="bg-slate-900 p-12 rounded-[60px] shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
                
                <div className="flex items-start gap-8 relative z-10 mb-10">
                    <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/10">
                        <Brain className="w-10 h-10 text-brand-300" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white tracking-tighter">
                            Observatoire Intuitif Sentinelle
                        </h3>
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[5px] mt-2">Intelligence Artificielle & Synthèse Statistique</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    {/* LEFT: AI INTERPRETATION */}
                    <div className="p-8 bg-white/5 rounded-[45px] border border-white/10 flex flex-col justify-between">
                        <div>
                            <h4 className="text-[11px] font-black text-brand-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                                Synthèse Analytique
                            </h4>
                            <p className="text-xl leading-relaxed text-slate-100 font-medium italic opacity-90">
                                "{data?.interpretation || "Analyse multicritère en cours..."}"
                            </p>
                        </div>
                        <div className="mt-10 flex items-center gap-4 pt-6 border-t border-white/5">
                             <ShieldCheck className="text-brand-500" size={18} />
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Vérifié par Observatoire National</span>
                        </div>
                    </div>

                    {/* RIGHT: DIRECT CORRELATIONS */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-brand-300 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                            Corrélations Directes (Inter-Sections)
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {data?.correlations?.map((c, i) => (
                                <div key={i} className="p-6 bg-white/5 hover:bg-white/10 rounded-[35px] border border-white/5 transition-all group/item flex items-center justify-between gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-brand-400 uppercase tracking-[3px]">{c?.tag}</span>
                                        <p className="text-xs font-bold text-slate-300">{c?.label || "Lien Statistique"}</p>
                                    </div>
                                    <div className="flex items-center gap-4 flex-1 max-w-[150px]">
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${c?.value || 0}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className="h-full bg-gradient-to-r from-brand-600 to-brand-400" 
                                            />
                                        </div>
                                        <span className="text-sm font-black text-white tabular-nums">{c?.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionDetailPanel;
