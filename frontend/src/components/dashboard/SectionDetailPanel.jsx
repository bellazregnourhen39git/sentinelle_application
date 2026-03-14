import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell
} from 'recharts';
import { 
    Info, AlertCircle, Share2, Map as MapIcon,
    ArrowUpRight, ArrowDownRight, Zap, ChevronLeft, Activity, Plus
} from 'lucide-react';
import api from '../../api';

const SectionDetailPanel = ({ sectionId, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await api.get(`section-stats/${sectionId}/`, {
                    params: { scope_type: 'national' }
                });
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch section stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sectionId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-white rounded-[50px] shadow-xl shadow-slate-100 border border-slate-50">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-slate-50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px]">Chargement des données...</p>
        </div>
    );

    if (!data) return (
        <div className="p-12 bg-orange-50 rounded-[40px] border border-orange-100 text-center">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-orange-900 mb-2">Données Indisponibles</h3>
            <p className="text-orange-700 text-sm font-medium">L'échantillon collecté pour cette section est actuellement insuffisant pour générer une analyse statistique fiable.</p>
            <button onClick={onBack} className="mt-6 px-6 py-2 bg-orange-200 text-orange-900 rounded-xl font-black text-[10px] uppercase tracking-widest">
                Retour
            </button>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
        >
            {/* Header / Intro */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-3 px-5 py-3 bg-white hover:bg-slate-900 text-slate-400 hover:text-white rounded-2xl shadow-sm border border-slate-100 transition-all font-black uppercase text-[10px] tracking-widest"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Retour
                </button>
                <div className="text-right">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Section {sectionId}</h2>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Détails Statistiques</p>
                </div>
            </div>

            {/* Block 1 — KPI Cards (3 cards) */}
            <div className="grid grid-cols-3 gap-6">
                {data.kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] shadow-lg shadow-slate-100 border border-slate-50 flex flex-col justify-between group">
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{kpi.label}</p>
                            <Info size={14} className="text-slate-200 group-hover:text-brand-300 transition-colors" />
                        </div>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{kpi.value}</p>
                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic border-t border-slate-50 pt-4">
                            {kpi.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Block 2 — Distribution Chart */}
            <div className="bg-white p-12 rounded-[50px] shadow-xl shadow-slate-100 border border-slate-50">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-md">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-2">Distribution Comparative</h3>
                        <p className="text-sm text-slate-400 font-medium italic">
                            "{data.chart.desc}"
                        </p>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div> Local
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div> National
                        </div>
                    </div>
                </div>
                
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chart.labels.map((l, i) => ({
                            name: l,
                            local: data.chart.datasets[0].data[i],
                            national: data.chart.datasets[1].data[i]
                        }))} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                dy={15}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#cbd5e1', fontSize: 10 }}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc', radius: 10 }}
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', padding: '20px' }}
                                itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                            />
                            <Bar dataKey="local" fill="#3B82F6" radius={[12, 12, 0, 0]} barSize={40} />
                            <Bar dataKey="national" fill="#e2e8f0" radius={[12, 12, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="mt-12 p-6 bg-slate-50 rounded-[30px] border border-slate-100 italic">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        <Activity size={14} className="inline-block mr-2 text-brand-600" />
                        L'analyse de distribution permet d'isoler les déviances locales par rapport aux tendances nationales. Une barre locale significativement supérieure à la barre nationale indique une zone de tension nécessitant une intervention ciblée.
                    </p>
                </div>
            </div>

            {/* Block 3 — Map Block */}
            <div className="bg-slate-900 p-12 rounded-[50px] shadow-2xl relative overflow-hidden group min-h-[400px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-10 flex items-center justify-center grayscale">
                    <MapIcon size={300} strokeWidth={0.5} />
                </div>
                
                <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-[30px] flex items-center justify-center text-brand-400 mb-8 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                        <MapIcon size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-[5px] mb-4">Visualisation Spatiale</h3>
                    <p className="text-sm text-slate-500 max-w-sm font-medium leading-relaxed uppercase tracking-widest italic">
                        Le module de cartographie choroplèthe génère une intensité de couleur basée sur la prévalence de la Section {sectionId} par gouvernorat.
                    </p>
                    <div className="mt-10 px-8 py-4 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-md">
                        <p className="text-[10px] font-black text-brand-300 uppercase tracking-[3px]">Génération dynamique en cours</p>
                    </div>
                </div>
            </div>

            {/* Block 4 — Correlations Block */}
            <div className="bg-white p-12 rounded-[50px] shadow-xl shadow-slate-100 border border-slate-50 border-dashed border-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Corrélations Directes</h3>
                        <p className="text-sm text-slate-400 font-bold tracking-tight">Liens statistiques identifiés avec d'autres thématiques.</p>
                    </div>
                    <Zap className="text-amber-500" size={32} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.correlations && data.correlations.length > 0 ? data.correlations.map((c, i) => (
                        <div key={i} className="group flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-950 rounded-[30px] border border-slate-100 transition-all hover:scale-[1.02] cursor-pointer">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white group-hover:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-brand-600 transition-colors shadow-sm">
                                    {c.section_id}
                                </div>
                                <div className="max-w-[150px]">
                                    <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest opacity-60">{c.tag}</p>
                                    <p className="text-xs font-black text-slate-800 group-hover:text-white transition-colors">{c.desc}</p>
                                </div>
                            </div>
                            <div className="bg-white/50 group-hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors">
                                <Plus size={14} className="group-hover:text-white" />
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 py-10 text-center">
                            <p className="text-sm font-medium text-slate-400 italic">Analyse de corrélation en attente de données complémentaires.</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-10 pt-10 border-t border-slate-50">
                    <p className="text-[10px] font-medium text-slate-400 italic leading-relaxed">
                        <AlertCircle size={10} className="inline-block mr-2" />
                        Note technique: Ces corrélations sont basées sur le profilage des habitudes de vie et ne constituent pas des preuves de causalité directe.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default SectionDetailPanel;
