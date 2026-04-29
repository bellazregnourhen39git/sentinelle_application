import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, Shield, Mail, MapPin, Building, RefreshCw, UserPlus, FileText, Trash2, X, LogOut } from 'lucide-react';
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

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/';
    };

    const fetchUsers = async () => {
        setLoading(true);
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
            // Refresh logic: immediately remove from local state for speed, then fetch
            setUsers(users.filter(u => u.id !== userToDelete.id));
            // fetchUsers(); // Optional double check
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Erreur lors de la suppression de l'utilisateur.");
        }
        setUserToDelete(null);
    };

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
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-50 border border-transparent text-rose-600 text-[10px] font-black uppercase tracking-[2px] italic hover:bg-rose-100 transition-all shadow-sm"
                        >
                            <LogOut size={16} />
                            <EditableLabel termKey="um_btn_logout" defaultValue="Déconnexion" />
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
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <RefreshCw size={40} className="animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-[4px] italic"><EditableLabel termKey="um_loading_msg" defaultValue="Chargement du Registre..." /></span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black italic">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 italic tracking-tight">{user.username}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 italic flex items-center gap-1.5">
                                                        <Mail size={10} /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full w-fit">
                                                <Shield size={12} className="text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase italic">{user.role}</span>
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
                                                {user.status}
                                            </span>
                                        </td>                                         <td className="p-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
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
