import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { getDaysUntil, haversine, isDate } from "../utils/utils";

const ItemCard = ({ item, currentUser, type }) => {
  const isRequest = type === "request";
  const isSale = type === "sale";

  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      <CardMedia
        component="img"
        height="200"
        image={item.part.image != null ? item.part.image : "/IMG_6769.jpg"}
        alt={item.part.name}
        sx={{ objectFit: "cover", maxHeight: 200, width: "100%" }}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {item.part.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {`Team ${item.user.team_number} - ${item.user.team_name}`}
        </Typography>

        {isRequest ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {currentUser
                ? haversine(
                  currentUser.formatted_address.latitude,
                  currentUser.formatted_address.longitude,
                  item.user.formatted_address.latitude,
                  item.user.formatted_address.longitude
                ).toFixed(1) + " miles"
                : isRequest && !currentUser
                  ? "Please log in to view distance"
                  : item.distance}
            </Typography>
            {(() => {
              let temp_date = item.needed_date;
              if (!isDate(temp_date)) {
                temp_date = new Date(temp_date);
              }
              const daysUntil = getDaysUntil(temp_date);
              const isUrgent = daysUntil < 3;
              return (
                isRequest && (
                  <Typography
                    variant="body2"
                    color={isUrgent ? "error" : "text.secondary"}
                    sx={{ fontWeight: isUrgent ? "bold" : "regular", mb: 2 }}
                  >
                    Due: {temp_date.toLocaleDateString()} ({daysUntil} days)
                  </Typography>
                )
              );
            })()}
          </Box>
        ) : (
          <Box>
            <Typography
              variant="body2"
              color="success.main"
              sx={{ fontWeight: "bold" }}
              gutterBottom
            >
              ask: ${item.ask_price}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Condition: {item.condition}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentUser
                ? haversine(
                  currentUser.formatted_address.latitude,
                  currentUser.formatted_address.longitude,
                  item.user.formatted_address.latitude,
                  item.user.formatted_address.longitude
                ).toFixed(1) + " miles"
                : isSale && !currentUser
                  ? "Please log in to view distance"
                  : item.distance}
            </Typography>
          </Box>
        )}

        {isRequest && (
          <>
            <button className="py-2 w-full text-white bg-blue-800 hover:bg-blue-900 transition duration-200 rounded-md"
              onClick={() => {
                window.location.href = `/requests/${item.id}`;
              }}>
              Offer Part
            </button>
          </>
        )}
        {isSale && (
          <>
            <button className="py-2 w-full text-white bg-green-600 hover:bg-green-700 transition duration-200 rounded-md"
              onClick={() => {
                window.location.href = `/sales/${item.id}`;
              }}>
              View Sale
            </button>
          </>
        )}
      </CardContent>
    </Card>
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
    coverPhoto: PropTypes.string,
    image: PropTypes.string,
    distance: PropTypes.number,
    needed_date: PropTypes.oneOfType([
      PropTypes.instanceOf(Date), // Accepts Date object
      PropTypes.string, // Accepts string
    ]),
    price: PropTypes.number,
    condition: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(["request", "sale"]).isRequired,
};

export default ItemCard;
