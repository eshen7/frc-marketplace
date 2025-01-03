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
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";
import ProfilePhoto from "./ProfilePhoto";

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
  onMarkerClick,
  navigate
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
        <ProfilePhoto 
          src={location.profile_photo} 
          teamNumber={location.team_number}
          alt={"Team Logo"} 
          className="w-10 h-10 rounded-md object-cover bg-black" 
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
                navigate(`/profile/frc/${location.team_number}`);
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

const MapContent = ({ locations, handleMarkerClick, userLat, userLon, loadingUserCoords, distance, error, navigate }) => {
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
          navigate={navigate}
        />
      ))}
    </>
  );
};

const Map = ({ zoom = 10, locations = [] }) => {
  const { user, loadingUser, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [loadingUserCoords, setLoadingUserCoords] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState();
  const [initialCenter, setInitialCenter] = useState(null);

  useEffect(() => {
    if (!loadingUser && isAuthenticated && user?.formatted_address) {
      const { latitude, longitude } = user.formatted_address;
      setUserLat(latitude);
      setUserLon(longitude);
      setInitialCenter({ lat: latitude, lng: longitude });
      setLoadingUserCoords(false);
      console.log("Initial Center Set to user's address");
    } else if (!loadingUser && !user && isAuthenticated !== null) {
      setError("Log in to display distance");
      setLoadingUserCoords(false);
      // Set default center for non-authenticated users
      setInitialCenter({ 
        lat: 32.95747527010932, 
        lng: -117.22508357787281 
      });
      console.log("Initial Center Set to default");
    }
  }, [user, loadingUser, isAuthenticated]);

  const handleMarkerClick = (marker) => {
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
      <div className="h-[500px] flex items-center justify-center mx-auto relative">
        {(initialCenter && isAuthenticated !== null) ? (
          <GoogleMapGL
            defaultZoom={zoom}
            defaultCenter={initialCenter}
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
              navigate={navigate}
            />
          </GoogleMapGL>
        ) : (
          <Skeleton
            variant="rectangular"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            animation="wave"
          />
        )}
      </div>
    </APIProvider>
  );
};

export default Map;
