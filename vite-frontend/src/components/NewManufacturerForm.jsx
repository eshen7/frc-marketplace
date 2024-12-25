import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import SuccessBanner from "./SuccessBanner";
import ErrorBanner from "./ErrorBanner";

const NewManufacturerForm = ({ open, onClose, onSuccess, loading }) => {
  const [manufacturerData, setManufacturerData] = useState({
    name: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (event) => {
    setManufacturerData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("parts/manufacturers/", manufacturerData);
      setSuccess(true);
      onSuccess(response.data);
      setManufacturerData({ name: "", website: "" });
      onClose();
    } catch (error) {
      setError("Failed to create new manufacturer");
      console.error("Error creating manufacturer:", error);
    }
  };

  return (
    <>
      {success && <SuccessBanner message="Manufacturer created successfully!" onClose={() => setSuccess(false)} />}
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}
      
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Manufacturer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Manufacturer Name"
            fullWidth
            value={manufacturerData.name}
            onChange={handleChange("name")}
          />
          <TextField
            margin="dense"
            label="Website URL"
            fullWidth
            value={manufacturerData.website}
            onChange={handleChange("website")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !manufacturerData.name}
          >
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

NewManufacturerForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default NewManufacturerForm;
