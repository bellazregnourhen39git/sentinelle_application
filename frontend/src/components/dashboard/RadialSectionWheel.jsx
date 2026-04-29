import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import EditableLabel from './EditableLabel';

const SECTION_GROUPS = {
    'Profil': { color: '#0ea5e9', banner: '/banners/profile.png', sections: ['A', 'B'] },
    'Addiction': { color: '#ef4444', banner: '/banners/addiction.png', sections: ['C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P'] },
    'Style de Vie': { color: '#f59e0b', banner: '/banners/digital.png', sections: ['R', 'S', 'T'] },
    'Social': { color: '#6366f1', banner: '/banners/digital.png', sections: ['U', 'V'] },
    'Sensibilisation': { color: '#10b981', banner: '/banners/profile.png', sections: ['Q', 'Z'] }
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
    totalSubmissions = 0
}) => {
    const svgRef = useRef();
    const [hovered, setHovered] = useState(null);
    
    // Dynamic Section Detection
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
    const innerRadius = 100; // Slightly larger for images
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
            const group = SECTION_GROUPS[groupKey] || { color: '#cbd5e1', banner: '/banners/profile.png' };
            
            const intensity = intensityData[sec.id] || 0.15;
            const dynamicOuterRadius = innerRadius + (outerRadius - innerRadius) * intensity;

            return {
                ...sec,
                index: i + 1,
                group: groupKey,
                color: group.color,
                banner: group.banner,
                startAngle: (i * angleStep) + rotationOffset,
                endAngle: ((i + 1) * angleStep) + rotationOffset,
                innerRadius,
                outerRadius: dynamicOuterRadius,
                maxOuterRadius: outerRadius
            };
        });
    }, [intensityData, dynamicSections]);

    // ... (Keep existing arc generators)
    const arcGenerator = d3.arc().innerRadius(d => d.innerRadius).outerRadius(d => d.outerRadius).cornerRadius(cornerRadius).padAngle(padAngle);
    const bgArcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius).padAngle(padAngle);
    const labelArcGenerator = d3.arc().innerRadius(outerRadius + 25).outerRadius(outerRadius + 25);

    const activeBanner = useMemo(() => {
        const target = hovered || activeSection;
        if (!target) return null;
        const seg = segments.find(s => s.id === target);
        return seg?.banner;
    }, [hovered, activeSection, segments]);

    return (
        <div className="relative flex items-center justify-center select-none animate-clinical-in">
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <defs>
                    <clipPath id="centerClip">
                        <circle cx="0" cy="0" r={innerRadius - 2} />
                    </clipPath>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <g transform={`translate(${width / 2}, ${height / 2})`}>
                    
                    {/* Background Skeleton */}
                    {segments.map(d => (
                        <path key={`bg-${d.id}`} d={bgArcGenerator(d)} fill={d.color} opacity={0.06} />
                    ))}

                    {/* Data Prisms */}
                    {segments.map(d => {
                        const isHovered = hovered === d.id;
                        const isActive = activeSection === d.id;
                        
                        return (
                            <g key={d.id} className="cursor-pointer" 
                                onMouseEnter={() => setHovered(d.id)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onSectionClick(d.id)}>
                                
                                <motion.path
                                    d={arcGenerator(d)}
                                    fill={d.color}
                                    stroke={isActive ? '#0f172a' : 'transparent'}
                                    strokeWidth={isActive ? 2 : 0}
                                    animate={{ 
                                        opacity: isHovered || isActive ? 1 : 0.7, 
                                        scale: isHovered ? 1.05 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                />

                                <g transform={`translate(${labelArcGenerator.centroid(d)})`}>
                                    <text
                                        transform={(() => {
                                            const midAngle = (d.startAngle + d.endAngle) / 2;
                                            const rotate = (midAngle * 180 / Math.PI);
                                            const finalRotate = (rotate > 90 && rotate < 270) ? rotate + 180 : rotate;
                                            return `rotate(${finalRotate})`;
                                        })()}
                                        dy=".35em" textAnchor="middle"
                                        className={`text-[10px] font-black transition-all duration-300 ${isActive ? 'fill-slate-900 scale-125' : isHovered ? 'fill-slate-900 scale-110' : 'fill-slate-400 opacity-60'}`}
                                    >
                                        {d.id}
                                    </text>
                                </g>
                            </g>
                        );
                    })}

                    {/* 📸 Center Visual Hub */}
                    <g clipPath="url(#centerClip)">
                        <circle r={innerRadius - 4} fill="#f8fafc" />
                        <AnimatePresence mode="wait">
                            {activeBanner && (
                                <motion.image
                                    key={activeBanner}
                                    href={activeBanner}
                                    x={-(innerRadius)} y={-(innerRadius)}
                                    width={innerRadius * 2} height={innerRadius * 2}
                                    preserveAspectRatio="xMidYMid slice"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 0.4, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                />
                            )}
                        </AnimatePresence>
                        
                        <circle r={innerRadius - 4} fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.3" />
                    </g>

                    {/* HUD Labels */}
                    <foreignObject x="-85" y="-85" width="170" height="170" onClick={() => onSectionClick(null)}>
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 cursor-pointer">
                            <AnimatePresence mode="wait">
                                {hovered ? (
                                    <motion.div key="hover" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                                        <p className="text-[9px] font-black uppercase tracking-[3px] text-brand-600 mb-1 italic opacity-80">SECTION {hovered}</p>
                                        <h3 className="text-[13px] font-black text-slate-900 leading-tight uppercase tracking-tighter italic">
                                            {dynamicSections.find(s => s.id === hovered)?.name}
                                        </h3>
                                    </motion.div>
                                ) : activeSection ? (
                                    <motion.div key="active" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                        <p className="text-[10px] font-black uppercase tracking-[4px] text-brand-500 mb-1 italic opacity-60">VECTEUR</p>
                                        <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter italic">{activeSection}</h3>
                                    </motion.div>
                                ) : (
                                    <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                                        <p className="text-[11px] font-black text-brand-500 mb-2 tracking-[6px] uppercase italic opacity-70">COHORTE</p>
                                        <p className="text-4xl font-black text-slate-900 tabular-nums leading-none italic tracking-tighter">{totalSubmissions}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </foreignObject>
                </g>
            </svg>
        </div>
    );
};

export default RadialSectionWheel;
