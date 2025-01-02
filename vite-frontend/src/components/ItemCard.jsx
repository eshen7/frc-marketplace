import React, { useState } from "react";
import PropTypes from "prop-types";
import { Skeleton } from "@mui/material";
import { getDaysUntil, haversine, isDate } from "../utils/utils";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ item, currentUser, type }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isRequest = type === "request";
  const isSale = type === "sale";

  const askPrice = typeof item.ask_price === 'string' ? parseFloat(item.ask_price) : item.ask_price;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="max-w-[345px] h-full bg-white rounded-lg shadow-md overflow-hidden">
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
          src={item.part.image || "/IMG_6769.jpg"}
          alt={item.part.name}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{
            display: imageLoaded ? "block" : "none"
          }}
        />
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 truncate">{item.part.name}</h2>

        <div onClick={() => navigate(`/profile/frc/${item.user.team_number}`)} className="text-gray-600 text-sm mb-2 truncate hover:underline cursor-pointer">
          {`Team ${item.user.team_number} - ${item.user.team_name}`}
        </div>

        {isRequest ? (
          <div>
            <p className="text-gray-600 text-sm mb-2">
              {currentUser && currentUser.team_number !== item.user.team_number
                ? haversine(
                    currentUser.formatted_address.latitude,
                    currentUser.formatted_address.longitude,
                    item.user.formatted_address.latitude,
                    item.user.formatted_address.longitude
                  ).toFixed(1) + " miles"
                : currentUser
                ? "Your Listing"
                : !currentUser
                ? "Please log in to view distance"
                : ""}
            </p>
            {(() => {
              let temp_date = item.needed_date;
              if (!isDate(temp_date)) {
                temp_date = new Date(temp_date);
              }
              const daysUntil = getDaysUntil(temp_date);
              const isUrgent = daysUntil < 3;
              return (
                isRequest && (
                  <p className={`text-sm mb-4 ${
                    isUrgent ? "text-red-600 font-bold" : "text-gray-600"
                  }`}>
                    Need By: {temp_date.toLocaleDateString()} ({daysUntil} days)
                  </p>
                )
              );
            })()}
          </div>
        ) : (
          <div>
            <p className="text-green-600 font-bold text-sm mb-2">
              ask: ${askPrice?.toFixed(2)}
            </p>
            <p className="text-gray-600 text-sm mb-2">
              Condition: {item.condition === "new" ? "New" : item.condition === "like-new" ? "Like New" : item.condition === "good" ? "Good" : item.condition === "fair" ? "Fair" : "Poor"}
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {currentUser && currentUser.team_number !== item.user.team_number
                ? haversine(
                    currentUser.formatted_address.latitude,
                    currentUser.formatted_address.longitude,
                    item.user.formatted_address.latitude,
                    item.user.formatted_address.longitude
                  ).toFixed(1) + " miles"
                : currentUser
                ? "Your Listing"
                : !currentUser
                ? "Please log in to view distance"
                : ""}
            </p>
          </div>
        )}

        {isRequest && (
          <button
            className="w-full py-2 text-white bg-blue-800 hover:bg-blue-900 transition duration-200 rounded-md"
            onClick={() => {
              navigate(`/requests/${item.id}`);
            }}
          >
            {currentUser && currentUser.team_number !== item.user.team_number ? "Offer Part" : "View Request"}
          </button>
        )}
        {isSale && (
          <button
            className="w-full py-2 text-white bg-green-600 hover:bg-green-700 transition duration-200 rounded-md"
            onClick={() => {
              navigate(`/sales/${item.id}`);
            }}
          >
            View Sale
          </button>
        )}
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
