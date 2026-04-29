import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, FileText, Calendar, MapPin, Building, Search, 
    CheckCircle, XCircle, AlertTriangle, ChevronDown, ArrowLeft,
    Folder, FolderOpen, Pencil, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import EditableLabel from './EditableLabel';


// 24 Governorates of Tunisia
const GOVERNORATES = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", 
    "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", 
    "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", 
    "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

const SubmissionsViewer = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditingAnswers, setIsEditingAnswers] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewingSession, setViewingSession] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [fetchingSession, setFetchingSession] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await api.get('questionnaire/submissions/');
                setSubmissions(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load submissions", err);
                setError("Impossible de charger les soumissions.");
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const fetchSessionDetail = async (id) => {
        setFetchingSession(true);
        try {
            const res = await api.get(`questionnaire/submissions/${id}/`);
            setSessionData(res.data);
            setViewingSession(id);
            setIsEditingAnswers(false);
        } catch (err) {
            console.error("Failed to fetch session detail", err);
            alert("Erreur lors de la récupération des détails.");
        } finally {
            setFetchingSession(false);
        }
    };

    const handleSaveEdits = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`questionnaire/submissions/${viewingSession}/`, sessionData);
            setSessionData(res.data);
            setIsEditingAnswers(false);
            alert("Modifications enregistrées !");
            // Refresh list to update risk/validity flags
            const listRes = await api.get('questionnaire/submissions/');
            setSubmissions(listRes.data);
        } catch (err) {
            console.error("Failed to save edits", err);
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setSaving(false);
        }
    };

    const handleAnswerChange = (sectionKey, fieldKey, newVal) => {
        setSessionData(prev => ({
            ...prev,
            [sectionKey]: {
                ...prev[sectionKey],
                [fieldKey]: newVal
            }
        }));
    };

    // Group submissions by region
    const groupedSubmissions = GOVERNORATES.reduce((acc, gov) => {
        acc[gov] = submissions.filter(s => s.governorate_name === gov);
        return acc;
    }, {});

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="p-8 bg-rose-50 text-rose-600 rounded-3xl font-bold flex items-center gap-3">
                <AlertTriangle /> {error}
            </div>
        </div>
    );

    // Answer Viewer Modal / Overlay
    if (viewingSession && sessionData) {
        return (
            <div className="min-h-screen bg-white p-12 relative">
                <div className="max-w-4xl mx-auto">
                    <div className="fixed top-8 left-8 flex gap-4 z-50">
                        <button 
                            onClick={() => { setViewingSession(null); setSessionData(null); }}
                            className="flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold uppercase tracking-widest text-xs transition-colors bg-white/80 backdrop-blur p-4 rounded-full shadow-lg"
                        >
                            <ArrowLeft size={16} /> <EditableLabel termKey="sub_btn_back" defaultValue="Retour" />
                        </button>
                        {!isEditingAnswers ? (
                                <button 
                                    onClick={() => setIsEditingAnswers(true)}
                                    className="flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-700 font-bold uppercase tracking-widest text-xs transition-all p-4 px-6 rounded-full shadow-lg"
                                >
                                    <Pencil size={16} /> <EditableLabel termKey="sub_btn_edit" defaultValue="Modifier les réponses" />
                                </button>
                        ) : (
                            <div className="flex gap-2">
                                    <button 
                                        onClick={handleSaveEdits}
                                        disabled={saving}
                                        className="flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-xs transition-all p-4 px-6 rounded-full shadow-lg disabled:opacity-50"
                                    >
                                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />} 
                                        <EditableLabel termKey="sub_btn_save" defaultValue="Enregistrer" />
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingAnswers(false)}
                                        className="flex items-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold uppercase tracking-widest text-xs transition-all p-4 px-6 rounded-full shadow-lg"
                                    >
                                        <EditableLabel termKey="sub_btn_cancel" defaultValue="Annuler" />
                                    </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-12 pt-16">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-4 py-1 bg-brand-100 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest">Dossier #{sessionData.id}</span>
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{new Date(sessionData.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
                            {isEditingAnswers ? <EditableLabel termKey="sub_mode_edit" defaultValue="Mode" /> : <EditableLabel termKey="sub_mode_detail" defaultValue="Détails des" />} <span className="text-brand-600">{isEditingAnswers ? <EditableLabel termKey="sub_label_edit" defaultValue="ÉDITION" /> : <EditableLabel termKey="sub_label_answers" defaultValue="Réponses" />}</span>
                        </h1>
                        
                        <div className="flex flex-wrap gap-6 p-8 bg-slate-50 rounded-[32px] border border-slate-100 mb-12">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"><EditableLabel termKey="sub_gov" defaultValue="Gouvernorat" /></span>
                                <span className="font-bold text-slate-900">{sessionData.governorate?.name || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"><EditableLabel termKey="sub_school" defaultValue="Établissement" /></span>
                                <span className="font-bold text-slate-900">{sessionData.school?.name || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"><EditableLabel termKey="sub_lang" defaultValue="Langue" /></span>
                                <span className="font-bold text-slate-900 uppercase">{sessionData.language_used}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"><EditableLabel termKey="sub_risk_label" defaultValue="Risque (Auto)" /></span>
                                <span className={`font-bold ${sessionData.has_risk_behavior ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {sessionData.has_risk_behavior ? <EditableLabel termKey="sub_yes" defaultValue="OUI" /> : <EditableLabel termKey="sub_no" defaultValue="NON" />}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"><EditableLabel termKey="sub_status_label" defaultValue="Statut (Auto)" /></span>
                                <span className={`font-bold ${sessionData.is_valid ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {sessionData.is_valid ? <EditableLabel termKey="sub_valid" defaultValue="VALIDE" /> : <EditableLabel termKey="sub_excluded" defaultValue="EXCLU" />}
                                </span>
                            </div>
                        </div>

                        {/* Rendering all sections and their answers */}
                        <div className="space-y-16">
                            {Object.keys(sessionData)
                                .filter(key => key.startsWith('section_') && sessionData[key])
                                .sort()
                                .map(sectionKey => {
                                    const section = sessionData[sectionKey];
                                    const letter = sectionKey.replace('section_', '').toUpperCase();
                                    return (
                                        <div key={sectionKey} className="animate-fade-in">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl italic">{letter}</div>
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight"><EditableLabel termKey="sub_section_title" defaultValue="Section" /> {letter}</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {Object.entries(section)
                                                    .filter(([k]) => k !== 'id')
                                                    .map(([key, val]) => (
                                                        <div key={key} className={`p-6 rounded-2xl flex items-start justify-between gap-8 transition-all ${isEditingAnswers ? 'bg-white border-2 border-brand-200 shadow-xl shadow-brand-100' : 'bg-slate-50 border border-slate-100 group hover:border-brand-200 hover:bg-white'}`}>
                                                            <div className="flex-1">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{key}</span>
                                                                {isEditingAnswers ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={val || ''} 
                                                                        onChange={(e) => handleAnswerChange(sectionKey, key, e.target.value)}
                                                                        className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all border border-slate-200"
                                                                    />
                                                                ) : (
                                                                    <p className="font-bold text-slate-700 leading-relaxed capitalize">{String(val).replace(/_/g, ' ')}</p>
                                                                )}
                                                            </div>
                                                            {!isEditingAnswers && (
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <CheckCircle size={16} className="text-brand-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    // If a region is selected, show its files
    if (selectedRegion) {
        const regionFiles = groupedSubmissions[selectedRegion].filter(s => 
            s.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id.toString().includes(searchTerm)
        );

        return (
            <div className="min-h-screen bg-slate-50 p-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <button 
                                onClick={() => { setSelectedRegion(null); setSearchTerm(''); }}
                                className="flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold uppercase tracking-widest text-xs mb-4 transition-colors"
                            >
                                <ArrowLeft size={16} /> Retour aux régions
                            </button>
                            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">
                                <EditableLabel termKey="sub_list_title" defaultValue="Dossiers" /> <span className="text-brand-600">{selectedRegion}</span>
                            </h1>
                            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
                                {groupedSubmissions[selectedRegion].length} <EditableLabel termKey="sub_forms_submitted" defaultValue="formulaires soumis" />
                            </p>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Rechercher (Établissement, ID)..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-4 w-80 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm shadow-sm transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic">
                                        <th className="p-6">Fichier</th>
                                        <th className="p-6">ID Session</th>
                                        <th className="p-6">Établissement</th>
                                        <th className="p-6">Date de soumission</th>
                                        <th className="p-6 text-center">Langue</th>
                                        <th className="p-6 text-center">Risque</th>
                                        <th className="p-6 text-center">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regionFiles.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-12 text-center text-slate-400 font-bold">Aucun dossier trouvé.</td>
                                        </tr>
                                    ) : (
                                        regionFiles.map((s, idx) => (
                                            <motion.tr 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.02 }}
                                                key={s.id} 
                                                onClick={() => fetchSessionDetail(s.id)}
                                                className="border-b border-slate-50 hover:bg-brand-50/50 transition-all cursor-pointer group"
                                            >
                                                <td className="p-6">
                                                    <div className="relative">
                                                        <FileText className="text-brand-400 group-hover:text-brand-600 transition-colors" size={24}/>
                                                        {fetchingSession && viewingSession === s.id && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 font-black text-slate-900">#{s.id}</td>
                                                <td className="p-6 text-sm font-bold text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Building size={14} className="text-slate-400" />
                                                        <span className="truncate max-w-[200px]" title={s.school_name}>{s.school_name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-xs font-bold text-slate-500 flex items-center gap-2">
                                                    <Calendar size={14} /> {new Date(s.created_at).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{s.language_used}</span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    {s.has_risk_behavior ? (
                                                        <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Oui</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Non</span>
                                                    )}
                                                </td>
                                                <td className="p-6 text-center">
                                                    {s.is_valid ? (
                                                        <div className="flex items-center justify-center gap-1 text-emerald-500 font-bold text-xs">
                                                            <CheckCircle size={16} /> Valide
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-1 text-rose-500 font-bold text-xs" title={s.exclusion_reason}>
                                                            <XCircle size={16} /> Exclu
                                                        </div>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default View: 24 Region Cards
    const filteredRegions = GOVERNORATES.filter(gov => gov.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-slate-50 p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold uppercase tracking-widest text-xs mb-4 transition-colors"
                        >
                            <ArrowLeft size={16} /> <EditableLabel termKey="sub_btn_back_hub" defaultValue="Retour au Hub" />
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Base de données <span className="text-brand-600">Régionale</span></h1>
                        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Classeurs des 24 Gouvernorats</p>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Rechercher une région..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 w-80 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm shadow-sm transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRegions.map((gov, idx) => {
                        const count = groupedSubmissions[gov]?.length || 0;
                        const hasFiles = count > 0;
                        return (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                key={gov}
                                onClick={() => hasFiles && setSelectedRegion(gov)}
                                disabled={!hasFiles}
                                className={`relative p-8 rounded-[32px] text-left transition-all duration-300 group ${hasFiles ? 'bg-white border-2 border-slate-100 hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-100 cursor-pointer' : 'bg-slate-100/50 border-2 border-slate-100 opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="absolute right-6 top-6 text-6xl font-black opacity-[0.03] select-none uppercase tracking-tighter pointer-events-none">
                                    {gov.substring(0, 3)}
                                </div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${hasFiles ? 'bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    {hasFiles ? <FolderOpen size={28} /> : <Folder size={28} />}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">{gov}</h3>
                                <p className={`text-xs font-bold uppercase tracking-widest ${hasFiles ? 'text-brand-600' : 'text-slate-400'}`}>
                                    {count} {count === 1 ? 'Dossier' : 'Dossiers'}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SubmissionsViewer;
