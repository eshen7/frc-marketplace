import React, { useState, useEffect, useCallback } from "react";
import {
  APIProvider,
  Map as GoogleMapGL,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import axiosInstance from "../utils/axiosInstance";

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
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in miles
}

const MarkerWithInfoWindow = ({ 
  location, 
  userLat, 
  userLon, 
  loadingUserCoords, 
  distance, 
  error,
  onMarkerClick 
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const handleMarkerClick = useCallback(() => {
    setInfoWindowShown(isShown => !isShown);
    onMarkerClick(location);
  }, [location, onMarkerClick]);

  const handleClose = useCallback(() => {
    setInfoWindowShown(false);
  }, []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{
          lat: location.formatted_address.latitude,
          lng: location.formatted_address.longitude,
        }}
        onClick={handleMarkerClick}
        title={location.team_name}
      >
        <img 
          src={location.profile_photo} 
          alt={location.team_name} 
          className="w-10 h-10 rounded-full object-cover" 
        />
      </AdvancedMarker>

      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose}>
          <div className="items-center text-center min-w-[120px]">
            <h3 className="font-bold">{location.team_name}</h3>
            <p>{location.team_number}</p>
            <button
              className="mt-1 bg-blue-800 px-2 py-1 rounded-md text-white font-bold
                hover:bg-blue-900 transition-transform duration-100"
              onClick={() => {
                window.location.href = `/profile/frc/${location.team_number}`;
              }}
            >
              Profile
            </button>
            {!loadingUserCoords && userLat != null && userLon != null ? (
              <p className="mt-1">
                {distance && distance != 0
                  ? `${distance} Miles`
                  : distance == 0
                  ? "You"
                  : "Calculating..."}
              </p>
            ) : (
              <p>{error}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapContent = ({ locations, handleMarkerClick, userLat, userLon, loadingUserCoords, distance, error }) => {
  const map = useMap();
  
  return (
    <>
      {locations.map((location, index) => (
        <MarkerWithInfoWindow
          key={index}
          location={location}
          userLat={userLat}
          userLon={userLon}
          loadingUserCoords={loadingUserCoords}
          distance={distance}
          error={error}
          onMarkerClick={handleMarkerClick}
        />
      ))}
    </>
  );
};

const Map = ({ zoom = 10, locations = [] }) => {
  const [activeMarker, setActiveMarker] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [loadingUserCoords, setLoadingUserCoords] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState();
  const [mapCenter, setMapCenter] = useState({
    lat: 32.95747527010932,
    lng: -117.22508357787281,
  });

  const fetchUserCoords = async () => {
    try {
      const response = await axiosInstance.get("/users/self/");
      console.log("response:", response);
      const data = response.data;
      console.log("data:", data);

      if (!data || !data.formatted_address) {
        throw new Error("Address or coordinates not found");
      }

      const { latitude, longitude } = data.formatted_address;
      setUserLat(latitude);
      setUserLon(longitude);
      setMapCenter({ lat: latitude, lng: longitude }); // Set map center to user's location
      setLoadingUserCoords(false);
    } catch (error) {
      console.error("Error fetching User Data:", error);
      setError("Failed to fetch user data. Please reload page and try again.");
      setLoadingUserCoords(false);
    }
  };
  useEffect(() => {
    const checkUserAndFetchCoords = async () => {
      const token = localStorage.getItem("authToken"); // Or wherever you store the token

      if (!token) {
        setError("Log in to display distance"); // Display login message if no user
        setLoadingUserCoords(false);
        return;
      }

      try {
        await fetchUserCoords(); // Fetch user data if a token exists
      } catch (error) {
        console.error("Error initializing user coordinates:", error);
      }
    };

    checkUserAndFetchCoords();
  }, []); // Runs when user auth changes

  const handleMarkerClick = (marker) => {
    // Calculate distance only when marker is clicked
    if (userLat !== null && userLon !== null) {
      const distance = haversine(
        userLat,
        userLon,
        marker.formatted_address.latitude,
        marker.formatted_address.longitude
      );
      setDistance(distance.toFixed(1));
    } else {
      setDistance(null);
    }
  };

  const mapOptions = {
    mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    gestureHandling: "greedy"
  };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
      <div className="h-[500px] flex items-center justify-center mx-auto">
        <GoogleMapGL
          defaultZoom={zoom}
          defaultCenter={mapCenter}
          mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
          options={mapOptions}
          style={{ width: "1000px", height: "500px" }}
        >
          <MapContent
            locations={locations}
            handleMarkerClick={handleMarkerClick}
            userLat={userLat}
            userLon={userLon}
            loadingUserCoords={loadingUserCoords}
            distance={distance}
            error={error}
          />
        </GoogleMapGL>
      </div>
    </APIProvider>
  );
};

export default Map;
