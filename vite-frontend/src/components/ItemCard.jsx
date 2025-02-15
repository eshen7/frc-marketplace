import React, { useState } from "react";
import PropTypes from "prop-types";
import { Skeleton } from "@mui/material";
import { getDaysUntil, haversine, isDate } from "../utils/utils";
import { useNavigate } from "react-router-dom";

export const ItemLoadingCard = ({ index }) => {
  return (
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
  );
}

const ItemCard = ({ item, currentUser, type, itemDistance }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isRequest = type === "request";
  const isSale = type === "sale";

  const askPrice = typeof item.ask_price === 'string' ? parseFloat(item.ask_price) : item.ask_price;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const renderRequestContent = () => {
    if (item.is_fulfilled) {
      return (
        <div className="flex flex-col">
          {/* Request Type Badge */}
          <div className={`border-b p-2 ${
            item.event_key 
              ? 'bg-purple-100 border-purple-200' 
              : 'bg-blue-100 border-blue-200'
          }`}>
            <span className={`text-sm font-medium ${
              item.event_key ? 'text-purple-700' : 'text-blue-700'
            }`}>
              {item.event_key ? '🏆 Competition Request' : '🔧 General Request'}
            </span>
          </div>
          
          {/* Fulfillment Status */}
          <div className={`border-b p-2 ${
            item.is_returned || !item.requires_return ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className={item.is_returned || !item.requires_return ? 'text-green-700' : 'text-blue-700'}>
                {item.is_returned || !item.requires_return ? 'Completed' : 'Fulfilled'}
              </span>
              <span className="text-sm text-gray-600">
                {new Date(item.fulfillment_date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              By Team {item.fulfilled_by?.team_number} - {item.fulfilled_by?.team_name}
            </p>
          </div>
          <div className="p-4">
            <p className="text-gray-800 font-medium">Qty: {item.quantity}</p>
            {item.requires_return ? (
              <div className="mt-2">
                {item.is_returned ? (
                  <span className="text-green-600 text-sm">
                    ✓ Returned on {new Date(item.return_date).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-orange-600 text-sm font-medium">
                    ⚠️ Return Required
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <span className="text-green-600 text-sm">
                  ✓ Return not needed
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        {/* Request Type Badge */}
        <div className={`mb-3 py-1 px-2 rounded-md inline-flex items-center ${
          item.event_key 
            ? 'bg-purple-100' 
            : 'bg-blue-100'
        }`}>
          <span className={`text-sm font-medium ${
            item.event_key ? 'text-purple-700' : 'text-blue-700'
          }`}>
            {item.event_key ? '🏆 Competition Request' : '🔧 General Request'}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-2">
          {currentUser && currentUser.team_number !== item.user.team_number
            ? itemDistance + " miles away"
            : currentUser
              ? "Your Listing"
              : !currentUser
                ? "Please log in to view distance"
                : ""}
        </p>
        <p className="text-gray-800 mb-2">Qty: {item.quantity}</p>
        {(() => {
          let temp_date = item.needed_date;
          if (!isDate(temp_date)) {
            temp_date = new Date(temp_date);
          }
          const daysUntil = getDaysUntil(temp_date);
          const isUrgent = daysUntil < 3;
          return (
            <p className={`text-sm ${isUrgent ? "text-red-600 font-bold" : "text-gray-600"}`}>
              Need By: {temp_date.toLocaleDateString()} ({daysUntil} days)
            </p>
          );
        })()}
      </div>
    );
  };

  const renderSaleContent = () => {
    if (item.is_sold) {
      return (
        <div className="flex flex-col">
          <div className="border-b p-2 rounded-t bg-green-50 border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-green-700">Sold</span>
              <span className="text-sm text-gray-600">
                {new Date(item.sale_date).toLocaleDateString()}
              </span>
            </div>
            {item.sold_to && (
              <p className="text-sm text-gray-700">
                To Team {item.sold_to?.team_number} - {item.sold_to?.team_name}
              </p>
            )}
          </div>
          <div className="p-4">
            <p className="text-gray-800 font-medium">Qty: {item.quantity}</p>
            <p className="text-green-700 text-lg font-medium">
              ${typeof item.ask_price === 'string' ? parseFloat(item.ask_price).toFixed(2) : item.ask_price.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-2">
          {currentUser && currentUser.team_number !== item.user.team_number
            ? itemDistance + " miles away"
            : currentUser
              ? "Your Listing"
              : !currentUser
                ? "Please log in to view distance"
                : ""}
        </p>
        <p className="text-gray-800 mb-2">Qty: {item.quantity}</p>
        <p className="text-green-700 text-lg font-medium">
          ${typeof item.ask_price === 'string' ? parseFloat(item.ask_price).toFixed(2) : item.ask_price.toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div className="min-w-[272px] h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative" style={{ paddingTop: "100%" }}>
        {!imageLoaded && (
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
        <img
          src={item.part.image || "/default.png"}
          alt={item.part.name}
          onLoad={handleImageLoad}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default.png";
          }}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{
            display: imageLoaded ? "block" : "none"
          }}
        />
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 text-right">
          {isRequest ? (new Date(item.request_date)).toLocaleDateString() : (new Date(item.sale_creation_date)).toLocaleDateString()}
        </p>
        <h1 className="text-xl font-semibold mb-2 truncate">
          {item.part.name}
        </h1>

        <div onClick={() => navigate(`/profile/frc/${item.user.team_number}`)} className="text-gray-600 text-sm mb-2 truncate hover:underline cursor-pointer">
          <h2>{`Team ${item.user.team_number} - ${item.user.team_name}`}</h2>
        </div>

        {type === "request" ? renderRequestContent() : renderSaleContent()}

        <button
          className={`w-full py-2 text-white rounded-md ${
            type === "request" 
              ? item.is_fulfilled
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
              : item.is_sold
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
          } transition duration-200`}
          onClick={() => navigate(`/${type}s/${item.id}`)}
        >
          {type === "request" 
            ? item.is_fulfilled
              ? "View Fulfilled Request"
              : currentUser?.team_number !== item.user.team_number
                ? "Offer Part"
                : "View Request"
            : item.is_sold
              ? "View Completed Sale"
              : "View Sale"}
        </button>
      </div>
    </div>
  );
};

ItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        team_number: PropTypes.number,
        team_name: PropTypes.string,
        formatted_address: PropTypes.shape({
          raw: PropTypes.string,
          latitude: PropTypes.number,
          longitude: PropTypes.number,
        }),
      }),
    ]).isRequired,
    part: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string,
    }).isRequired,
    distance: PropTypes.number,
    needed_date: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string,
    ]),
    ask_price: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    condition: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.object,
  type: PropTypes.oneOf(["request", "sale"]).isRequired,
};

export default ItemCard;
