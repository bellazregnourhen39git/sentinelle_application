import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Zap, ArrowRight, Info, AlertTriangle, ShieldCheck,
    Layers, Search, LogOut, User, Smartphone, Scan, Bell, CheckCircle, XCircle,
    Mail, Phone, MapPin, FileText, QrCode, Users, Pencil, Database, ClipboardList, FileSpreadsheet, Menu, ChevronDown, BookOpen
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import RadialSectionWheel from './RadialSectionWheel';
import SectionDetailPanel from './SectionDetailPanel';
import RegionalSelector from './RegionalSelector';
import TunisiaMap from './TunisiaMap';
import EditableLabel from './EditableLabel';
import { useTerminology } from '../../TerminologyContext';
import { SocialInlet, CompetitiveMatrix, NationalHeatList, ExpertAudit, ComorbiditySpectrum, RankingsLabInlet } from './IntelligenceInlets';
import RegionalProfilePanel from './RegionalProfilePanel';

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
            className="pro-card p-10 md:p-14 rounded-[56px] mb-12 border border-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] bg-white/70 backdrop-blur-3xl relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none z-0" />
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
                        <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-widest drop-shadow-sm"><EditableLabel termKey="dash_matrice" defaultValue="Matrice de Scanning" /></h3>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] italic">
                        <EditableLabel termKey="dash_surveillance" defaultValue="Surveillance" /> {activeLabel} : <EditableLabel termKey="dash_points_fixation" defaultValue="Points de Fixation Sécuritaires" />
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-full text-[10px] font-black text-white uppercase tracking-[2px] italic shadow-[0_0_15px_rgba(15,23,42,0.1)] flex items-center gap-2">
                        <Activity size={12} className="text-brand-400 animate-pulse" />
                        {metrics.length} <EditableLabel termKey="dash_zones" defaultValue="ZONES ANALYSÉES" />
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
    const activeLabel = sectionNames[activeSection] || 'Global';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
        >
            {/* 🔬 Regional Identity Header */}
            <div className="p-10 md:p-14 rounded-[56px] border border-slate-200 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.05)] relative overflow-hidden group bg-gradient-to-b from-white/90 to-slate-50/90 backdrop-blur-3xl text-slate-900">
                <div className="absolute top-0 right-0 w-full h-[60vh] bg-gradient-to-br from-brand-100/50 to-transparent pointer-events-none mix-blend-multiply rounded-full blur-[100px]" />
                <div className="absolute top-0 right-0 p-10 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none scale-150 -translate-y-10 translate-x-10">
                    <Activity size={240} strokeWidth={1} className="text-brand-600" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-8 mb-10">
                        <div className="flex bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
                            <button className="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[4px] bg-brand-500 text-white shadow-xl shadow-brand-500/20 italic hover:bg-brand-600 transition-colors">
                                {activeSection ? <><EditableLabel termKey="dash_critere" defaultValue="Critère :" /> {sectionNames[activeSection]}</> : <EditableLabel termKey="dash_veille" defaultValue="Veille Active" />}
                            </button>
                        </div>
                        <div className="h-[2px] w-16 bg-slate-200" />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] italic opacity-80"><EditableLabel termKey="dash_medspad" defaultValue="Medspad 2026" /></span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-800 tracking-tighter uppercase italic leading-none mb-10">
                        {headline?.scope_label ? (
                            <div className="flex flex-wrap items-center gap-x-4">
                                <EditableLabel termKey="dash_synth_gov" defaultValue="Synthèse :" /> 
                                <EditableLabel 
                                    termKey={`dash_scope_${headline.scope_label}`} 
                                    defaultValue={headline.scope_label.replace('Gouvernorat de ', '')} 
                                />
                            </div>
                        ) : (
                            <EditableLabel termKey="dash_synth_glob" defaultValue="Synthèse Globale" />
                        )} 
                        <span className="text-brand-600 ml-4">{activeLabel === 'Global' ? '' : activeLabel}</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-bold italic max-w-2xl leading-relaxed opacity-90">
                        {activeSection
                            ? <><EditableLabel termKey="dash_analyse" defaultValue="Analyse des données collectées concernant la prévalence :" /> {sectionNames[activeSection]}.</>
                            : <EditableLabel termKey="dash_surv_consolid" defaultValue="Surveillance et synthèse consolidée des enquêtes MEDSPAD." />}
                    </p>
                </div>
            </div>

            {/* 📊 High-Density KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {kpis?.map((kpi, idx) => (
                    <div key={idx} className="pro-card p-10 rounded-[48px] group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.12)] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] group-hover:text-brand-500 transition-colors italic">{kpi.label}</p>
                            <div className="w-2 h-2 rounded-full bg-brand-500/20 group-hover:bg-brand-500 animate-pulse transition-colors shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        </div>
                        <p className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter italic mb-8 relative z-10">{kpi.value}</p>
                        <div className="w-12 h-[3px] bg-slate-100 group-hover:w-full group-hover:bg-brand-500 transition-all duration-1000 rounded-full relative z-10 shadow-sm" />
                    </div>
                ))}
            </div>

            {/* 🛡️ Clinical Reliability Index */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-16">
                <div className="bg-slate-900 p-10 rounded-[48px] flex items-center justify-between shadow-2xl shadow-slate-900/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent opacity-50" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] mb-2 italic"><EditableLabel termKey="dash_reliability" defaultValue="Indice de Fiabilité" /></p>
                        <p className="text-3xl font-black text-white italic tracking-tight tabular-nums">{headline?.reliability_rate || 92}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl border border-brand-500/20 text-brand-400 flex items-center justify-center font-black text-[10px] uppercase tracking-widest italic bg-brand-500/10 shadow-inner group-hover:bg-brand-500 group-hover:text-white transition-colors duration-500 ring-4 ring-slate-900">
                        <EditableLabel termKey="dash_optimal" defaultValue="Optimal" />
                    </div>
                </div>
                <div className="bg-white/70 backdrop-blur-3xl border border-white p-10 rounded-[48px] flex items-center justify-between shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-transform relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-50" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] mb-2 italic"><EditableLabel termKey="dash_completion" defaultValue="Taux de Complétion" /></p>
                        <p className="text-3xl font-black text-slate-900 italic tracking-tight tabular-nums">{headline?.completion_rate || 85}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl border border-slate-100 text-slate-500 flex items-center justify-center font-black text-xs italic bg-white shadow-sm ring-4 ring-slate-50">
                        {headline?.completion_rate || 85}%
                    </div>
                </div>
            </div>

            {/* 🧪 LABORATOIRES D'INTELLIGENCE */}
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

const SentinelleDashboard = ({ profile, initialScope = 'user_school', initialScopeId = null, forcedUser = null, onLogout }) => {
    const { t_dyn, isEditMode, setIsEditMode } = useTerminology();
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
        if (currentUser?.role?.toUpperCase() !== 'SUPER_ADMIN') return;
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
    const activeScope = urlParams.get('scope') || initialScope;
    const activeScopeId = urlParams.get('gouvernorat') || initialScopeId;

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

    const exportSuperAdminCSV = async () => {
        try {
            const accessToken = localStorage.getItem('access');
            const response = await api.get('questionnaire/export/', {
                params: accessToken ? {} : { mock: 'true' },
                responseType: 'blob',
            });

            if (response.status !== 200) {
                throw new Error(`Unexpected status ${response.status}`);
            }

            const contentType = response.headers['content-type'] || response.headers['Content-Type'];
            if (!contentType?.includes('csv')) {
                const text = await response.data.text();
                throw new Error(`Expected CSV, got: ${text}`);
            }

            const filename = `questionnaire_answers_${new Date().toISOString().split('T')[0]}.csv`;
            const blob = new Blob([response.data], { type: contentType });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Super admin export failed:', err);
            alert(`Export failed: ${err.message}`);
        }
    };

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

                    {['PRACTITIONER', 'OPERATOR'].includes(currentUser?.role?.toUpperCase()) && (
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
                                        
                                        {currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' && (
                                            <>
                                                <button onClick={() => { navigate('/admin/users'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                    <Users size={14} /> <EditableLabel termKey="dash_btn_users" defaultValue="GESTION UTILISATEURS" />
                                                </button>
                                                <button onClick={() => { navigate('/admin/submissions'); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                    <Activity size={14} /> <EditableLabel termKey="dash_btn_submissions" defaultValue="VOIR LES SOUMISSIONS" />
                                                </button>
                                                <button onClick={() => { setIsEditMode(!isEditMode); setIsNavMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors w-full text-left">
                                                    <Pencil size={14} /> {isEditMode ? "QUITTER ÉDITION" : <EditableLabel termKey="dash_btn_edit" defaultValue="ACTIVER ÉDITION" />}
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

            <div className="max-w-[1600px] mx-auto p-12 pb-24 relative">
                {['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SUPERADMIN'].includes(currentUser?.role?.toUpperCase()) && (activeScope === 'national' || activeScope === 'gouvernorate') && (
                    <div className="mb-10 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={exportSuperAdminCSV}
                            className="pro-btn-secondary inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-3 text-xs font-black uppercase tracking-[2px] transition-colors hover:bg-slate-800"
                        >
                            <FileSpreadsheet size={16} />
                            <EditableLabel termKey="dash_btn_csv" defaultValue="Exporter réponses CSV" />
                        </button>
                    </div>
                )}
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
                                <h3 className="text-xl font-black text-slate-900 tracking-[6px] mb-3 uppercase italic"><EditableLabel termKey="dash_init" defaultValue="Initialisation..." /></h3>
                                <p className="text-slate-400 font-black uppercase tracking-[8px] text-[10px] animate-pulse"><EditableLabel termKey="dash_extract" defaultValue="Extraction Multidimensionnelle" /></p>
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
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('gouvernorat', name);
                                                        params.set('scope', 'gouvernorate');
                                                        navigate({
                                                            pathname: window.location.pathname,
                                                            search: params.toString()
                                                        }, { replace: true });
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
                                                                <RankingsLabInlet />
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
                                                                isSuperAdmin={['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SUPERADMIN'].includes(currentUser?.role?.toUpperCase())}
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
                    )}
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
