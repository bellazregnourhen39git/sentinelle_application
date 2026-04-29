import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ChevronRight, Loader2, ShieldAlert,
  FlaskConical, Brain, Swords, Link2, ShieldCheck,
  BarChart3, Maximize2, Users, Zap
} from 'lucide-react';
import api from '../../api';

// ─── Severity colours ─────────────────────────────────────────────────────────
const SEV = {
  critical: { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300', badge: 'bg-rose-500', dot: 'bg-rose-400' },
  high:     { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300', badge: 'bg-orange-500', dot: 'bg-orange-400' },
  medium:   { bg: 'bg-amber-500/15',  border: 'border-amber-500/40',  text: 'text-amber-300',  badge: 'bg-amber-500',  dot: 'bg-amber-400' },
};

const RISK_COLOURS = {
  critical: { pill: 'bg-rose-500/20 border-rose-500/50 text-rose-300',  glow: 'shadow-rose-500/20' },
  high:     { pill: 'bg-orange-500/20 border-orange-500/50 text-orange-300', glow: 'shadow-orange-500/20' },
  medium:   { pill: 'bg-amber-500/20 border-amber-500/40 text-amber-300',   glow: 'shadow-amber-500/20' },
  low:      { pill: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', glow: 'shadow-emerald-500/20' },
};

// ─── Type icons ───────────────────────────────────────────────────────────────
const TYPE_ICON = {
  prevalence:   <BarChart3  size={14} />,
  comorbidity:  <FlaskConical size={14} />,
  psychosocial: <Brain      size={14} />,
  violence:     <Swords     size={14} />,
  correlation:  <Link2      size={14} />,
  integrity:    <ShieldCheck size={14} />,
};

// ─── KPI chip ─────────────────────────────────────────────────────────────────
const KpiChip = ({ label, value, color = 'text-white' }) => (
  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-1 min-w-[80px]">
    <span className={`text-2xl font-black tracking-tight ${color}`}>{value}</span>
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] text-center leading-tight">{label}</span>
  </div>
);

// ─── Substance bar ────────────────────────────────────────────────────────────
const SubstanceBar = ({ substance, rate, rank }) => {
  const colors = ['bg-brand-500', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-pink-500'];
  const color = colors[rank] || 'bg-slate-500';
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">{rank + 1}</span>
      <span className="w-28 text-[10px] font-black text-slate-300 uppercase tracking-wide truncate">{substance}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
      <span className="text-xs font-black text-white w-10 text-right">{rate}%</span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const RegionalProfilePanel = ({ govName, isSuperAdmin }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSuperAdmin || !govName) return;
    setLoading(true);
    setData(null);
    setError(null);
    api.get(`stats/regional-profile/${govName}/`)
      .then(r => setData(r.data))
      .catch(() => setError("Impossible de charger le profil régional."))
      .finally(() => setLoading(false));
  }, [govName, isSuperAdmin]);

  if (!isSuperAdmin) return null;

  const riskC  = RISK_COLOURS[data?.risk_level] || RISK_COLOURS.low;
  const top3   = (data?.prevalence || []).filter(p => p.rate > 0).slice(0, 4);
  const concs  = (data?.key_conclusions || []).slice(0, 3);
  const stress = data?.psychometrics?.avg_stress_index ?? '—';
  const viol   = data?.psychometrics?.violence_rate    ?? '—';
  const poly   = data?.poly_drug?.rate_2plus            ?? '—';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={govName}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mt-10 bg-slate-950 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative"
      >
        {/* ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 p-8 lg:p-12">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[3px]">Intelligence Régionale</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                {govName}
              </h2>
            </div>

            {/* Risk badge + submission count */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              {data && (
                <>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-black uppercase tracking-widest shadow-lg ${riskC.pill} ${riskC.glow}`}>
                    <ShieldAlert size={14} />
                    Risque {data.risk_label}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{data.total_submissions}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[3px]">Soumissions</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── States ── */}
          {loading && (
            <div className="h-60 flex flex-col items-center justify-center gap-4 text-slate-600">
              <Loader2 size={28} className="animate-spin text-brand-500" />
              <span className="text-[9px] font-black uppercase tracking-[4px]">Analyse en cours…</span>
            </div>
          )}

          {error && (
            <div className="h-40 flex items-center justify-center text-rose-500 font-bold uppercase tracking-[2px] text-xs">{error}</div>
          )}

          {!loading && !error && data && (
            <div className="space-y-8">

              {/* ── Conclusions ── */}
              {concs.length > 0 ? (
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                    <Zap size={11} className="text-brand-500" /> Ce que nous avons conclu
                  </p>
                  <div className="space-y-3">
                    {concs.map(c => {
                      const s = SEV[c.severity] || SEV.medium;
                      return (
                        <div key={c.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${s.bg} ${s.border}`}>
                          <div className={`mt-0.5 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${s.text}`}>
                            {TYPE_ICON[c.type] || <AlertTriangle size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold leading-snug ${s.text}`}>{c.text}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">{c.detail}</p>
                          </div>
                          <span className={`shrink-0 text-lg font-black ${s.text}`}>{c.stat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <p className="text-sm font-bold text-emerald-300">Aucun signal d'alerte significatif détecté pour ce gouvernorat.</p>
                </div>
              )}

              {/* ── Behavioral KPIs + Substance leaderboard ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* KPIs */}
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                    <Users size={11} className="text-brand-500" /> Indicateurs Comportementaux
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <KpiChip label="Stress PSS-4" value={stress !== '—' ? `${stress}%` : '—'} color={stress > 50 ? 'text-orange-400' : 'text-white'} />
                    <KpiChip label="Violence" value={viol !== '—' ? `${viol}%` : '—'} color={viol > 20 ? 'text-rose-400' : 'text-white'} />
                    <KpiChip label="Poly-conso ≥2" value={poly !== '—' ? `${poly}%` : '—'} color={poly > 15 ? 'text-amber-400' : 'text-white'} />
                  </div>
                </div>

                {/* Substance leaderboard */}
                {top3.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                      <BarChart3 size={11} className="text-brand-500" /> Substances Dominantes
                    </p>
                    <div className="space-y-2.5">
                      {top3.map((p, i) => (
                        <SubstanceBar key={p.substance} substance={p.substance} rate={p.rate} rank={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Expand button ── */}
              <div className="pt-2 flex justify-end">
                <button
                  id={`regional-expand-${govName}`}
                  onClick={() => navigate(`/region/${encodeURIComponent(govName)}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 group"
                >
                  <Maximize2 size={14} />
                  Rapport complet
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegionalProfilePanel;
