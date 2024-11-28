import React, { useState } from 'react'
import { GoogleMap, MarkerF, useJsApiLoader, InfoWindowF } from '@react-google-maps/api'
import axiosInstance from '../utils/axiosInstance';

function haversine(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of Earth in miles

    // Convert latitude and longitude from degrees to radians
    const toRadians = (degree) => (degree * Math.PI) / 180;
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    // Differences in latitude and longitude
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    // Haversine formula
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in miles
}

const Map = ({ center, zoom, locations }) => {
    const [activeMarker, setActiveMarker] = useState(null);
    const [userLat, setUserLat] = useState(null);
    const [userLon, setUserLon] = useState(null);

    const fetchUserCoords = async () => {
        try {
            const response = await axiosInstance.get('/users/self/');
            const data = response.data;

            if (!data || !data.formatted_address) {
                throw new Error('Address or coordinates not found');
            }

            const { latitude, longitude } = data.formatted_address;
            setUserLat(latitude);
            setUserLon(longitude);
        }
        catch (error) {
            console.error('Error fetching User Data:', error);
            throw error; // Rethrow to propagate the error up
        }
    };

    fetchUserCoords();
    // const apiKey = process.env.GOOGLE_API_KEY;
    // const apiKey = "";

    // const { isLoaded } = useJsApiLoader({
    //     googleMapsApiKey: apiKey,
    // });

    // if (!isLoaded) {
    //     return <div>Loading...</div>;
    // }

    const handleMarkerClick = (marker) => {
        if (marker === activeMarker) {
            handleCloseClick();
            return;
        }
        setActiveMarker(marker);
    };

    const handleCloseClick = () => {
        setActiveMarker(null); // Close InfoWindow.
    };

    return (
        <div className=' h-[500px] flex items-center justify-center mx-auto min-w-[500px]'>
            <GoogleMap mapContainerStyle={{ width: '1000px', height: '500px' }} center={center} zoom={zoom}>
                {locations.map((location, index) => (
                    <MarkerF
                        key={index}
                        position={{ lat: location.lat, lng: location.lng }}
                        onClick={() => handleMarkerClick(location)}
                    >
                        {activeMarker == location && (
                            <InfoWindowF position={{ lat: activeMarker.lat, lng: activeMarker.lng }} onCloseClick={handleCloseClick}>
                                <div className='items-center text-center'>
                                    <h3 className='font-bold'>{location.name}</h3>
                                    <p>{location.number}</p>
                                    <button className='mt-1 bg-red-800 px-2 py-1 rounded-md text-white font-bold
                                    hover:bg-red-900 transition-transform duration-100'>
                                        Profile
                                    </button>
                                    <p>{haversine(userLat, userLon, location.lat, location.lng).toFixed(1)} Miles</p>
                                </div>
                            </InfoWindowF>
                        )};
                    </MarkerF>
                ))}
            </GoogleMap>
        </div>
    );
}

export default Map