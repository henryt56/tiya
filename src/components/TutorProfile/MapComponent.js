import React, { useState, useEffect, useRef } from 'react';

const MapComponent = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const initializeMap = async () => {
                const { Map } = await import('mapbox-gl');

                const map = new Map({
                    container: mapRef.current,
                    style: 'mapbox://styles/mapbox/streets-v12', // Replace with your map style
                    center: [-77.0369, 38.9072], // Replace with your desired center coordinates
                    zoom: 12, // Replace with your desired zoom level
                });

                setMap(map);
            };

            if (!map) {
                initializeMap();
            }
        }
    }, [map]);

    return <div ref={mapRef} style={{ height: '400px' }} />;
};

export default MapComponent;