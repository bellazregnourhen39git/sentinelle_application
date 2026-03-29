import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TUNISIA_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "id": 1, "properties": { "name": "Tunis", "base_prev": 45 }, "geometry": { "type": "Polygon", "coordinates": [[[10.1, 36.8], [10.2, 36.8], [10.2, 36.7], [10.1, 36.7], [10.1, 36.8]]] } },
        { "type": "Feature", "id": 2, "properties": { "name": "Sfax", "base_prev": 35 }, "geometry": { "type": "Polygon", "coordinates": [[[10.7, 34.8], [10.8, 34.8], [10.8, 34.7], [10.7, 34.7], [10.7, 34.8]]] } },
        { "type": "Feature", "id": 3, "properties": { "name": "Sousse", "base_prev": 30 }, "geometry": { "type": "Polygon", "coordinates": [[[10.6, 35.8], [10.7, 35.8], [10.7, 35.7], [10.6, 35.7], [10.6, 35.8]]] } },
        { "type": "Feature", "id": 4, "properties": { "name": "Bizerte", "base_prev": 25 }, "geometry": { "type": "Polygon", "coordinates": [[[9.8, 37.3], [9.9, 37.3], [9.9, 37.2], [9.8, 37.2], [9.8, 37.3]]] } },
        { "type": "Feature", "id": 5, "properties": { "name": "Kairouan", "base_prev": 20 }, "geometry": { "type": "Polygon", "coordinates": [[[10.0, 35.7], [10.1, 35.7], [10.1, 35.6], [10.0, 35.6], [10.0, 35.7]]] } },
        { "type": "Feature", "id": 6, "properties": { "name": "Gafsa", "base_prev": 15 }, "geometry": { "type": "Polygon", "coordinates": [[[8.7, 34.4], [8.8, 34.4], [8.8, 34.3], [8.7, 34.3], [8.7, 34.4]]] } },
        { "type": "Feature", "id": 7, "properties": { "name": "Medenine", "base_prev": 40 }, "geometry": { "type": "Polygon", "coordinates": [[[10.4, 33.3], [10.5, 33.3], [10.5, 33.2], [10.4, 33.2], [10.4, 33.3]]] } },
    ]
};

const TunisiaChoropleth = ({ sectionId, intensity = 1.0 }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [hovered, setHovered] = useState(null);
    const [mapReady, setMapReady] = useState(false);

    // Create a deterministic "seed" based on sectionId to vary the map look
    const sectionSeed = (sectionId?.charCodeAt(0) || 0) % 5;

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize map only ONCE
        if (!map.current) {
            try {
                map.current = new maplibregl.Map({
                    container: mapContainer.current,
                    style: 'https://tiles.openfreemap.org/styles/bright',
                    center: [9.5, 34.0],
                    zoom: 5.4,
                    pitch: 20,
                    antialias: true,
                    trackResize: true
                });

                map.current.on('load', () => {
                    setMapReady(true);
                    map.current.addSource('tunisia-govs', { 'type': 'geojson', 'data': TUNISIA_GEOJSON });
                    
                    map.current.addLayer({
                        'id': 'gov-extrusion',
                        'type': 'fill-extrusion',
                        'source': 'tunisia-govs',
                        'paint': {
                            'fill-extrusion-color': '#eff6ff',
                            'fill-extrusion-height': 0,
                            'fill-extrusion-base': 0,
                            'fill-extrusion-opacity': 0.85,
                            'fill-extrusion-color-transition': { duration: 1000 },
                            'fill-extrusion-height-transition': { duration: 1000 }
                        }
                    });

                    // Add interaction handlers once
                    map.current.on('mousemove', 'gov-extrusion', (e) => {
                        if (e.features.length > 0) {
                            const feat = e.features[0];
                            const currentIntensity = map.current.getLayer('gov-extrusion').metadata?.intensity || 1.0;
                            setHovered({
                                name: feat.properties.name,
                                value: (feat.properties.base_prev * currentIntensity).toFixed(1)
                            });
                            map.current.getCanvas().style.cursor = 'pointer';
                        }
                    });

                    map.current.on('mouseleave', 'gov-extrusion', () => {
                        setHovered(null);
                        map.current.getCanvas().style.cursor = '';
                    });

                    // Trigger initial sync
                    syncMapData();
                });
            } catch (err) { console.error(err); }
        } else {
            // Map already exists, just sync properties when intensity/sectionId change
            syncMapData();
        }

        function syncMapData() {
            if (!map.current || !map.current.isStyleLoaded() || !map.current.getLayer('gov-extrusion')) return;

            // Store intensity in metadata for hover calculations
            map.current.setLayerProperty('gov-extrusion', 'metadata', { intensity });

            // Apply a section-specific transform to the base values for visual variety
            const colorVariation = [
                'interpolate',
                ['linear'],
                ['*', ['get', 'base_prev'], intensity],
                5, '#eff6ff',
                15, '#93c5fd',
                30, '#3b82f6',
                50, '#1d4ed8',
                100, '#1e3a8a'
            ];

            const heightVariation = [
                'interpolate',
                ['linear'],
                ['*', ['get', 'base_prev'], intensity],
                0, 2000,
                100, 160000 + (sectionSeed * 15000)
            ];

            map.current.setPaintProperty('gov-extrusion', 'fill-extrusion-color', colorVariation);
            map.current.setPaintProperty('gov-extrusion', 'fill-extrusion-height', heightVariation);

            // Force a small tilt for better 3D effect if intensity is high
            map.current.easeTo({
                pitch: intensity > 1.2 ? 40 : 15,
                duration: 1000,
                essential: true
            });

            map.current.resize();
        }

        return () => {
            // We don't remove the map on every sectionId change to avoid flickering
            // The main Dashboard or parent component handles full unmount
        };
    }, [intensity, sectionId]); 

    // Final cleanup on unmount only
    useEffect(() => {
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full min-h-[400px] rounded-[40px] overflow-hidden bg-white">
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
            
            {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Chargement de la carte...</p>
                    </div>
                </div>
            )}
            
            {/* Legend & Tooltip Overlay */}
            <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl pointer-events-none z-10 transition-all">
                <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest mb-1">
                    Analyse Spatiale : {sectionId}
                </p>
                {hovered ? (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <h4 className="text-xl font-black text-slate-800">{hovered.name}</h4>
                        <p className="text-xs font-bold text-slate-500">Prévalence: <span className="text-brand-600">{hovered.value}%</span></p>
                    </div>
                ) : (
                    <p className="text-xs font-medium text-slate-400 italic">Survolez un gouvernorat</p>
                )}
            </div>

            {/* Gradient Legend */}
            <div className="absolute bottom-6 right-6 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 flex items-center gap-3 z-10">
                <span className="text-[8px] font-black text-slate-400">0%</span>
                <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-[#eff6ff] via-[#2563eb] to-[#1e3a8a]"></div>
                <span className="text-[8px] font-black text-slate-400">MAX</span>
            </div>
        </div>
    );
};

export default TunisiaChoropleth;
