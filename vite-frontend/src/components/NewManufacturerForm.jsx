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

const NewManufacturerForm = ({ open, onClose, onSuccess, loading }) => {
  const [manufacturerData, setManufacturerData] = useState({
    name: "",
    website: "",
  });

  const handleChange = (field) => (event) => {
    setManufacturerData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "parts/manufacturers/",
        manufacturerData
      );
      setManufacturerData({ name: "", website: "" });
      onSuccess(response.data, "Manufacturer created successfully!");
    } catch (error) {
      onSuccess(null, "Failed to create new manufacturer", true);
    }
  };

  return (
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
  );
};

NewManufacturerForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default NewManufacturerForm;
