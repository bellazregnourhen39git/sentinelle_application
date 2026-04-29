import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Activity, Globe, Lock, ArrowRight, AlertTriangle, Database, Eye, Zap, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATS = [
    { value: '24', label: 'Gouvernorats Couverts', sub: 'Couverture Nationale Totale' },
    { value: '5', label: 'Substances Surveillées', sub: 'Protocole MedSPAD-4' },
    { value: '3', label: 'Niveaux d\'Accès', sub: 'Architecture RBAC Sécurisée' },
    { value: '99.8%', label: 'Disponibilité Système', sub: 'SLA Institutionnel' },
];

const FEATURES = [
    {
        icon: Database,
        title: 'Collecte Structurée',
        desc: 'Agrégation sécurisée des questionnaires MedSPAD-4 à travers les 24 gouvernorats de la République.',
    },
    {
        icon: Activity,
        title: 'Analytique Temps Réel',
        desc: 'Moteurs d\'intelligence embarqués produisant des analyses de prévalence, comorbidité et intégrité.',
    },
    {
        icon: Eye,
        title: 'Audit d\'Intégrité',
        desc: 'Protocole forensique à 3 couches détectant les anomalies de déclaration dans chaque dossier soumis.',
    },
    {
        icon: Users,
        title: 'Contrôle d\'Accès',
        desc: 'Architecture RBAC multi-niveaux : Praticien, Analyste Régional, Administration Nationale.',
    },
    {
        icon: Globe,
        title: 'Cartographie Dynamique',
        desc: 'Visualisation géospatiale de la densité épidémiologique par gouvernorat en temps réel.',
    },
    {
        icon: FileText,
        title: 'Export & Reporting',
        desc: 'Génération de rapports CSV et extraction de données brutes pour les entités supervisoires.',
    },
];

const Counter = ({ target }) => {
    const [count, setCount] = useState('0');
    useEffect(() => {
        const isPercent = target.includes('%');
        const num = parseFloat(target.replace('%', ''));
        let start = 0;
        const step = num / 60;
        const timer = setInterval(() => {
            start += step;
            if (start >= num) { setCount(target); clearInterval(timer); }
            else setCount(isPercent ? start.toFixed(1) + '%' : Math.floor(start).toString());
        }, 16);
        return () => clearInterval(timer);
    }, [target]);
    return <span>{count}</span>;
};

const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    
    // 🎥 Creative Animation Transforms
    const titleScale = useTransform(scrollY, [0, 500], [1, 1.1]);
    const titleLetterSpacing = useTransform(scrollY, [0, 500], ["-0.05em", "0.2em"]);
    const titleOpacity = useTransform(scrollY, [0, 400], [1, 0.8]);
    const imageScale = useTransform(scrollY, [0, 1000], [1, 1.2]);
    const imageY = useTransform(scrollY, [0, 1000], [0, 100]);
    const badgeY = useTransform(scrollY, [0, 300], [0, -50]);

    return (
        <div className="bg-white text-slate-900 font-sans selection:bg-brand-500/10 overflow-x-hidden">

            {/* ── NAVBAR ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-8 md:px-16 border-b border-slate-100 backdrop-blur-2xl bg-white/80">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[15px] font-black text-slate-900 uppercase italic tracking-tight leading-none">Sentinelle</p>
                        <p className="text-[9px] font-black text-brand-600 uppercase tracking-[3px] opacity-70">MedSPAD-4 · Tunisie 2026</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[2px]">Système Opérationnel</span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-500 text-white text-[10px] font-black uppercase tracking-[2px] hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
                    >
                        <Lock size={12} />
                        Accès Sécurisé
                    </button>
                </div>
            </nav>

            {/* ── HERO IMAGE SECTION (Creative Parallax) ── */}
            <section className="relative w-full pt-20 z-0 overflow-hidden">
                <motion.div 
                    style={{ scale: imageScale, y: imageY }}
                    className="w-full h-[500px] md:h-[700px] relative"
                >
                    <img 
                        src="/hero-banner.png" 
                        alt="Sentinelle Health Surveillance" 
                        className="w-full h-full object-cover"
                    />
                    {/* Surveillance Overlay Grid */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                         style={{ backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                </motion.div>
            </section>

            {/* ── HERO TEXT (Creative Focus) ── */}
            <section className="relative py-32 flex items-center justify-center z-10 -mt-32">
                <div className="relative text-center max-w-6xl mx-auto px-6">
                    {/* Badge */}
                    <motion.div 
                        style={{ y: badgeY }}
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-brand-200 bg-brand-50 mb-12 shadow-sm"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-[4px]">Intelligence de Veille Sanitaire</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                    </motion.div>

                    {/* Headline with Creative Focus Animation */}
                    <motion.div
                        style={{ 
                            scale: titleScale, 
                            letterSpacing: titleLetterSpacing,
                            opacity: titleOpacity
                        }}
                        className="mb-8"
                    >
                        <h1 className="text-[70px] md:text-[130px] font-black uppercase italic tracking-tighter leading-none text-slate-900 drop-shadow-2xl">
                            Sentinelle
                        </h1>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
                        className="w-48 h-1.5 bg-gradient-to-r from-brand-500 to-brand-400 mx-auto mb-8 rounded-full" />
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                        className="text-lg md:text-xl font-bold text-slate-500 italic max-w-3xl mx-auto leading-relaxed mb-4">
                        Système de surveillance épidémiologique des conduites addictives des lycéens en Tunisie.
                        Plateforme officielle MedSPAD-4 — accès réservé au personnel autorisé.
                    </motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        className="text-[10px] font-black text-rose-500 uppercase tracking-[4px] mb-16 flex items-center justify-center gap-2">
                        <AlertTriangle size={10} />
                        Accès restreint · Usage institutionnel exclusif
                        <AlertTriangle size={10} />
                    </motion.p>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="group flex items-center gap-3 px-10 py-5 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-[3px] text-[11px] hover:bg-brand-600 transition-all shadow-2xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-1"
                        >
                            <Lock size={16} />
                            Accéder à la Plateforme
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[2px] bg-slate-50">
                            <Zap size={12} className="text-brand-500" />
                            Authentification JWT Sécurisée
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-20 border-y border-slate-100 bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="text-center group">
                            <p className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                                <Counter target={s.value} />
                            </p>
                            <p className="text-[11px] font-black text-brand-500 uppercase tracking-[2px] mb-1">{s.label}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[1px]">{s.sub}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-28 max-w-6xl mx-auto px-6 bg-white">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-center mb-20">
                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-[4px] mb-4">Capacités Opérationnelles</p>
                    <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900">
                        Intelligence<br /><span className="text-brand-500">Analytique</span>
                    </h2>
                </motion.div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                            className="group p-8 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-500/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                                <f.icon size={22} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-3">{f.title}</h3>
                            <p className="text-[13px] text-slate-500 font-bold leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── CLASSIFICATION BANNER ── */}
            <section className="py-20 mx-6 mb-6 rounded-[48px] bg-slate-50 border border-slate-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.05),transparent_60%)]" />
                <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-8">
                            <AlertTriangle size={12} className="text-rose-600" />
                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-[3px]">Notice Réglementaire</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 mb-6">
                            Accès<br /><span className="text-brand-500">Contrôlé</span>
                        </h2>
                        <p className="text-slate-500 font-bold text-[14px] leading-relaxed max-w-2xl mx-auto mb-10 italic">
                            L'accès à cette plateforme est strictement réservé au personnel habilité du Ministère de la Santé,
                            aux équipes de recherche MedSPAD et aux administrateurs régionaux désignés.
                            Toute tentative d'accès non autorisée est journalisée et susceptible de poursuites.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="group inline-flex items-center gap-3 px-10 py-5 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-[3px] text-[11px] hover:bg-brand-600 transition-all shadow-2xl shadow-brand-500/30 hover:-translate-y-1"
                        >
                            <Lock size={16} />
                            Authentification Requise
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-12 px-6 border-t border-slate-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
                            <ShieldCheck size={14} className="text-brand-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase italic">Sentinelle — MedSPAD-4</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[2px]">République Tunisienne · 2026</p>
                        </div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] text-center">
                        Système de Veille Sanitaire Nationale · Usage Institutionnel Exclusif · Tous droits réservés
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[2px]">Système Actif</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
