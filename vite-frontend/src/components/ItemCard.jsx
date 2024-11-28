import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

const ItemCard = ({ item, type }) => {
  const isRequest = type === "request";

  const getDaysUntil = (dueDate) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      <CardMedia
        component="img"
        height="200"
        image={isRequest ? item.coverPhoto : item.image}
        alt={item.title}
        sx={{ objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {item.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isRequest
            ? `Team ${item.team.number} - ${item.team.name}`
            : item.team}
        </Typography>

        {isRequest ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {item.distance} miles away
            </Typography>
            {(() => {
              const daysUntil = getDaysUntil(item.dueDate);
              const isUrgent = daysUntil < 3;
              return (
                <Typography
                  variant="body2"
                  color={isUrgent ? "error" : "text.secondary"}
                  sx={{ fontWeight: isUrgent ? 'bold' : 'regular', mb: 2 }}
                >
                  Due: {item.dueDate.toLocaleDateString()} ({daysUntil} days)
                </Typography>
              );
            })()}
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }} gutterBottom>
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
            bgcolor: isRequest ? 'primary.main' : 'error.dark',
            '&:hover': {
              bgcolor: isRequest ? 'primary.dark' : 'error.darker',
            },
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
    title: PropTypes.string.isRequired,
    team: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        number: PropTypes.number,
        name: PropTypes.string,
      }),
    ]).isRequired,
    coverPhoto: PropTypes.string,
    image: PropTypes.string,
    distance: PropTypes.number,
    dueDate: PropTypes.instanceOf(Date),
    price: PropTypes.number,
    condition: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(["request", "sale"]).isRequired,
};

export default ItemCard;
