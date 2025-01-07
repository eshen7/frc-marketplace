import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import NewPartForm from "../components/NewPartForm";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import AlertBanner from "../components/AlertBanner";

const INITIAL_FORM_STATE = {
  partId: "",
  quantity: 1,
  price: "",
  condition: "",
  description: "",
};

const PartSaleForm = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isNewPartFormOpen, setIsNewPartFormOpen] = useState(false);

  useEffect(() => {
    fetchParts();
  }, []);
  const fetchParts = async () => {
    try {
      const { data } = await axiosInstance.get("/parts/");
      setParts(data);
    } catch (error) {
      setAlertState({
        open: true,
        message: "Failed to fetch parts list",
        severity: "error",
      });
      console.error("Error fetching parts:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.partId || !formData.condition) return;

    setLoading(true);
    setAlertState({ open: false, message: "", severity: "success" });

    try {
      const saleData = {
        part_id: formData.partId,
        quantity: formData.quantity,
        ask_price: formData.price,
        condition: formData.condition,
        additional_info: formData.description,
      };

      await axiosInstance.post("/sales/", saleData);
      setAlertState({
        open: true,
        message:
          "Part listed for sale successfully. Navigating to sales page...",
        severity: "success",
      });
      setFormData(INITIAL_FORM_STATE);
      setTimeout(() => navigate("/sales"), 3000);
    } catch (error) {
      setAlertState({
        open: true,
        message: "Failed to submit sale listing. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPartSuccess = async (newPart) => {
    if (newPart) {
      await fetchParts();
      setFormData((prev) => ({ ...prev, partId: newPart.id }));
      setAlertState({
        open: true,
        message: "Part created successfully!",
        severity: "success",
      });
    }
    setIsNewPartFormOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AlertBanner
        {...alertState}
        onClose={() => setAlertState({ ...alertState, open: false })}
      />

      <TopBar />
      <div className="w-screen flex-grow flex flex-col place-items-center bg-white relative">
        {/* Form */}
        <div className="flex flex-col justify-center place-items-center w-full sm:w-2/3 md:w-[55%] my-[40px] mx-[20px] sm:mx-[30px] bg-white py-10 sm:py-16 px-10">
          <h1 className="text-5xl text-center mb-[40px] sm:mb-[80px] text-black font-semibold text-shadow-md">
            Post a Sale
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
            <FormControl fullWidth margin="normal">
              <Autocomplete
                id="part-select"
                options={parts}
                value={
                  parts.find((part) => part.id === formData.partId) || null
                }
                onChange={(_, newValue) => {
                  handleInputChange({
                    target: {
                      name: "partId",
                      value: newValue ? newValue.id : "",
                    },
                  });
                }}
                getOptionLabel={(option) =>
                  `${option.name} - ${option.manufacturer.name}`
                }
                renderOption={(props, option) => (
                  <MenuItem {...props}>
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
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Part" required />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No parts found"
              />
            </FormControl>

            <button
              type="button"
              className="w-full mt-1 mb-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded"
              onClick={() => setIsNewPartFormOpen(true)}
            >
              Create New Part
            </button>

            <TextField
              fullWidth
              name="quantity"
              type="number"
              margin="normal"
              label="Quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              name="price"
              type="number"
              margin="normal"
              label="Desired Price Per Unit"
              value={formData.price}
              onChange={handleInputChange}
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="condition-select-label">Condition *</InputLabel>
              <Select
                labelId="condition-select-label"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="like-new">Like New</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              name="description"
              label="Additional Info"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
            />

            <button
              type="submit"
              className="w-full mt-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} className="text-white" />
              ) : (
                "List Part for Sale"
              )}
            </button>
          </form>

          <NewPartForm
            open={isNewPartFormOpen}
            onClose={() => {
              setIsNewPartFormOpen(false);
            }}
            onSuccess={(newPart) => {
              handleNewPartSuccess(newPart);
            }}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartSaleForm;
