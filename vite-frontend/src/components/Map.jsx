import React, { useState } from 'react'
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api'

const Map = ({ center, zoom, locations }) => {
    const [activeMarker, setActiveMarker] = useState(null);

    // const apiKey = process.env.GOOGLE_API_KEY;
    const apiKey = "";

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: apiKey,
    });

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    const handleActiveMarker = (marker) => {
        if (marker === activeMarker) {
            return;
        }
        setActiveMarker(marker);
    };

    return (
        <div className=' h-[500px] flex items-center justify-center mx-auto min-w-[500px]'>
            <GoogleMap mapContainerStyle={{ width: '1000px', height: '500px' }} center={center} zoom={zoom}>
                {locations.map((location, index) => (
                    <Marker
                        key={index}
                        position={{ lat: location.lat, lng: location.lng }}
                        onClick={() => handleActiveMarker(index)}
                    // label={{
                    //     text: location.name,
                    //     color: "black",
                    //     fontSize: "14px",
                    //     fontWeight: "bold",
                    // }}
                    >
                        {activeMarker === index ? (
                            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                                <div className='items-center text-center'>
                                    <h3 className='font-bold'>{location.name}</h3>
                                    <p>{location.number}</p>
                                    <button className='mt-1 bg-red-800 px-2 py-1 rounded-md text-white font-bold
                                    hover:bg-red-900 transition-transform duration-100'>
                                        Profile
                                    </button>
                                </div>
                            </InfoWindow>
                        ) : null}
                    </Marker>
                ))}
            </GoogleMap>
        </div>
    );
}

export default Map