import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, AlertTriangle, BarChart2, PieChart,
    Layers, Info
} from 'lucide-react';
import EditableLabel from './EditableLabel';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart as RechartsPie, Pie, Legend
} from 'recharts';

// ─── Color palette — Clinical Crystal Design System ───────────────────────────

const PALETTES = [
    ['#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD'], // Brand Blue
    ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'], // Indigo
    ['#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'], // Slate
    ['#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3'], // Rose (Contrast)
];

const DIVERSE_PALETTE = ['#0EA5E9', '#6366F1', '#64748B', '#F43F5E', '#38BDF8', '#818CF8', '#94A3B8'];

const SECTION_NAMES = {
    A: 'Profil Démographique', B: 'Contexte Socio-Économique',
    C: 'Consommation Tabagique', D: 'Cigarettes Électroniques', E: 'Usage du Narguilé',
    G: 'Substances Alcoolisées', H: 'Produits Psychotropes', I: 'Cannabis / Substances', 
    J: 'Cocaïne / Stimulants', K: 'Ecstasy / MDMA', L: 'Opiacés / Héroïne', 
    M: 'Inhalants Chimiques', N: 'Substances NPS', P: 'Drogues de Synthèse', 
    Q: 'Perception du Risque', R: 'Empreinte Réseaux Sociaux',
    S: 'Industrie Jeux Vidéo', T: "Jeux d'Argent / Hasard", U: 'Violence & Incidents',
    V: 'État de Santé Mentale', Z: 'Intégrité du Protocole',
};

const GROUP_COLORS = {
    A: '#0EA5E9', B: '#0EA5E9',
    C: '#0EA5E9', D: '#0EA5E9', E: '#0EA5E9', G: '#0EA5E9', H: '#0EA5E9',
    I: '#0EA5E9', J: '#0EA5E9', K: '#0EA5E9', L: '#0EA5E9', M: '#0EA5E9',
    N: '#0EA5E9', P: '#0EA5E9',
    Q: '#6366F1', Z: '#6366F1',
    R: '#64748B', S: '#64748B', T: '#64748B',
    U: '#F43F5E', V: '#F43F5E',
};

// ─── Chart Components (Refined) ──────────────────────────────────────────

const BarQuestionItem = ({ code, label, distribution, index }) => {
    const palette = PALETTES[index % PALETTES.length];
    const hasData = distribution.some(d => d.count > 0);
    const data = distribution.map(d => ({ name: d.label, value: d.pct }));

    return (
        <div className="flex flex-col gap-6 p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-all duration-500 group min-h-[250px]">
            <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-white shadow-lg italic"
                    style={{ backgroundColor: palette[0] }}>
                    {code}
                </span>
                <p className="text-[13px] font-black text-slate-800 italic tracking-tight uppercase leading-tight flex-1">{label}</p>
            </div>
            <div className="h-44 mt-2 flex items-center justify-center relative">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" />
                            <YAxis tick={{ fontSize: 8, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} unit="%" dx={-5} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', radius: 4 }}
                                formatter={(v) => [`${v}%`, 'Prévalence']}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 900, color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={20}>
                                {data.map((_, i) => (
                                    <Cell key={i} fill={palette[0]} fillOpacity={1 - (i * 0.15)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center gap-3 opacity-20 hover:opacity-40 transition-opacity">
                        <BarChart2 size={32} className="text-slate-400" />
                        <p className="text-[9px] font-black uppercase tracking-[4px] text-slate-400 italic">Aucun Jeu de Données Détecté</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DonutQuestionItem = ({ code, label, distribution, index }) => {
    const palette = PALETTES[index % PALETTES.length];
    const hasData = distribution.some(d => d.count > 0);
    const data = distribution.filter(d => d.count > 0).map(d => ({ name: d.label, value: d.pct }));

    return (
        <div className="flex flex-col gap-6 p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-all duration-500 group min-h-[250px]">
            <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-white shadow-lg italic"
                    style={{ backgroundColor: palette[0] }}>
                    {code}
                </span>
                <p className="text-[13px] font-black text-slate-800 italic tracking-tight uppercase leading-tight flex-1">{label}</p>
            </div>
            <div className="h-44 mt-2 flex items-center justify-center">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                            <Pie data={data} cx="45%" cy="50%" innerRadius={42} outerRadius={58}
                            paddingAngle={5} dataKey="value" stroke="white" strokeWidth={3}>
                            {data.map((_, i) => (
                                <Cell key={i} fill={DIVERSE_PALETTE[i % DIVERSE_PALETTE.length]} />
                            ))}
                        </Pie>
                            <Tooltip 
                                formatter={(v) => [`${v}%`, 'Prévalence']}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 900, color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                            />
                            <Legend 
                                iconType="circle" 
                                iconSize={8} 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right" 
                                formatter={(v, entry) => (
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2 truncate max-w-[80px]">
                                        {v} ({entry.payload.value}%)
                                    </span>
                                )} 
                            />
                        </RechartsPie>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center gap-3 opacity-20 hover:opacity-40 transition-opacity">
                        <PieChart size={32} className="text-slate-400" />
                        <p className="text-[9px] font-black uppercase tracking-[4px] text-slate-400 italic">Participation Aléatoire</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main panel — Clinical Crystal ───────────────────────────────────────────

const SectionDetailPanel = ({ sectionId, onBack, data }) => {
    if (!data) return null;

    const sectionColor = GROUP_COLORS[sectionId] || '#0EA5E9';
    const sectionName = SECTION_NAMES[sectionId] || `Vecteur ${sectionId}`;
    const questions = data.questions || [];
    const n = data.n_submissions || 0;

    return (
        <motion.div
            className="flex flex-col gap-10 pb-32"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Nav Headers */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-4 text-slate-500 hover:text-brand-600 font-black text-[11px] uppercase tracking-[5px] transition-all bg-white shadow-xl shadow-slate-200/40 px-10 py-5 rounded-[24px] border border-slate-100 hover:scale-[1.05] active:scale-95 group italic"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> <EditableLabel termKey="detail_btn_back" defaultValue="Retour au Tableau de Bord" />
                </button>
                <div className="flex items-center gap-4 px-10 py-5 rounded-[24px] bg-slate-900 shadow-2xl shadow-slate-900/20">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-2xl shadow-brand-500 animate-pulse" />
                   <span className="text-[11px] font-black text-white uppercase tracking-[5px] italic"><EditableLabel termKey="detail_vecteur_prefix" defaultValue="Vecteur Analytique" /> {sectionId}</span>
                </div>
            </div>

            {/* Consolidated Statistical Anchor */}
            <div className="pro-card p-12 rounded-[64px] border-l-[16px] shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl relative overflow-hidden"
                 style={{ borderLeftColor: sectionColor }}>
                
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Info size={250} strokeWidth={1} />
                </div>

                {/* Header Metrics */}
                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12 border-b border-slate-100 pb-12 mb-12">
                    <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[36px] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-brand-500/30 italic"
                            style={{ backgroundColor: sectionColor }}>
                            {sectionId}
                        </div>
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">{sectionName}</h2>
                            <p className="text-[11px] font-black text-brand-600 uppercase tracking-[6px] italic opacity-60"><EditableLabel termKey="detail_consolidation_msg" defaultValue="Consolidation Intelligence Vague 2026.Alpha" /></p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        {[
                            { icon: Users, label: <EditableLabel termKey="detail_stat_dossiers" defaultValue="Dossiers" />, value: n === 0 ? '—' : n.toLocaleString(), color: 'text-brand-600' },
                            { icon: Layers, label: <EditableLabel termKey="detail_stat_variables" defaultValue="Variables" />, value: questions.length, color: 'text-slate-900' },
                        ].map(({ icon: Icon, label, value, color }, i) => (
                            <div key={i} className="flex flex-col items-center px-8 py-5 rounded-[32px] bg-slate-50 border border-slate-100 min-w-[140px] shadow-sm hover:bg-white hover:border-brand-500/20 transition-all cursor-default">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] mb-2 italic">{label}</span>
                                <p className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🧪 THE "BIG CARD" FIELD — Consolidated Grid */}
                <div className="relative z-10">
                    {questions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AnimatePresence>
                                {questions.map((q, idx) => (
                                    <motion.div
                                        key={q.code}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                    >
                                        {q.type === 'donut'
                                            ? <DonutQuestionItem code={q.code} label={q.label} distribution={q.distribution} index={idx} />
                                            : <BarQuestionItem code={q.code} label={q.label} distribution={q.distribution} index={idx} />
                                        }
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center gap-6 bg-slate-50 rounded-[56px] border-4 border-dashed border-slate-100 group hover:bg-white hover:border-rose-500/20 transition-all duration-700">
                            <AlertTriangle size={64} className="text-slate-100 group-hover:text-rose-500 transition-colors" />
                            <p className="text-[13px] font-black text-slate-400 uppercase tracking-[10px] italic">Aucun Vecteur Analytique Trouvé</p>
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
};

export default SectionDetailPanel;
