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

  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      <CardMedia
        component="img"
        height="200"
        image={
          isRequest
            ? item.part.image != null
              ? item.part.image
              : "/IMG_6769.jpg"
            : null
        }
        alt={item.part.name}
        sx={{ objectFit: "cover", maxHeight: 200, width: "100%" }}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {item.part.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isRequest
            ? `Team ${item.user.team_number} - ${item.user.team_name}`
            : item.user}
        </Typography>

        {isRequest ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isRequest && currentUser
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
                <Typography
                  variant="body2"
                  color={isUrgent ? "error" : "text.secondary"}
                  sx={{ fontWeight: isUrgent ? "bold" : "regular", mb: 2 }}
                >
                  Due: {temp_date.toLocaleDateString()} ({daysUntil} days)
                </Typography>
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
              ask: ${item.price}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Condition: {item.condition}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {item.distance} miles away
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: isRequest ? "primary.main" : "error.dark",
            "&:hover": {
              bgcolor: isRequest ? "primary.dark" : "error.darker",
            },
          }}
          onClick={() => {
            window.location.href = `/requests/${item.id}`;
          }}
        >
          {isRequest ? "Offer Part" : "Buy"}
        </Button>
      </CardContent>
    </Card>
  );
};

ItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    part_name: PropTypes.string.isRequired,
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
