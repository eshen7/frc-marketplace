import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
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
  Box,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../utils/axiosInstance";
import NewCategoryForm from "./NewCategoryForm";
import NewManufacturerForm from "./NewManufacturerForm";
import SuccessBanner from "./SuccessBanner";
import ErrorBanner from "./ErrorBanner";

const NewPartForm = ({ open, onClose }) => {
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
    imageFile: null,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("parts/categories/");
      setCategories(response.data);
    } catch (error) {
      setError("Failed to fetch categories. Please try again.");
      setCategories([]);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const response = await axiosInstance.get("parts/manufacturers/");
      setManufacturers(response.data);
    } catch (error) {
      setError("Failed to fetch manufacturers. Please try again.");
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

    if (field === "imageFile") {
      const file = event.target.files[0];
      setPartData((prev) => ({ ...prev, imageFile: file }));
      return;
    }

    setPartData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setPartData((prev) => ({ ...prev, imageFile: file }));
    setPreview(URL.createObjectURL(file));
    setImageError(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setPartData((prev) => ({ ...prev, imageFile: null }));
    setPreview(null);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async () => {
    if (!partData.imageFile) {
      setImageError(true);
      return; // Prevent submission if no image is added
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", partData.name);
      formData.append("manufacturer_id", partData.manufacturer_id);
      formData.append("category_id", partData.category_id);
      formData.append("model_id", partData.partID);
      formData.append("description", partData.description);
      formData.append("image", partData.imageFile);

      const response = await axiosInstance.post("parts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      setSuccess(true);
      setPartData({
        name: "",
        description: "",
        category_id: "",
        manufacturer_id: "",
        partID: "",
        imageFile: null,
      });
      setPreview(null);
      onClose(response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error.includes("Integrity Error")
      ) {
        setError("A part with this name and manufacturer already exists!");
        setLoading(false);
      } else {
        setError("Failed to create part. Please try again.");
        setLoading(false);
      }
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

  const isFormValid = () => {
    return partData.name && partData.category_id; // Require both name and category
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {success && (
        <SuccessBanner
          message="Part created successfully!"
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
            required
            error={!partData.name}
            value={partData.name}
            onChange={handleChange("name")}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel required>Manufacturer</InputLabel>
            <Select
              value={partData.manufacturer_id || ""}
              label="Manufacturer"
              onChange={handleChange("manufacturer_id")}
            >
              <MenuItem value="">
                <em>Select a manufacturer</em>
              </MenuItem>
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
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Category</InputLabel>
            <Select
              value={partData.category_id || ""}
              label="Category *"
              onChange={handleChange("category_id")}
              error={!partData.category_id}
            >
              <MenuItem value="">
                <em>Select a category</em>
              </MenuItem>
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
          {/* top margin of 1 */}
          <Box sx={{ mt: 1 }}>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${imageError ? "red" : "#cccccc"}`,
                borderRadius: "4px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography>Drop the image here ...</Typography>
              ) : (
                <Typography>Add An Image*</Typography>
              )}
            </div>

            {preview && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Box
                  component="img"
                  src={preview}
                  sx={{
                    maxWidth: 200,
                    maxHeight: 200,
                    objectFit: "contain",
                  }}
                />
                <IconButton onClick={handleRemoveImage} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            )}
          </Box>
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
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()} // Added form validation
          >
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
    </Box>
  );
};

NewPartForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NewPartForm;
