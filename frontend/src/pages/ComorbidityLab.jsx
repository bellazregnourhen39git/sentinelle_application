import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Activity, LucideArrowLeft, Info, HelpCircle, Target, TrendingUp, AlertTriangle, Zap, FlaskConical, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditableLabel from '../components/dashboard/EditableLabel';
import api from '../api';

const ComorbidityLab = ({ profile }) => {
    const navigate = useNavigate();
    const [labData, setLabData] = useState(null);
    const [loading, setLoading] = useState(true);

    const isUser = profile?.role === 'USER';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('lab-stats/');
                setLabData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Échec de synchronisation de la Comorbidité :", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const polyStats = labData?.comorbidity?.rankings || [];
    const topPairs = labData?.comorbidity?.top_combinations || [];
    const topTriplesData = labData?.comorbidity?.top_triples || [];
    const nationalAvg = labData?.national_avg?.poly_usage || 12.6;

    const renderSubstanceLabel = (label) => {
        if (!label) return '';
        const parts = label.split(' + ');
        return parts.map((part, i) => {
            const termKey = `substance_${part.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '_').replace(/-/g, '_')}`;
            return (
                <React.Fragment key={i}>
                    <EditableLabel termKey={termKey} defaultValue={part} />
                    {i < parts.length - 1 && " + "}
                </React.Fragment>
            );
        });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-12">
            {/* 🔬 En-tête de Navigation */}
            <div className="max-w-[1400px] mx-auto mb-12 flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-500 font-black uppercase tracking-[2px] text-[10px] italic hover:bg-slate-50 transition-all shadow-sm group"
                >
                    <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <EditableLabel termKey="lab_btn_back" defaultValue="Retour au Hub" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-600 uppercase tracking-[3px] italic flex items-center gap-2 shadow-sm">
                        <Layers size={14} className="animate-pulse" />
                        <EditableLabel termKey="lab_comorbidity_header_badge" defaultValue="Laboratoire de Phénoménologie Comorbide" />
                    </div>
                </div>
            </div>

            {/* 🌌 Section Héro */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1400px] mx-auto pro-card p-16 rounded-[64px] border-l-[16px] border-rose-500 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 relative overflow-hidden mb-8"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Zap size={280} strokeWidth={1} className="text-rose-500" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-8">
                        <EditableLabel termKey="lab_comorbidity_hero_title_1" defaultValue="Spectre" /> <span className="text-rose-600"><EditableLabel termKey="lab_comorbidity_hero_title_2" defaultValue="Comorbidité" /></span>
                    </h1>
                    <p className="text-xl text-slate-500 font-bold italic leading-relaxed opacity-80 mb-10">
                        <EditableLabel termKey="lab_comorbidity_hero_desc" defaultValue="Analyse multidimensionnelle de la poly-consommation. Identification des profils à risque psychiatrique majeur et des synergies de substances." />
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="px-8 py-3 bg-rose-900 text-white rounded-full text-[11px] font-black uppercase tracking-[4px] italic shadow-2xl shadow-rose-900/20">
                            <EditableLabel termKey="lab_como_hero_alert" defaultValue="Alerte Poly-Usage" /> : {nationalAvg}% <EditableLabel termKey="lab_como_hero_nat" defaultValue="National" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ⚙️ Moteur de Classification & Threshold Intelligence */}
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl flex items-start gap-6"
                >
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-inner shrink-0">
                        <FlaskConical size={28} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic mb-2">Classification : <span className="text-brand-600 underline">Admission = Usage</span></h4>
                        <p className="text-[11px] font-bold text-slate-400 italic leading-relaxed">
                            Le système suit le protocole Sentinelle : tout individu ayant déclaré une consommation au moins une fois dans sa vie (score <span className="text-brand-500 font-black">"1-2 fois"</span> ou plus) est classifié comme <span className="text-slate-900">Consommateur Actif</span>. Cette approche inclusive permet de détecter les signaux faibles avant l'ancrage de la dépendance.
                        </p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-[40px] bg-rose-50 border border-rose-100 shadow-xl flex items-start gap-6"
                >
                    <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner shrink-0">
                        <Target size={28} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic mb-2">Seuil Critique : <span className="text-rose-600 underline">20% Research-Based</span></h4>
                        <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">
                            Le seuil de <span className="text-rose-600 font-black">20%</span> n'est pas arbitraire ; il est indexé sur le <span className="text-rose-600 underline">Protocole MedSPAD-C12</span>. Il marque la transition d'une consommation isolée vers une <span className="text-rose-700">épidémie de poly-consommation systémique</span>, nécessitant des protocoles d'urgence régionaux.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* 📊 Matrice & Classements */}
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* 🧪 Matrice de Corrélation des Substances (Paires) */}
                <motion.div 
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-12 pro-card p-12 rounded-[56px] border border-slate-100 bg-white shadow-xl mb-6"
                >
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter"><EditableLabel termKey="lab_como_synergy_title" defaultValue="Synergies Directes" /></h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] italic mt-2"><EditableLabel termKey="lab_como_synergy_subtitle" defaultValue="Duos de Consommation les plus Fréquents" /></p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {topPairs.map((combo, idx) => (
                            <div key={idx} className="p-10 rounded-[48px] bg-slate-900 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                                    <FlaskConical size={60} />
                                </div>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[4px] italic mb-4 block"><EditableLabel termKey="lab_como_duo_prefix" defaultValue="Duo Alpha" /> #{idx + 1}</span>
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">
                                    {renderSubstanceLabel(combo.label)}
                                </h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white italic tracking-tighter">{combo.count}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase italic"><EditableLabel termKey="lab_como_profiles_count" defaultValue="Profils Identifiés" /></span>
                                </div>
                                <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 italic">
                                    Alerte Clinique : Risque de dépression respiratoire et de syndrome sélectif accru.
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 🔴 Pathologies à Triple Menace */}
                <motion.div 
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-12 p-12 rounded-[56px] bg-rose-950 border border-white/10 shadow-2xl mb-12 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.1),transparent)]" />
                    
                    <div className="flex items-center gap-4 mb-12 px-2 relative z-10 text-white">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter"><EditableLabel termKey="lab_como_triple_title" defaultValue="Pathologies Triple-Axe (+3)" /></h3>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[3px] italic mt-2"><EditableLabel termKey="lab_como_triple_subtitle" defaultValue="Combinaisons Critiques de 3 Substances ou Plus" /></p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        {topTriplesData && topTriplesData.length > 0 ? topTriplesData.map((combo, idx) => (
                            <div key={idx} className="p-10 rounded-[48px] bg-white/5 border border-white/10 text-white relative overflow-hidden group hover:bg-white/10 transition-all">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[4px] italic mb-4 block underline"><EditableLabel termKey="lab_como_triple_prefix" defaultValue="Triple Menace" /> #{idx + 1}</span>
                                <h4 className="text-xl font-extrabold italic uppercase tracking-tighter mb-4 pr-12 text-white leading-tight">
                                    {renderSubstanceLabel(combo.label)}
                                </h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-rose-500 italic tracking-tighter">{combo.count}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase italic"><EditableLabel termKey="lab_como_profiles_count" defaultValue="Profils Identifiés" /></span>
                                </div>
                            </div>
                        )) : (
                            <div className="md:col-span-3 py-12 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                                <p className="text-xl font-black italic text-white opacity-20 uppercase tracking-[4px]"><EditableLabel termKey="lab_como_no_triple" defaultValue="Aucun Profil Triple Détecté dans le Registre" /></p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 🏢 Classement National Poly-Usage (Admin/SuperAdmin uniquement) */}
                {!isUser ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-8 pro-card p-12 rounded-[64px] border border-slate-100 bg-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-12 px-2">
                             <div>
                                <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter"><EditableLabel termKey="lab_como_nat_rank_title" defaultValue="Classement National Poly-Usage" /></h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] italic mt-2"><EditableLabel termKey="lab_como_nat_rank_subtitle" defaultValue="Intensité de la Consommation Multiple par Gouvernorat" /></p>
                            </div>
                        </div>

                        <div className="h-[520px] overflow-y-auto pr-6 space-y-4 custom-scrollbar px-2">
                            {polyStats.map((reg, idx) => (
                                <div key={reg.gov_name} className="flex items-center gap-8 p-6 rounded-[32px] bg-slate-50 border border-slate-100 group hover:bg-white hover:border-rose-500/20 transition-all hover:shadow-xl">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-lg ${idx < 3 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                        #{idx + 1}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-slate-900 uppercase tracking-[1px] italic">{reg.gov_name}</span>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase italic"><EditableLabel termKey="lab_como_critical_zone" defaultValue="Zone Critique (3+)" /></p>
                                                    <p className="text-sm font-black text-rose-600 italic">{reg.poly_3plus}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase italic"><EditableLabel termKey="lab_como_multi_usage" defaultValue="Multi-Usage (2+)" /></p>
                                                    <p className="text-sm font-black text-slate-900 italic">{reg.poly_2plus}%</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${reg.poly_2plus}%` }}
                                                className="h-full bg-rose-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 p-12 rounded-[64px] bg-white border border-slate-100 shadow-xl flex items-center justify-center text-center"
                    >
                        <div>
                            <TrendingUp size={80} className="text-rose-500/20 mx-auto mb-8" />
                            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter mb-4"><EditableLabel termKey="lab_como_field_view_title" defaultValue="Vue de Terrain Activée" /></h3>
                            <p className="text-sm font-bold text-slate-400 italic max-w-md mx-auto leading-relaxed">
                                <EditableLabel termKey="lab_como_field_view_desc" defaultValue="Les classements comparatifs inter-régionaux sont réservés à la supervision. Concentrez-vous sur les synergies de substances détectées." />
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* 📋 Documentation de Diagnostic Clinique */}
                <motion.div 
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 p-12 rounded-[64px] border border-slate-900 bg-slate-900 shadow-xl flex flex-col justify-between text-white"
                >
                    <div className="mb-10 relative">
                        <div className="absolute -top-6 -right-6 opacity-10">
                            <TrendingUp size={140} />
                        </div>
                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[4px] mb-12 italic"><EditableLabel termKey="lab_como_diag_title" defaultValue="Fiche de Diagnostic Clinique" /></h4>
                        
                        <div className="space-y-10">
                            <div className="group">
                                <h5 className="text-[11px] font-black uppercase tracking-[2px] mb-4 text-rose-400 flex items-center gap-2 italic">
                                    <AlertTriangle size={14} /> Le Risque Synergique
                                </h5>
                                <p className="text-[12px] font-bold text-slate-400 italic leading-relaxed group-hover:text-white transition-colors">
                                    La consommation simultanée de dépresseurs (Alcool/Tranquillisants) et de stimulants (Tabac/Cannabis) masque les signes de surdose immédiate, augmentant drastiquement la mortalité subite.
                                </p>
                            </div>

                            <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
                                <h5 className="text-[11px] font-black uppercase tracking-[2px] mb-4 text-rose-400 italic">Intervention Prioritaire</h5>
                                <p className="text-[13px] font-black italic tracking-tight leading-relaxed mb-6 text-white">
                                    "Un score Poly-Usage {'>'} 20% dans une région nécessite l'activation immédiate d'une cellule de crise médicale."
                                </p>
                                <div className="flex items-center gap-3">
                                    <Award size={16} className="text-rose-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[2px] text-slate-500 italic">Protocole MedSPAD-C12</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-5 bg-rose-500 text-white rounded-[24px] font-black uppercase tracking-[4px] text-[10px] italic shadow-2xl hover:bg-rose-600 transition-all border-none shadow-rose-500/20">
                        <EditableLabel termKey="lab_como_btn_print" defaultValue="Imprimer Rapport de Risque" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default ComorbidityLab;
