import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import {
  ArrowLeft, AlertTriangle, ShieldAlert, ShieldCheck,
  BarChart3, Brain, Swords, Link2, FlaskConical,
  Users, MapPin, Loader2, Activity, Eye
} from 'lucide-react';
import api from '../api';

// ─── Colour maps ──────────────────────────────────────────────────────────────
const SEV = {
  critical: { bg: 'bg-rose-500/15',   border: 'border-rose-500/40',   text: 'text-rose-300',   badge: 'bg-rose-500' },
  high:     { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300', badge: 'bg-orange-500' },
  medium:   { bg: 'bg-amber-500/15',  border: 'border-amber-500/40',  text: 'text-amber-300',  badge: 'bg-amber-500' },
};
const RISK_PILL = {
  critical: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
  high:     'bg-orange-500/20 border-orange-500/50 text-orange-300',
  medium:   'bg-amber-500/20 border-amber-500/40 text-amber-300',
  low:      'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
};
const TYPE_ICON = {
  prevalence:   <BarChart3  size={15} />,
  comorbidity:  <FlaskConical size={15} />,
  psychosocial: <Brain      size={15} />,
  violence:     <Swords     size={15} />,
  correlation:  <Link2      size={15} />,
  integrity:    <ShieldCheck size={15} />,
};
const BAR_COLORS = ['#7C6FF7', '#3B82F6', '#8B5CF6', '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#F97316', '#14B8A6'];

// ─── SubSection title ─────────────────────────────────────────────────────────
const SectionTitle = ({ icon, label }) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="text-brand-400">{icon}</div>
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">{label}</h3>
  </div>
);

// ─── Network graph component ──────────────────────────────────────────────────
const NetworkGraph = ({ nodes, links }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes?.length || !svgRef.current) return;
    const W = 560, H = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    const glow = defs.append('filter').attr('id', 'glow-dd');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const ns = nodes.map(d => Object.create(d));
    const ls = links.map(d => Object.create(d));

    const sim = d3.forceSimulation(ns)
      .force('link', d3.forceLink(ls).id(d => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide().radius(44));

    const link = svg.append('g').selectAll('line').data(ls).join('line')
      .attr('stroke', '#475569').attr('stroke-opacity', 0.5)
      .attr('stroke-width', d => Math.sqrt(d.value || 1) * 0.8);

    const nodeG = svg.append('g').selectAll('g').data(ns).join('g')
      .call(d3.drag()
        .on('start', (e) => { if (!e.active) sim.alphaTarget(0.3).restart(); e.subject.fx = e.subject.x; e.subject.fy = e.subject.y; })
        .on('drag',  (e) => { e.subject.fx = e.x; e.subject.fy = e.y; })
        .on('end',   (e) => { if (!e.active) sim.alphaTarget(0); e.subject.fx = null; e.subject.fy = null; })
      );

    nodeG.append('circle')
      .attr('r', d => Math.max(14, Math.min(28, (d.val || 1) * 2.2)))
      .attr('fill', d => d.group === 1 ? '#7C6FF7' : '#F43F5E')
      .attr('filter', 'url(#glow-dd)')
      .attr('stroke', '#0f172a').attr('stroke-width', 2);

    nodeG.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', d => Math.max(14, Math.min(28, (d.val || 1) * 2.2)) + 14)
      .attr('fill', '#94A3B8').attr('font-size', '9px').attr('font-weight', '900');

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [nodes, links]);

  if (!nodes?.length) {
    return (
      <div className="h-60 flex flex-col items-center justify-center gap-3 opacity-40">
        <Link2 size={36} className="text-slate-600" />
        <p className="text-[9px] font-black uppercase tracking-[4px] text-slate-600">Données insuffisantes pour la matrice</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg ref={svgRef} width="100%" height="400" viewBox="0 0 560 400" className="overflow-visible" />
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500" /><span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Substance</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Comportement psychosocial</span></div>
      </div>
    </div>
  );
};

// ─── Gauge arc ────────────────────────────────────────────────────────────────
const Gauge = ({ value, label, color = '#7C6FF7' }) => {
  const pct = Math.min(value || 0, 100);
  const r = 40, cx = 56, cy = 56;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ * 0.75;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="112" height="70" viewBox="0 0 112 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round" transform={`rotate(135, ${cx}, ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round" transform={`rotate(135, ${cx}, ${cy})`}
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="900">{pct}%</text>
      </svg>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] text-center">{label}</p>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const RegionalDeepDivePage = () => {
  const { govName } = useParams();
  const navigate    = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const decodedName = decodeURIComponent(govName || '');

  useEffect(() => {
    if (!decodedName) return;
    setLoading(true);
    api.get(`stats/regional-profile/${decodedName}/`)
      .then(r => setData(r.data))
      .catch(() => setError("Impossible de charger le profil régional."))
      .finally(() => setLoading(false));
  }, [decodedName]);

  const riskPill = RISK_PILL[data?.risk_level] || RISK_PILL.low;
  const prevalence = data?.prevalence || [];
  const conclusions = data?.key_conclusions || [];
  const maxRate = prevalence[0]?.rate || 1;

  return (
    <div className="min-h-screen bg-[#030712] text-white font-['Inter',sans-serif]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-colors"
        >
          <ArrowLeft size={18} /> Retour au tableau de bord
        </button>
        <div className="flex items-center gap-3">
          <MapPin size={14} className="text-brand-400" />
          <span className="text-sm font-black uppercase tracking-widest text-white">{decodedName}</span>
          {data && (
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${riskPill}`}>
              Risque {data.risk_label}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-5 text-slate-600">
          <Loader2 size={40} className="animate-spin text-brand-500" />
          <p className="text-[10px] font-black uppercase tracking-[5px]">Extraction du profil régional…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-[60vh] text-rose-500 font-bold text-sm">{error}</div>
      )}

      {!loading && !error && data && (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-14">

          {/* ── Hero ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-brand-400 uppercase tracking-[3px]">Rapport d'Intelligence Régionale</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter">
                  Gouvernorat de <span className="text-brand-400">{decodedName}</span>
                </h1>
                <p className="text-slate-500 mt-2 text-sm">{data.total_submissions} questionnaires analysés · Vague 2026</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
                  <p className="text-3xl font-black">{data.total_submissions}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[2px]">Soumissions</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
                  <p className="text-3xl font-black">{data.prevalence?.filter(p => p.rate > 0).length}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[2px]">Substances actives</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
                  <p className="text-3xl font-black text-amber-400">{data.poly_drug?.rate_2plus}%</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[2px]">Poly-conso ≥2</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Conclusions ── */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SectionTitle icon={<Eye size={14} />} label="Ce que nous avons conclu" />
            {conclusions.length === 0 ? (
              <div className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <ShieldCheck size={20} className="text-emerald-400" />
                <p className="font-bold text-emerald-300">Aucun signal d'alerte significatif détecté pour ce gouvernorat.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {conclusions.map((c, i) => {
                  const s = SEV[c.severity] || SEV.medium;
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                      className={`flex items-start gap-4 p-5 rounded-2xl border ${s.bg} ${s.border}`}>
                      <div className={`mt-0.5 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 ${s.text}`}>
                        {TYPE_ICON[c.type] || <AlertTriangle size={15} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold leading-snug ${s.text}`}>{c.text}</p>
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">{c.detail}</p>
                      </div>
                      <div className={`shrink-0 text-2xl font-black ${s.text}`}>{c.stat}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* ── Gauges + Substances ── */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Behavioural gauges */}
            <div className="bg-white/4 border border-white/8 rounded-[32px] p-8">
              <SectionTitle icon={<Brain size={14} />} label="Indicateurs Comportementaux" />
              <div className="flex justify-around">
                <Gauge value={data.psychometrics?.avg_stress_index} label="Stress PSS-4" color="#F59E0B" />
                <Gauge value={data.psychometrics?.violence_rate}    label="Violence" color="#F43F5E" />
                <Gauge value={data.psychometrics?.honesty_score}    label="Honnêteté" color="#10B981" />
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white/4 border border-white/8 rounded-[32px] p-8">
              <SectionTitle icon={<Users size={14} />} label="Démographie" />
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-black mb-1">
                    <span className="text-blue-400">Garçons · {data.demographics?.gender?.male_pct ?? '—'}%</span>
                    <span className="text-pink-400">Filles · {data.demographics?.gender?.female_pct ?? '—'}%</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
                    <div className="bg-blue-500 h-full" style={{ width: `${data.demographics?.gender?.male_pct || 50}%` }} />
                    <div className="bg-pink-500 h-full flex-1" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">
                  {data.demographics?.gender?.M} garçons · {data.demographics?.gender?.F} filles · Total {data.total_submissions}
                </p>
                {/* Poly-drug breakdown */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-amber-400">{data.poly_drug?.rate_2plus}%</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[2px] mt-1">Poly-conso ≥2</p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-rose-400">{data.poly_drug?.rate_3plus}%</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[2px] mt-1">Poly-conso ≥3</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Full prevalence ── */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <SectionTitle icon={<BarChart3 size={14} />} label="Matrice de Prévalence Complète" />
            <div className="bg-white/4 border border-white/8 rounded-[32px] p-8 space-y-4">
              {prevalence.map((p, i) => (
                <div key={p.substance} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">{i + 1}</span>
                  <span className="w-32 text-[10px] font-black text-slate-300 uppercase tracking-wide shrink-0">{p.substance}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(p.rate / maxRate) * 100}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-black text-white">{p.rate}%</span>
                    <span className="text-[9px] text-slate-500 block">{p.count} cas</span>
                  </div>
                </div>
              ))}
              {prevalence.filter(p => p.rate === 0).length === prevalence.length && (
                <p className="text-slate-500 text-sm text-center py-4">Aucune donnée de consommation disponible.</p>
              )}
            </div>
          </motion.section>

          {/* ── Network ── */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <SectionTitle icon={<Activity size={14} />} label="Cartographie des Corrélations" />
            <div className="bg-white/4 border border-white/8 rounded-[32px] p-8">
              <p className="text-[10px] text-slate-500 font-bold mb-6">
                Chaque lien représente une co-occurrence statistique entre deux comportements.
                Plus la ligne est épaisse, plus la corrélation est fréquente.
              </p>
              <NetworkGraph nodes={data.network?.nodes} links={data.network?.links} />
            </div>
          </motion.section>

        </div>
      )}
    </div>
  );
};

export default RegionalDeepDivePage;
