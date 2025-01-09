import React, { useState } from 'react';
import { Skeleton } from '@mui/material';

const ProfilePhoto = ({ src, alt, className, containerClassName="", teamNumber = 3647 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const defaultImage = `https://www.thebluealliance.com/avatar/2024/frc${teamNumber}.png`;

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {!imageLoaded && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          className="absolute top-0 left-0 w-full h-full"
        />
      )}
      <img
        src={imageError ? defaultImage : src}
        alt={alt || 'Profile Photo'}
        className={className}
        style={{ display: imageLoaded ? 'block' : 'none' }}
        {...(!imageError && {
          onError: handleError,
          onLoad: handleLoad
        })}
      />
    </div>
  );
};

export default ProfilePhoto;