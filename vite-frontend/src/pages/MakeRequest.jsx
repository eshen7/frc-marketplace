import React, { useState, useEffect } from "react";
// Material UI imports
import {
  Autocomplete,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
// Date handling
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// Components
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import SuccessBanner from "../components/SuccessBanner";
import ErrorBanner from "../components/ErrorBanner";
import NewPartForm from "../components/NewPartForm";
// Utils
import axiosInstance from "../utils/axiosInstance";
import { useData } from '../contexts/DataContext';

const INITIAL_FORM_STATE = {
  quantity: 1,
  neededFor: "",
  additionalInfo: "",
};

const PartRequestForm = () => {
  const { parts, loadingStates, refreshSingle } = useData();
  const [selectedPart, setSelectedPart] = useState("");
  const [dateNeeded, setDateNeeded] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isNewPartFormOpen, setIsNewPartFormOpen] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPart || !dateNeeded) return;

    setLoading(true);
    setError("");

    try {
      setLoading(true);
      const requestData = {
        part_id: selectedPart,
        quantity: formData.quantity,
        needed_for: formData.neededFor,
        additional_info: formData.additionalInfo,
        needed_date: new Date(dateNeeded).toISOString().split("T")[0],
      };

      await axiosInstance.post("/requests/", requestData);
      setSuccess(true);
      setSelectedPart("");
      setFormData(INITIAL_FORM_STATE);
      setDateNeeded(null);
    } catch (error) {
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
      refreshSingle('requests');
    }
  };

  const handleNewPartSuccess = async (newPart) => {
    setSelectedPart(newPart.id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {success && (
        <SuccessBanner
          message="Operation completed successfully!"
          onClose={() => setSuccess(false)}
        />
      )}
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <TopBar />
      <div className="w-screen flex-grow flex flex-col place-items-center bg-white relative">
        {/* Form */}
        <div className="flex flex-col justify-center place-items-center w-full sm:w-2/3 md:w-[55%] my-[40px] mx-[20px] sm:mx-[30px] bg-white py-10 sm:py-16 px-10">
          <h1 className="text-5xl text-center mb-[40px] sm:mb-[80px] text-black font-semibold text-shadow-md">
            Make a Request
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
            <Autocomplete
              id="part-select"
              options={parts}
              value={parts.find(part => part.id === selectedPart) || null}
              onChange={(_, newValue) => {
                setSelectedPart(newValue ? newValue.id : '');
              }}
              getOptionLabel={(option) => `${option.name} - ${option.manufacturer.name}`}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <MenuItem key={key} {...otherProps}>
                    <div className="flex flex-row w-full items-center justify-between">
                      <span>
                        {option.name} - <em>{option.manufacturer.name}</em>
                      </span>
                      {option.image ? (
                        <img
                          src={option.image}
                          alt={option.name}
                          className="w-[30px] h-[30px] ml-[10px]"
                        />
                      ) : (
                        <img
                          src="/IMG_6769.jpg"
                          alt="IMG_6769.jpg"
                          className="w-[30px] h-[30px] ml-[10px]"
                        />
                      )}
                    </div>
                  </MenuItem>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Part"
                  required
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No parts found"
            />

            <button
              className="w-full mt-1 mb-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded"
              onClick={() => setIsNewPartFormOpen(true)}
            >
              Create New Part
            </button>

            <TextField
              fullWidth
              name="quantity"
              margin="normal"
              label="Quantity*"
              value={formData.quantity}
              onChange={handleInputChange}
            />

            <div className="grid grid-cols-1 gap-4 mt-4">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Need the part by"
                  value={dateNeeded}
                  onChange={setDateNeeded}
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </div>

            <TextField
              fullWidth
              name="additionalInfo"
              label="Any other additional info"
              multiline
              rows={4}
              value={formData.additionalInfo}
              onChange={handleInputChange}
              margin="normal"
            />

            <button
              type="submit"
              className="w-full mt-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Submit Request"}
            </button>
          </form>

          <NewPartForm
            open={isNewPartFormOpen}
            onClose={(newPart) => {
              setIsNewPartFormOpen(false);
              if (newPart) handleNewPartSuccess(newPart);
            }}
            onSubmit={handleNewPartSuccess}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartRequestForm;
