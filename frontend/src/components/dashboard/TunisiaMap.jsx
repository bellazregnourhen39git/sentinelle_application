import React, { useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, Users, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

// Using Highcharts robust Tunisia GeoJSON with 24 governorates
const GEOJSON_URL = '/tunisia.geojson';

// hc-key → backend DB governorate name (100% Exact mapping)
const GEO_TO_BACKEND = {
    'tn-4431': 'Ariana', 'tn-sf': 'Sfax', 'tn-me': 'Mednine', 'tn-to': 'Tozeur',
    'tn-mn': 'Mannouba', 'tn-bj': 'Beja', 'tn-ba': 'Ben Arous', 'tn-bz': 'Bizerte',
    'tn-je': 'Jandouba', 'tn-nb': 'Nabeul', 'tn-tu': 'Tunis', 'tn-kf': 'Le kef',
    'tn-ks': 'Kasserine', 'tn-gb': 'Gabes', 'tn-gf': 'Gafsa', 'tn-sz': 'Sidi Bouzid',
    'tn-sl': 'Siliana', 'tn-mh': 'Mahdia', 'tn-ms': 'Monastir', 'tn-kr': 'Kairouan',
    'tn-ss': 'Sousse', 'tn-za': 'Zaghouan', 'tn-kb': 'Kebili', 'tn-ta': 'Tataouine'
};

// French display labels per backend name
const DISPLAY = {
    Tunis: 'Tunis', Ariana: 'Ariana', 'Ben Arous': 'Ben Arous',
    Mannouba: 'Manouba', Nabeul: 'Nabeul', Zaghouan: 'Zaghouan',
    Bizerte: 'Bizerte', Beja: 'Béja', Jandouba: 'Jendouba',
    'Le kef': 'Le Kef', Siliana: 'Siliana', Sousse: 'Sousse',
    Monastir: 'Monastir', Mahdia: 'Mahdia', Sfax: 'Sfax',
    Kairouan: 'Kairouan', Kasserine: 'Kasserine',
    'Sidi Bouzid': 'Sidi Bouzid', Gabes: 'Gabès', Mednine: 'Médenine',
    Tataouine: 'Tataouine', Gafsa: 'Gafsa', Tozeur: 'Tozeur', Kebili: 'Kébili',
};

const W = 380;
const H = 580;

// --- Prismatic color scale: soft slate → vibrant medical blue ---
function buildColorScale(data) {
    if (!data) return null;
    const vals = Object.values(data).map(d => d?.prevalence ?? 0).filter(v => v > 0);
    if (!vals.length) return null;
    return d3.scaleSequential()
        .domain([0, Math.max(...vals)])
        .interpolator(d3.interpolate('#eef2ff', '#4338ca')); // indigo-50 to indigo-700 for premium authoritative vibe
}

const TunisiaMap = ({ data, activeSection, currentUser, onRegionSelect }) => {
    const [geoJson, setGeoJson] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
    const [hoveredId, setHoveredId] = useState(null);

    const isSuperAdmin = ['SUPERADMIN', 'NATIONAL'].includes(
        (currentUser?.role ?? '').toUpperCase()
    );
    const adminGov = currentUser?.gouvernorat;

    const load = useCallback(() => {
        setStatus('loading');
        fetch(GEOJSON_URL)
            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(j => { setGeoJson(j); setStatus('ok'); })
            .catch(() => setStatus('error'));
    }, []);

    useEffect(() => { load(); }, [load]);

    // Normalize names for robust mapping (strips accents, etc)
    const normalize = (str) => {
        if (!str) return "";
        return str.normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .trim()
                  .replace(/^(el|le|al)\s+/i, "")
                  .replace(/\s+/g, "");
    };

    const colorScale = useMemo(() => buildColorScale(data), [data]);

    // Build region objects: path, centroid, stats
    const regions = useMemo(() => {
        if (!geoJson) return [];
        const proj = d3.geoIdentity().reflectY(true).fitSize([W, H], geoJson);
        const gen  = d3.geoPath().projection(proj);
        
        // Normalize the input data keys for robust fuzzy matching
        const normalizedData = {};
        if (data) {
            Object.keys(data).forEach(k => {
                normalizedData[normalize(k)] = data[k];
            });
        }
        
        return geoJson.features.map(f => {
            const hcKey = f.properties['hc-key'];
            const backendName = GEO_TO_BACKEND[hcKey] || "Inconnu";
            const displayName = DISPLAY[backendName] || backendName;
            
            let centroid = [0, 0];
            try { centroid = gen.centroid(f); } catch (_) {}
            
            const fuzzyKey = normalize(backendName);
            const stats = normalizedData[fuzzyKey] ?? { submissions: 0, prevalence: 0 };
            return { backendName, displayName, path: gen(f) || '', centroid, stats };
        });
    }, [geoJson, data]);

    const getFill = (r) => {
        if (!isSuperAdmin && adminGov && r.backendName !== adminGov) return '#f1f5f9';
        if (!r.stats.submissions || !colorScale) return '#f1f5f9'; 
        return colorScale(r.stats.prevalence);
    };

    const getOpacity = (r) =>
        (!isSuperAdmin && adminGov && r.backendName !== adminGov) ? 0.3 : 1;

    const canInteract = (r) => isSuperAdmin || r.backendName === adminGov;

    // Hovered region data
    const hoveredRegion = regions.find(r => r.backendName === hoveredId);

    return (
        <div className="relative w-full rounded-[48px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40 animate-clinical-in"
            style={{ background: 'linear-gradient(150deg, #f8fafc 0%, #f1f5f9 100%)', minHeight: 660 }}>

      {/* ── Header ─────────────────────────────────── */}
      <div className="absolute top-8 left-8 z-20 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MapPin size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[12px] font-black text-slate-900 uppercase italic tracking-[2px] leading-none">
                Vecteur Géospatial
            </p>
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[3px] opacity-60">
              24 Gouvernorats · Cohorte 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-slate-100 shadow-sm w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-[1.5px] italic">
            {isSuperAdmin
              ? 'Surveillance Nationale Active'
              : `Secteur : ${adminGov || 'Restreint'}`}
          </span>
        </div>
      </div>

      {/* ── Hover Stats Card ───────────────────────── */}
      <AnimatePresence>
        {hoveredRegion && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 right-2 z-30 bg-white/95 backdrop-blur-2xl rounded-[28px] border border-slate-100 shadow-2xl p-5 min-w-[200px]"
          >
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[4px] italic mb-2">ANALYTICS</p>
            <p className="text-xl font-black text-slate-900 uppercase italic leading-tight mb-4 tracking-tighter">
              {hoveredRegion.displayName}
            </p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Users size={12} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Volume</span>
                </div>
                <span className="text-[12px] font-black text-slate-900 tabular-nums">
                  {hoveredRegion.stats.submissions}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-indigo-50 border border-indigo-100/50">
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-indigo-500" />
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider">Taux</span>
                </div>
                <span className="text-[12px] font-black text-indigo-700 tabular-nums italic">
                  {hoveredRegion.stats.prevalence > 0
                    ? `${hoveredRegion.stats.prevalence}%`
                    : '0%'}
                </span>
              </div>
            </div>
            {canInteract(hoveredRegion) && (
              <div className="mt-4 w-full py-2.5 rounded-xl bg-indigo-50 border border-indigo-100/50 text-center animate-clinical-in">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-tight">
                  Cliquez sur la carte<br/>pour explorer
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map SVG ────────────────────────────────── */}
      <div className="w-full flex items-center justify-center" style={{ padding: '100px 0 80px' }}>
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full border-4 border-slate-50 border-t-indigo-500 animate-spin" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] italic animate-pulse">
                Localisation des Inlets…
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6 text-center px-10">
            <AlertCircle size={40} className="text-rose-400" />
            <p className="text-sm font-black text-slate-500 italic max-w-xs">
              Échec de la synchronisation géospatiale. Protocoles de sécurité corrompus.
            </p>
            <button
              onClick={load}
              className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
            >
              <RefreshCw size={14} /> Récupérer
            </button>
          </div>
        )}

        {status === 'ok' && (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-[85%] max-h-[520px]"
            style={{ overflow: 'visible', filter: 'drop-shadow(0 30px 60px rgba(15,23,42,0.06))' }}
          >
            {regions.map((region) => {
              const hovered  = hoveredId === region.backendName;
              const interact = canInteract(region);
              const fill     = getFill(region);
              const opacity  = getOpacity(region);

              return (
                <g key={region.backendName}>
                  <path
                    d={region.path}
                    fill={fill}
                    fillOpacity={opacity}
                    stroke={hovered ? '#6366f1' : 'rgba(255,255,255,0.8)'}
                    strokeWidth={hovered ? 2 : 0.8}
                    style={{
                      cursor: interact ? 'pointer' : 'default',
                      transition: 'all 0.35s cubic-bezier(0.2, 1, 0.3, 1)',
                      filter: hovered ? 'brightness(1.05)' : 'none',
                    }}
                    onMouseEnter={() => interact && setHoveredId(region.backendName)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => interact && onRegionSelect?.(region.backendName)}
                  />

                  {/* Region label */}
                  {region.centroid[0] > 0 && region.centroid[1] > 0 && (
                    <text
                      x={region.centroid[0]}
                      y={region.centroid[1]}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontSize: hovered ? '9px' : '7px',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 900,
                        fill: hovered ? '#0f172a' : '#64748b',
                        opacity: opacity,
                        paintOrder: 'stroke',
                        stroke: 'white',
                        strokeWidth: '4px',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        pointerEvents: 'none',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s ease',
                        fontStyle: 'italic'
                      }}
                    >
                      {region.displayName}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* ── Legend ─────────────────────────────────── */}
      {status === 'ok' && (
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
          <div className="flex items-center gap-6 p-4 bg-white/40 backdrop-blur-md rounded-[24px] border border-slate-100/50">
            {[
              { color: '#f8fafc', label: 'Zéro' },
              { color: '#c7d2fe', label: 'Bas' },    // indigo-200
              { color: '#818cf8', label: 'Modéré' }, // indigo-400
              { color: '#4f46e5', label: 'Dense' },  // indigo-600
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-md shadow-sm border border-white" style={{ backgroundColor: item.color }} />
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-[1px]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-500 rounded-full shadow-xl shadow-indigo-500/20 border border-indigo-400/30">
            <Target size={14} className="text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-[2px] italic">
              {activeSection ? `SECTION ${activeSection}` : 'DENSITÉ GLOBALE'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TunisiaMap;
