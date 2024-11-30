import React, { useState, useEffect } from 'react'
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

const Map = ({ zoom, locations }) => {
    const [activeMarker, setActiveMarker] = useState(null);
    const [userLat, setUserLat] = useState(null);
    const [userLon, setUserLon] = useState(null);
    const [loadingUserCoords, setLoadingUserCoords] = useState(true); // Added loading state
    const [error, setError] = useState(null);
    const [distance, setDistance] = useState();
    const [mapCenter, setMapCenter] = useState({ lat: 32.95747527010932, lng: -117.22508357787281 });

    const fetchUserCoords = async () => {
        try {
            const response = await axiosInstance.get('/users/self/');
            console.log("response:", response)
            const data = response.data;
            console.log("data:", data)

            if (!data || !data.formatted_address) {
                throw new Error('Address or coordinates not found');
            }

            const { latitude, longitude } = data.formatted_address;
            setUserLat(latitude);
            setUserLon(longitude);
            setMapCenter({ lat: latitude, lng: longitude }); // Set map center to user's location
            setLoadingUserCoords(false);
        }
        catch (error) {
            console.error('Error fetching User Data:', error);
            setError('Failed to fetch user data. Please reload page and try again.');
            setLoadingUserCoords(false);
        }
    };
    useEffect(() => {
        const checkUserAndFetchCoords = async () => {
            const token = localStorage.getItem('authToken'); // Or wherever you store the token

            if (!token) {
                setError('Log in to display distance'); // Display login message if no user
                setLoadingUserCoords(false);
                return;
            }

            try {
                await fetchUserCoords(); // Fetch user data if a token exists
            } catch (error) {
                console.error('Error initializing user coordinates:', error);
            }
        };

        checkUserAndFetchCoords();
    }, []); // Runs when user auth changes

    const handleMarkerClick = (marker) => {
        if (marker === activeMarker) {
            handleCloseClick();
            return;
        }

        // Calculate distance only when marker is clicked
        if (userLat !== null && userLon !== null) {
            const distance = haversine(
                userLat,
                userLon,
                marker.formatted_address.latitude,
                marker.formatted_address.longitude
            );
            setDistance(distance.toFixed(1)); // Set the calculated distance
        } else {
            setDistance(null);
        }

        setActiveMarker(marker);
    };

    const handleCloseClick = () => {
        setActiveMarker(null); // Close InfoWindow.
        setDistance(null); // Clear distance when InfoWindow is closed
    };

    return (
        <div className=' h-[500px] flex items-center justify-center mx-auto min-w-[500px]'>
            <GoogleMap
                mapContainerStyle={{ width: '1000px', height: '500px' }}
                //center={(userLat && userLon) ? ({ lat: userLat, lng: userLon }) : ({ lat: 32.95747527010932, lng: -117.22508357787281 })}
                center={mapCenter}
                zoom={zoom}>
                {locations.map((location, index) => (
                    <MarkerF
                        key={index}
                        position={{ lat: location.formatted_address.latitude, lng: location.formatted_address.longitude }}
                        onClick={() => handleMarkerClick(location)}
                    >
                        {activeMarker == location && (
                            <InfoWindowF
                                position={{ lat: activeMarker.formatted_address.latitude, lng: activeMarker.formatted_address.longitude }}
                                onCloseClick={handleCloseClick}>
                                <div className='items-center text-center min-w-[120px]'>
                                    <h3 className='font-bold'>{location.team_name}</h3>
                                    <p>{location.team_number}</p>
                                    <button className='mt-1 bg-red-800 px-2 py-1 rounded-md text-white font-bold
                                    hover:bg-red-900 transition-transform duration-100'>
                                        Profile
                                    </button>
                                    {!loadingUserCoords && userLat != null && userLon != null ? (
                                        <p className='mt-1'>
                                            {distance && distance != 0 ? (
                                                `${distance} Miles`
                                            ) : distance == 0 ? (
                                                'You'
                                            ) : (
                                                'Calculating...'
                                            )}
                                        </p>
                                    ) : (
                                        <p>{error}</p>
                                    )}
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