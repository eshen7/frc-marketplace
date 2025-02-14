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
import NewPartForm from "../components/NewPartForm";
import AlertBanner from "../components/AlertBanner";
// Utils
import axiosInstance from "../utils/axiosInstance";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router-dom";
import HelmetComp from "../components/HelmetComp";
import { useUser } from "../contexts/UserContext";

const INITIAL_FORM_STATE = {
  quantity: 1,
  additionalInfo: "",
  eventKey: "",
};

const PartRequestForm = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState("");
  const [dateNeeded, setDateNeeded] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [isNewPartFormOpen, setIsNewPartFormOpen] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { user } = useUser();
  const [competitions, setCompetitions] = useState([]);
  const [loadingComps, setLoadingComps] = useState(true);
  const { addItem } = useData();  // Add this line

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
    }
  };

  // Add useEffect to fetch team's competitions
  useEffect(() => {
    const fetchTeamEvents = async () => {
      if (!user?.team_number) return;
      
      try {
        const response = await fetch(
          `https://www.thebluealliance.com/api/v3/team/frc${user.team_number}/events/2025`,
          {
            headers: {
              "X-TBA-Auth-Key": import.meta.env.VITE_TBA_API_KEY
            }
          }
        );
        const data = await response.json();
        // Filter for regular season events and sort by date
        const validEvents = data
          .filter(event => event.week >= 0 && event.week <= 6)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        setCompetitions(validEvents);
      } catch (err) {
        console.error("Error fetching team events:", err);
      } finally {
        setLoadingComps(false);
      }
    };

    fetchTeamEvents();
  }, [user?.team_number]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPart || !dateNeeded) return;

    setLoading(true);

    try {
      const requestData = {
        part_id: selectedPart,
        quantity: formData.quantity,
        additional_info: formData.additionalInfo,
        needed_date: new Date(dateNeeded).toISOString().split("T")[0],
        event_key: formData.eventKey || null,
      };

      const response = await axiosInstance.post("/requests/", requestData);
      
      // Add the new request to DataContext
      addItem('requests', response.data);
      
      // Update navigation based on whether it's a competition request
      const navigationPath = formData.eventKey 
        ? `/comp/${formData.eventKey}` 
        : "/requests";
        
      setAlertState({
        open: true,
        message: `Request submitted successfully. Navigating to ${formData.eventKey ? 'competition' : 'requests'} page...`,
        severity: "success",
      });
      
      setSelectedPart("");
      setFormData(INITIAL_FORM_STATE);
      setDateNeeded(null);
      setTimeout(() => navigate(navigationPath), 3000);
    } catch (error) {
      setAlertState({
        open: true,
        message: "Failed to submit request. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPartSuccess = async (newPart) => {
    if (newPart) {
      await fetchParts();
      setSelectedPart(newPart.id);
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
      <HelmetComp title="Make a Part Request" />
      <div className="w-screen flex-grow flex flex-col place-items-center bg-white relative">
        {/* Form */}
        <div className="flex flex-col justify-center place-items-center w-full sm:w-2/3 md:w-[55%] my-[40px] mx-[20px] sm:mx-[30px] bg-white py-10 sm:py-16 px-10">
          <h1 className="text-5xl text-center mb-[40px] sm:mb-[80px] text-black font-semibold text-shadow-md">
            Make a Request
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
            <FormControl fullWidth margin="normal">
              <Autocomplete
                id="part-select"
                options={parts}
                value={parts.find((part) => part.id === selectedPart) || null}
                onChange={(_, newValue) => {
                  setSelectedPart(newValue ? newValue.id : "");
                }}
                getOptionLabel={(option) =>
                  `${option.name} - ${option.manufacturer.name}`
                }
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
                            onError={(e) => {
                              e.target.src = "/default.png";
                            }}
                            className="w-[30px] h-[30px] ml-[10px]"
                          />
                        ) : (
                          <img
                            src="/default.png"
                            alt="default.png"
                            className="w-[30px] h-[30px] ml-[10px]"
                          />
                        )}
                      </div>
                    </MenuItem>
                  );
                }}
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
              margin="normal"
              label="Quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
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
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            <FormControl fullWidth margin="normal">
              <InputLabel>At a Competition?</InputLabel>
              <Select
                name="eventKey"
                value={formData.eventKey}
                onChange={handleInputChange}
                label="At a Competition?"
              >
                <MenuItem value="">
                  <em>No</em>
                </MenuItem>
                {competitions.map((comp) => (
                  <MenuItem key={comp.key} value={comp.key}>
                    {comp.name} (Week {comp.week + 1})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              name="additionalInfo"
              label="Any other additional info"
              multiline
              required
              placeholder="e.g. want to trade, willing to ship, need in good condition, willing to pay $X for it, etc..."
              rows={4}
              value={formData.additionalInfo}
              onChange={handleInputChange}
              margin="normal"
            />

            <button
              type="submit"
              className="w-full mt-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || formData.additionalInfo === "" || formData.quantity === 0 || !selectedPart || !dateNeeded}
            >
              {loading ? <CircularProgress size={24} /> : "Submit Request"}
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

export default PartRequestForm;
