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
import AlertBanner from "./AlertBanner";

const NewPartForm = ({ open, onClose, onSuccess }) => {
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
    part_link: "",
  });
  const [imageError, setImageError] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("parts/categories/");
      setCategories(response.data);
    } catch (error) {
      setAlertState({
        open: true,
        message: "Failed to fetch categories. Please try again.",
        severity: 'error'
      });
      setCategories([]);
    }
  };
  const fetchManufacturers = async () => {
    try {
      const response = await axiosInstance.get("parts/manufacturers/");
      setManufacturers(response.data);
    } catch (error) {
      setAlertState({
        open: true,
        message: "Failed to fetch manufacturers. Please try again.",
        severity: 'error'
      });
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
      formData.append("link", partData.part_link);

      const response = await axiosInstance.post("parts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      setAlertState({
        open: true,
        message: "Part created successfully!",
        severity: 'success'
      });
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
      onSuccess(response.data);
      onClose();
    } catch (error) {
      setAlertState({
        open: true,
        message: error.response?.data?.error?.includes("Integrity Error") 
          ? "A part with this name and manufacturer already exists!"
          : "Failed to create part. Please try again.",
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleManufacturerSuccess = (newManufacturer, message, isError = false) => {
    setAlertState({
      open: true,
      message: message,
      severity: isError ? 'error' : 'success'
    });
    
    if (newManufacturer) {
      fetchManufacturers();
      handleChange("manufacturer_id")({
        target: {
          value: newManufacturer.id,
        },
      });
      setManufacturerDialogOpen(false);
    }
  };

  const handleCategorySuccess = (newCategory, message, isError = false) => {
    setAlertState({
      open: true,
      message: message,
      severity: isError ? 'error' : 'success'
    });
    
    if (newCategory) {
      fetchCategories();
      handleChange("category_id")({
        target: {
          value: newCategory.id,
        },
      });
      setCategoryDialogOpen(false);
    }
  };

  const isFormValid = () => {
    return (
      partData.name &&
      partData.category_id &&
      partData.manufacturer_id &&
      partData.imageFile &&
      partData.part_link
    );
  };

  return (
    <div className={`${open ? "block" : "hidden"} min-h-screen flex flex-col`}>
      <AlertBanner
        {...alertState}
        onClose={() => setAlertState({ ...alertState, open: false })}
      />

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Part</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Part Name"
            fullWidth
            placeholder="Name + acronyms if applicable"
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
                handleChange("manufacturer_id")({
                  target: {
                    value: newValue ? newValue.id : "",
                  },
                });
              }
            }}
            getOptionLabel={(option) => {
              if (option === "create") return "➕ ADD NEW MANUFACTURER";
              return option.name;
            }}
            renderOption={(props, option) => {
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
            placeholder="Item ID from manufacturer's website"
            onChange={handleChange("partID")}
          />
          <TextField
            margin="dense"
            label="Part Link"
            fullWidth
            required
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
                handleChange("category_id")({
                  target: {
                    value: newValue ? newValue.id : "",
                  },
                });
              }
            }}
            getOptionLabel={(option) => {
              if (option === "create") return "➕ ADD NEW CATEGORY";
              return option.name;
            }}
            renderOption={(props, option) => {
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
            placeholder="Part Details as found on manufacturer's website"
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
