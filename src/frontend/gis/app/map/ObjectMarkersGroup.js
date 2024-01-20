"use client";
import React, { useEffect, useState } from 'react';
import { LayerGroup, useMap } from 'react-leaflet';
import { ObjectMarker } from "./ObjectMarker";
import useAPI from '../Hooks/useAPI';

function ObjectMarkersGroup() {
    const map = useMap();
    const [geom, setGeom] = useState([]);
    const [bounds, setBounds] = useState(map.getBounds());
    const {GET} = useAPI();

    useEffect(() => {
        const cb = () => {
            setBounds(map.getBounds());
        }
        map.on('moveend', cb);

        return () => {
            map.off('moveend', cb);
        }
    }, [map]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const apiData = await GET('/markers');
    
            const geomData = apiData.map(data => ({
                type: "feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        addRandomDeviation(data.geometry.coordinates[0]),
                        addRandomDeviation(data.geometry.coordinates[1]),
                    ],
                },
                properties: {
                    id: data.properties.id,
                    country: data.properties.country,
                    name: data.properties.name,
                    imgUrl: "https://cdn-icons-png.flaticon.com/512/3774/3774278.png",
                }
            }));
    
            setGeom(geomData);
        } catch (error) {
            console.error("Error fetching data from API:", error);
        }
    };

    const addRandomDeviation = (coordinate) => {
        const deviation = (Math.random() - 0.5) * 0.5;
        return coordinate + deviation;
    };

    return (
        <LayerGroup>
            {
                geom.map(geoJSON => <ObjectMarker key={geoJSON.properties.id} geoJSON={geoJSON} />)
            }
        </LayerGroup>
    );
}

export default ObjectMarkersGroup;
