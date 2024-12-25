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

const NewCategoryForm = ({ open, onClose, onSuccess, loading }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("parts/categories/", { name });
      setSuccess(true);
      onSuccess(response.data);
      setName("");
      onClose();
    } catch (error) {
      setError("Failed to create new category");
      console.error("Error creating category:", error);
    }
  };

  return (
    <>
      {success && <SuccessBanner message="Category created successfully!" onClose={() => setSuccess(false)} />}
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}
      
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
    </>
  );
};

NewCategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default NewCategoryForm;
