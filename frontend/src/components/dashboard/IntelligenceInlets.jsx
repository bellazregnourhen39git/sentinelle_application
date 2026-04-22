import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EditableLabel from './EditableLabel';
import { Users, ShieldAlert, Award, TrendingUp, UserCheck, Flag, GraduationCap, Home, Activity, CheckCircle2, AlertTriangle, Layers, Target, Thermometer, FlaskConical, ArrowUpRight } from 'lucide-react';

// 🛡️ Audit Expert — Indice de Fiabilité et d'Intégrité des Données
export const ExpertAudit = ({ integrity, locked = false }) => {
    const navigate = useNavigate();
    const { honesty_score = 0, is_reliable = true } = integrity || {};
    
    return (
        <motion.div 
            whileHover={!locked ? { scale: 1.01, translateY: -4 } : {}}
            onClick={() => !locked && navigate('/lab/integrity')}
            className={`pro-card p-8 h-full rounded-[40px] border border-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] transition-all duration-500 relative overflow-hidden group
                ${locked ? 'cursor-not-allowed opacity-70 grayscale-[30%]' : 'cursor-pointer hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.12)]'}
                ${!is_reliable ? 'bg-rose-50/50 backdrop-blur-3xl' : 'bg-white/70 backdrop-blur-3xl'}`}
        >
            {/* Lock Badge */}
            {locked && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-full">
                    <span className="text-[9px]">🔒</span>
                    <span className="text-[8px] font-black text-white uppercase tracking-[2px] italic">Superviseur</span>
                </div>
            )}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
                <ArrowUpRight size={24} className="text-brand-500" />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${!is_reliable ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'}`}>
                        {is_reliable ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[3px] italic">
                            <EditableLabel termKey="lab_integrity_title" defaultValue="Audit d'Intégrité" />
                        </h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] italic">
                            <EditableLabel termKey="lab_integrity_subtitle" defaultValue="Validation Vague 2026" />
                        </p>
                    </div>
                </div>
                {!is_reliable && (
                    <span className="px-4 py-1.5 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-[2px] animate-pulse shadow-lg shadow-rose-500/20">Alerte</span>
                )}
            </div>

            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] italic"><EditableLabel termKey="lab_integrity_honesty_idx" defaultValue="Indice d'Honnêteté" /></span>
                        <span className={`text-[12px] font-black tabular-nums italic ${!is_reliable ? 'text-rose-600' : 'text-brand-600'}`}>{honesty_score}%</span>
                    </div>
                    <div className="h-4 rounded-full bg-slate-50 overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${honesty_score}%` }} 
                            className={`h-full rounded-full ${!is_reliable ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 'bg-brand-500 shadow-[0_0_12px_rgba(14,165,233,0.3)]'}`} 
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 group-hover:bg-brand-50 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${!is_reliable ? 'bg-rose-500' : 'bg-brand-500'} animate-pulse`} />
                        <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-wide"><EditableLabel termKey="lab_integrity_anomaly_margin" defaultValue="Marge d'Anomalie" /></span>
                    </div>
                    <span className={`text-[15px] font-black tabular-nums italic ${!is_reliable ? 'text-rose-600' : 'text-slate-900'}`}>{(100 - honesty_score).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 text-[8px] font-black text-brand-500 uppercase tracking-[3px] italic opacity-0 group-hover:opacity-100 transition-opacity">
                    <FlaskConical size={10} />
                    <EditableLabel termKey="lab_enter" defaultValue="Entrer dans le Lab" />
                </div>
            </div>
        </motion.div>
    );
};

// 📈 Spectre de Comorbidité — Intensité du Poly-Usage de Drogues
export const ComorbiditySpectrum = ({ metrics, locked = false }) => {
    const { poly_2plus_pct = 0, poly_3plus_pct = 0 } = metrics || {};
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => !locked && navigate('/lab/comorbidity')}
            className={`pro-card p-8 h-full rounded-[40px] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] overflow-hidden group transition-all duration-500 relative
                ${locked ? 'cursor-not-allowed opacity-70 grayscale-[30%]' : 'cursor-pointer hover:border-rose-300 hover:shadow-[0_40px_100px_-20px_rgba(244,63,94,0.12)] active:scale-95'}
            `}
        >
            {/* Lock Badge */}
            {locked && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-full">
                    <span className="text-[9px]">🔒</span>
                    <span className="text-[8px] font-black text-white uppercase tracking-[2px] italic">Superviseur</span>
                </div>
            )}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                    <Layers size={24} />
                </div>
                <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[3px] italic">
                        <EditableLabel termKey="lab_comorbidity_title" defaultValue="Spectre Comorbidité" />
                    </h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] italic">
                        <EditableLabel termKey="lab_comorbidity_subtitle" defaultValue="Intensité Poly-Usage" />
                    </p>
                </div>
            </div>

            <div className="space-y-10">
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] italic"><EditableLabel termKey="lab_como_multi_2" defaultValue="Usage Multi-Substances (2+)" /></span>
                        <span className="text-3xl font-black text-rose-600 italic tracking-tighter tabular-nums">{poly_2plus_pct}%</span>
                    </div>
                    <div className="h-4 rounded-full bg-slate-50 border border-slate-100 overflow-hidden shadow-inner p-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${poly_2plus_pct}%` }} className="h-full bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                    </div>
                </div>

                {/* 🔗 Major Correlations - General View */}
                {metrics?.top_pairs?.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3.5px] mb-6 italic flex items-center gap-2">
                            <Activity size={12} className="text-brand-500 animate-pulse" />
                            <EditableLabel termKey="lab_como_correlations" defaultValue="Corrélations Majeures" />
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                            {metrics.top_pairs.map((pair, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm group/pair hover:border-brand-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-wider group-hover/pair:text-brand-600 transition-colors">
                                            {pair.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${pair.pct}%` }} 
                                                className="h-full bg-brand-500" 
                                            />
                                        </div>
                                        <span className="text-[11px] font-black text-brand-600 italic tabular-nums min-w-[35px] text-right">
                                            {pair.pct}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-6 rounded-[32px] bg-slate-900 text-white shadow-2xl shadow-slate-900/30 relative overflow-hidden mt-8">
                    <div className="absolute top-[-10%] right-[-10%] opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <Thermometer size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-[3px] italic text-rose-400"><EditableLabel termKey="lab_como_zone" defaultValue="Zone Critique (3+)" /></span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                <span className="text-[16px] font-black italic tabular-nums">{poly_3plus_pct}%</span>
                            </div>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[1.5px] leading-relaxed opacity-50 italic">
                            <EditableLabel termKey="lab_como_priority" defaultValue="Priorité d'intervention psychiatrique absolue pour les cas identifiés." />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 👤 Pouls de la Cohorte — Surveillance Démographique à 360 Degrés
export const CohortPulse = ({ insights }) => {
    const { demographics = {}, academic = {}, stability = {} } = insights || {};
    
    return (
        <div className="pro-card p-8 h-full rounded-[40px] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.12)] hover:-translate-y-1 relative group">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 border border-brand-100 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                    <Users size={24} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[3px] italic"><EditableLabel termKey="lab_cohort_title" defaultValue="Dynamique Cohorte" /></h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] italic"><EditableLabel termKey="lab_cohort_subtitle" defaultValue="Statut Social-Académique" /></p>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Gender split */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] italic"><EditableLabel termKey="lab_cohort_biology" defaultValue="Répartition Biologique" /></span>
                       <span className="text-[10px] font-black text-slate-900 italic tabular-nums">N = {demographics.total?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 h-3.5 rounded-full overflow-hidden bg-slate-50 p-1 border border-slate-100 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${demographics.male_pct}%` }} className="h-full bg-brand-500 rounded-full" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${demographics.female_pct}%` }} className="h-full bg-rose-500 rounded-full" />
                    </div>
                   <div className="flex justify-between mt-3 px-1 text-[9px] font-black uppercase text-slate-400 tracking-tighter italic">
                       <span className="flex items-center gap-1.5 text-brand-600"><span className="w-2 h-2 rounded-full bg-brand-500" />{demographics.male_pct}% <EditableLabel termKey="lab_cohort_male" defaultValue="Masculin" /></span>
                       <span className="flex items-center gap-1.5 text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500" />{demographics.female_pct}% <EditableLabel termKey="lab_cohort_female" defaultValue="Féminin" /></span>
                   </div>
                </div>

                {/* 2. Academic Performance */}
                <div className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                        <GraduationCap size={16} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] italic"><EditableLabel termKey="lab_cohort_academic" defaultValue="Trajectoire Académique" /></span>
                   </div>
                   <div className="flex items-center gap-1 h-3 p-1 bg-white rounded-full border border-slate-100 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${academic.above_12_pct}%` }} className="h-full bg-brand-400 rounded-full" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${academic.mid_10_12_pct}%` }} className="h-full bg-amber-400 rounded-full" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${academic.below_10_pct}%` }} className="h-full bg-rose-400 rounded-full" />
                   </div>
                   <div className="mt-3 flex justify-between px-1 text-[8px] font-black uppercase text-slate-400 italic letter-spacing-tight">
                       <span className="text-brand-500"><EditableLabel termKey="lab_cohort_high" defaultValue="Haut" /> ({academic.above_12_pct}%)</span>
                       <span className="text-amber-500"><EditableLabel termKey="lab_cohort_mid" defaultValue="Médian" /> ({academic.mid_10_12_pct}%)</span>
                       <span className="text-rose-500"><EditableLabel termKey="lab_cohort_low" defaultValue="Vulnérable" /> ({academic.below_10_pct}%)</span>
                   </div>
                </div>

                {/* 3. Family Stability */}
                <div className="px-1">
                   <div className="flex items-center gap-3 mb-4">
                      <Home size={16} className="text-brand-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] italic"><EditableLabel termKey="lab_cohort_stability" defaultValue="Stabilité Résidentielle" /></span>
                   </div>
                    <div className="h-3.5 rounded-full bg-slate-50 overflow-hidden p-1 border border-slate-100 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stability.stable_pct}%` }} className="h-full bg-brand-500 rounded-full shadow-lg" />
                    </div>
                   <div className="mt-3 flex justify-between text-[9px] font-black uppercase text-slate-400 italic">
                       <span className="text-brand-600">Stable ({stability.stable_pct}%)</span>
                       <span className="text-rose-500">Aléas ({stability.instable_pct}%)</span>
                   </div>
                </div>
            </div>
        </div>
    );
};

// 🤝 Vecteurs de Contexte Social — Stress & Incidents
export const SocialInlet = ({ stressIndex = 0, violenceIndex = 0, locked = false }) => {
    const navigate = useNavigate();

    return (
        <motion.div 
            whileHover={!locked ? { scale: 1.01, translateY: -4 } : {}}
            onClick={() => !locked && navigate('/lab/social')}
            className={`pro-card p-8 h-full rounded-[40px] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] transition-all duration-500 relative overflow-hidden
                ${locked ? 'cursor-not-allowed opacity-70 grayscale-[30%]' : 'cursor-pointer hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.12)] group'}`}
        >
            {/* Lock Badge */}
            {locked && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-full">
                    <span className="text-[9px]">🔒</span>
                    <span className="text-[8px] font-black text-white uppercase tracking-[2px] italic">Superviseur</span>
                </div>
            )}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
                <ArrowUpRight size={24} className="text-brand-500" />
            </div>

            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 border border-brand-100 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                    <ShieldAlert size={24} />
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[4px] italic"><EditableLabel termKey="lab_social_title" defaultValue="Vecteurs Sociaux" /></h4>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-brand-500/20 transition-all duration-300">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2.5px] mb-2 italic"><EditableLabel termKey="lab_social_stress" defaultValue="Contrainte Psychologique" /></p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-slate-900 italic tabular-nums group-hover:text-brand-600 transition-colors">{stressIndex}%</span>
                        <span className="text-[10px] font-black text-brand-500 uppercase italic opacity-60 tracking-widest">Normal</span>
                    </div>
                </div>
                <div className="w-14 h-14 rounded-full border-[6px] border-slate-100 border-t-brand-500 flex items-center justify-center transform rotate-[-45deg] bg-white shadow-xl shadow-slate-200/50 group-hover:rotate-0 transition-transform duration-700">
                    <TrendingUp size={20} className="text-brand-500 transform rotate-[45deg] group-hover:rotate-0 transition-transform" />
                </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-[32px] bg-rose-50/30 border border-rose-100/50 group-hover:bg-rose-50 transition-all duration-300">
                <div className="flex flex-col">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[2.5px] mb-2 italic"><EditableLabel termKey="lab_social_conflict" defaultValue="Index de Conflictualité" /></p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-slate-900 italic tabular-nums">{violenceIndex}%</span>
                        <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[8px] font-black uppercase tracking-[1.5px] shadow-lg shadow-rose-500/20">Risque</span>
                    </div>
                </div>
                <Activity size={32} className="text-rose-300 animate-pulse" />
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-6 text-[8px] font-black text-brand-500 uppercase tracking-[3px] italic opacity-0 group-hover:opacity-100 transition-opacity">
                <FlaskConical size={10} />
                Explorer la Phénoménologie
            </div>
        </motion.div>
    );
};

// 🏙️ Matrice Competitive — Grille de Classement Haute Densité pour les Admins
export const CompetitiveMatrix = ({ rankings, govName }) => {
    if (!rankings) return null;
    
    const categories = Object.keys(rankings).map(id => ({
        id,
        label: rankings[id].label,
        data: rankings[id].leaderboard.find(r => r.gov_name === govName)
    }));

    return (
        <div className="pro-card p-10 h-full rounded-[48px] border border-white bg-white/70 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.12)] hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Target size={120} className="text-brand-500" />
            </div>
            <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-brand-500 flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 group-hover:rotate-6 transition-transform">
                    <Award size={32} strokeWidth={3} className="glow-brand" />
                </div>
                <div>
                   <h4 className="text-[11px] font-black text-brand-600 uppercase tracking-[5px] italic mb-1.5 opacity-60"><EditableLabel termKey="lab_competing_bench" defaultValue="Benchmark Régional" /></h4>
                   <p className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{govName}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
                {categories.map((cat) => (
                    <div key={cat.id} className="p-5 rounded-[28px] bg-slate-50 border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all duration-500 hover:bg-white hover:border-brand-500/20 hover:scale-[1.05] hover:shadow-xl hover:shadow-brand-500/5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[1.5px] mb-2 italic h-[16px] overflow-hidden">{cat.label}</span>
                        <div className="flex items-baseline gap-1.5">
                           <span className="text-2xl font-black text-slate-900 italic tabular-nums tracking-tighter">#{cat.data?.rank || '0'}</span>
                           <span className="text-[10px] font-black text-brand-600 italic opacity-80">{cat.data?.prevalence}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 🌍 Liste de Vigilance Nationale — Pour le Niveau SuperAdmin
export const NationalHeatList = ({ rankings }) => {
    if (!rankings) return null;
    
    const heatList = Object.keys(rankings).map(id => ({
        category: rankings[id].label,
        topRegion: rankings[id].leaderboard[0]
    }));

    return (
        <div className="pro-card p-10 h-full rounded-[48px] bg-slate-900 text-white shadow-2xl shadow-slate-900/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black pointer-events-none" />
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flag size={100} className="text-brand-500" />
            </div>
            
            <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 group-hover:scale-110 transition-transform">
                    <Flag size={28} className="glow-brand" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-2"><EditableLabel termKey="lab_national_points" defaultValue="Points de Vigilance" /></h4>
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-[4px] italic"><EditableLabel termKey="lab_national_monitor" defaultValue="Monitoring National Actif" /></p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
                {heatList.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-brand-500/40 hover:bg-white/[0.06] transition-all duration-300 text-center group/item hover:scale-[1.02]">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[2px] mb-2 italic truncate opacity-60 group-hover/item:opacity-100 group-hover/item:text-brand-400 transition-all">{item.category}</span>
                         <span className="text-[13px] font-black text-white uppercase italic tracking-widest mb-1">{item.topRegion.gov_name}</span>
                         <span className="text-[11px] font-black text-rose-500 tabular-nums shadow-[0_0_10px_rgba(244,63,94,0.3)]">{item.topRegion.prevalence}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 🏆 Accès Lab des Classements — Compétition Nationale
export const RankingsLabInlet = () => {
    const navigate = useNavigate();

    return (
        <motion.div 
            whileHover={{ scale: 1.01, translateY: -4 }}
            onClick={() => navigate('/lab/rankings')}
            className="pro-card p-10 h-full rounded-[40px] bg-slate-950 border border-slate-900 shadow-xl shadow-slate-900/20 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[300px]"
        >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="absolute top-[-10%] right-[-5%] opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700">
                <Target size={180} strokeWidth={1} className="text-brand-500" />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Award size={32} />
                </div>
                <div className="flex items-center gap-1.5 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
                     <span className="text-[9px] font-black uppercase tracking-[2px] italic"><EditableLabel termKey="lab_open_hub" defaultValue="Ouvrir le Hub" /></span>
                     <ArrowUpRight size={12} />
                </div>
            </div>

            <div className="relative z-10">
                <h4 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none mb-3 group-hover:text-brand-400 transition-colors">
                    <EditableLabel termKey="lab_rankings_title" defaultValue="Laboratoire de Classement" />
                </h4>
                <p className="text-[12px] font-bold text-slate-400 leading-relaxed max-w-[85%] italic">
                    <EditableLabel termKey="lab_rankings_desc" defaultValue="Accédez au tableau structurel compétitif évaluant l'intégralité des 24 gouvernorats à travers toutes les dimensions de prévalence et vecteurs d'addiction." />
                </p>
                <div className="mt-6 flex items-center gap-3">
                     <div className="w-full h-[1px] bg-slate-800" />
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic shrink-0"><EditableLabel termKey="lab_rankings_limit" defaultValue="Périmètre National Uniquement" /></div>
                </div>
            </div>
        </motion.div>
    );
};
