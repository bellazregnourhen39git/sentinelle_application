import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Plus, 
    Scan, 
    ArrowLeft, 
    LayoutDashboard,
    ClipboardCheck,
    Users,
    Calendar,
    MapPin,
    Search,
    Pencil,
    Save,
    X,
    CheckCircle,
    AlertTriangle,
    CheckCircle2,
    RotateCw,
    Trash2,
    Eye,
    EyeOff,
    Shield,
    Sparkles,
    Filter,
    BookOpen,
    HelpCircle,
    SlidersHorizontal
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { MEDSPAD_SECTIONS, formatQuestionAndAnswer, QUESTIONS_METADATA } from '../utils/questionnaireDictionary';

const SessionCollectionView = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'valid' | 'invalid' | 'risk'

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isReadOnly = ['GLOBAL_ADMIN', 'REGIONAL_ADMIN'].includes(currentUser?.role?.toUpperCase());

    // Interactive Submission Response Viewer & Editor State
    const [viewingSubmissionId, setViewingSubmissionId] = useState(null);
    const [submissionDetail, setSubmissionDetail] = useState(null);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSectionTab, setActiveSectionTab] = useState('ALL');

    const fetchSessionData = async () => {
        try {
            const reportRes = await api.get(`class-report/${reportId}/`);
            setReport(reportRes.data);
            
            const subRes = await api.get(`questionnaire/submissions/?class_report=${reportId}`);
            const list = Array.isArray(subRes.data) ? subRes.data : (subRes.data?.results || []);
            setSubmissions(list);
        } catch (err) {
            console.error("Failed to load session collection", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reportId) {
            localStorage.setItem('sentinelle_active_report_id', String(reportId));
        }
        fetchSessionData();
    }, [reportId]);

    const handleOpenSubmission = async (subId) => {
        setViewingSubmissionId(subId);
        setFetchingDetail(true);
        setIsEditing(false);
        setActiveSectionTab('ALL');
        try {
            const res = await api.get(`questionnaire/submissions/${subId}/`);
            setSubmissionDetail(res.data);
        } catch (err) {
            console.error("Failed to fetch submission details", err);
            alert("Erreur lors de la récupération des détails de ce formulaire.");
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleAnswerChange = (sectionKey, fieldKey, newVal) => {
        setSubmissionDetail(prev => ({
            ...prev,
            [sectionKey]: {
                ...prev[sectionKey],
                [fieldKey]: newVal
            }
        }));
    };

    const handleSaveSubmissionEdits = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`questionnaire/submissions/${viewingSubmissionId}/`, submissionDetail);
            setSubmissionDetail(res.data);
            setIsEditing(false);
            // Refresh submissions list
            const subRes = await api.get(`questionnaire/submissions/?class_report=${reportId}`);
            setSubmissions(Array.isArray(subRes.data) ? subRes.data : (subRes.data?.results || []));
            alert("Modifications du formulaire enregistrées avec succès !");
        } catch (err) {
            console.error("Failed to save submission edits", err);
            alert("Erreur lors de l'enregistrement des modifications.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleSubmissionAccounting = async (subId, currentValid, e) => {
        if (e) e.stopPropagation();
        const newValidity = !currentValid;
        try {
            await api.patch(`questionnaire/submissions/${subId}/`, {
                is_valid: newValidity,
                exclusion_reason: newValidity ? null : 'Exclu manuellement (non comptabilisé)'
            });
            setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, is_valid: newValidity, exclusion_reason: newValidity ? null : 'Exclu manuellement (non comptabilisé)' } : s));
            if (submissionDetail && submissionDetail.id === subId) {
                setSubmissionDetail(prev => ({ ...prev, is_valid: newValidity, exclusion_reason: newValidity ? null : 'Exclu manuellement (non comptabilisé)' }));
            }
        } catch (err) {
            console.error("Failed to toggle accounting status", err);
            alert("Erreur lors de la mise à jour du statut de comptabilisation.");
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = 
            sub.id?.toString().includes(searchTerm) ||
            (sub.section_a?.gender === 'M' ? 'homme garçon' : 'femme fille').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        if (filterStatus === 'valid') return sub.is_valid;
        if (filterStatus === 'invalid') return !sub.is_valid;
        if (filterStatus === 'risk') return sub.has_risk_behavior;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chargement de la session de classe...</p>
            </div>
        );
    }

    const rawPresent = Number(report?.students_present) || 0;
    const rawRefused = Number(report?.students_refused) || 0;
    const rawNoAuth = Number(report?.students_without_authorization) || 0;
    const rawCollected = Number(report?.questionnaires_collected);

    const collectedTarget = (rawCollected > 0)
        ? rawCollected
        : Math.max(0, rawPresent - rawRefused - rawNoAuth);

    const submittedCount = submissions.length;
    const progressPct = collectedTarget > 0 
        ? Math.min(100, Math.round((submittedCount / collectedTarget) * 100))
        : 0;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 font-sans selection:bg-brand-500 selection:text-white">
            <div className="max-w-7xl mx-auto">
                
                {/* Navigation Breadcrumb & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 pb-6 border-b border-slate-800/80">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/60 shadow-lg"
                            title="Retour"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${report?.is_finalized ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                    {report?.is_finalized ? 'Session Clôturée' : 'Session Active'}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-500">
                                    Rapport #{reportId}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-2.5">
                                <ClipboardCheck className="text-brand-400 shrink-0" size={28} />
                                {report?.establishment_name || 'Établissement'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium mt-1">
                                <span className="flex items-center gap-1"><MapPin size={13} className="text-brand-400" /> {report?.governorate_name || 'Tunis'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Calendar size={13} /> {report?.report_date}</span>
                                <span>•</span>
                                <span className="font-bold text-slate-300">{report?.study_level === '1_AS' ? '1ère Année Secondaire' : '2ème Année Secondaire'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {isReadOnly ? (
                            <span className="px-4 py-2 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold tracking-wider uppercase">
                                Mode Consultation {currentUser?.role === 'REGIONAL_ADMIN' ? '(Régional)' : '(National)'}
                            </span>
                        ) : (
                            <>
                                <button 
                                    onClick={() => navigate(`/class-report?edit=${reportId}`)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700 shadow-sm"
                                    title="Modifier les paramètres du rapport de classe"
                                >
                                    <Pencil size={14} /> Modifier Rapport
                                </button>
                                <button 
                                    onClick={() => navigate(`/scan?report_id=${reportId}`)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                    title="Lancer la numérisation OCR"
                                >
                                    <Scan size={14} /> Numérisation OCR
                                </button>
                                <button 
                                    onClick={() => navigate(`/questionnaire?report_id=${reportId}`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-500/20"
                                    title="Saisir un nouveau questionnaire manuellement"
                                >
                                    <Plus size={16} /> + Nouvelle Saisie
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* KPI Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Élèves Présents</p>
                        <p className="text-3xl font-black text-white italic">{report?.students_present || 0}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Effectif classe déclaré</p>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                        <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest mb-1">Cible Questionnaires</p>
                        <p className="text-3xl font-black text-amber-400 italic">{collectedTarget}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Questionnaires collectés</p>
                    </div>

                    <div className="bg-slate-900/90 border border-brand-500/30 p-5 rounded-2xl relative overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 to-brand-950/40">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest mb-1">Saisis Numériquement</p>
                                <p className="text-3xl font-black text-brand-400 italic">{submissions.length}</p>
                            </div>
                            <span className="text-xs font-black px-2 py-1 bg-brand-500/20 text-brand-300 rounded-lg">
                                {progressPct}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                        <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest mb-1">Restants à Saisir</p>
                        <p className="text-3xl font-black text-rose-400 italic">
                            {Math.max(0, collectedTarget - submissions.length)}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">À numériser pour complétude</p>
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md">
                    {/* Filter & Search Toolbar */}
                    <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-brand-400" />
                            <h2 className="text-lg font-black uppercase italic tracking-tight text-white">
                                Questionnaires & Réponses Détaillées ({submissions.length})
                            </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Filter Status Pills */}
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Tous ({submissions.length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('valid')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'valid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Valides ({submissions.filter(s => s.is_valid).length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('risk')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'risk' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    À Risque ({submissions.filter(s => s.has_risk_behavior).length})
                                </button>
                            </div>

                            {/* Search input */}
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-3.5 top-3 text-slate-500" size={14} />
                                <input 
                                    type="text"
                                    placeholder="Filtrer ID, genre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table of Submissions */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/70 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-800">
                                    <th className="p-5">Formulaire ID</th>
                                    <th className="p-5">Statut Validité</th>
                                    <th className="p-5">Comportement à Risque</th>
                                    <th className="p-5">Démographie (Genre / Âge)</th>
                                    <th className="p-5">Date d'Enregistrement</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-16 text-center text-slate-500 italic text-sm">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileText size={36} className="text-slate-600" />
                                                <p>Aucune réponse de formulaire trouvée pour ce filtre.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubmissions.map((sub) => {
                                        const gender = sub.section_a?.gender === 'M' ? 'Garçon (M)' : (sub.section_a?.gender === 'F' ? 'Fille (F)' : 'Non précisé');
                                        const birthYear = sub.section_a?.birth_year;
                                        const age = birthYear ? (2026 - birthYear) + ' ans' : 'N/A';

                                        return (
                                            <tr 
                                                key={sub.id} 
                                                onClick={() => handleOpenSubmission(sub.id)}
                                                className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors group cursor-pointer"
                                            >
                                                <td className="p-5 font-mono text-xs text-brand-400 font-bold">
                                                    #SQ-{sub.id.toString().padStart(5, '0')}
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                                        sub.is_valid 
                                                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' 
                                                            : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                                                    }`}>
                                                        {sub.is_valid ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                                                        {sub.is_valid ? 'Valide' : 'Exclu / Invalide'}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        sub.has_risk_behavior 
                                                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' 
                                                            : 'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {sub.has_risk_behavior ? 'Risque Détecté' : 'Aucun Risque'}
                                                    </span>
                                                </td>
                                                <td className="p-5 font-bold text-sm text-slate-200">
                                                    <span>{gender}</span>
                                                    <span className="text-slate-500 font-normal text-xs ml-2">({age})</span>
                                                </td>
                                                <td className="p-5 text-xs text-slate-400 font-medium">
                                                    {new Date(sub.created_at).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="p-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!isReadOnly && (
                                                            <button
                                                                onClick={(e) => handleToggleSubmissionAccounting(sub.id, sub.is_valid, e)}
                                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border shadow-sm ${
                                                                    sub.is_valid
                                                                        ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/50 hover:border-rose-700'
                                                                        : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/50 hover:border-emerald-700'
                                                                }`}
                                                                title={sub.is_valid ? "Exclure ce formulaire des statistiques sans le supprimer" : "Réintégrer ce formulaire dans les statistiques"}
                                                            >
                                                                {sub.is_valid ? (
                                                                    <>
                                                                        <EyeOff size={13} />
                                                                        Ne pas comptabiliser
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 size={13} />
                                                                        Comptabiliser
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleOpenSubmission(sub.id)}
                                                            className="px-3.5 py-2 bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 border border-brand-500/30"
                                                            title="Voir et modifier les réponses réelles du formulaire"
                                                        >
                                                            <Eye size={14} />
                                                            Voir Réponses
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ─── Interactive Questionnaire Response Inspector & Editor Modal ─── */}
                <AnimatePresence>
                    {viewingSubmissionId && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={() => { setViewingSubmissionId(null); setSubmissionDetail(null); }}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            />
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                                className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[36px] shadow-2xl text-white max-h-[92vh] flex flex-col overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="p-6 md:p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-slate-900/95">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-black text-xl shadow-lg">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
                                                    Formulaire #SQ-{viewingSubmissionId.toString().padStart(5, '0')}
                                                </h2>
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                    submissionDetail?.is_valid 
                                                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' 
                                                        : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                                                }`}>
                                                    {submissionDetail?.is_valid ? 'VALIDE' : 'NON COMPTABILISÉ'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium mt-1">
                                                {report?.establishment_name} • {report?.governorate_name} • Saisi le {submissionDetail?.created_at ? new Date(submissionDetail.created_at).toLocaleString('fr-FR') : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!isEditing ? (
                                            <>
                                                {!isReadOnly && (
                                                    <button
                                                        onClick={() => handleToggleSubmissionAccounting(viewingSubmissionId, submissionDetail?.is_valid)}
                                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 shadow-sm ${
                                                            submissionDetail?.is_valid 
                                                                ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-800/60' 
                                                                : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/60'
                                                        }`}
                                                        title={submissionDetail?.is_valid ? "Exclure des statistiques sans supprimer" : "Réintégrer dans les statistiques"}
                                                    >
                                                        {submissionDetail?.is_valid ? <EyeOff size={14} /> : <CheckCircle2 size={14} />}
                                                        {submissionDetail?.is_valid ? 'Ne pas comptabiliser' : 'Comptabiliser'}
                                                    </button>
                                                )}
                                                {!isReadOnly && (
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-brand-500/20"
                                                    >
                                                        <Pencil size={14} /> Mode Édition
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-700"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleSaveSubmissionEdits}
                                                    disabled={saving}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                                >
                                                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                                                    Enregistrer Réponses
                                                </button>
                                            </>
                                        )}

                                        <button 
                                            onClick={() => { setViewingSubmissionId(null); setSubmissionDetail(null); }}
                                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Section Fast-Filter Navigation Tabs */}
                                {submissionDetail && (
                                    <div className="px-6 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1 shrink-0 mr-1">
                                            <Filter size={12} /> Sections:
                                        </span>
                                        <button
                                            onClick={() => setActiveSectionTab('ALL')}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${activeSectionTab === 'ALL' ? 'bg-brand-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                                        >
                                            Toutes les Sections
                                        </button>
                                        {Object.keys(submissionDetail)
                                            .filter(k => k.startsWith('section_') && submissionDetail[k])
                                            .sort()
                                            .map(secKey => {
                                                const letter = secKey.replace('section_', '').toUpperCase();
                                                const secInfo = MEDSPAD_SECTIONS[letter] || { title: `Section ${letter}` };
                                                const isActive = activeSectionTab === letter;
                                                return (
                                                    <button
                                                        key={letter}
                                                        onClick={() => setActiveSectionTab(letter)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${isActive ? 'bg-brand-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                                                        title={secInfo.title}
                                                    >
                                                        <span className="font-black italic">{letter}</span>
                                                        <span className="hidden sm:inline text-[11px] font-medium opacity-80">{secInfo.title.split(' ')[0]}</span>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                )}

                                {/* Modal Body: Actual Questionnaire Responses by Section */}
                                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pr-3">
                                    {fetchingDetail || !submissionDetail ? (
                                        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <div className="w-10 h-10 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin"></div>
                                            <p className="text-xs font-black uppercase tracking-widest">Chargement des questions et réponses officielles...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Summary Pills */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Langue de Passation</span>
                                                    <span className="font-bold text-white uppercase text-sm">{submissionDetail.language_used === 'AR' ? 'Arabe (العربية)' : 'Français (FR)'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Comportement à Risque</span>
                                                    <span className={`font-bold text-sm ${submissionDetail.has_risk_behavior ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        {submissionDetail.has_risk_behavior ? 'OUI (Positif)' : 'NON (Négatif)'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Genre Déclaré</span>
                                                    <span className="font-bold text-white text-sm">
                                                        {submissionDetail.section_a?.gender === 'M' ? 'Masculin (Garçon)' : (submissionDetail.section_a?.gender === 'F' ? 'Féminin (Fille)' : 'Non précisé')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Âge Calculé</span>
                                                    <span className="font-bold text-white text-sm">
                                                        {submissionDetail.section_a?.birth_year ? `${2026 - submissionDetail.section_a.birth_year} ans (${submissionDetail.section_a.birth_year})` : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Sections Rendering */}
                                            <div className="space-y-8">
                                                {Object.keys(submissionDetail)
                                                    .filter(key => key.startsWith('section_') && submissionDetail[key])
                                                    .sort()
                                                    .filter(key => {
                                                        if (activeSectionTab === 'ALL') return true;
                                                        return key.replace('section_', '').toUpperCase() === activeSectionTab;
                                                    })
                                                    .map(sectionKey => {
                                                        const sectionData = submissionDetail[sectionKey];
                                                        const letter = sectionKey.replace('section_', '').toUpperCase();
                                                        const secMeta = MEDSPAD_SECTIONS[letter] || {
                                                            title: `Section ${letter}`,
                                                            desc: "Variables collectées",
                                                            color: "from-slate-700 to-slate-900",
                                                            iconColor: "text-brand-400"
                                                        };

                                                        return (
                                                            <div key={sectionKey} className="bg-slate-950/70 p-6 md:p-8 rounded-[28px] border border-slate-800/90 shadow-xl">
                                                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800/80">
                                                                    <div className={`w-12 h-12 bg-gradient-to-br ${secMeta.color} rounded-2xl flex items-center justify-center text-white font-black text-xl italic shadow-md`}>
                                                                        {letter}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                                                            Section {letter} — {secMeta.title}
                                                                        </h3>
                                                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                                            {secMeta.desc}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {Object.entries(sectionData)
                                                                        .filter(([k]) => k !== 'id')
                                                                        .map(([fieldKey, rawVal]) => {
                                                                            const qInfo = formatQuestionAndAnswer(sectionKey, fieldKey, rawVal);
                                                                            const fieldMeta = QUESTIONS_METADATA[fieldKey];

                                                                            return (
                                                                                <div 
                                                                                    key={fieldKey} 
                                                                                    className={`p-5 rounded-2xl transition-all flex flex-col justify-between ${
                                                                                        isEditing 
                                                                                            ? 'bg-slate-900 border-2 border-brand-500/60 shadow-lg shadow-brand-500/10' 
                                                                                            : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                                                                                    }`}
                                                                                >
                                                                                    <div>
                                                                                        {/* Question Code & Full Question Text */}
                                                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                                                                                                {qInfo.code}
                                                                                            </span>
                                                                                        </div>

                                                                                        <h4 className="text-xs font-bold text-slate-300 leading-snug mb-3">
                                                                                            {qInfo.label}
                                                                                        </h4>
                                                                                    </div>

                                                                                    {/* Formatted Answer Response */}
                                                                                    <div className="pt-2 border-t border-slate-800/80">
                                                                                        {isEditing ? (
                                                                                            fieldMeta?.options ? (
                                                                                                <select
                                                                                                    value={rawVal !== null && rawVal !== undefined ? String(rawVal) : ''}
                                                                                                    onChange={(e) => handleAnswerChange(sectionKey, fieldKey, e.target.value)}
                                                                                                    className="w-full bg-slate-950 p-2.5 rounded-xl font-bold text-white text-xs outline-none focus:ring-2 focus:ring-brand-500 border border-slate-700 cursor-pointer"
                                                                                                >
                                                                                                    <option value="">-- Non renseigné --</option>
                                                                                                    {Object.entries(fieldMeta.options).map(([optCode, optLabel]) => (
                                                                                                        <option key={optCode} value={optCode}>
                                                                                                            {optCode} - {optLabel}
                                                                                                        </option>
                                                                                                    ))}
                                                                                                </select>
                                                                                            ) : (
                                                                                                <input 
                                                                                                    type="text" 
                                                                                                    value={rawVal !== null && rawVal !== undefined ? rawVal : ''} 
                                                                                                    onChange={(e) => handleAnswerChange(sectionKey, fieldKey, e.target.value)}
                                                                                                    className="w-full bg-slate-950 p-2.5 rounded-xl font-bold text-white text-xs outline-none focus:ring-2 focus:ring-brand-500 border border-slate-700"
                                                                                                />
                                                                                            )
                                                                                        ) : (
                                                                                            <div className="space-y-1.5">
                                                                                                {String(qInfo.value).includes(' • ') ? (
                                                                                                    <div className="space-y-1.5 mt-1">
                                                                                                        {String(qInfo.value).split(' • ').map((item, i) => (
                                                                                                            <div key={i} className="flex items-start gap-2 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90 shadow-sm">
                                                                                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1 shrink-0" />
                                                                                                                <span className="font-semibold text-slate-200 leading-snug">{item}</span>
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <div className={`w-2 h-2 rounded-full ${qInfo.value === 'Non renseigné' ? 'bg-slate-600' : 'bg-brand-400'}`} />
                                                                                                        <p className={`font-black text-sm ${qInfo.value === 'Non renseigné' ? 'text-slate-500 italic' : 'text-white'}`}>
                                                                                                            {qInfo.value}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SessionCollectionView;
