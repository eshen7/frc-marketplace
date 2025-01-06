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
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../utils/axiosInstance";
import NewCategoryForm from "./NewCategoryForm";
import NewManufacturerForm from "./NewManufacturerForm";
import SuccessBanner from "./SuccessBanner";
import ErrorBanner from "./ErrorBanner";
import { useData } from '../contexts/DataContext';

const NewPartForm = ({ open, onClose }) => {
  const { categories, manufacturers, refreshData } = useData();
  const [manufacturerDialogOpen, setManufacturerDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [partData, setPartData] = useState({
    name: "",
    manufacturer_id: "",
    category_id: "",
    partID: "",
    description: "",
    imageFile: null,
    part_link: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    if (field === "manufacturer" && event.target.value === "create") {
      setManufacturerDialogOpen(true);
      return;
    }

    if (field === "category" && event.target.value === "create") {
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
      formData.append("link", partData.part_link);

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
        part_link: "",
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
    refreshData('manufacturers');
  };

  const handleCategorySuccess = (newCategory) => {
    setPartData((prev) => ({ ...prev, category_id: newCategory.id }));
    setCategoryDialogOpen(false);
    refreshData('categories');
  };

  const isFormValid = () => {
    return (
      partData.name &&
      partData.category_id &&
      partData.manufacturer_id &&
      partData.imageFile
    );
  };

  return (
    <div className={`${open ? "block" : "hidden"} min-h-screen flex flex-col`}>
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
            value={partData.name}
            onChange={handleChange("name")}
          />
          <Autocomplete
            fullWidth
            options={["create", ...manufacturers]}
            value={
              manufacturers.find((m) => m.id === partData.manufacturer_id) ||
              null
            }
            onChange={(_, newValue) => {
              if (newValue === "create") {
                setManufacturerDialogOpen(true);
              } else {
                setPartData(prev => ({
                  ...prev,
                  manufacturer_id: newValue ? newValue.id : ""
                }));
              }
            }}
            getOptionLabel={(option) => {
              if (option === "create") return "➕ ADD NEW MANUFACTURER";
              return option.name;
            }}
            renderOption={(props, option, state) => {
              const { key, ...otherProps } = props;
              return (
                <MenuItem key={key} {...otherProps}>
                  {option === "create" ? (
                    <span className="text-blue-600 font-medium">
                      ➕ ADD NEW MANUFACTURER
                    </span>
                  ) : (
                    option.name
                  )}
                </MenuItem>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Manufacturer *" margin="dense" />
            )}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              if (option === "create") return value === "create";
              return option.id === value.id;
            }}
          />
          <TextField
            margin="dense"
            label="Part ID"
            fullWidth
            value={partData.partID}
            onChange={handleChange("partID")}
          />
          <TextField
            margin="dense"
            label="Part Link"
            fullWidth
            placeholder="https://..."
            value={partData.part_link}
            onChange={handleChange("part_link")}
          />
          <Autocomplete
            fullWidth
            options={["create", ...categories]}
            value={
              categories.find((c) => c.id === partData.category_id) || null
            }
            onChange={(_, newValue) => {
              if (newValue === "create") {
                setCategoryDialogOpen(true);
              } else {
                setPartData(prev => ({
                  ...prev,
                  category_id: newValue ? newValue.id : ""
                }));
              }
            }}
            getOptionLabel={(option) => {
              if (option === "create") return "➕ ADD NEW CATEGORY";
              return option.name;
            }}
            renderOption={(props, option, state) => {
              const { key, ...otherProps } = props;
              return (
                <MenuItem key={key} {...otherProps}>
                  {option === "create" ? (
                    <span className="text-blue-600 font-medium">
                      ➕ ADD NEW CATEGORY
                    </span>
                  ) : (
                    option.name
                  )}
                </MenuItem>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Category *" margin="dense" />
            )}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              if (option === "create") return value === "create";
              return option.id === value.id;
            }}
          />
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
    </div>
  );
};

NewPartForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NewPartForm;
