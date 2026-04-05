import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Award, ArrowLeft, Trophy, ChevronRight, Activity, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const RankingsLab = () => {
    const navigate = useNavigate();
    const [rankings, setRankings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                // Fetch the homepage data which includes the national rankings
                const res = await api.get('homepage/', { params: { scope_type: 'national' } });
                setRankings(res.data.rankings);
            } catch (err) {
                console.error("Failed to load rankings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!rankings) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-brand-500/30 selection:text-brand-200">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto p-12">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-[3px] italic hover:bg-white hover:text-slate-950 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Retour Hub Central
                    </button>
                    <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-full border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse glow-brand" />
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Classement National Alpha</span>
                    </div>
                </div>

                <div className="mb-16">
                   <div className="w-20 h-20 rounded-[24px] bg-brand-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative">
                      <Target size={40} className="text-white" />
                      <div className="absolute -inset-2 rounded-[32px] border border-brand-500/30" />
                   </div>
                   <h1 className="text-7xl font-black uppercase tracking-tighter italic mb-4">Classement<br/><span className="text-brand-500">Compétitif</span></h1>
                   <p className="text-slate-400 font-bold max-w-2xl leading-relaxed italic text-lg opacity-80">
                       Analyse comparative de la prévalence des conduites addictives sur l'ensemble du territoire national.
                   </p>
                </div>

                {/* Comprehensive Data Table */}
                <div className="overflow-x-auto rounded-[40px] border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl custom-scrollbar shadow-2xl shadow-slate-900/50 pb-4">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr>
                                <th className="p-8 border-b border-slate-800/80 text-[10px] uppercase font-black tracking-[4px] text-slate-400 italic sticky left-0 bg-slate-950/95 backdrop-blur-md z-20">
                                    Territoire
                                </th>
                                {Object.keys(rankings).map(key => (
                                    <th key={key} className="p-8 border-b border-slate-800/80 text-[10px] uppercase font-black tracking-[3px] text-slate-300 italic whitespace-nowrap">
                                        {rankings[key].label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rankings[Object.keys(rankings)[0]]?.leaderboard.map(r => r.gov_name).sort().map((region, rowIdx) => (
                                <tr key={region} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-8 font-black uppercase text-[12px] tracking-widest text-slate-200 whitespace-nowrap sticky left-0 bg-slate-950/95 group-hover:bg-slate-900 transition-colors z-10 border-r border-slate-800/50 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.2)]">
                                        {region}
                                    </td>
                                    {Object.keys(rankings).map(key => {
                                        const rankIndex = rankings[key].leaderboard.findIndex(r => r.gov_name === region);
                                        const rank = rankIndex + 1;
                                        const rankData = rankings[key].leaderboard[rankIndex];
                                        const prevalence = rankData?.prevalence || 0;
                                        const isTop3 = rank <= 3 && prevalence > 0;
                                        
                                        return (
                                            <td key={key} className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[12px] italic transition-all duration-300 ${isTop3 ? 'bg-brand-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110' : 'bg-slate-900 text-slate-400 border border-slate-800 group-hover:border-brand-500/30'}`}>
                                                        #{rank}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm tabular-nums font-black italic mb-0.5 ${isTop3 ? 'text-white' : 'text-slate-400'}`}>
                                                            {prevalence}%
                                                        </span>
                                                        <span className={`text-[8px] uppercase font-bold tracking-widest ${isTop3 ? 'text-brand-400' : 'text-slate-600'}`}>
                                                            Prév.
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default RankingsLab;
