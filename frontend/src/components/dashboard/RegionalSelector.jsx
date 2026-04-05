import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Shield, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegionalSelector = ({ regions = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 selection:bg-brand-500/10 overflow-hidden relative">
            {/* ❄️ Clinical Crystal Background Enhancements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-brand-500/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-blue-500/3 blur-[100px] rounded-full" />
            </div>

            {/* 🛡️ Clinical Brand Header */}
            <motion.div 
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-20 relative z-10"
            >
                <div className="w-20 h-20 rounded-3xl bg-brand-500 mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-brand-500/30 border border-white">
                    <Shield className="text-white glow-brand" size={36} />
                </div>
                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tight italic mb-4">
                    Portail <span className="text-brand-600">Sentinelle</span>
                </h1>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[8px] italic leading-none opacity-80">
                    Architecture de Veille Sanitaire v2.0
                </p>
            </motion.div>

            {/* 🗺️ High-Density Choice Hub */}
            <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                {regions && regions.length > 0 ? regions.map((reg, idx) => (
                    <motion.div
                        key={reg.id}
                        onClick={() => navigate(`/admin/${reg.slug || reg.name.toLowerCase()}`)}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                        className="group relative pro-card p-12 hover:bg-white transition-all duration-500 text-left overflow-hidden border border-slate-100 shadow-xl cursor-pointer active:scale-95"
                    >
                        {/* Decorative Identifier */}
                        <span className="absolute -top-6 -right-6 text-9xl font-black text-slate-100 italic select-none group-hover:text-brand-50 transition-colors">{reg.id}</span>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-500/20 border border-slate-100 transition-all duration-500">
                                    <MapPin size={28} />
                                </div>
                                <div className="flex items-center gap-2.5 px-5 py-2.5 bg-brand-50 border border-brand-100 rounded-full text-[10px] font-black text-brand-600 uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                    VECTEUR ACTIF
                                </div>
                            </div>
                            
                            <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-5 group-hover:text-brand-600 transition-colors">
                                {reg.name}
                            </h3>
                            
                            <div className="space-y-5 mb-12">
                                <div className="flex items-center justify-between p-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Établissements</span>
                                    <span className="text-lg font-black text-slate-900 italic tabular-nums">{reg.schools}</span>
                                </div>
                                <div className="flex items-center justify-between p-1 border-t border-slate-50 pt-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Dossiers Collectés</span>
                                    <span className="text-lg font-black text-slate-900 italic tabular-nums">{reg.dossiers}</span>
                                </div>
                            </div>

                            <div className="w-full py-5 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[4px] flex items-center justify-center gap-3 group-hover:bg-brand-700 transition-all duration-500 shadow-xl shadow-brand-500/10 group-hover:shadow-brand-500/20 border border-white/20 italic">
                                Scanner le Secteur <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    /* Fallback Recovery State */
                    <div className="col-span-full py-24 text-center">
                        <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-100 mx-auto mb-8 flex items-center justify-center">
                            <RefreshCw size={28} className="text-brand-500 animate-spin" />
                        </div>
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[8px] italic animate-pulse">Initialisation du Réseau…</p>
                    </div>
                )}
            </div>

            {/* 🔬 System Footer */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-20 text-center relative z-10"
            >
                <button 
                    onClick={() => navigate('/superadmin')}
                    className="text-[11px] font-black text-slate-400 hover:text-brand-600 transition-all uppercase tracking-[4px] border-b border-transparent hover:border-brand-600 pb-2 italic"
                >
                    Accéder au HUB National (SuperAdmin)
                </button>
            </motion.div>
        </div>
    );
};

export default RegionalSelector;
