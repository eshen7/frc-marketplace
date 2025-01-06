import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Link,
} from "@mui/material";

const PartItemCard = ({ part, navigate}) => {
  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      <CardMedia
        component="img"
        image={part.image || "/IMG_6769.jpg"}
        alt={part.name}
        sx={{
          aspectRatio: "1/1",
          width: "100%",
          objectFit: "cover",
        }}
      />
      <CardContent>
        <button onClick={() => navigate(`/part/${part.id}`)} className="text-blue-500 hover:text-blue-700 hover:underline">
          <Typography variant="h6" gutterBottom>
            {part.name || "Part Name"}
          </Typography>
        </button>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {part.category.name || "No Category"}
          </Typography>
        </Box>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {part.manufacturer.name || "No Manufacturer"}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1,
          }}
        >
          {part.description ||
            "Description placeholder text goes here. This can be multiple lines long and will be truncated after 3 lines."}
        </Typography>
      </CardContent>
    </Card>
  );
};

PartItemCard.propTypes = {
  part: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    category: PropTypes.object,
    manufacturer: PropTypes.object,
    weight: PropTypes.number,
    description: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
};

export default PartItemCard;
