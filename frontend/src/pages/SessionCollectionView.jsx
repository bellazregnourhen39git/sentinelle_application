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
    Search
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const SessionCollectionView = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reportRes = await api.get(`class-report/${reportId}/`); // Wait, need to check if this route exists
                setReport(reportRes.data);
                
                // Fetch submissions tethered to this report
                const subRes = await api.get(`questionnaire/submissions/?class_report=${reportId}`);
                setSubmissions(subRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reportId]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-slate-900 rounded-full transition-colors border border-slate-800"
                        >
                            <LayoutDashboard className="text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                                <ClipboardCheck className="text-brand-500" />
                                Session: {report?.establishment_name || '...'}
                            </h1>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    <MapPin size={12} /> {report?.governorate_name}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    <Calendar size={12} /> {report?.report_date}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(`/scan?report_id=${reportId}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-500/20"
                        >
                            <Scan size={18} /> Lancer le Scan (OCR)
                        </button>
                        <button 
                            onClick={() => navigate(`/questionnaire?report_id=${reportId}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-700"
                        >
                            <Plus size={18} /> Saisie Manuelle
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Prévus (Rapport)', value: report?.students_present, color: 'text-slate-400' },
                        { label: 'Collectés (Rapport)', value: report?.questionnaires_collected, color: 'text-amber-500' },
                        { label: 'Saisis (Digital)', value: submissions.length, color: 'text-brand-500' },
                        { label: 'Manquants', value: (report?.questionnaires_collected || 0) - submissions.length, color: 'text-rose-500' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black italic ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Submissions List */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                            <Users size={18} className="text-brand-500" /> Questionnaires Saisis
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                            <input 
                                type="text"
                                placeholder="Rechercher..."
                                className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-brand-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                                    <th className="p-4">ID Submission</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4">Genre</th>
                                    <th className="p-4">Âge</th>
                                    <th className="p-4">Date de Saisie</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-slate-500 italic text-sm">
                                            Aucun questionnaire n'a encore été saisi pour cette session.
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((sub) => (
                                        <tr key={sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                                            <td className="p-4 font-mono text-xs text-brand-400">#SQ-{sub.id.toString().padStart(5, '0')}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${sub.is_valid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {sub.is_valid ? 'Valide' : 'Invalide'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-sm text-white">{sub.section_a?.gender === 'M' ? 'Homme' : 'Femme'}</td>
                                            <td className="p-4 text-sm text-slate-300">{2026 - (sub.section_a?.birth_year || 2000)} ans</td>
                                            <td className="p-4 text-xs text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => navigate(`/submissions/${sub.id}`)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionCollectionView;
