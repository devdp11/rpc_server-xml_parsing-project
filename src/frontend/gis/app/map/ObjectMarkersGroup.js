"use client";
import React, { useEffect, useState } from 'react';
import { LayerGroup, useMap } from 'react-leaflet';
import { ObjectMarker } from "./ObjectMarker";
import useAPI from '../Hooks/useAPI';

function ObjectMarkersGroup() {
    const map = useMap();
    const [geom, setGeom] = useState([]);
    const [bounds, setBounds] = useState(map.getBounds());
    const api = useAPI();

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
            const apiData = await api.GET('/markers');

            /* console.log("API Data:", apiData); */

            setGeom(apiData.map(data => ({
                type: "feature",
                geometry: {
                    type: "Point",
                    coordinates: data.geometry.coordinates,
                },
                properties: {
                    id: data.properties.id,
                    country: data.properties.country,
                    name: data.properties.name,
                    imgUrl: "https://cdn-icons-png.flaticon.com/512/805/805401.png",
                }
            })));
        } catch (error) {
            console.error("Error fetching data from API:", error);
        }
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
