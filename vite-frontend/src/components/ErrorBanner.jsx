import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Alert, Slide, Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const ErrorBanner = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        zIndex: 9999,
      }}
    >
      <Alert
        severity="error"
        sx={{
          mt: 2,
          maxWidth: "md",
          width: "45%",
          boxShadow: 2,
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Box>
  );
};

ErrorBanner.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ErrorBanner;
