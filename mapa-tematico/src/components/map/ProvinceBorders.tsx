'use client';

import React, { useEffect } from 'react';
import { useMap } from '@/components/ui/map';

export function ProvinceBorders() {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (!map || !isLoaded) return;

        const addBorders = () => {
            // Check if source already exists
            if (map.getSource('provinces-source')) return;

            map.addSource('provinces-source', {
                type: 'geojson',
                data: '/angola_provinces.json'
            });

            // Traceja a linha de Angola (exterior)
            map.addLayer({
                id: 'angola-outline',
                type: 'line',
                source: 'provinces-source',
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 2,
                    'line-opacity': 0.8,
                    'line-dasharray': [2, 2]
                }
            });

            // Traceja as divisões das províncias
            map.addLayer({
                id: 'provinces-fill',
                type: 'fill',
                source: 'provinces-source',
                paint: {
                    'fill-color': 'rgba(255, 255, 255, 0.1)',
                    'fill-outline-color': 'rgba(255, 255, 255, 0.3)'
                }
            });
            
            // Adiciona labels das províncias
            map.addLayer({
                id: 'provinces-labels',
                type: 'symbol',
                source: 'provinces-source',
                layout: {
                    'text-field': ['get', 'shapeName'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 10,
                    'text-transform': 'uppercase',
                    'text-letter-spacing': 0.1,
                    'text-anchor': 'center'
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-opacity': 0.7,
                    'text-halo-color': 'rgba(0,0,0,0.5)',
                    'text-halo-width': 1
                }
            });
        };

        if (map.isStyleLoaded()) {
            addBorders();
        } else {
            map.on('style.load', addBorders);
        }

        return () => {
            if (!map) return;
            try {
                if (map.getLayer('provinces-labels')) map.removeLayer('provinces-labels');
                if (map.getLayer('provinces-fill')) map.removeLayer('provinces-fill');
                if (map.getLayer('angola-outline')) map.removeLayer('angola-outline');
                if (map.getSource('provinces-source')) map.removeSource('provinces-source');
            } catch (e) {
                // Ignore cleanup errors if map is already disposed
            }
        };
    }, [map, isLoaded]);

    return null;
}
