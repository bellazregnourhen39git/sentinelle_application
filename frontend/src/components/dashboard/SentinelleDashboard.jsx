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
    const [selectedSectionData, setSelectedSectionData] = useState(null);
    const [homepageData, setHomepageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const ALL_SECTIONS_INFO = {
        'A': 'Données Démographiques', 'B': 'Contexte Familial', 'C': 'Cigarettes', 'D': 'E-cigarettes', 'E': 'Narguilé',
        'G': 'Alcool', 'H': 'Tranquillisants', 'I': 'Cannabis', 'J': 'Cocaïne', 'K': 'Ecstasy', 
        'L': 'Héroïne', 'M': 'Inhalants', 'N': 'Autres Substances', 'P': 'NPS', 'Q': 'Perception des Risques',
        'R': 'Réseaux Sociaux', 'S': 'Jeux Vidéo', 'T': 'Jeux d\'Argent', 'U': 'Violence', 'V': 'Santé Mentale / Stress', 'Z': 'Honnêteté'
    };

    const SECTION_STATIC_DATA = {
        'A': { p: "100%", e: 1450, i: "Faible", l: [100, 100, 100], n: [100, 100, 100], s: [{ label: "Rendement Scolaire Excellent (A05)", value: "32%" }, { label: "Absentéisme > 3 jours (A04)", value: "14%" }] },
        'B': { p: "85.2%", e: 1420, i: "Moyen", l: [85.2, 80.1, 75.0], n: [82.0, 78.5, 72.0], s: [{ label: "Situation Éco. Défavorable (B05)", value: "28%" }, { label: "Parents Sans Emploi (B03/B04)", value: "12%" }] },
        'C': { p: "12.8%", e: 1390, i: "Moyen", l: [12.8, 8.5, 4.2], n: [10.5, 7.0, 3.5], s: [{ label: "Usage Quotidien 30j (C04)", value: "6.5%" }, { label: "Amis Fumeurs (C02)", value: "45%" }] },
        'D': { p: "19.5%", e: 1385, i: "Élevé", l: [19.5, 14.2, 9.8], n: [15.0, 10.5, 6.0], s: [{ label: "Usage Quotidien 30j (D04)", value: "8.2%" }, { label: "Accessibilité Facile (D01)", value: "62%" }] },
        'E': { p: "6.4%", e: 1350, i: "Faible", l: [6.4, 3.2, 1.1], n: [7.5, 4.0, 1.5], s: [{ label: "Usage Quotidien 30j (E04)", value: "1.2%" }, { label: "Amis Consommateurs (E02)", value: "31%" }] },
        'G': { p: "8.2%", e: 1370, i: "Moyen", l: [8.2, 5.1, 2.0], n: [7.1, 4.5, 1.8], s: [{ label: "Binge Drinking Récent (G05)", value: "18%" }, { label: "Ivresse/Intoxication (G06)", value: "11%" }] },
        'H': { p: "4.1%", e: 1300, i: "Élevé", l: [4.1, 2.5, 1.2], n: [3.0, 1.8, 0.9], s: [{ label: "Sans Prescription (H03)", value: "4.1%" }, { label: "Initiation Précoce (H04)", value: "1.5%" }] },
        'I': { p: "21.4%", e: 1365, i: "Élevé", l: [21.4, 15.0, 8.5], n: [15.2, 10.1, 4.8], s: [{ label: "Usage Derniers 12 Mois (I05)", value: "15%" }, { label: "Accessibilité Facile (I01)", value: "48%" }] },
        'J': { p: "1.5%", e: 1290, i: "Élevé", l: [1.5, 0.8, 0.3], n: [1.2, 0.6, 0.2], s: [{ label: "Accessibilité Facile (J01)", value: "12%" }, { label: "Usage Unique (J03)", value: "0.8%" }] },
        'K': { p: "2.8%", e: 1280, i: "Moyen", l: [2.8, 1.5, 0.5], n: [2.5, 1.2, 0.4], s: [{ label: "Amis Consommateurs (K02)", value: "5%" }, { label: "Accessibilité Facile (K01)", value: "18%" }] },
        'L': { p: "0.4%", e: 1250, i: "Élevé", l: [0.4, 0.2, 0.1], n: [0.3, 0.1, 0.1], s: [{ label: "Entourage Consommateur (L02)", value: "1%" }, { label: "Accessibilité Facile (L01)", value: "3%" }] },
        'M': { p: "3.2%", e: 1275, i: "Moyen", l: [3.2, 1.8, 0.7], n: [2.8, 1.5, 0.5], s: [{ label: "Accessibilité Facile (M01)", value: "42%" }, { label: "Entourage Usager (M02)", value: "8%" }] },
        'N': { p: "5.5%", e: 1260, i: "Moyen", l: [5.5, 3.0, 1.2], n: [4.5, 2.5, 1.0], s: [{ label: "Cocktails Médicamenteux (N02)", value: "2.1%" }, { label: "Accessibilité Facile (N01)", value: "35%" }] },
        'P': { p: "1.2%", e: 1240, i: "Élevé", l: [1.2, 0.7, 0.2], n: [0.9, 0.5, 0.1], s: [{ label: "Forme Solide (P02)", value: "0.5%" }, { label: "Usage 12 Derniers Mois (P01)", value: "0.7%" }] },
        'Q': { p: "92.0%", e: 1400, i: "Faible", l: [92.0, 88.5, 85.0], n: [90.0, 85.0, 80.0], s: [{ label: "Risque Perçu Identifié (Q01)", value: "85%" }, { label: "Sait où Trouver de l'Aide (Q03)", value: "62%" }] },
        'R': { p: "98.1%", e: 1410, i: "Faible", l: [98.1, 95.2, 90.5], n: [97.0, 93.5, 88.0], s: [{ label: "+4 Heures/Jour (R01)", value: "41%" }, { label: "Sentiment de Dépendance (R02)", value: "55%" }] },
        'S': { p: "75.4%", e: 1395, i: "Moyen", l: [75.4, 65.0, 55.2], n: [70.5, 60.2, 50.5], s: [{ label: "Impact sur le Sommeil (S03)", value: "34%" }, { label: "Usage Quotidien (S02)", value: "52%" }] },
        'T': { p: "14.2%", e: 1320, i: "Élevé", l: [14.2, 8.5, 4.1], n: [10.5, 6.0, 2.5], s: [{ label: "Besoin d'Augmenter les Mises (T04)", value: "5.5%" }, { label: "Mensonges sur Mises (T05)", value: "3.2%" }] },
        'U': { p: "24.5%", e: 1335, i: "Élevé", l: [24.5, 15.2, 8.0], n: [18.5, 10.5, 5.0], s: [{ label: "Bagarre dans le Lycée (U03)", value: "12%" }, { label: "A Nécessité des Soins (U06)", value: "4%" }] },
        'V': { p: "38.6%", e: 1345, i: "Élevé", l: [38.6, 25.4, 15.2], n: [32.0, 20.1, 12.5], s: [{ label: "Sentiment de Perte de Contrôle (V01)", value: "22%" }, { label: "Difficultés Insurmontables (V04)", value: "18%" }] },
        'Z': { p: "88.5%", e: 1360, i: "Faible", l: [88.5, 85.0, 80.0], n: [90.5, 88.0, 82.5], s: [{ label: "Biais Déclaratif Alcool (Z01)", value: "11%" }, { label: "Biais Déclaratif Cannabis (Z02)", value: "15%" }] }
    };

    const statsBySection = Object.keys(ALL_SECTIONS_INFO).reduce((acc, key) => {
        const data = SECTION_STATIC_DATA[key] || SECTION_STATIC_DATA['A'];
        const sectionName = ALL_SECTIONS_INFO[key];
        const trendWord = data.l[0] > data.n[0] ? "à la hausse" : (data.l[0] < data.n[0] ? "plus faible" : "stable");

        acc[key] = {
            prevalence: data.p,
            echantillon: data.e,
            indiceAlerte: data.i,
            distributionComparative: { 
                local: data.l, 
                national: data.n, 
                labels: ["Usage Life", "Usage 12M", "Usage 30j"] 
            },
            specificInsights: data.s,
            correlations: [
                { tag: "Santé Mentale", value: 45, label: "Lien Stéréotypé" },
                { tag: "Environnement", value: 32, label: "Pression Sociale" },
                { tag: "Accessibilité", value: 68, label: "Disponibilité Locale" },
                { tag: "Scolarité", value: 54, label: "Performances Scolaires" },
                { tag: "Famille", value: 29, label: "Consommation Parents" },
                { tag: "Digital", value: 41, label: "Cyberdépendance" }
            ],
            interpretation: `L'indicateur pour [${sectionName}] montre une tendance ${trendWord} dans la zone locale par rapport aux données nationales.`
        };
        return acc;
    }, {});

    const handleSectionClick = (id) => {
        setSelectedSection(id);
        if (id) {
            setSelectedSectionData(statsBySection[id] || statsBySection['A']);
        } else {
            setSelectedSectionData(null);
        }
    };

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
                    onSectionClick={handleSectionClick}
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
                                data={selectedSectionData}
                                onBack={() => handleSectionClick(null)} 
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
                                         onClick={() => handleSectionClick(section.section_id)}
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
