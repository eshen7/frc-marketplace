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

const NewCategoryForm = ({ open, onClose, onSuccess, loading }) => {
  const [name, setName] = useState("");

  const handleChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("parts/categories/", { name });
      setName("");
      onSuccess(response.data, "Category created successfully!");
      onClose();
    } catch (error) {
      onSuccess(null, "Failed to create new category", true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Category</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Category Name"
          fullWidth
          value={name}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !name}>
          {loading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NewCategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default NewCategoryForm;
