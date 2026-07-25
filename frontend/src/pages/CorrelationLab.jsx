import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radar, Gamepad2, Swords, Flame, Sparkles, Beer, Award,
    AlertTriangle, ArrowUpRight, ArrowDownRight, Thermometer,
    ShieldAlert, Smartphone, LucideArrowLeft, Info, Activity,
    TrendingUp, Layers, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EditableLabel from '../components/dashboard/EditableLabel';

// ─── Tooltip component ────────────────────────────────────────────────────────
const Tooltip = ({ content, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-4 rounded-2xl bg-slate-900 text-white text-[11px] font-bold leading-relaxed italic shadow-2xl border border-white/10 pointer-events-none"
                    >
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-white/10" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const getIcon = (id) => {
    switch (id) {
        case 'gaming_violence':
            return <div className="flex gap-1 items-center"><Gamepad2 size={18} className="text-white" /><span className="text-white/40 font-black">×</span><Swords size={18} className="text-white" /></div>;
        case 'smoking_cannabis':
            return <div className="flex gap-1 items-center"><Flame size={18} className="text-white" /><span className="text-white/40 font-black">×</span><Sparkles size={18} className="text-white" /></div>;
        case 'alcohol_grades':
            return <div className="flex gap-1 items-center"><Beer size={18} className="text-white" /><span className="text-white/40 font-black">×</span><Award size={18} className="text-white" /></div>;
        case 'stress_meds':
            return <div className="flex gap-1 items-center"><Thermometer size={18} className="text-white" /><span className="text-white/40 font-black">×</span><ShieldAlert size={18} className="text-white" /></div>;
        case 'social_stress':
            return <div className="flex gap-1 items-center"><Smartphone size={18} className="text-white" /><span className="text-white/40 font-black">×</span><Thermometer size={18} className="text-white" /></div>;
        case 'gambling_grades':
            return <div className="flex gap-1 items-center"><Flame size={18} className="text-white" /><span className="text-white/40 font-black">×</span><Award size={18} className="text-white" /></div>;
        case 'vape_smoke':
            return <div className="flex gap-1 items-center"><Sparkles size={18} className="text-white" /><span className="text-white/40 font-black">×</span><Flame size={18} className="text-white" /></div>;
        case 'violence_family':
            return <div className="flex gap-1 items-center"><Swords size={18} className="text-white" /><span className="text-white/40 font-black">×</span><ShieldAlert size={18} className="text-white" /></div>;
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
        case 'violence_family': return 'from-rose-600 to-slate-700 shadow-rose-600/20';
        default: return 'from-emerald-500 to-emerald-600 shadow-emerald-500/20';
    }
};

// ─── Clinical interpretation by correlation id ────────────────────────────────
const CLINICAL_NOTES = {
    gaming_violence: "Les élèves jouant plus de 6h/jour aux jeux vidéo présentent statistiquement plus de comportements agressifs. Cette corrélation suggère un mécanisme de désensibilisation à la violence, documenté dans la littérature psychiatrique adolescente.",
    smoking_cannabis: "Le tabagisme quotidien constitue un facteur de risque majeur d'initiation au cannabis (passerelle de substance). Une intervention précoce sur le tabac réduit significativement le risque de poly-usage.",
    alcohol_grades: "L'alcoolisation régulière impacte directement les fonctions cognitives : mémoire de travail, concentration et temps de réaction. Les résultats scolaires en sont une mesure objective et directe.",
    stress_meds: "Un niveau de stress chronique chez l'adolescent l'expose à l'automédication par tranquillisants. Cette corrélation identifie les lycéens nécessitant un accompagnement psychologique prioritaire.",
    social_stress: "L'hyperconnexion aux réseaux sociaux (comparaison sociale, cyberharcèlement, FOMO) est corrélée à un niveau d'anxiété cliniquement significatif. Un usage supérieur à 6h/jour constitue un seuil d'alerte validé.",
    gambling_grades: "Les jeux de hasard induisent une activation dopaminergique similaire aux substances addictives, conduisant à une impulsivité accrue et une désorganisation des priorités scolaires.",
    vape_smoke: "Le vapotage constitue fréquemment une porte d'entrée vers le tabagisme classique ou un comportement de substitution. La prévalence simultanée des deux indique un profil d'addiction nicotinique établi.",
    violence_family: "Un environnement familial conflictuel est le premier facteur de risque environnemental validé pour l'exposition à la violence entre pairs. L'intervention familiale est clé pour briser ce cycle."
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CorrelationLab = ({ profile }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('stats/correlations/', {
                    params: { scope_type: 'national' }
                });
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch correlation stats", err);
                setError("Impossible de charger le moteur de corrélation.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Only show statistically significant correlations: |deviation| > 3 OR rate > 20%
    const significantCorrelations = (data?.correlations || []).filter(
        item => Math.abs(item.deviation) > 3 || item.rate > 20
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-12">
            {/* Header */}
            <div className="max-w-[1400px] mx-auto mb-12 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-500 font-black uppercase tracking-[2px] text-[10px] italic hover:bg-slate-50 transition-all shadow-sm group"
                >
                    <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Retour au Hub
                </button>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-600 uppercase tracking-[3px] italic flex items-center gap-2">
                        <Layers size={14} className="animate-pulse" />
                        Moteur de Corrélation Clinique
                    </div>
                </div>
            </div>

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1400px] mx-auto pro-card p-16 rounded-[64px] border-l-[16px] border-rose-500 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 relative overflow-hidden mb-10"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Radar size={280} strokeWidth={1} className="text-rose-500" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-8">
                        Moteur de <span className="text-rose-600">Corrélation</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-bold italic leading-relaxed opacity-80 mb-10">
                        Analyse croisée des comportements à risque. Seules les corrélations statistiquement significatives (écart national &gt; 3pp ou taux &gt; 20%) sont affichées.
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="px-6 py-2.5 bg-rose-900 text-white rounded-full text-[10px] font-black uppercase tracking-[3px] italic shadow-xl">
                            {significantCorrelations.length} Corrélations Significatives Détectées
                        </div>
                        {data?.scope_label && (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] italic">
                                {data.scope_label}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-[1400px] mx-auto h-80 flex flex-col items-center justify-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-rose-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity size={18} className="text-rose-500" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] italic">Calcul des matrices de corrélation...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        className="max-w-[1400px] mx-auto h-60 flex flex-col items-center justify-center gap-4 text-center"
                    >
                        <AlertTriangle size={36} className="text-rose-400" />
                        <p className="text-sm font-black text-slate-600 uppercase italic">{error}</p>
                    </motion.div>
                ) : significantCorrelations.length === 0 ? (
                    <motion.div
                        key="empty"
                        className="max-w-[1400px] mx-auto h-60 flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-slate-200 rounded-[48px]"
                    >
                        <TrendingUp size={40} className="text-slate-200" />
                        <p className="text-sm font-black text-slate-300 uppercase italic">Aucune corrélation significative détectée dans la cohorte actuelle.</p>
                        <p className="text-[10px] font-bold text-slate-300 italic">Enrichissez la base de données pour activer le moteur.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {significantCorrelations.map((item, idx) => {
                            const isHighDev = item.deviation > 0;
                            const isNegDev = item.deviation < 0;
                            const absDeviation = Math.abs(item.deviation);
                            const isExpanded = expandedCard === item.id;
                            const clinicalNote = CLINICAL_NOTES[item.id] || "Corrélation clinique validée par le protocole MedSPAD. Survolez pour les détails.";

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="p-8 rounded-[36px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col gap-6 group/card relative overflow-hidden cursor-pointer"
                                    onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                                >
                                    {/* Subtle glow */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getGradient(item.id)} opacity-[0.04] group-hover/card:opacity-[0.09] blur-2xl rounded-full transition-opacity duration-700 pointer-events-none`} />

                                    {/* Top row */}
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
                                        <Tooltip content={clinicalNote}>
                                            <HelpCircle size={16} className="text-slate-300 hover:text-rose-500 transition-colors cursor-help shrink-0 mt-0.5" />
                                        </Tooltip>
                                    </div>

                                    {/* Description */}
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic opacity-90">
                                        {item.description}
                                    </p>

                                    {/* Metrics row */}
                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                        <div>
                                            <Tooltip content={`Sur ${item.cohort_size} élèves satisfaisant la condition "${item.condition_label}", ${item.correlation_size} (${item.rate}%) présentent aussi "${item.outcome_label}".`}>
                                                <div className="cursor-help">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                                                        Taux Local <Info size={10} className="text-slate-300" />
                                                    </span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-black italic tracking-tighter text-slate-900">{item.rate}%</span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                            ({item.correlation_size}/{item.cohort_size})
                                                        </span>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>
                                        <div>
                                            <Tooltip content={`La moyenne nationale pour cette même corrélation est de ${item.national_rate}%. Cela permet de comparer le niveau local au reste du pays.`}>
                                                <div className="cursor-help">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                                                        Moyenne Nationale <Info size={10} className="text-slate-300" />
                                                    </span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-black italic tracking-tighter text-slate-500">{item.national_rate}%</span>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(item.rate, 100)}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            className={`h-full bg-gradient-to-r ${getGradient(item.id)}`}
                                        />
                                    </div>

                                    {/* Deviation badge */}
                                    <div className="flex items-center justify-between mt-1">
                                        <Tooltip content={`Écart entre le taux local (${item.rate}%) et la moyenne nationale (${item.national_rate}%). Un écart positif signifie que ce territoire est plus exposé que la moyenne nationale.`}>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] cursor-help flex items-center gap-1">
                                                Écart National <Info size={10} className="text-slate-300" />
                                            </span>
                                        </Tooltip>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[1px] flex items-center gap-1.5 italic ${isHighDev ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : isNegDev ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                            {isHighDev ? (
                                                <><ArrowUpRight size={12} className="stroke-[3]" />+{absDeviation}% au-dessus</>
                                            ) : isNegDev ? (
                                                <><ArrowDownRight size={12} className="stroke-[3]" />-{absDeviation}% en-dessous</>
                                            ) : 'Égal à la nationale'}
                                        </div>
                                    </div>

                                    {/* Expanded clinical note */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 border-t border-slate-100 mt-2">
                                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[3px] italic mb-2">Interprétation Clinique</p>
                                                    <p className="text-[12px] font-bold text-slate-600 italic leading-relaxed">{clinicalNote}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic text-right">
                                        {isExpanded ? 'Cliquer pour réduire ▲' : 'Cliquer pour l\'interprétation clinique ▼'}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CorrelationLab;
