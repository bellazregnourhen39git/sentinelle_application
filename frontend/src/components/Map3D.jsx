import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Maximize, MousePointer2, Info, TrendingUp } from 'lucide-react';

// Simplified GeoJSON for Tunisian Governorates (Centroids and rough bounds for demonstration)
const TUNISIA_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "name": "Tunis", "prevalence": 45 }, "geometry": { "type": "Polygon", "coordinates": [[[10.1, 36.8], [10.2, 36.8], [10.2, 36.7], [10.1, 36.7], [10.1, 36.8]]] } },
        { "type": "Feature", "properties": { "name": "Sfax", "prevalence": 35 }, "geometry": { "type": "Polygon", "coordinates": [[[10.7, 34.8], [10.8, 34.8], [10.8, 34.7], [10.7, 34.7], [10.7, 34.8]]] } },
        { "type": "Feature", "properties": { "name": "Sousse", "prevalence": 30 }, "geometry": { "type": "Polygon", "coordinates": [[[10.6, 35.8], [10.7, 35.8], [10.7, 35.7], [10.6, 35.7], [10.6, 35.8]]] } },
        { "type": "Feature", "properties": { "name": "Bizerte", "prevalence": 25 }, "geometry": { "type": "Polygon", "coordinates": [[[9.8, 37.3], [9.9, 37.3], [9.9, 37.2], [9.8, 37.2], [9.8, 37.3]]] } },
        { "type": "Feature", "properties": { "name": "Kairouan", "prevalence": 20 }, "geometry": { "type": "Polygon", "coordinates": [[[10.0, 35.7], [10.1, 35.7], [10.1, 35.6], [10.0, 35.6], [10.0, 35.7]]] } },
        { "type": "Feature", "properties": { "name": "Gafsa", "prevalence": 15 }, "geometry": { "type": "Polygon", "coordinates": [[[8.7, 34.4], [8.8, 34.4], [8.8, 34.3], [8.7, 34.3], [8.7, 34.4]]] } },
        { "type": "Feature", "properties": { "name": "Medenine", "prevalence": 40 }, "geometry": { "type": "Polygon", "coordinates": [[[10.4, 33.3], [10.5, 33.3], [10.5, 33.2], [10.4, 33.2], [10.4, 33.3]]] } },
    ]
};

const Map3D = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(9.53);
    const [lat] = useState(34.8);
    const [zoom] = useState(5.5);
    const [pitch] = useState(45);
    const [hoveredStateId, setHoveredStateId] = useState(null);

    useEffect(() => {
        if (map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://demotiles.maplibre.org/style.json', // Basic style, can be swapped for premium tiles
            center: [lng, lat],
            zoom: zoom,
            pitch: pitch,
            antialias: true
        });

        map.current.on('load', () => {
            // Add source for governorates
            map.current.addSource('tunisia-govs', {
                'type': 'geojson',
                'data': TUNISIA_GEOJSON
            });

            // 3D Extrusion Layer
            map.current.addLayer({
                'id': 'gov-extrusion',
                'type': 'fill-extrusion',
                'source': 'tunisia-govs',
                'paint': {
                    'fill-extrusion-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'prevalence'],
                        0, '#f0f9ff',
                        20, '#7dd3fc',
                        40, '#0284c7',
                        60, '#0c4a6e'
                    ],
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['get', 'prevalence'],
                        0, 0,
                        60, 50000 // Height in meters reflecting prevalence
                    ],
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 0.85
                }
            });

            // Hover effect layer
            map.current.on('mousemove', 'gov-extrusion', (e) => {
                if (e.features.length > 0) {
                    const name = e.features[0].properties.name;
                    const prev = e.features[0].properties.prevalence;
                    setHoveredStateId({ name, prev });
                    map.current.getCanvas().style.cursor = 'pointer';
                }
            });

            map.current.on('mouseleave', 'gov-extrusion', () => {
                setHoveredStateId(null);
                map.current.getCanvas().style.cursor = '';
            });
        });

        return () => map.current.remove();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in relative">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-3 font-display">
                        Geospatial Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium">3D Data Density Mapping - Tunisia Region</p>
                </div>
                <div className="bg-white border border-slate-200 p-2 rounded-xl flex gap-1 shadow-sm">
                    <button className="p-2 bg-brand-50 text-brand-600 rounded-lg"><Layers size={20} /></button>
                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Maximize size={20} /></button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
                {/* Map Container */}
                <div className="lg:col-span-3 pro-card relative overflow-hidden group">
                    <div ref={mapContainer} className="w-full h-full" />

                    {/* Floating UI Overlay */}
                    <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-2xl space-y-3 pointer-events-none">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <TrendingUp size={12} /> Live Metrics
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-500">Active Monitoring</p>
                            <p className="text-lg font-black text-slate-900 leading-tight">National Density</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-10 left-10 p-4 bg-white rounded-xl shadow-xl border border-slate-100 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prevalence Key</p>
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-brand-100 to-brand-900"></div>
                            <span className="text-[10px] font-bold text-slate-600">Low &rarr; High</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="pro-card p-6 border-l-4 border-l-brand-600">
                        <div className="flex items-center gap-2 text-brand-600 mb-3">
                            <MousePointer2 size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Interactive Feed</span>
                        </div>
                        {hoveredStateId ? (
                            <div className="space-y-2 animate-fade-in">
                                <h4 className="text-2xl font-black text-slate-900">{hoveredStateId.name}</h4>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-black text-brand-600 leading-none">{hoveredStateId.prev}%</span>
                                    <span className="text-xs font-bold text-slate-400 mb-1">PREVALENCE</span>
                                </div>
                                <p className="text-xs text-slate-500 pt-4 leading-relaxed">
                                    Regional density is calculated based on current questionnaire session data normalized across all age groups.
                                </p>
                            </div>
                        ) : (
                            <div className="h-32 flex flex-col items-center justify-center text-center">
                                <Info className="text-slate-200 mb-2" size={24} />
                                <p className="text-sm text-slate-400 font-medium">Hover over a region to inspect density metrics</p>
                            </div>
                        )}
                    </div>

                    <div className="pro-card p-6 bg-slate-900 text-white border-none shadow-brand-100 shadow-2xl">
                        <h4 className="font-bold text-lg mb-4">3D Extrusion Data</h4>
                        <p className="text-slate-400 text-xs leading-relaxed mb-6">
                            Heights represent the <span className="text-brand-400 font-bold italic">intensity</span> of the substance use prevalence detected in specific governorates. High-risk zones are visually identifiable by elevation.
                        </p>
                        <button className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-900/50">
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map3D;
