import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
void motion;
import {
    Activity, Zap, ArrowRight, ArrowLeft, Info, AlertTriangle, ShieldCheck,
    Layers, Search, LogOut, User, Smartphone, Scan, Bell, CheckCircle, XCircle,
    Mail, Phone, MapPin, FileText, QrCode, Users, Pencil, Edit3, Database, ClipboardList, FileSpreadsheet, Menu, ChevronDown, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import RadialSectionWheel from './RadialSectionWheel';
import SectionDetailPanel from './SectionDetailPanel';
import RegionalSelector from './RegionalSelector';
import TunisiaMap from './TunisiaMap';
import EditableLabel from './EditableLabel';
import { useTerminology } from '../../TerminologyContext';
import { SocialInlet, CompetitiveMatrix, NationalHeatList, ExpertAudit, ComorbiditySpectrum, RankingsLabInlet } from './IntelligenceInlets';
import RegionalProfilePanel from './RegionalProfilePanel';
import { isNationalAdminRole, isSuperAdminRole, isPractitionerRole } from '../../utils/roles';

const NationalVigilancePanel = ({ metrics, activeSection }) => {
    const { t_dyn } = useTerminology();
    if (!metrics || metrics.length === 0) return null;

    const sectionNames = {
        'C': t_dyn('section_wheel_C', 'Tabagisme'),
        'G': t_dyn('section_wheel_G', 'Alcoolisme'),
        'I': t_dyn('section_wheel_I', 'Cannabis'),
        'E': t_dyn('section_wheel_E', 'Narguilé'),
        'D': t_dyn('section_wheel_D', 'Vapotage'),
        'H': t_dyn('section_wheel_H', 'Tranquillisants'),
        'J': t_dyn('section_wheel_J', 'Cocaïne'),
        'K': t_dyn('section_wheel_K', 'Ecstasy'),
        'L': t_dyn('section_wheel_L', 'Héroïne'),
        'M': t_dyn('section_wheel_M', 'Inhalants')
    };
    const activeLabel = sectionNames[activeSection] || 'GLOBAL';

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="pro-card p-7 md:p-9 rounded-[40px] mb-6 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.06)] bg-white relative overflow-hidden group"
        >
            <div className="relative z-10 flex items-center justify-between mb-8 pb-5 border-b border-slate-100/60">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 italic uppercase tracking-wider">
                            <EditableLabel termKey="dash_matrice" defaultValue="Matrice de Scanning" />
                        </h3>
                    </div>
                    <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[3px] italic">
                        <EditableLabel termKey="dash_surveillance" defaultValue="Surveillance" /> {activeLabel} : <EditableLabel termKey="dash_points_fixation" defaultValue="Points de Fixation Sécuritaires" />
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black text-white uppercase tracking-[2px] italic shadow-sm flex items-center gap-2">
                        <Activity size={12} className="text-sky-400 animate-pulse" />
                        {metrics.length} <EditableLabel termKey="dash_zones" defaultValue="ZONES ANALYSÉES" />
                    </div>
                </div>
            </div>

            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            <div className="flex gap-5 overflow-x-auto pb-2 relative z-10 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {metrics.map((reg) => {
                    const prevalence = reg.prevalence || 0;

                    return (
                        <motion.div 
                            key={reg.id} 
                            variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }} 
                            className="w-[190px] shrink-0 snap-start relative group p-6 rounded-[28px] bg-white border border-slate-100 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md hover:border-slate-200 shadow-[0_2px_12px_rgba(15,23,42,0.03)]"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] truncate">{reg.name}</span>
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" />
                            </div>

                            <div className="relative z-10 my-1">
                                <p className="text-3xl font-black italic tracking-tight text-rose-500 mb-2">
                                    {prevalence}%
                                </p>
                                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(prevalence, 100)}%` }}
                                        className="h-full bg-rose-500 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest italic relative z-10">
                                <span>VOL. {reg.dossiers}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};


const RegionalSummaryHub = ({ data, globalInsights, activeSection, isSuperAdmin, activeScope, activeScopeId }) => {
    const { t_dyn } = useTerminology();
    const navigate = useNavigate();
    if (!data) return null;
    const { headline, kpis } = data;

    const sectionNames = {
        'A': t_dyn('section_wheel_A', 'Profil'),
        'B': t_dyn('section_wheel_B', 'Famille'),
        'C': t_dyn('section_wheel_C', 'Tabagisme'),
        'D': t_dyn('section_wheel_D', 'Vapotage'),
        'E': t_dyn('section_wheel_E', 'Narguilé'),
        'G': t_dyn('section_wheel_G', 'Alcoolisme'),
        'H': t_dyn('section_wheel_H', 'Tranquillisants'),
        'I': t_dyn('section_wheel_I', 'Cannabis'),
        'J': t_dyn('section_wheel_J', 'Cocaïne'),
        'K': t_dyn('section_wheel_K', 'Ecstasy'),
        'L': t_dyn('section_wheel_L', 'Héroïne'),
        'M': t_dyn('section_wheel_M', 'Inhalants'),
        'N': t_dyn('section_wheel_N', 'Substances'),
        'P': t_dyn('section_wheel_P', 'NPS'),
        'Q': t_dyn('section_wheel_Q', 'Perception'),
        'R': t_dyn('section_wheel_R', 'Réseaux Sociaux'),
        'S': t_dyn('section_wheel_S', 'Jeux Vidéo'),
        'T': t_dyn('section_wheel_T', 'Jeux de Hasard'),
        'U': t_dyn('section_wheel_U', 'Violence'),
        'V': t_dyn('section_wheel_V', 'Stress'),
        'Z': t_dyn('section_wheel_Z', 'Intégrité')
    };
    const activeLabel = sectionNames[activeSection] || 'Global';
    const isRegionalGov = headline?.scope_label && (headline.scope_label.includes('Gouvernorat') || headline.scope_label.includes('Lycée'));

    return (
        <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-10"
        >
            {/* 🔬 Regional Identity Header */}
            <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} 
                className="p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 text-white"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none rounded-full blur-3xl z-0" />
                <div className="absolute top-0 right-0 p-6 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none scale-110 -translate-y-4 translate-x-4">
                    <Activity size={180} strokeWidth={1.5} className="text-brand-400" />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 shadow-sm backdrop-blur-md">
                                <button className="px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[3px] bg-brand-500 text-white shadow-lg shadow-brand-500/20 italic hover:bg-brand-600 transition-colors">
                                    {activeSection ? <><EditableLabel termKey="dash_critere" defaultValue="Critère :" /> {sectionNames[activeSection]}</> : <EditableLabel termKey="dash_veille" defaultValue="Veille Active" />}
                                </button>
                            </div>
                            <div className="h-[1px] w-12 bg-slate-700" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] italic opacity-90"><EditableLabel termKey="dash_medspad" defaultValue="Medspad 2026" /></span>
                        </div>
                        
                        {(isRegionalGov || window.location.search.includes('gouvernorat=')) && (
                            <button
                                onClick={() => navigate('/superadmin')}
                                className="flex items-center gap-2.5 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all italic shadow-lg cursor-pointer"
                            >
                                <ArrowLeft size={14} /> <EditableLabel termKey="dash_back_nat" defaultValue="RETOUR VUE NATIONALE" />
                            </button>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic leading-none mb-6">
                        {headline?.scope_label ? (
                            <div className="flex flex-wrap items-center gap-x-3">
                                <EditableLabel termKey="dash_synth_gov" defaultValue="Synthèse :" /> 
                                <EditableLabel 
                                    termKey={`dash_scope_${headline.scope_label}`} 
                                    defaultValue={headline.scope_label.replace('Gouvernorat de ', '')} 
                                />
                            </div>
                        ) : (
                            <EditableLabel termKey="dash_synth_glob" defaultValue="Synthèse Globale" />
                        )} 
                        <span className="text-brand-400 ml-4">{activeLabel === 'Global' ? '' : activeLabel}</span>
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 font-medium italic max-w-2xl leading-relaxed opacity-90">
                        {activeSection
                            ? <><EditableLabel termKey="dash_analyse" defaultValue="Analyse des données collectées concernant la prévalence :" /> {sectionNames[activeSection]}.</>
                            : <EditableLabel termKey="dash_surv_consolid" defaultValue="Surveillance et synthèse consolidée des enquêtes MEDSPAD." />}
                    </p>
                </div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {kpis?.map((kpi, idx) => (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} key={idx} className="pro-card p-7 rounded-[36px] group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.12)] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] group-hover:text-brand-500 transition-colors italic">
                                <EditableLabel termKey={`dash_kpi_label_${idx}`} defaultValue={kpi.label} />
                            </p>
                            <div className="w-2 h-2 rounded-full bg-brand-500/20 group-hover:bg-brand-500 animate-pulse transition-colors shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        </div>
                        <p className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter italic mb-5 relative z-10">{kpi.value}</p>
                        <div className="w-12 h-[3px] bg-slate-100 group-hover:w-full group-hover:bg-brand-500 transition-all duration-1000 rounded-full relative z-10 shadow-sm" />
                    </motion.div>
                ))}
            </motion.div>

            {/* 🛡️ Clinical Reliability Index */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 mb-8">
                <div className="bg-slate-900 p-7 rounded-[36px] flex items-center justify-between shadow-2xl shadow-slate-900/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent opacity-50" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] mb-2 italic"><EditableLabel termKey="dash_reliability" defaultValue="Indice de Fiabilité" /></p>
                        <p className="text-3xl font-black text-white italic tracking-tight tabular-nums">{headline?.reliability_rate != null ? `${headline.reliability_rate}%` : '—'}</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl border border-brand-500/20 text-brand-400 flex items-center justify-center font-black text-[10px] uppercase tracking-widest italic bg-brand-500/10 shadow-inner group-hover:bg-brand-500 group-hover:text-white transition-colors duration-500 ring-4 ring-slate-900">
                        <EditableLabel termKey="dash_optimal" defaultValue="Optimal" />
                    </div>
                </div>
                <div className="bg-white/70 backdrop-blur-3xl border border-white p-7 rounded-[36px] flex items-center justify-between shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-transform relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-50" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] mb-2 italic"><EditableLabel termKey="dash_completion" defaultValue="Taux de Complétion" /></p>
                        <p className="text-3xl font-black text-slate-900 italic tracking-tight tabular-nums">{headline?.completion_rate != null ? `${headline.completion_rate}%` : '—'}</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl border border-slate-100 text-slate-500 flex items-center justify-center font-black text-xs italic bg-white shadow-sm ring-4 ring-slate-50">
                        {headline?.completion_rate != null ? `${headline.completion_rate}%` : '—'}
                    </div>
                </div>
            </motion.div>

            {/* 🧪 LABORATOIRES D'INTELLIGENCE */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SocialInlet
                    stressIndex={globalInsights?.social?.stress_index}
                    violenceIndex={globalInsights?.social?.violence_index}
                    scopeType={activeScope}
                    scopeId={activeScopeId}
                    locked={!isSuperAdmin}
                />
                <ExpertAudit
                    integrity={globalInsights?.integrity}
                    scopeType={activeScope}
                    scopeId={activeScopeId}
                    locked={!isSuperAdmin}
                />
                <div className="md:col-span-2">
                    <ComorbiditySpectrum
                        metrics={globalInsights?.comorbidity}
                        scopeType={activeScope}
                        scopeId={activeScopeId}
                        locked={!isSuperAdmin}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

const SentinelleDashboard = ({ initialScope = 'user_school', initialScopeId = null, forcedUser = null, onLogout }) => {
    const { isEditMode, setIsEditMode } = useTerminology();
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedSectionData, setSelectedSectionData] = useState(null);
    const [sectionLoading, setSectionLoading] = useState(false);
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

    const handleLogout = onLogout || (() => {
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/';
    });

    // 🛡️ Security & Role Extraction
    const [currentUser, setCurrentUser] = useState(forcedUser);
    const [showWelcome, setShowWelcome] = useState(true);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchPendingUsers = useCallback(async () => {
        if (!isSuperAdminRole(currentUser?.role)) return;
        try {
            const res = await api.get('auth/pending-approvals/');
            setPendingUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch pending approvals", err);
        }
    }, [currentUser]);

    const handleExportRawData = async () => {
        try {
            const response = await api.get('stats/export-raw/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'donnees_brutes_sentinelle.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to export raw data", err);
            alert("Erreur lors de l'exportation des données brutes.");
        }
    };

    useEffect(() => {
        if (forcedUser) { setCurrentUser(forcedUser); return; }
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setCurrentUser(parsed);
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, [forcedUser]);

    useEffect(() => {
        if (currentUser) {
            fetchPendingUsers();
        }
    }, [currentUser, fetchPendingUsers]);

    const handleApprove = async (id) => {
        try {
            await api.post(`auth/approve-user/${id}/`);
            fetchPendingUsers();
        } catch (err) { console.error(err); }
    };

    const handleReject = async (id) => {
        try {
            await api.post(`auth/reject-user/${id}/`);
            fetchPendingUsers();
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowWelcome(false), 6000);
        return () => clearTimeout(timer);
    }, []);

    const [homepageData, setHomepageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasInitialData = React.useRef(false);

    const urlParams = new URLSearchParams(window.location.search);
    const activeScope = urlParams.get('scope_type') || initialScope;
    const activeScopeId = urlParams.get('scope_id') || initialScopeId;

    const fetchHomepage = useCallback(async (sectionId = null) => {
        try {
            // Only show full-screen loader if we haven't successfully loaded data yet
            if (!hasInitialData.current) {
                setLoading(true);
            }
            const res = await api.get('homepage/', {
                params: {
                    scope_type: activeScope,
                    scope_id: activeScopeId,
                    section: sectionId
                }
            });
            setHomepageData(res.data);
            hasInitialData.current = true;
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

    const intensityData = useMemo(() => {
        return homepageData?.section_intensity || {};
    }, [homepageData]);

    if (error) return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-transparent">
            <div className="pro-card p-12 rounded-[48px] text-center max-w-lg border-t-8 border-t-rose-500 shadow-2xl bg-white">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner">
                    <AlertTriangle size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter italic">Échec Système</h3>
                <p className="text-slate-500 mb-10 font-bold leading-relaxed italic">{error}</p>
                <button onClick={() => fetchHomepage()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[4px] text-[11px] hover:bg-brand-600 transition-all shadow-2xl shadow-slate-200 border border-white/10 active:scale-95 italic mb-4">
                    <EditableLabel termKey="dash_btn_recalibrate" defaultValue="Forcer la Recalibration" />
                </button>
                <button onClick={() => navigate('/guide')} className="w-full py-4 bg-white text-slate-500 rounded-2xl font-black uppercase tracking-[4px] text-[10px] hover:bg-slate-50 transition-all border border-slate-100 active:scale-95 italic">
                    <BookOpen size={16} className="inline mr-2 opacity-50" />
                    <EditableLabel termKey="dash_btn_back_guide" defaultValue="Retour au Guide" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-slate-900 font-sans selection:bg-brand-500/10 selection:text-brand-700">
            <AnimatePresence>
                {showWelcome && currentUser && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-28 left-1/2 -translate-x-1/2 z-[60] bg-brand-50 text-brand-700 px-8 py-3.5 rounded-full border border-brand-200 shadow-xl font-bold tracking-wide text-sm flex items-center gap-3 backdrop-blur-md"
                    >
                        <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="italic">Bienvenue sur votre espace de veille, <span className="font-black underline decoration-2 underline-offset-4">{currentUser.username}</span> !</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="h-24 sticky top-0 z-50 px-12 flex items-center justify-between">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl border-b border-slate-100 shadow-sm" />
                <div className="relative flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-2xl shadow-brand-500/20 group hover:rotate-12 transition-transform duration-500">
                        <Activity size={24} className="text-white glow-brand" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase leading-none italic">
                            <EditableLabel termKey="app_title" defaultValue="Sentinelle" />
                        </h2>
                        <span className="text-[10px] font-black text-brand-600 tracking-[5px] uppercase opacity-70">
                            <EditableLabel termKey="app_subtitle" defaultValue="Hub Clinique" />
                        </span>
                    </div>
                </div>

                <div className="relative flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-lg glow-brand animate-pulse" />
                    </div>
                    {currentUser && (
                        <div className="hidden md:flex items-center gap-4 border-l-[3px] border-slate-100 pl-6">
                            <div className="flex flex-col text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] leading-none mb-1 italic">{currentUser.role === 'USER' || currentUser.role === 'PRACTITIONER' ? 'PRATICIEN' : currentUser.role?.replace('_', ' ') || 'PRATICIEN'}</p>
                                <p className="text-sm font-black text-slate-900 italic tracking-tight">{currentUser.username}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                                <User size={18} />
                            </div>
                        </div>
                    )}

                    {currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                                <Bell size={18} />
                                {pendingUsers.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
                                        {pendingUsers.length}
                                    </span>
                                )}
                            </button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-14 w-[360px] bg-white rounded-[24px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden z-[100]"
                                    >
                                        <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Comptes Désactivés</h3>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {pendingUsers.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                                                    Aucun compte en attente
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {pendingUsers.map(user => (
                                                        <div key={user.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 flex flex-col gap-3 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900">{user.username}</p>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mt-0.5">{user.role}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={() => handleApprove(user.id)} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                                                        <CheckCircle size={16} />
                                                                    </button>
                                                                    <button onClick={() => handleReject(user.id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-1 mt-1 text-[11px] font-bold text-slate-500">
                                                                {user.email && <p className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {user.email}</p>}
                                                                {user.phone_number && <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {user.phone_number}</p>}
                                                                {(user.governorate_name || user.establishment_name) && (
                                                                    <p className="flex items-start gap-2">
                                                                        <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                                                        <span className="leading-tight">
                                                                            {user.establishment_name ? `${user.establishment_name}, ` : ''}
                                                                            {user.governorate_name || 'N/A'}
                                                                        </span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {isPractitionerRole(currentUser?.role) && (
                        <button
                            onClick={() => navigate('/guide')}
                            className="hidden lg:flex items-center gap-3 px-6 py-2.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-black uppercase tracking-widest italic hover:bg-brand-100 transition-all shadow-sm"
                        >
                            <BookOpen size={16} />
                            <EditableLabel termKey="dash_btn_back_guide" defaultValue="Retour au Guide" />
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 text-[10px] font-black uppercase tracking-widest italic group ${isNavMenuOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}
                        >
                            <Menu size={16} />
                            <span><EditableLabel termKey="dash_btn_menu" defaultValue="MENU OPÉRATIONS" /></span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isNavMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isNavMenuOpen && (
                                <>
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={() => setIsNavMenuOpen(false)}
                                        className="fixed inset-0 z-40"
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-14 w-64 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden z-50 flex flex-col py-2"
                                    >
                                        <button onClick={() => { navigate('/scan'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                            <Scan size={14} /> <EditableLabel termKey="dash_btn_scan" defaultValue="SCANNER OCR" />
                                        </button>
                                        <button onClick={() => { navigate('/qr'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                            <QrCode size={14} /> <EditableLabel termKey="dash_btn_qr" defaultValue="ACCÈS QR" />
                                        </button>
                                        
                                        {['PRACTITIONER', 'OPERATOR', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'ADMIN'].includes(currentUser?.role?.toUpperCase()) && (
                                            <button onClick={() => { navigate('/class-report'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                <ClipboardList size={14} /> <EditableLabel termKey="dash_btn_rapport" defaultValue="Rapport de Classe" />
                                            </button>
                                        )}

                                        {['PRACTITIONER', 'OPERATOR', 'SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(currentUser?.role?.toUpperCase()) && (
                                            <button onClick={() => { navigate('/questionnaire'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                <FileText size={14} /> <EditableLabel termKey="dash_btn_quest" defaultValue="Questionnaire" />
                                            </button>
                                        )}

                                        {['PRACTITIONER', 'OPERATOR'].includes(currentUser?.role?.toUpperCase()) && (
                                            <button onClick={() => { navigate('/guide'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                <BookOpen size={14} /> <EditableLabel termKey="dash_btn_guide" defaultValue="Guide des Procédures" />
                                            </button>
                                        )}

                                        {['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(currentUser?.role?.toUpperCase()) && (
                                            <div className="h-px w-full bg-slate-100 my-1" />
                                        )}

                                        {['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(currentUser?.role?.toUpperCase()) && (
                                            <button onClick={() => { handleExportRawData(); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                <Database size={14} /> <EditableLabel termKey="dash_btn_export" defaultValue="EXPORTER DONNÉES BRUTES" />
                                            </button>
                                        )}
                                        
{isSuperAdminRole(currentUser?.role) && (
                                            <>
                                                <button onClick={() => { navigate('/admin/users'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                    <Users size={14} /> <EditableLabel termKey="dash_btn_users" defaultValue="GESTION UTILISATEURS" />
                                                </button>
                                                <button onClick={() => { navigate('/admin/submissions'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                    <Activity size={14} /> <EditableLabel termKey="dash_btn_submissions" defaultValue="VOIR LES SOUMISSIONS" />
                                                </button>
                                                <button onClick={() => { navigate('/questionnaire?edit=true'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors w-full text-left font-bold">
                                                    <Edit3 size={14} /> <EditableLabel termKey="dash_btn_edit_struct" defaultValue="ÉDITEUR DE STRUCTURE DU QUESTIONNAIRE" />
                                                </button>
                                                <button onClick={() => { setIsEditMode(!isEditMode); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                    <Pencil size={14} /> {isEditMode ? "QUITTER ÉDITION" : <EditableLabel termKey="dash_btn_edit" defaultValue="ACTIVER ÉDITION DE LABELS" />}
                                                </button>
                                            </>
                                        )}

                                        <div className="h-px w-full bg-slate-100 my-1" />

                                        <button onClick={() => { handleLogout(); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors w-full text-left">
                                            <LogOut size={14} /> <EditableLabel termKey="dash_btn_logout" defaultValue="Déconnexion" />
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>

            <div className="w-full p-8 pb-16 relative">

                <AnimatePresence mode="wait">
                    <div className="space-y-8">
                        {loading && (
                            <div className="flex items-center justify-center py-10">
                                <div className="flex flex-col items-center gap-4 text-slate-300">
                                    <Activity size={40} className="animate-spin text-brand-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[4px] italic">Synchronisation...</span>
                                </div>
                            </div>
                        )}
                        
                        {(!activeScopeId && activeScope === 'gouvernorate') ? (
                                <RegionalSelector regions={homepageData?.regional_metrics} />
                            ) : (
                                <div className="grid lg:grid-cols-12 gap-8 items-start">
                                    {/* Left Column: Visual Hub */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="lg:col-span-5 flex flex-col gap-6 sticky top-28"
                                    >
                                        <div className="pro-card p-8 rounded-[48px] border border-slate-100 relative overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 group">
                                            <RadialSectionWheel
                                                intensityData={intensityData}
                                                activeSection={selectedSection}
                                                onSectionClick={handleSectionClick}
                                                totalSubmissions={homepageData?.headline?.n_submissions || 0}
                                            />
                                            <div className="mt-10 flex justify-center">
                                                <div className="px-8 py-3.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[5px] flex items-center gap-4 italic group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-all duration-500">
                                                    <div className="w-2 h-2 rounded-full bg-brand-500 shadow-lg glow-brand" />
                                                    <EditableLabel termKey="dash_vecteur" defaultValue="Vecteur Cohorte Consolidé" />
                                                </div>
                                            </div>
                                        </div>

                                        {['SUPER_ADMIN', 'GLOBAL_ADMIN', 'REGIONAL_ANALYST', 'SUPERADMIN', 'ADMIN', 'NATIONAL'].includes(currentUser?.role?.toUpperCase()) ? (
                                            <div className="mt-4">
                                                <TunisiaMap
                                                    data={homepageData?.map_data}
                                                    activeSection={selectedSection}
                                                    currentUser={currentUser}
                                                    onRegionSelect={(name) => {
                                                        navigate(`/admin/${encodeURIComponent(name)}?scope_type=gouvernorate&scope_id=${encodeURIComponent(name)}`);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="mt-4 pro-card p-14 rounded-[56px] border-dashed border-slate-100 flex flex-col items-center justify-center gap-6 min-h-[350px] bg-white/50">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                                                    <ShieldCheck size={40} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[6px] italic"><EditableLabel termKey="dash_hub_restr" defaultValue="Hub Géospatial Restreint" /></p>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[2px] mt-3"><EditableLabel termKey="dash_niveau" defaultValue="Niveau d'Accès :" /> {currentUser?.role || 'INDÉFINI'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Right Column: Analytic Workflow */}
                                    <div className="lg:col-span-7 space-y-8 min-h-[900px]">
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
                                                <div className="space-y-8">
                                                    <RegionalSummaryHub
                                                        data={homepageData}
                                                        globalInsights={homepageData?.global_insights}
                                                        activeSection={selectedSection}
                                                        activeScope={activeScope}
                                                        activeScopeId={activeScopeId}
                                                        isSuperAdmin={['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SUPERADMIN'].includes(currentUser?.role?.toUpperCase())}
                                                    />

                                                    {/* Points de Vigilance Grid & Rankings Lab */}
                                                    {['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SUPERADMIN'].includes(currentUser?.role?.toUpperCase()) && (activeScope === 'national' || activeScope === 'gouvernorate') && (
                                                        <div className="space-y-6">
                                                            <NationalVigilancePanel
                                                                metrics={homepageData?.regional_metrics}
                                                                activeSection={selectedSection}
                                                            />
                                                            <div className="h-64">
                                                                <RankingsLabInlet scopeType={activeScope} scopeId={activeScopeId} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Competitive Matrix & Regional Deep Profile (if in gov scope) */}
                                                    {activeScope === 'gouvernorate' && activeScopeId && (
                                                        <>
                                                            <CompetitiveMatrix
                                                                rankings={homepageData?.rankings}
                                                                govName={homepageData?.headline?.scope_label?.replace('Gouvernorat de ', '')}
                                                            />
                                                            <RegionalProfilePanel
                                                                govName={homepageData?.headline?.scope_label?.replace('Gouvernorat de ', '')}
                                                                isSuperAdmin={isNationalAdminRole(currentUser?.role)}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                    </div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isEditMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-12 right-12 z-[100]"
                    >
                        <button
                            onClick={() => setIsEditMode(false)}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white rounded-full font-black uppercase tracking-[3px] text-[11px] italic shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-brand-600 transition-all group border border-white/10"
                        >
                            <XCircle size={20} className="text-brand-400 group-hover:text-white transition-colors" />
                            <EditableLabel termKey="dash_btn_quit_edit" defaultValue="QUITTER LE MODE ÉDITION" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SentinelleDashboard;
