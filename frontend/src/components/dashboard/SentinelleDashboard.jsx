import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Zap, ArrowRight, Info, AlertTriangle, ShieldCheck,
    Layers, Search, LogOut, User
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import RadialSectionWheel from './RadialSectionWheel';
import SectionDetailPanel from './SectionDetailPanel';
import RegionalSelector from './RegionalSelector';
import TunisiaMap from './TunisiaMap';
import { SocialInlet, CompetitiveMatrix, NationalHeatList, ExpertAudit, ComorbiditySpectrum, RankingsLabInlet } from './IntelligenceInlets';

const NationalVigilancePanel = ({ metrics, activeSection }) => {
    if (!metrics || metrics.length === 0) return null;
    
    const sectionNames = { 
        'C': 'Tabagisme', 'G': 'Alcoolisme', 'I': 'Cannabis', 'E': 'Narguilé', 'D': 'Vapotage',
        'H': 'Tranquillisants', 'J': 'Cocaïne', 'K': 'Ecstasy', 'L': 'Héroïne', 'M': 'Inhalants'
    };
    const activeLabel = sectionNames[activeSection] || 'Global';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-card p-12 rounded-[56px] mb-12 border border-slate-100 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl relative overflow-hidden"
        >
            {/* Radar Sweep Animation (Light Version) */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 w-[150%] h-[150%] pointer-events-none origin-bottom-right z-0 mix-blend-multiply opacity-[0.03]"
                style={{
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(16,185,129,0.2) 95%, rgba(16,185,129,0.8) 100%)',
                    transform: 'translate(-50%, -50%)',
                }}
            />
            {/* Scan Line Animation (Light Version) */}
            <motion.div 
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] pointer-events-none z-0 opacity-20"
            />
            
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />

            <div className="relative z-10 flex items-center justify-between mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-widest drop-shadow-sm">Matrice de Scanning</h3>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] italic">
                        Surveillance {activeLabel} : Points de Fixation Sécuritaires
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-full text-[10px] font-black text-white uppercase tracking-[2px] italic shadow-[0_0_15px_rgba(15,23,42,0.1)] flex items-center gap-2">
                        <Activity size={12} className="text-brand-400 animate-pulse" />
                        {metrics.length} ZONES ANALYSÉES
                    </div>
                </div>
            </div>

            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            <div className="flex gap-6 overflow-x-auto pb-4 relative z-10 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {metrics.map((reg) => {
                    const prevalence = reg.prevalence || 0;
                    const isHigh = prevalence > 25;
                    const isMed = prevalence > 15;
                    
                    return (
                        <div key={reg.id} className="w-[180px] shrink-0 snap-start relative group p-6 rounded-[32px] bg-white border border-slate-100 flex flex-col gap-4 transition-all duration-500 hover:bg-slate-900 hover:border-slate-800 hover:-translate-y-1 hover:shadow-2xl overflow-hidden shadow-sm">
                             <div className="flex items-center justify-between relative z-10">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] break-words group-hover:text-slate-300 transition-colors">{reg.name}</span>
                                 <div className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-500 ${isHigh ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse group-hover:bg-rose-400' : isMed ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] group-hover:bg-amber-400' : 'bg-brand-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover:bg-brand-400'}`} />
                             </div>

                             <div className="relative z-10">
                                 <p className={`text-2xl font-black italic tracking-tighter mb-2 transition-colors duration-500 ${isHigh ? 'text-rose-600 group-hover:text-rose-400' : 'text-slate-900 group-hover:text-white'} group-hover:scale-105 transition-transform origin-left`} title={`${prevalence}%`}>
                                     {prevalence}%
                                 </p>
                                 <div className="w-full h-1 bg-slate-100 group-hover:bg-slate-800 transition-colors duration-500 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${prevalence}%` }}
                                        className={`h-full ${isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-brand-500'}`}
                                     />
                                 </div>
                             </div>

                             <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest italic relative z-10 group-hover:text-slate-500 transition-colors">
                                 <span>VOL. {reg.dossiers}</span>
                             </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const RegionalSummaryHub = ({ data, globalInsights, activeSection, isSuperAdmin }) => {
    if (!data) return null;
    const { headline, kpis } = data;
    
    const sectionNames = { 'C': 'Tabagisme', 'G': 'Alcoolisme', 'I': 'Cannabis', 'E': 'Narguilé', 'D': 'Vapotage' };
    const activeLabel = sectionNames[activeSection] || 'Cognitive';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
        >
            {/* 🔬 Regional Identity Header — Crystal Light */}
            <div className="pro-card p-14 rounded-[64px] border-l-[12px] border-brand-500 shadow-2xl shadow-slate-200/40 relative overflow-hidden group bg-white/80 backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Activity size={180} strokeWidth={1} className="text-brand-500" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-8 mb-10">
                        <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                            <button className="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[4px] bg-brand-500 text-white shadow-xl shadow-brand-500/20 italic hover:bg-brand-600 transition-colors">
                                {activeSection ? `Filtrage : ${sectionNames[activeSection]}` : 'Audit Temps-Réel'}
                            </button>
                        </div>
                        <div className="h-[2px] w-16 bg-slate-100" />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] italic opacity-60">Cycle 2026.Alpha</span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-8">
                        Synthèse <span className="text-brand-600">{activeLabel}</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-bold italic max-w-2xl leading-relaxed opacity-80">
                         {activeSection 
                            ? `Analyse segmentée des indicateurs de veille pour le vecteur ${sectionNames[activeSection]}.`
                            : "Synthèse globale des indicateurs de veille sanitaire pour le périmètre sélectionné."}
                    </p>
                </div>
            </div>

            {/* 📊 High-Density KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {kpis?.map((kpi, idx) => (
                    <div key={idx} className="pro-card p-10 rounded-[48px] group transition-all duration-500 hover:scale-[1.02] bg-white border border-slate-100 shadow-xl shadow-slate-200/30">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] group-hover:text-brand-500 transition-colors italic">{kpi.label}</p>
                            <div className="w-2 h-2 rounded-full bg-brand-500/20 group-hover:bg-brand-500 animate-pulse transition-colors" />
                        </div>
                        <p className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter italic mb-8">{kpi.value}</p>
                        <div className="w-12 h-[2px] bg-slate-100 group-hover:w-full group-hover:bg-brand-500 transition-all duration-1000 rounded-full" />
                    </div>
                ))}
            </div>
            
            {/* 🛡️ Clinical Reliability Index */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-10 rounded-[48px] flex items-center justify-between shadow-2xl shadow-slate-900/20">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] mb-2 italic">Indice de Fiabilité</p>
                        <p className="text-2xl font-black text-white italic tracking-tight tabular-nums">{headline?.reliability_rate || 92}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl border-2 border-brand-500/30 text-brand-400 flex items-center justify-center font-black text-xs italic bg-brand-500/5 shadow-inner">
                        OPTIMAL
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-10 rounded-[48px] flex items-center justify-between shadow-xl shadow-slate-200/40">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] mb-2 italic">Taux de Complétion</p>
                        <p className="text-2xl font-black text-slate-900 italic tracking-tight tabular-nums">{headline?.completion_rate || 85}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl border-2 border-slate-50 text-slate-400 flex items-center justify-center font-black text-xs italic bg-slate-50">
                        {headline?.completion_rate || 85}%
                    </div>
                </div>
            </div>

            {/* 🧪 INTELLIGENCE LABS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SocialInlet 
                    stressIndex={globalInsights?.social?.stress_index}
                    violenceIndex={globalInsights?.social?.violence_index}
                    locked={!isSuperAdmin}
                />
                <ExpertAudit integrity={globalInsights?.integrity} locked={!isSuperAdmin} />
                <div className="md:col-span-2">
                    <ComorbiditySpectrum metrics={globalInsights?.comorbidity} locked={!isSuperAdmin} />
                </div>
            </div>
        </motion.div>
    );
};

// Sentinelle Analytical Engine — Multi-Scope Environment
const SentinelleDashboard = ({ initialScope = 'user_school', initialScopeId = null, forcedUser = null, onLogout = null }) => {
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedSectionData, setSelectedSectionData] = useState(null);
    const [sectionLoading, setSectionLoading] = useState(false);
    
    // 🛡️ Security & Role Extraction
    const [currentUser, setCurrentUser] = useState(forcedUser);
    useEffect(() => {
        if (forcedUser) { setCurrentUser(forcedUser); return; }
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setCurrentUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, [forcedUser]);

    const [homepageData, setHomepageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const urlParams = new URLSearchParams(window.location.search);
    const activeScope = urlParams.get('scope') || initialScope;
    const activeScopeId = urlParams.get('gouvernorat') || initialScopeId;

    const fetchHomepage = useCallback(async (sectionId = null) => {
        try {
            setLoading(true);
            const res = await api.get('homepage/', { 
                params: { 
                    scope_type: activeScope,
                    scope_id: activeScopeId,
                    section: sectionId
                } 
            });
            setHomepageData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Synchronisation de données impossible.");
            setLoading(false);
        }
    }, [activeScope, activeScopeId]);

    const handleSectionClick = useCallback(async (id) => {
        if (!id) {
            setSelectedSection(null);
            setSelectedSectionData(null);
            fetchHomepage(null);
            return;
        }

        setSectionLoading(true);
        try {
            const response = await api.get(`section-stats/${id}/`, {
                params: { 
                    scope_type: activeScope, 
                    scope_id: activeScopeId 
                }
            });
            setSelectedSectionData(response.data);
            setSelectedSection(id);
            fetchHomepage(id);
        } catch (err) {
            console.error("Critical Analysis Failure:", err);
            setError("Impossible de charger les données sectorielles.");
        } finally {
            setSectionLoading(false);
        }
    }, [activeScope, activeScopeId, fetchHomepage]);

    useEffect(() => {
        setSelectedSection(null);
        setSelectedSectionData(null);
        fetchHomepage();
    }, [activeScope, activeScopeId, fetchHomepage]);

    const intensityData = homepageData?.top_sections?.reduce((acc, s) => {
        acc[s.section_id] = 1.0;
        return acc;
    }, {}) || {};

    if (error) return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-transparent">
            <div className="pro-card p-12 rounded-[48px] text-center max-w-lg border-t-8 border-t-rose-500 shadow-2xl bg-white">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner">
                    <AlertTriangle size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter italic">Échec Système</h3>
                <p className="text-slate-500 mb-10 font-bold leading-relaxed italic">{error}</p>
                <button onClick={() => fetchHomepage()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[4px] text-[11px] hover:bg-brand-600 transition-all shadow-2xl shadow-slate-200 border border-white/10 active:scale-95 italic">
                    Forcer la Recalibration
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-slate-900 font-sans selection:bg-brand-500/10 selection:text-brand-700">
            
            <nav className="h-24 sticky top-0 z-50 px-12 flex items-center justify-between">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl border-b border-slate-100 shadow-sm" />
                <div className="relative flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-2xl shadow-brand-500/20 group hover:rotate-12 transition-transform duration-500">
                        <Activity size={24} className="text-white glow-brand" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase leading-none italic">Sentinelle</h2>
                        <span className="text-[10px] font-black text-brand-600 tracking-[5px] uppercase opacity-70">Clinical Hub</span>
                    </div>
                </div>
                
                <div className="relative flex items-center gap-8">
                    <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-lg glow-brand animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Actif • Synchronisé</span>
                    </div>
                    {currentUser && (
                        <div className="hidden md:flex items-center gap-4 border-l-[3px] border-slate-100 pl-8">
                            <div className="flex flex-col text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] leading-none mb-1 italic">{currentUser.role || 'USER'}</p>
                                <p className="text-sm font-black text-slate-900 italic tracking-tight">{currentUser.username}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                                <User size={18} />
                            </div>
                        </div>
                    )}
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            title="Déconnexion"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all duration-300 text-[10px] font-black uppercase tracking-widest italic group"
                        >
                            <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden lg:inline">Sortie</span>
                        </button>
                    )}
                </div>
            </nav>

            <div className="max-w-[1600px] mx-auto p-12 pb-24 relative">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[60vh] flex flex-col items-center justify-center gap-12"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-slate-50 rounded-full animate-spin border-t-brand-500 shadow-2xl" />
                                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-500/20" size={36} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-[6px] mb-3 uppercase italic">Initialisation...</h3>
                                <p className="text-slate-400 font-black uppercase tracking-[8px] text-[10px] animate-pulse">Extraction Multidimensionnelle</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-12">
                            {(!activeScopeId && activeScope === 'gouvernorate') ? (
                                <RegionalSelector regions={homepageData?.regional_metrics} />
                            ) : (
                                <div className="grid lg:grid-cols-12 gap-12 items-start">
                                    {/* Left Column: Visual Hub */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="lg:col-span-5 flex flex-col gap-10 sticky top-36"
                                    >
                                        <div className="pro-card p-12 rounded-[56px] border border-slate-100 relative overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 group">
                                            <RadialSectionWheel 
                                                intensityData={intensityData}
                                                activeSection={selectedSection}
                                                onSectionClick={handleSectionClick}
                                                totalSubmissions={homepageData?.headline?.n_submissions || 0}
                                            />
                                            <div className="mt-10 flex justify-center">
                                                <div className="px-8 py-3.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[5px] flex items-center gap-4 italic group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-all duration-500">
                                                    <div className="w-2 h-2 rounded-full bg-brand-500 shadow-lg glow-brand" />
                                                    Vecteur Cohorte Consolidé
                                                </div>
                                            </div>
                                        </div>

                                        {(currentUser?.role?.toUpperCase() === 'SUPERADMIN' || currentUser?.role?.toUpperCase() === 'ADMIN' || currentUser?.role === 'national') ? (
                                            <div className="mt-4">
                                                <TunisiaMap 
                                                    data={homepageData?.map_data}
                                                    activeSection={selectedSection}
                                                    currentUser={currentUser}
                                                    onRegionSelect={(name) => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('gouvernorat', name);
                                                        params.set('scope', 'gouvernorate');
                                                        window.location.search = params.toString();
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="mt-4 pro-card p-14 rounded-[56px] border-dashed border-slate-100 flex flex-col items-center justify-center gap-6 min-h-[350px] bg-white/50">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                                                    <ShieldCheck size={40} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[6px] italic">Hub Géospatial Restreint</p>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[2px] mt-3">Auth Level : {currentUser?.role || 'UNDEF'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Right Column: Analytic Workflow */}
                                    <div className="lg:col-span-7 space-y-12 min-h-[900px]">
                                        <AnimatePresence mode="wait">
                                            {selectedSection ? (
                                                <motion.div 
                                                    key="section"
                                                    initial={{ opacity: 0, x: 24 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 24 }}
                                                    transition={{ duration: 0.4, ease: [0.2, 1, 0.3, 1] }}
                                                >
                                                    {sectionLoading ? (
                                                        <div className="h-[500px] flex items-center justify-center">
                                                            <div className="w-12 h-12 border-4 border-slate-50 border-t-brand-500 rounded-full animate-spin shadow-xl" />
                                                        </div>
                                                    ) : (
                                                        <SectionDetailPanel 
                                                            sectionId={selectedSection} 
                                                            data={selectedSectionData}
                                                            onBack={() => handleSectionClick(null)} 
                                                        />
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="space-y-12">
                                                    <RegionalSummaryHub 
                                                        data={homepageData} 
                                                        globalInsights={homepageData?.global_insights}
                                                        activeSection={selectedSection}
                                                        isSuperAdmin={currentUser?.role?.toUpperCase() === 'SUPERADMIN'}
                                                    />
                                                    
                                                    {/* Points de Vigilance Grid & Rankings Lab */}
                                                    {currentUser?.role?.toUpperCase() === 'SUPERADMIN' && (activeScope === 'national' || activeScope === 'gouvernorate') && (
                                                        <div className="space-y-6">
                                                            <NationalVigilancePanel 
                                                                metrics={homepageData?.regional_metrics} 
                                                                activeSection={selectedSection}
                                                            />
                                                            <div className="h-64">
                                                                <RankingsLabInlet />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Competitive Matrix (if in gov scope) */}
                                                    {activeScope === 'gouvernorate' && activeScopeId && (
                                                        <CompetitiveMatrix 
                                                            rankings={homepageData?.rankings} 
                                                            govName={homepageData?.headline?.scope_label?.replace('Gouvernorat de ', '')} 
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SentinelleDashboard;
