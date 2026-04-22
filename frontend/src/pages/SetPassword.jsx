import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Jeton d'invitation manquant ou invalide.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('auth/activate/', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || "Une erreur est survenue lors de l'activation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 bg-[url('/grid.svg')] bg-center bg-fixed">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-12">
                     <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-6">
                        <Activity size={32} className="text-white glow-brand" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Sentinelle</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] mt-2 italic">Activation de Compte</p>
                </div>

                <div className="pro-card p-10 md:p-14 rounded-[48px] border border-white bg-white/70 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none z-0" />
                    
                    {success ? (
                        <div className="relative z-10 text-center py-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 italic">Compte Activé !</h3>
                            <p className="text-slate-500 font-bold leading-relaxed italic">
                                Votre mot de passe a été configuré avec succès. Redirection vers la page de connexion...
                            </p>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-sm font-bold italic"
                                >
                                    <AlertTriangle size={18} />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-4 italic px-2 bg-white/50 w-fit rounded-full">Nouveau Mot de Passe</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-16 pl-14 pr-8 rounded-3xl bg-white border-2 border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 group-hover:border-slate-200"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-4 italic px-2 bg-white/50 w-fit rounded-full">Confirmer</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full h-16 pl-14 pr-8 rounded-3xl bg-white border-2 border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 group-hover:border-slate-200"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[4px] text-[11px] hover:bg-brand-600 transition-all shadow-2xl shadow-slate-200 border border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed italic mt-4"
                                >
                                    {loading ? "Traitement..." : "Activer mon Compte"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
                
                <p className="mt-12 text-center text-slate-400 font-bold text-xs italic">
                    Hub d'Observation Clinique Sentinelle • Réseau de Vigilance Globale
                </p>
            </motion.div>
        </div>
    );
};

export default SetPassword;
