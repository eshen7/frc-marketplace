import React, { useRef } from 'react';
import ItemCard from './ItemCard';
import { Skeleton } from "@mui/material";
import { haversine } from '../utils/utils';

const ItemScrollBar = ({ items, loadingItems, user, loadingUser, type, isAuthenticated }) => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -288,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 288,
        behavior: "smooth",
      });
    }
  };

  const renderContent = () => {
    if (loadingItems) {
      return [...Array(4)].map((_, index) => (
        <div key={index} className="flex-none w-[272px]">
          <div className="bg-white rounded-lg shadow-md p-4">
            {/* Image skeleton */}
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
              className="rounded-lg"
            />
            
            {/* Title skeleton */}
            <Skeleton 
              variant="text" 
              width="70%" 
              height={32} 
              className="mt-4"
            />
            
            {/* Team info skeleton */}
            <div className="flex items-center mt-2">
              <Skeleton 
                variant="circular" 
                width={24} 
                height={24} 
              />
              <Skeleton 
                variant="text" 
                width="40%" 
                height={24} 
                className="ml-2"
              />
            </div>
            
            {/* Additional info skeletons */}
            <div className="mt-4">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </div>
      ));
    }

    if (!loadingUser && items.length !== 0) {
      return items
        .slice(-10)
        .reverse()
        .map((item) => (
          <div key={item.id} className="flex-none w-[272px]">
            <ItemCard
              item={item}
              currentUser={user}
              type={type}
              itemDistance={isAuthenticated ? haversine(
                user.formatted_address.latitude,
                user.formatted_address.longitude,
                item.user.formatted_address.latitude,
                item.user.formatted_address.longitude
              ).toFixed(1) : null}
            />
          </div>
        ));
    }

    if (items.length === 0) {
      return <p className="text-center">No parts for sale!</p>;
    }

    return <></>;
  };

  return (
    <div className="relative">
      <button
        onClick={scrollLeft}
        className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
      >
        &#8592;
      </button>
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-4 pb-4"
      >
        {renderContent()}
      </div>
      <button
        onClick={scrollRight}
        className="absolute right-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
      >
        &#8594;
      </button>
    </div>
  );
};

export default ItemScrollBar;