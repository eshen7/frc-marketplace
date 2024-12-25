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
import axiosInstance from "../utils/axiosInstance";
import NewCategoryForm from "./NewCategoryForm";
import NewManufacturerForm from "./NewManufacturerForm";
import SuccessBanner from "./SuccessBanner";
import ErrorBanner from "./ErrorBanner";

const NewPartForm = ({ open, onClose, loading }) => {
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturerDialogOpen, setManufacturerDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [partData, setPartData] = useState({
    name: "",
    manufacturer_id: "",
    category_id: "",
    partID: "",
    description: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("parts/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const response = await axiosInstance.get("parts/manufacturers/");
      setManufacturers(response.data);
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      setManufacturers([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, []);

  const handleChange = (field) => (event) => {
    if (field === "manufacturer_id" && event.target.value === "create") {
      setManufacturerDialogOpen(true);
      return;
    }

    if (field === "category_id" && event.target.value === "create") {
      setCategoryDialogOpen(true);
      return;
    }
    setPartData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.post("parts/", partData);
      setSuccess(true);
      setPartData({
        name: "",
        description: "",
        category_id: "",
        manufacturer_id: "",
        partID: "",
      });
      onClose();
    } catch (error) {
      setError("Failed to create part. Please try again.");
      console.error("Error creating part:", error);
    }
  };

  const handleManufacturerSuccess = (newManufacturer) => {
    setPartData((prev) => ({ ...prev, manufacturer_id: newManufacturer.id }));
    setManufacturerDialogOpen(false);
    fetchManufacturers();
  };

  const handleCategorySuccess = (newCategory) => {
    setPartData((prev) => ({ ...prev, category_id: newCategory.id }));
    setCategoryDialogOpen(false);
    fetchCategories();
  };

  return (
    <>
      {success && (
        <SuccessBanner
          message="Operation completed successfully!"
          onClose={() => setSuccess(false)}
        />
      )}
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

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
              value={partData.manufacturer_id || ""}  // Add fallback to empty string
              label="Manufacturer"
              onChange={handleChange("manufacturer_id")}
            >
              {manufacturers.map((manufacturer) => (
                <MenuItem key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </MenuItem>
              ))}
              <MenuItem value="create">
                <em>ADD NEW MANUFACTURER +</em>
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Part ID"
            fullWidth
            value={partData.partID}
            onChange={handleChange("partID")}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={partData.category_id || ""}  // Add fallback to empty string
              label="Category"
              onChange={handleChange("category_id")}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
              <MenuItem value="create">
                <em>ADD NEW CATEGORY +</em>
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={partData.description}
            onChange={handleChange("description")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <NewManufacturerForm
        open={manufacturerDialogOpen}
        onClose={() => setManufacturerDialogOpen(false)}
        onSuccess={handleManufacturerSuccess}
        loading={loading}
      />

      <NewCategoryForm
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onSuccess={handleCategorySuccess}
        loading={loading}
      />
    </>
  );
};

NewPartForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default NewPartForm;
