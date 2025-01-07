import React from "react";
import PropTypes from "prop-types";
import { Alert, Snackbar } from "@mui/material";

const AlertBanner = ({ message, severity, open, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ width: "45%", mt: 2 }}
    >
      <Alert
        severity={severity}
        sx={{ width: "100%", boxShadow: 2 }}
        onClose={onClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

AlertBanner.propTypes = {
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["error", "success"]).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AlertBanner;
