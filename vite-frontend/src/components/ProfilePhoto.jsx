import React, { useState } from 'react';
import { Skeleton } from '@mui/material';

const ProfilePhoto = ({ src, alt, className, containerClassName = "", teamNumber }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [primaryImageError, setPrimaryImageError] = useState(false);
  const [fallbackImageError, setFallbackImageError] = useState(false);

  const fallbackImage = `https://www.thebluealliance.com/avatar/2024/frc${teamNumber}.png`;
  const defaultImage = "/default.png";


  const handleError = () => {
    if (!primaryImageError) {
      setPrimaryImageError(true);
      setImageLoaded(false);
    } else {
      setFallbackImageError(true);
      setImageLoaded(true);
    }
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const getImageSrc = () => {
    if (!primaryImageError) return src;
    if (!fallbackImageError) return fallbackImage;
    return defaultImage;
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {!imageLoaded && (
        <>
          <Skeleton
            variant="rectangular"
            animation="wave"
            className="absolute top-0 left-0 w-full h-full"
          />
        </>
      )}
      <img
        src={getImageSrc()}
        alt={alt || 'Profile Photo'}
        className={`${className} object-cover`}
        style={{ display: imageLoaded ? 'block' : 'none' }}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default ProfilePhoto;