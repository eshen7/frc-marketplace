import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Container,
  Box,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import TopBar from "./../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import axiosInstance from "../utils/axiosInstance";

const PartRequestForm = () => {
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState("");
  const [date_needed, setDateNeededBy] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    needed_for: "",
    additional_info: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [openNewPartDialog, setOpenNewPartDialog] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newPartDescription, setNewPartDescription] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setDateNeededBy(date);
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await axiosInstance.get("/parts/");
      const data = response.data;
      setParts(data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch parts");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const needed_date = new Date(date_needed).toISOString().split("T")[0];
    const { quantity, needed_for, additional_info } = formData;
    console.log(quantity);

    try {
      const response = await axiosInstance.post("/requests/", {
        part_id: selectedPart,
        quantity,
        needed_for,
        additional_info,
        needed_date,
      });
      setSuccess(true);
      setSelectedPart("");
    } catch (err) {
      console.error("Error response:", err);
      setError("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPart = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/parts/", {
        name: newPartName,
        description: newPartDescription,
      });

      const newPart = response.data;
      setParts([...parts, newPart]);
      setSelectedPart(newPart.id);
      setOpenNewPartDialog(false);
      setNewPartName("");
      setNewPartDescription("");
      setSuccess(true);
    } catch (err) {
      setError("Failed to create part");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar />
      <Box
        sx={{
          flexGrow: 1,
          mt: 4,
          mx: "auto",
          width: "100%",
          maxWidth: 600,
          px: 2,
        }}
      >
        <h1 className="text-7xl text-center mt-[80px] mb-[80px] font-paytone text-[#AE0000] font-extrabold text-shadow-md">
          Make a Request
        </h1>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="part-select-label">Part</InputLabel>
            <Select
              labelId="part-select-label"
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              required
            >
              {parts.map((part) => (
                <MenuItem key={part.id} value={part.id}>
                  {part.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mt: 1, mb: 2 }}
            onClick={() => setOpenNewPartDialog(true)}
          >
            Create New Part
          </Button>
          <TextField
            fullWidth
            name="quantity"
            margin="normal"
            label="Quantity*"
            value={formData.quantity}
            onChange={handleInputChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Need the part by*"
                value={formData.needed_date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              name="needed_for"
              label="Need it for what"
              value={formData.needed_for}
              onChange={handleInputChange}
            />
          </div>
          <TextField
            fullWidth
            name="additional_info"
            label="Any other additional info"
            multiline
            rows={4}
            value={formData.additional_info}
            onChange={handleInputChange}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 4 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Submit Request"}
          </Button>
        </form>
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Operation completed successfully"
        />
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          message={error}
        />
        {/* Dialog for creating a new part */}
        <Dialog
          open={openNewPartDialog}
          onClose={() => setOpenNewPartDialog(false)}
        >
          <DialogTitle>Create New Part</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Part Name"
              type="text"
              fullWidth
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={newPartDescription}
              onChange={(e) => setNewPartDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewPartDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateNewPart} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Footer />
    </Box>
  );
};

export default PartRequestForm;
