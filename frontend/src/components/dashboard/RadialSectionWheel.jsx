import React, { useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion as Motion } from 'framer-motion';
import EditableLabel from './EditableLabel';

const SECTION_GROUPS = {
    'Profil': { color: '#0ea5e9', sections: ['A', 'B'] },
    'Addiction': { color: '#ef4444', sections: ['C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P'] },
    'Style de Vie': { color: '#f59e0b', sections: ['R', 'S', 'T'] },
    'Social': { color: '#6366f1', sections: ['U', 'V'] },
    'Sensibilisation': { color: '#10b981', sections: ['Q', 'Z'] }
};

const renderSectionIcon = (sectionId, color = '#64748b', size = 46) => {
    const commonProps = { width: size, height: size, viewBox: '0 0 64 64', fill: 'none' };

    const iconMap = {
        A: (
            <svg {...commonProps} aria-label="Profil" role="img">
                <circle cx="32" cy="24" r="10" stroke={color} strokeWidth="4" />
                <path d="M16 50c2.5-9 10.2-14 16-14s13.5 5 16 14" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        B: (
            <svg {...commonProps} aria-label="Famille" role="img">
                <path d="M18 28L32 16l14 12v18H18z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M26 46V34h12v12" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        C: (
            <svg {...commonProps} aria-label="Tabac" role="img">
                <path d="M20 34h18" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M24 20c4 0 6 4 8 8 2 4 4 8 8 8" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <circle cx="20" cy="34" r="4" fill={color} />
            </svg>
        ),
        D: (
            <svg {...commonProps} aria-label="Vapotage" role="img">
                <rect x="18" y="20" width="28" height="18" rx="8" stroke={color} strokeWidth="4" />
                <path d="M24 28h16" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <circle cx="28" cy="28" r="3" fill={color} />
            </svg>
        ),
        E: (
            <svg {...commonProps} aria-label="Narguilé" role="img">
                <path d="M20 22c0-4 3-7 7-7h6c4 0 7 3 7 7v8c0 6-5 10-10 10s-10-4-10-10z" stroke={color} strokeWidth="4" />
                <path d="M26 20v16" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M38 20v16" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        G: (
            <svg {...commonProps} aria-label="Alcool" role="img">
                <path d="M24 18h16l-2 10c-.6 3-3 5-6 5s-5.4-2-6-5L24 18z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M28 34v8m8-8v8" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        H: (
            <svg {...commonProps} aria-label="Médicament" role="img">
                <rect x="18" y="16" width="28" height="32" rx="8" stroke={color} strokeWidth="4" />
                <path d="M32 24v16M24 32h16" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        I: (
            <svg {...commonProps} aria-label="Cannabis" role="img">
                <path d="M20 20c8-4 16-4 24 0-8 6-16 6-24 0z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M20 44c8-6 16-6 24 0" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M32 16v24" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        J: (
            <svg {...commonProps} aria-label="Cocaïne" role="img">
                <path d="M24 20h16v24H24z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M28 24h8" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        K: (
            <svg {...commonProps} aria-label="Ecstasy" role="img">
                <path d="M24 18h16l-8 10 8 10H24l8-10-8-10z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
            </svg>
        ),
        L: (
            <svg {...commonProps} aria-label="Héroïne" role="img">
                <path d="M20 24c0-4 3-7 7-7h6c4 0 7 3 7 7v16H20z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M24 28h12" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        M: (
            <svg {...commonProps} aria-label="Inhalants" role="img">
                <path d="M20 18h24" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M24 18v28" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M32 18v28" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M40 18v28" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        N: (
            <svg {...commonProps} aria-label="NPS" role="img">
                <circle cx="32" cy="32" r="14" stroke={color} strokeWidth="4" />
                <path d="M24 24l16 16M40 24L24 40" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        P: (
            <svg {...commonProps} aria-label="Drogue de synthèse" role="img">
                <path d="M22 20h20l-10 24z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M22 44h20" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        Q: (
            <svg {...commonProps} aria-label="Perception" role="img">
                <circle cx="32" cy="32" r="12" stroke={color} strokeWidth="4" />
                <path d="M24 24l16 16M24 40l16-16" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        R: (
            <svg {...commonProps} aria-label="Réseaux" role="img">
                <rect x="18" y="18" width="28" height="28" rx="8" stroke={color} strokeWidth="4" />
                <path d="M24 24h16" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M24 32h10" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        S: (
            <svg {...commonProps} aria-label="Jeux vidéo" role="img">
                <rect x="18" y="20" width="28" height="24" rx="8" stroke={color} strokeWidth="4" />
                <path d="M24 32h8M28 28v8" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        T: (
            <svg {...commonProps} aria-label="Jeux d’argent" role="img">
                <circle cx="32" cy="32" r="14" stroke={color} strokeWidth="4" />
                <path d="M28 26h8v12h-8z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
            </svg>
        ),
        U: (
            <svg {...commonProps} aria-label="Violence" role="img">
                <path d="M24 16l16 8v12c0 8-5 14-8 16-3-2-8-8-8-16V24z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M28 28h8" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        V: (
            <svg {...commonProps} aria-label="Stress" role="img">
                <path d="M20 40c4-8 8-12 12-12s8 4 12 12" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M24 24c2-4 4-6 8-6s6 2 8 6" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
        Z: (
            <svg {...commonProps} aria-label="Intégrité" role="img">
                <path d="M32 16l12 6v12c0 8-4 14-12 20-8-6-12-12-12-20V22l12-6z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
                <path d="M27 32l3 3 7-8" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        default: (
            <svg {...commonProps} aria-label="Section" role="img">
                <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="4" />
                <circle cx="32" cy="32" r="8" fill={color} />
            </svg>
        )
    };

    return iconMap[sectionId] || iconMap.default;
};

const DEFAULT_SECTIONS = [
    { id: 'A', name: 'Profil' }, { id: 'B', name: 'Famille' },
    { id: 'C', name: 'Cigarettes' }, { id: 'D', name: 'E-cigarettes' },
    { id: 'E', name: 'Narguilé' }, { id: 'G', name: 'Alcool' },
    { id: 'H', name: 'Tranquillisants' }, { id: 'I', name: 'Cannabis' },
    { id: 'J', name: 'Cocaïne' }, { id: 'K', name: 'Extasy' },
    { id: 'L', name: 'Héroïne' }, { id: 'M', name: 'Inhalants' },
    { id: 'N', name: 'Substances' }, { id: 'P', name: 'NPS' },
    { id: 'Q', name: 'Perception' }, { id: 'R', name: 'Réseaux Sociaux' },
    { id: 'S', name: 'Jeux Vidéo' }, { id: 'T', name: 'Jeux de Hasard' },
    { id: 'U', name: 'Violence' }, { id: 'V', name: 'Stress' },
    { id: 'Z', name: 'Intégrité' }
];

const RadialSectionWheel = ({
    intensityData = {},
    activeSection = null,
    onSectionClick,
}) => {
    const svgRef = useRef();
    const [hovered, setHovered] = useState(null);
    const dynamicSections = useMemo(() => {
        const existingIds = new Set(DEFAULT_SECTIONS.map(s => s.id));
        const newSections = Object.keys(intensityData)
            .filter(id => !existingIds.has(id))
            .map(id => ({ id, name: `Section ${id}` }));
        return [...DEFAULT_SECTIONS, ...newSections];
    }, [intensityData]);

    const width = 650;
    const height = 650;
    const outerRadius = 220;
    const innerRadius = 100;
    const cornerRadius = 8;
    const padAngle = 0.045;

    const segments = useMemo(() => {
        const arcCount = dynamicSections.length;
        const angleStep = (2 * Math.PI) / arcCount;
        const rotationOffset = -Math.PI / (arcCount * 2);

        return dynamicSections.map((sec, i) => {
            const groupKey = Object.keys(SECTION_GROUPS).find(key =>
                SECTION_GROUPS[key].sections.includes(sec.id)
            );
            const group = SECTION_GROUPS[groupKey] || { color: '#cbd5e1' };
            const rawIntensity = intensityData?.[sec.id];
            const intensity = rawIntensity != null ? Math.max(0, rawIntensity) : 0;
            const dynamicOuterRadius = innerRadius + (outerRadius - innerRadius) * intensity;

            return {
                ...sec,
                index: i + 1,
                group: groupKey,
                color: group.color,
                startAngle: (i * angleStep) + rotationOffset,
                endAngle: ((i + 1) * angleStep) + rotationOffset,
                innerRadius,
                outerRadius: dynamicOuterRadius,
                maxOuterRadius: outerRadius
            };
        });
    }, [intensityData, dynamicSections]);

    const arcGenerator = d3.arc().innerRadius(d => d.innerRadius).outerRadius(d => d.outerRadius).cornerRadius(cornerRadius).padAngle(padAngle);
    const bgArcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius).padAngle(padAngle);

    const activeSegment = useMemo(() => {
        const target = hovered || activeSection;
        if (!target) return null;
        return segments.find(s => s.id === target);
    }, [hovered, activeSection, segments]);

    const r = innerRadius - 4;

    return (
        <div className="relative flex items-center justify-center select-none animate-clinical-in">
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <defs>
                    <clipPath id="centerClip">
                        <circle cx="0" cy="0" r={r} />
                    </clipPath>
                </defs>

                <g transform={`translate(${width / 2}, ${height / 2})`}>

                    {/* Background skeleton */}
                    {segments.map(d => (
                        <path key={`bg-${d.id}`} d={bgArcGenerator(d)} fill={d.color} opacity={0.18} stroke="white" strokeWidth="0.5" />
                    ))}

                    {/* Data prisms */}
                    {segments.map(d => {
                        const isHovered = hovered === d.id;
                        const isActive = activeSection === d.id;
                        return (
                            <g key={d.id} className="cursor-pointer"
                                onMouseEnter={() => setHovered(d.id)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onSectionClick(d.id)}>
                                <Motion.path
                                    d={arcGenerator(d)}
                                    fill={d.color}
                                    stroke={isActive ? '#0f172a' : 'transparent'}
                                    strokeWidth={isActive ? 2 : 0}
                                    animate={{
                                        opacity: isHovered || isActive ? 1 : 0.7,
                                        scale: isHovered ? 1.05 : 1,
                                    }}
                                    style={{ 
                                        filter: isHovered || isActive ? 'url(#glow)' : 'none',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                />
                                <g transform={`translate(${bgArcGenerator.centroid(d)})`}>
                                    <text
                                        transform={(() => {
                                            const midAngle = (d.startAngle + d.endAngle) / 2;
                                            const rotate = (midAngle * 180 / Math.PI) - 90;
                                            const isLeft = midAngle > Math.PI;
                                            const finalRotate = isLeft ? rotate + 180 : rotate;
                                            return `rotate(${finalRotate})`;
                                        })()}
                                        dy=".35em"
                                        textAnchor="middle"
                                        className={`text-[8px] font-black transition-all duration-300 pointer-events-none ${
                                            isActive || isHovered
                                                ? 'fill-white scale-105 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.35)]'
                                                : 'fill-slate-800 opacity-90'
                                        }`}
                                    >
                                        {d.id} - {d.name}
                                    </text>
                                </g>
                            </g>
                        );
                    })}

                    {/* ── Center Visual Hub ── */}
                    <g clipPath="url(#centerClip)">
                        <circle r={r} fill="#f8fafc" />
                        <Motion.circle
                            r={r}
                            fill={activeSegment ? activeSegment.color : '#cbd5e1'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: activeSegment ? 0.08 : 0.04 }}
                            transition={{ duration: 0.3 }}
                        />
                        <circle r={r} fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.2" />
                    </g>

                    {/* HUD Icon Only */}
                    <foreignObject
                        x={-r + 10} y={-r + 10}
                        width={(r - 10) * 2} height={(r - 10) * 2}
                        onClick={() => onSectionClick(null)}
                    >
                        <div className="w-full h-full flex items-center justify-center p-3 cursor-pointer rounded-full transition-all duration-300">
                            <div className="w-24 h-24 rounded-full border border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md flex items-center justify-center">
                                {activeSegment ? renderSectionIcon(activeSegment.id, activeSegment.color, 42) : renderSectionIcon('default', '#64748b', 40)}
                            </div>
                        </div>
                    </foreignObject>
                </g>
            </svg>
        </div>
    );
};

export default RadialSectionWheel;
