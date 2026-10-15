import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Shield, MapPin, Link as LinkIcon, Copy, Check, AlertCircle } from 'lucide-react';
import api from '../../api';

const InviteUserModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('PRACTITIONER');
    const [govId, setGovId] = useState('');
    const [governorates, setGovernorates] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inviteResult, setInviteResult] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGeographics();
            setError(null);
            setInviteResult(null);
        }
    }, [isOpen]);

    const fetchGeographics = async () => {
        try {
            const govs = await api.get('geography/governorates/');
            setGovernorates(Array.isArray(govs.data) ? govs.data : []);
        } catch (err) {
            console.error("Failed to fetch governorates", err);
        }
    };

    const isNationalRole = ['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(role);

    useEffect(() => {
        if (isNationalRole) {
            setGovId('');
        }
    }, [role, isNationalRole]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const orgType = isNationalRole ? 'NATIONAL' : (role === 'REGIONAL_ADMIN' ? 'REGIONAL' : 'LOCAL');

        try {
            const res = await api.post('auth/invite/', {
                email: email.trim(),
                username: username.trim() || undefined,
                role,
                organization_type: orgType,
                governorate: isNationalRole ? null : (govId || null)
            });
            setInviteResult(res.data);
        } catch (err) {
            const data = err.response?.data;
            if (data?.email) {
                setError(`L'adresse email "${email}" est déjà utilisée par un autre compte.`);
            } else if (data?.detail) {
                setError(data.detail);
            } else {
                setError("Une erreur est survenue lors de l'invitation. Veuillez vérifier les informations saisies.");
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (inviteResult?.invitation_link) {
            const fullLink = `${window.location.origin}${inviteResult.invitation_link}`;
            navigator.clipboard.writeText(fullLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const resetForm = () => {
        setInviteResult(null);
        setEmail('');
        setUsername('');
        setRole('PRACTITIONER');
        setGovId('');
        setError(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6 sm:p-8">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inviter un Utilisateur</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-0.5">Création d'accès sécurisé pour un enquêteur ou administrateur</p>
                                </div>
                                <button 
                                    onClick={onClose} 
                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {inviteResult ? (
                                <div className="space-y-6 py-2">
                                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                                            <Check size={28} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">Invitation Créée avec Succès !</h3>
                                        <p className="text-xs text-slate-600 font-medium mb-6">
                                            Un e-mail d'activation a été envoyé à <strong>{email}</strong>.
                                            <br/><span className="text-slate-500 text-[11px]">Vous pouvez également transmettre ce lien d'activation directement :</span>
                                        </p>
                                        
                                        <div className="w-full relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <LinkIcon size={16} />
                                            </div>
                                            <input 
                                                readOnly 
                                                value={`${window.location.origin}${inviteResult.invitation_link}`}
                                                className="w-full h-12 pl-11 pr-28 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 overflow-hidden text-ellipsis outline-none"
                                            />
                                            <button 
                                                onClick={copyToClipboard}
                                                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600 transition-all cursor-pointer"
                                            >
                                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                                {copied ? "Copié !" : "Copier"}
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={resetForm}
                                        className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                                    >
                                        Inviter un autre utilisateur
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleInvite} className="space-y-4">
                                    {error && (
                                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
                                            <AlertCircle size={16} className="shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1.5">Adresse Email</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                required 
                                                type="email" 
                                                value={email} 
                                                onChange={e => setEmail(e.target.value)} 
                                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none transition-all font-semibold text-sm text-slate-800" 
                                                placeholder="praticien@santé.tn" 
                                            />
                                        </div>
                                    </div>

                                    {/* Username (Optional) */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1.5">
                                            Identifiant / Nom d'utilisateur <span className="text-slate-400 font-normal">(Optionnel)</span>
                                        </label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={username} 
                                                onChange={e => setUsername(e.target.value)} 
                                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none transition-all font-semibold text-sm text-slate-800" 
                                                placeholder={email ? email.split('@')[0] : "dr_ben_ali"} 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Role */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1.5">Rôle Système</label>
                                            <div className="relative">
                                                <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <select 
                                                    value={role} 
                                                    onChange={e => setRole(e.target.value)} 
                                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none transition-all font-semibold text-sm text-slate-800"
                                                >
                                                    <option value="PRACTITIONER">Praticien / Médecin</option>
                                                    <option value="REGIONAL_ADMIN">Admin Régional</option>
                                                    <option value="OPERATOR">Opérateur de Saisie</option>
                                                    <option value="SUPER_ADMIN">Superviseur National</option>
                                                    <option value="GLOBAL_ADMIN">Admin Global</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Governorate */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1.5">Gouvernorat d'affectation</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <select 
                                                    value={govId} 
                                                    disabled={isNationalRole} 
                                                    onChange={e => setGovId(e.target.value)} 
                                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none transition-all font-semibold text-sm text-slate-800 disabled:opacity-50"
                                                >
                                                    {isNationalRole ? (
                                                        <option value="">National (Tous gouvernorats)</option>
                                                    ) : (
                                                        <>
                                                            <option value="">-- Sélectionner un gouvernorat --</option>
                                                            {governorates.map(g => (
                                                                <option key={g.id} value={g.id}>{g.name}</option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="pt-3">
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            {loading ? "Création de l'invitation..." : "Générer l'Invitation"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteUserModal;
