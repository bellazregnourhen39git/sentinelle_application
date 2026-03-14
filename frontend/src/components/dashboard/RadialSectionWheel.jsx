import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const SECTION_GROUPS = {
    'Profile': { color: '#7F77DD', sections: ['A', 'B'] },
    'Addiction': { color: '#D85A30', sections: ['C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P'] },
    'Lifestyle': { color: '#EF9F27', sections: ['R', 'S', 'T'] },
    'Social': { color: '#1D9E75', sections: ['U', 'V'] },
    'Awareness': { color: '#378ADD', sections: ['Q', 'Z'] }
};

const ALL_SECTIONS = [
    { id: 'A', name: 'Demographics' }, { id: 'B', name: 'Family' },
    { id: 'C', name: 'Cigarettes' }, { id: 'D', name: 'E-cigarettes' },
    { id: 'E', name: 'Nargileh' }, { id: 'G', name: 'Alcohol' },
    { id: 'H', name: 'Tranquilisers' }, { id: 'I', name: 'Cannabis' },
    { id: 'J', name: 'Cocaine' }, { id: 'K', name: 'Ecstasy' },
    { id: 'L', name: 'Heroin' }, { id: 'M', name: 'Inhalants' },
    { id: 'N', name: 'Substances' }, { id: 'P', name: 'NPS' },
    { id: 'Q', name: 'Perception' }, { id: 'R', name: 'Social Media' },
    { id: 'S', name: 'Video Games' }, { id: 'T', name: 'Gambling' },
    { id: 'U', name: 'Violence' }, { id: 'V', name: 'Stress' },
    { id: 'Z', name: 'Honesty' }
];

const RadialSectionWheel = ({ 
    intensityData = {}, 
    activeSection = null, 
    onSectionClick,
    totalSubmissions = 0
}) => {
    const svgRef = useRef();
    const [hovered, setHovered] = useState(null);
    
    const width = 600;
    const height = 600;
    const outerRadius = 250;
    const innerRadius = 110;
    const cornerRadius = 4;
    const padAngle = 0.03;

    const segments = useMemo(() => {
        const arcCount = ALL_SECTIONS.length;
        const angleStep = (2 * Math.PI) / arcCount;

        return ALL_SECTIONS.map((sec, i) => {
            const groupKey = Object.keys(SECTION_GROUPS).find(key => 
                SECTION_GROUPS[key].sections.includes(sec.id)
            );
            const group = SECTION_GROUPS[groupKey] || { color: '#ccc' };
            
            const intensity = intensityData[sec.id] || 0.1;
            const dynamicOuterRadius = innerRadius + (outerRadius - innerRadius) * intensity;

            return {
                ...sec,
                index: i + 1,
                group: groupKey,
                color: group.color,
                startAngle: i * angleStep,
                endAngle: (i + 1) * angleStep,
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
        .innerRadius(outerRadius + 20)
        .outerRadius(outerRadius + 20);

    return (
        <div className="relative flex items-center justify-center select-none">
            <svg 
                ref={svgRef} 
                width={width} 
                height={height} 
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            >
                <g transform={`translate(${width / 2}, ${height / 2})`}>
                    
                    {/* Pulsing center background */}
                    <motion.circle
                        r={innerRadius - 5}
                        fill="white"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [1, 0.8, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Background Arcs (Ghost segments) */}
                    {segments.map(d => (
                        <path
                            key={`bg-${d.id}`}
                            d={bgArcGenerator(d)}
                            fill={d.color}
                            opacity={0.05}
                        />
                    ))}

                    {/* Data Arcs with Proportional Growth */}
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
                                    stroke={isActive ? 'white' : 'transparent'}
                                    strokeWidth={ isActive ? 4 : 0}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ 
                                        opacity: 1, 
                                        scale: isHovered ? 1.03 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    style={{
                                        filter: isHovered || isActive ? `drop-shadow(0 0 12px ${d.color}66)` : 'none'
                                    }}
                                />

                                {/* Outer Number Labels (1-21) */}
                                <text
                                    transform={`translate(${labelArcGenerator.centroid(d)})`}
                                    dy=".35em"
                                    textAnchor="middle"
                                    className={`text-[10px] font-black ${isActive || isHovered ? 'fill-slate-900' : 'fill-slate-300'}`}
                                >
                                    {d.index}
                                </text>
                            </g>
                        );
                    })}

                    {/* Center Info Panel (Literal Name + Count) */}
                    <foreignObject x="-85" y="-85" width="170" height="170" onClick={() => onSectionClick(null)}>
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 cursor-pointer">
                            <AnimatePresence mode="wait">
                                {hovered ? (
                                    <motion.div
                                        key="hovered"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                            Section {hovered}
                                        </p>
                                        <h3 className="text-sm font-black text-slate-800 leading-tight px-2">
                                            {ALL_SECTIONS.find(s => s.id === hovered)?.name}
                                        </h3>
                                    </motion.div>
                                ) : activeSection ? (
                                    <motion.div
                                        key="active"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-1">
                                            Exploration
                                        </p>
                                        <h3 className="text-2xl font-black text-slate-900 leading-none">
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
                                        <p className="text-xs font-black text-slate-900 mb-1 tracking-tight">
                                            SENTINELLE
                                        </p>
                                        <div className="h-0.5 w-6 bg-brand-600 mb-2 rounded-full"></div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {totalSubmissions}
                                        </p>
                                        <p className="text-[8px] font-black text-slate-300 uppercase italic">
                                            Soumissions
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
