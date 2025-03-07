import React, { useRef } from 'react';
import ItemCard, { ItemLoadingCard } from './ItemCard';
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
        <ItemLoadingCard key={index} index={index} />
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
              itemDistance={(isAuthenticated && user?.formatted_address && item.user?.formatted_address) ? haversine(
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
      return (
        <div className="flex items-center justify-center h-full w-full min-h-[200px]">
          <p className="text-gray-400 text-lg font-medium animate-fade-in">
            {type == "sale" ? "No parts for sale!" : "No requests!"}
          </p>
        </div>
      );
    }

    return <></>;
  };

  return (
    <div className="relative group">
      <button
        onClick={scrollLeft}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-3 
                 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 
                 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-6 pb-4 px-4 scroll-smooth scrollbar-hide"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '::WebkitScrollbar': { display: 'none' }
        }}
      >
        {renderContent()}
      </div>
      <button
        onClick={scrollRight}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-3 
                 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 
                 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default ItemScrollBar;