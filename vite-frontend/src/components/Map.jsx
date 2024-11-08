import React from 'react';
import GoogleMapReact from 'google-map-react';

// Custom marker component
const LocationPin = ({ text }) => (
    <div className="pin">
        <div className="pin-text bg-blue-500 text-white p-2 rounded">
            {text}
        </div>
    </div>
);



const Map = ({ center, zoom, locations }) => {
    //const apiKey = process.env.GOOGLE_API_KEY;
    const apiKey = "";
    return (
        <div className='w-2/3 h-[500px] flex items-center justify-center mx-auto'>
            <GoogleMapReact
                bootstrapURLKeys={{ key: apiKey }}
                defaultCenter={center}
                defaultZoom={zoom}
            >
                {locations.map((location, index) => (
                    <LocationPin
                        key={index}
                        lat={location.lat}
                        lng={location.lng}
                        text={location.name}
                    />
                ))}
            </GoogleMapReact>
        </div>
    );
};

export default Map;