import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    ArrowLeft, 
    Shield, 
    Mail, 
    MapPin, 
    Building, 
    RefreshCw, 
    UserPlus, 
    FileText, 
    Trash2, 
    X, 
    LogOut,
    ClipboardList,
    CheckCircle2,
    RotateCw,
    Pencil,
    Plus,
    PlayCircle,
    ShieldCheck,
    Scan,
    Building2,
    Calendar,
    ChevronRight,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InviteUserModal from '../components/dashboard/InviteUserModal';
import ConfirmationModal from '../components/dashboard/ConfirmationModal';
import api from '../api';
import EditableLabel from '../components/dashboard/EditableLabel';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // For Details
    const [userToDelete, setUserToDelete] = useState(null); // For Deletion confirmation

    // Super Admin User Class Reports Inspector
    const [inspectingUser, setInspectingUser] = useState(null);
    const [userReports, setUserReports] = useState([]);
    const [loadingUserReports, setLoadingUserReports] = useState(false);
    const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'active' | 'closed'

    const translateRole = (role) => {
        switch(role) {
            case 'SUPER_ADMIN': return 'Superviseur National';
            case 'GLOBAL_ADMIN': return 'Admin Global';
            case 'ADMIN': return 'Admin';
            case 'REGIONAL_ADMIN': return 'Admin Régional';
            case 'PRACTITIONER': return 'Praticien';
            case 'OPERATOR': return 'Opérateur';
            case 'USER': return 'Utilisateur';
            default: return role;
        }
    };

    const translateStatus = (status) => {
        switch(status?.toUpperCase()) {
            case 'ACTIVE': return 'ACTIF';
            case 'PENDING': return 'EN ATTENTE';
            case 'INACTIVE': return 'INACTIF';
            default: return status || 'EN ATTENTE';
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('auth/users/');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleExportCSV = async () => {
        try {
            const response = await api.get('auth/users/export/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'utilisateurs_sentinelle.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to export CSV", err);
            alert("Erreur lors de l'exportation du registre.");
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`auth/delete-user/${userToDelete.id}/`);
            setUsers(users.filter(u => u.id !== userToDelete.id));
        } catch (err) {
            console.error("Failed to delete user", err);
            const errorMsg = err.response?.data?.detail || "Erreur lors de la suppression de l'utilisateur.";
            alert(errorMsg);
        }
        setUserToDelete(null);
    };

    // ─── Super Admin Inspection Actions ─────────────────────────
    const handleInspectUserReports = async (user) => {
        setInspectingUser(user);
        setLoadingUserReports(true);
        setReportFilter('all');
        try {
            const res = await api.get(`class-report/list/?user_id=${user.id}`);
            const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setUserReports(list);
        } catch (err) {
            console.error("Failed to fetch user reports", err);
            setUserReports([]);
        } finally {
            setLoadingUserReports(false);
        }
    };

    const handleToggleFinalizeReport = async (reportId, currentStatus) => {
        try {
            await api.post(`class-report/${reportId}/finalize/`, {
                action: currentStatus ? 'unfinalize' : 'finalize',
                is_finalized: !currentStatus
            });
            setUserReports(prev => prev.map(r => r.id === reportId ? { ...r, is_finalized: !currentStatus } : r));
        } catch (err) {
            console.error("Failed to toggle report finalize status", err);
            alert("Erreur lors de la mise à jour du statut du rapport.");
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport de classe ?")) {
            try {
                await api.delete(`class-report/${reportId}/`);
                setUserReports(prev => prev.filter(r => r.id !== reportId));
            } catch (err) {
                console.error("Failed to delete report", err);
                alert("Erreur lors de la suppression du rapport.");
            }
        }
    };

    const filteredReports = userReports.filter(rep => {
        if (reportFilter === 'active') return !rep.is_finalized;
        if (reportFilter === 'closed') return rep.is_finalized;
        return true;
    });

    const activeCount = userReports.filter(r => !r.is_finalized).length;
    const closedCount = userReports.filter(r => r.is_finalized).length;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tight"><EditableLabel termKey="um_title" defaultValue="Gestion des Utilisateurs" /></h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] italic"><EditableLabel termKey="um_subtitle" defaultValue="Administration du personnel de veille" /></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{users.length} <EditableLabel termKey="um_active_users" defaultValue="Utilisateurs Actifs" /></span>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[2px] italic hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <FileText size={16} className="text-brand-500" />
                            <EditableLabel termKey="um_btn_export" defaultValue="Détails Utilisateurs (CSV)" />
                        </button>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[2px] italic hover:bg-brand-600 transition-all shadow-xl shadow-slate-200"
                        >
                            <UserPlus size={16} />
                            <EditableLabel termKey="um_btn_invite" defaultValue="Inviter un Utilisateur" />
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic"><EditableLabel termKey="um_th_user" defaultValue="Utilisateur" /></th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic"><EditableLabel termKey="um_th_role" defaultValue="Rôle" /></th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic"><EditableLabel termKey="um_th_assign" defaultValue="Affectation" /></th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic"><EditableLabel termKey="um_th_status" defaultValue="Statut" /></th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right"><EditableLabel termKey="um_th_actions" defaultValue="Actions" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <RefreshCw size={40} className="animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-[4px] italic"><EditableLabel termKey="um_loading_msg" defaultValue="Chargement du Registre..." /></span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr 
                                        key={user.id} 
                                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                                        onClick={() => handleInspectUserReports(user)}
                                    >
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black italic">
                                                    {user.username[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 italic tracking-tight flex items-center gap-2">
                                                        {user.username}
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-bold">
                                                            Voir Rapports →
                                                        </span>
                                                    </p>
                                                    <p className="text-[11px] font-bold text-slate-400 italic flex items-center gap-1.5">
                                                        <Mail size={10} /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full w-fit">
                                                <Shield size={12} className="text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase italic">{translateRole(user.role)}</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 italic">
                                                <MapPin size={12} className="text-brand-500" />
                                                {user.governorate_name || 'National'}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                                    user.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {translateStatus(user.status)}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleInspectUserReports(user)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-sm"
                                                    title="Inspecter les rapports de classe"
                                                >
                                                    <ClipboardList size={14} />
                                                    Rapports
                                                </button>
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all shadow-sm"
                                                    title="Fiche Utilisateur"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setUserToDelete(user)}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => {
                    setIsInviteModalOpen(false);
                    fetchUsers();
                }}
            />

            {/* ─── Super Admin User Class Reports Inspector Drawer / Modal ─── */}
            <AnimatePresence>
                {inspectingUser && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setInspectingUser(null)} 
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[36px] shadow-2xl p-6 md:p-8 text-white max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/20">
                                        {inspectingUser.username[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
                                                Rapports de {inspectingUser.username}
                                            </h2>
                                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                                                {translateRole(inspectingUser.role)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-1">
                                            <span className="flex items-center gap-1"><Mail size={12} /> {inspectingUser.email}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 text-slate-300 font-bold"><MapPin size={12} className="text-brand-400" /> {inspectingUser.governorate_name || 'National'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setInspectingUser(null)} 
                                    className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700/50"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Filter Pills & Actions Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-slate-800/60 shrink-0">
                                <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                                    <button
                                        onClick={() => setReportFilter('all')}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${reportFilter === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Tous ({userReports.length})
                                    </button>
                                    <button
                                        onClick={() => setReportFilter('active')}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${reportFilter === 'active' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        <PlayCircle size={13} />
                                        En cours ({activeCount})
                                    </button>
                                    <button
                                        onClick={() => setReportFilter('closed')}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${reportFilter === 'closed' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        <CheckCircle2 size={13} />
                                        Clôturés ({closedCount})
                                    </button>
                                </div>

                                <button
                                    onClick={() => navigate('/class-report')}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-brand-500/20"
                                >
                                    <Plus size={14} />
                                    Nouveau Rapport
                                </button>
                            </div>

                            {/* Reports List Body */}
                            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                                {loadingUserReports ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                                        <RefreshCw size={32} className="animate-spin text-brand-400" />
                                        <p className="text-xs font-black uppercase tracking-widest">Chargement des rapports de classe...</p>
                                    </div>
                                ) : filteredReports.length === 0 ? (
                                    <div className="py-16 text-center text-slate-500 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-3">
                                        <ClipboardList size={36} className="text-slate-600" />
                                        <p>Aucun rapport de classe trouvé pour cet utilisateur dans ce filtre.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredReports.map(rep => {
                                            const collected = rep.submissions_count || 0;
                                            const rawTarget = Number(rep.questionnaires_collected);
                                            const rawPres = Number(rep.students_present) || 0;
                                            const rawRef = Number(rep.students_refused) || 0;
                                            const rawNoA = Number(rep.students_without_authorization) || 0;
                                            const target = (rawTarget > 0) ? rawTarget : Math.max(0, rawPres - rawRef - rawNoA);
                                            const isClosed = rep.is_finalized;

                                            return (
                                                <div 
                                                    key={rep.id}
                                                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                                                        isClosed 
                                                            ? 'bg-slate-950/60 border-slate-800/80 hover:border-amber-500/40' 
                                                            : 'bg-slate-950/90 border-slate-800 hover:border-brand-500/50'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <h3 className="font-black text-sm text-white line-clamp-1 flex items-center gap-2" title={rep.establishment_name}>
                                                                <Building2 size={16} className={isClosed ? "text-amber-400 shrink-0" : "text-brand-400 shrink-0"} />
                                                                {rep.establishment_name || 'Établissement'}
                                                            </h3>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                                    isClosed 
                                                                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' 
                                                                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                                                }`}>
                                                                    {isClosed ? 'CLÔTURÉ' : 'EN COURS'}
                                                                </span>
                                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                                                                    #{rep.id}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-3">
                                                            <span>{rep.study_level === '1_AS' ? '1ère AS' : '2ème AS'}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><Calendar size={11} /> {rep.report_date}</span>
                                                            {rep.governorate_name && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-slate-300 font-bold">{rep.governorate_name}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Questionnaires Progress Bar */}
                                                        <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800/80 mb-4">
                                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                                                                <span className="text-slate-400">Formulaires Saisis</span>
                                                                <span className={isClosed ? "text-amber-400 font-mono font-bold" : "text-brand-400 font-mono font-bold"}>
                                                                    {collected} {target > 0 ? `/ ${target}` : ''}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${isClosed ? 'bg-gradient-to-r from-amber-500 to-emerald-400' : 'bg-gradient-to-r from-brand-500 to-emerald-400'}`}
                                                                    style={{ width: `${target > 0 ? Math.min(100, (collected / target) * 100) : (collected > 0 ? 100 : 0)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Super Admin Action Controls */}
                                                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={() => navigate(`/session/${rep.id}/collect`)}
                                                                className="py-2 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-brand-500/20"
                                                                title="Accéder aux formulaires rattachés à ce rapport"
                                                            >
                                                                <FileText size={13} />
                                                                Formulaires ({collected})
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/questionnaire?report_id=${rep.id}`)}
                                                                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                                                                title="Ajouter une saisie manuelle"
                                                            >
                                                                <Plus size={13} />
                                                                + Saisie
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => navigate(`/scan?report_id=${rep.id}`)}
                                                                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all border border-slate-700/60"
                                                                title="Scanner OCR"
                                                            >
                                                                <Scan size={12} />
                                                                Scan OCR
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/class-report?edit=${rep.id}`)}
                                                                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all border border-slate-700/60"
                                                                title="Modifier le rapport de classe"
                                                            >
                                                                <Pencil size={12} />
                                                                Éditer
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleFinalizeReport(rep.id, isClosed)}
                                                                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all border ${
                                                                    isClosed 
                                                                        ? 'bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white border-slate-700' 
                                                                        : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                                                                }`}
                                                                title={isClosed ? "Réouvrir cette session" : "Clôturer cette session"}
                                                            >
                                                                {isClosed ? <RotateCw size={12} /> : <ShieldCheck size={12} />}
                                                                {isClosed ? 'Réouvrir' : 'Clôturer'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReport(rep.id)}
                                                                className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 rounded-lg text-[11px] font-bold transition-all border border-slate-700/60"
                                                                title="Supprimer ce rapport"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Fiche Utilisateur</h2>
                                <button onClick={() => setSelectedUser(null)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500"><X size={18} /></button>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identifiant Système</p>
                                        <p className="text-sm font-black text-slate-800 italic">#{selectedUser.id}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom de l'utilisateur</p>
                                        <p className="text-sm font-black text-slate-800 italic">{selectedUser.username}</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email de Contact</p>
                                    <p className="text-sm font-black text-slate-800 italic">{selectedUser.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rôle Affecté</p>
                                        <p className="text-sm font-black text-brand-600 italic">{selectedUser.role}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type d'Organisation</p>
                                        <p className="text-sm font-black text-slate-800 italic">{selectedUser.organization_type}</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gouvernorat d'affectation</p>
                                    <p className="text-sm font-black text-slate-800 italic">{selectedUser.governorate_name || 'National'}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDeleteUser}
                title="Suppression de Compte"
                message={`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${userToDelete?.email}" ? Cette action est irréversible.`}
                confirmText="Oui, Supprimer"
                cancelText="Non, Garder"
                type="danger"
            />
        </div>
    );
};

export default UserManagement;
