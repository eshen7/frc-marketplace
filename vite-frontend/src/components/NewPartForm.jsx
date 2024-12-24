import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const categories = [
  "Motors",
  "Electronics",
  "Pneumatics",
  "Mechanical",
  "Sensors",
  "Controls",
  "Batteries",
  "Other",
];

const manufacturers = ["VEX", "REV Robotics", "AndyMark"];

const NewPartForm = ({ open, onClose, onCreate, loading }) => {
  const [partData, setPartData] = useState({
    name: "",
    manufacturer: "",
    partID: "",
    description: "",
    category: "",
  });

  const handleChange = (field) => (event) => {
    setPartData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = () => {
    onCreate(partData);
    setPartData({ name: "", description: "", category: "" });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Part</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Part Name"
          fullWidth
          value={partData.name}
          onChange={handleChange("name")}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Manufacturer</InputLabel>
          <Select
            value={partData.manufacturer}
            label="Manufacturer"
            onChange={handleChange("manufacturer")}
          />
          {manufacturers.map((manufacturer) => (
            <MenuItem key={manufacturer} value={manufacturer}>
              {manufacturer}
            </MenuItem>
          ))}
        </FormControl>
        <TextField
          margin="dense"
          label="Part ID"
          fullWidth
          multiline
          value={partData.partID}
          onChange={handleChange("description")}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={partData.description}
          onChange={handleChange("description")}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Category</InputLabel>
          <Select
            value={partData.category}
            label="Category"
            onChange={handleChange("category")}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !partData.name || !partData.category}
        >
          {loading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NewPartForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default NewPartForm;
