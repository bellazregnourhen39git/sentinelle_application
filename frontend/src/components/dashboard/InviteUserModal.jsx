import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Shield, Briefcase, MapPin, Building, Link as LinkIcon, Copy, Check } from 'lucide-react';
import api from '../../api';

const InviteUserModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('PRACTITIONER');
    const [orgType, setOrgType] = useState('LOCAL');
    const [govId, setGovId] = useState('');
    const [governorates, setGovernorates] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inviteResult, setInviteResult] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGeographics();
        }
    }, [isOpen]);

    const fetchGeographics = async () => {
        try {
            const govs = await api.get('geography/governorates/');
            setGovernorates(govs.data);
        } catch (err) {
            console.error("Failed to fetch locations", err);
        }
    };

    useEffect(() => {
        // First Three: SUPER_ADMIN, GLOBAL_ADMIN, OPERATOR -> INSP
        if (['SUPER_ADMIN', 'GLOBAL_ADMIN', 'OPERATOR'].includes(role)) {
            setOrgType('NATIONAL');
            setGovId('2'); // Tunis
        } 
        // Regional Analyst: No Establishment
        else if (role === 'REGIONAL_ANALYST') {
            setOrgType('REGIONAL');
        }
        // Practitioner: Local
        else if (role === 'PRACTITIONER') {
            setOrgType('LOCAL');
            setGovId('');
        }
    }, [role]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('auth/invite/', {
                email,
                username,
                role,
                organization_type: orgType,
                governorate: govId || null
            });
            setInviteResult(res.data);
        } catch (err) {
            const data = err.response?.data;
            if (data?.email) {
                setError(`L'adresse email "${email}" est déjà utilisée par un autre compte.`);
            } else if (data?.detail) {
                setError(data.detail);
            } else {
                setError("Une erreur est survenue lors de l'invitation. Veuillez vérifier les champs.");
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
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isNationalAdmin = ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'OPERATOR'].includes(role);
    const isRegionalAnalyst = role === 'REGIONAL_ANALYST';
    const isPractitioner = role === 'PRACTITIONER';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-8 md:p-12">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Inviter un Utilisateur</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mt-1 italic">Nouveau Vecteur de Veille</p>
                                </div>
                                <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {inviteResult ? (
                                <div className="space-y-8 py-4">
                                    <div className="p-8 rounded-[32px] bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                            <Check size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 italic mb-2">Invitation Envoyée !</h3>
                                        <p className="text-sm text-slate-600 font-bold italic mb-8">
                                            Un e-mail d'activation a été envoyé à <strong>{email}</strong>. 
                                            <br/><span className="text-[10px] text-slate-400">Si l'utilisateur ne le reçoit pas, vous pouvez lui transmettre ce lien manuellement :</span>
                                        </p>
                                        
                                        <div className="w-full relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                                <LinkIcon size={16} />
                                            </div>
                                            <input 
                                                readOnly 
                                                value={`${window.location.origin}${inviteResult.invitation_link}`}
                                                className="w-full h-14 pl-12 pr-32 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-500 overflow-hidden text-ellipsis"
                                            />
                                            <button 
                                                onClick={copyToClipboard}
                                                className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-600 transition-all"
                                            >
                                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                                {copied ? "COPIÉ" : "COPIER"}
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {setInviteResult(null); setEmail(''); setUsername('');}}
                                        className="w-full h-16 bg-slate-50 text-slate-400 rounded-3xl font-black uppercase tracking-[4px] text-[11px] hover:bg-slate-100 transition-all italic underline underline-offset-4"
                                    >
                                        Inviter un autre utilisateur
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleInvite} className="space-y-6">
                                    {error && (
                                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black italic flex items-center gap-3">
                                            <Shield size={16} /> {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-4 italic px-2 bg-white/50 w-fit rounded-full">Email de l'invité</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all font-bold text-sm" placeholder="contact@hopital.tn" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-4 italic px-2 bg-white/50 w-fit rounded-full">Rôle Système</label>
                                            <div className="relative">
                                                <Shield size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all font-bold text-sm appearance-none">
                                                    <option value="SUPER_ADMIN">ADMINISTRATEUR SUPRÊME</option>
                                                    <option value="GLOBAL_ADMIN">ADMINISTRATEUR GLOBAL</option>
                                                    <option value="OPERATOR">OPÉRATEUR</option>
                                                    <option value="REGIONAL_ANALYST">ANALYSTE RÉGIONAL</option>
                                                    <option value="PRACTITIONER">PRATICIEN / MÉDECIN</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-4 italic px-2 bg-white/50 w-fit rounded-full">Type Organisation</label>
                                            <div className="relative">
                                                <Briefcase size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <select value={orgType} disabled={isNationalAdmin || isRegionalAnalyst || isPractitioner} onChange={e => setOrgType(e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all font-bold text-sm appearance-none disabled:opacity-50">
                                                    <option value="NATIONAL">NATIONAL (Ministère)</option>
                                                    <option value="REGIONAL">REGIONAL (Direction)</option>
                                                    <option value="LOCAL">LOCAL (Établissement)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-4 italic px-2 bg-white/50 w-fit rounded-full">Gouvernorat d'affectation</label>
                                             <div className="relative">
                                                 <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                 <select value={govId} disabled={isNationalAdmin} onChange={e => setGovId(e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all font-bold text-sm appearance-none disabled:opacity-50">
                                                     <option value="">National (Tous les gouvernorats)</option>
                                                     {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                 </select>
                                             </div>
                                         </div>
                                     </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[4px] text-[11px] hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 italic mt-6"
                                    >
                                        {loading ? "GÉNÉRATION..." : "GÉNÉRER L'INVITATION"}
                                    </button>
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
