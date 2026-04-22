import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const SECTION_GROUPS = {
    'Profil': { color: '#0ea5e9', sections: ['A', 'B'] }, // Medical Blue
    'Addiction': { color: '#ef4444', sections: ['C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P'] }, // Signal Red
    'Style de Vie': { color: '#f59e0b', sections: ['R', 'S', 'T'] }, // Alert Amber
    'Social': { color: '#6366f1', sections: ['U', 'V'] }, // Indigo Insight
    'Sensibilisation': { color: '#10b981', sections: ['Q', 'Z'] } // Emerald Health
};

const ALL_SECTIONS = [
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
    
    const width = 650;
    const height = 650;
    const outerRadius = 220;
    const innerRadius = 90;
    const cornerRadius = 8;
    const padAngle = 0.045;

    const segments = useMemo(() => {
        const arcCount = ALL_SECTIONS.length;
        const angleStep = (2 * Math.PI) / arcCount;
        const rotationOffset = -Math.PI / (arcCount * 2); // Shift slightly so segment splits don't align with vertical axis

        return ALL_SECTIONS.map((sec, i) => {
            const groupKey = Object.keys(SECTION_GROUPS).find(key => 
                SECTION_GROUPS[key].sections.includes(sec.id)
            );
            const group = SECTION_GROUPS[groupKey] || { color: '#cbd5e1' };
            
            const intensity = intensityData[sec.id] || 0.15;
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
    }, [intensityData]);

    const arcGenerator = d3.arc()
        .innerRadius(d => d.innerRadius)
        .outerRadius(d => d.outerRadius)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle);

    const bgArcGenerator = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle);

    const labelArcGenerator = d3.arc()
        .innerRadius(outerRadius + 35)
        .outerRadius(outerRadius + 35);

    return (
        <div className="relative flex items-center justify-center select-none animate-clinical-in">
            <svg 
                ref={svgRef} 
                width={width} 
                height={height} 
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            >
                <g transform={`translate(${width / 2}, ${height / 2})`}>
                    
                    {/* Pulsing center background — Crystal Core */}
                    <motion.circle
                        r={innerRadius - 8}
                        fill="white"
                        stroke="#f1f5f9"
                        strokeWidth="1.5"
                        animate={{
                            scale: [1, 1.04, 1],
                            opacity: [0.9, 0.6, 0.9]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* 🔬 Clinical HUD Base */}
                    <motion.circle
                        r={innerRadius - 4}
                        fill="rgba(255, 255, 255, 0.95)"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        className="backdrop-blur-[20px] shadow-2xl shadow-slate-200/50"
                    />

                    {/* Background Arcs — Subtle Skeleton */}
                    {segments.map(d => (
                        <path
                            key={`bg-${d.id}`}
                            d={bgArcGenerator(d)}
                            fill={d.color}
                            opacity={0.06}
                        />
                    ))}

                    {/* Data Visualization Prisms */}
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
                                    strokeWidth={isActive ? 1.5 : 0}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ 
                                        opacity: isHovered || isActive ? 1 : 0.8, 
                                        scale: isHovered ? 1.04 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    style={{
                                        filter: isHovered || isActive ? `drop-shadow(0 8px 16px ${d.color}33)` : 'none'
                                    }}
                                />

                                {/* Frequency Indexer */}
                                <g transform={`translate(${labelArcGenerator.centroid(d)})`}>
                                    <text
                                        transform={(() => {
                                            const midAngle = (d.startAngle + d.endAngle) / 2;
                                            const rotate = (midAngle * 180 / Math.PI);
                                            // Flip the text if it's on the left side to keep it upright
                                            const finalRotate = (rotate > 90 && rotate < 270) ? rotate + 180 : rotate;
                                            return `rotate(${finalRotate})`;
                                        })()}
                                        dy=".35em"
                                        textAnchor="middle"
                                        className={`text-[9px] font-black uppercase transition-all duration-300 ${isActive ? 'fill-slate-900 scale-110' : isHovered ? 'fill-slate-900 scale-105' : 'fill-slate-500 opacity-80'}`}
                                    >
                                        {d.id} - {d.name}
                                    </text>
                                </g>
                            </g>
                        );
                    })}

                    {/* 💠 HUD Content — High Contrast Crystal */}
                    <foreignObject x="-75" y="-75" width="150" height="150" onClick={() => onSectionClick(null)}>
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 cursor-pointer overflow-visible">
                            <AnimatePresence mode="wait">
                                {hovered ? (
                                    <motion.div
                                        key="hovered"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[3px] text-brand-600 mb-2 italic leading-none opacity-80">
                                            SECTION {hovered}
                                        </p>
                                        <h3 className="text-[14px] font-black text-slate-900 leading-tight uppercase tracking-tighter px-2 italic">
                                            {ALL_SECTIONS.find(s => s.id === hovered)?.name}
                                        </h3>
                                    </motion.div>
                                ) : activeSection ? (
                                    <motion.div
                                        key="active"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[4px] text-brand-500 mb-2 italic opacity-60">
                                            VECTEUR
                                        </p>
                                        <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter italic">
                                            {activeSection}
                                        </h3>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="default"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <p className="text-[11px] font-black text-brand-500 mb-3 tracking-[8px] uppercase italic opacity-70">
                                            COHORTE
                                        </p>
                                        <div className="h-[2px] w-10 bg-brand-500 mb-5 rounded-full shadow-sm opacity-20"></div>
                                        <p className="text-4xl font-black text-slate-900 tabular-nums leading-none italic tracking-tighter shadow-sm shadow-brand-100">
                                            {totalSubmissions}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mt-3 opacity-80">
                                            Total
                                        </p>
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
