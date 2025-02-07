import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import ItemCard from "../components/ItemCard";
import { useUser } from "../contexts/UserContext";
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  Link,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  TextField,
  TextareaAutosize,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { FaEdit, FaSave } from "react-icons/fa";
import { useData } from "../contexts/DataContext";
import { haversine } from "../utils/utils";
import AlertBanner from "../components/AlertBanner";
import HelmetComp from "../components/HelmetComp";
import { motion } from "framer-motion";

const PartDetailsComponent = ({ part, setPart, isAuthenticated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: part.description || "",
    link: part.link || "",
  });
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    if (isEditing && (formData.description !== part.description || formData.link !== part.link)) {
      axiosInstance.put(`/parts/id/${part.id}/edit/`, formData)
        .then((response) => {
          setPart(response.data);
          setIsEditing(false);
          setAlertState({
            open: true,
            message: "Part Updated Successfully.",
            severity: 'success'
          });
        })
        .catch((error) => {
          setAlertState({
            open: true,
            message: "Error updating part, please try again.",
            severity: 'error'
          });
        });
    } else if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <>
      <AlertBanner
        {...alertState}
        onClose={() => setAlertState({ ...alertState, open: false })}
      />

      <div className="max-w-6xl mx-auto p-4 min-h-[calc(100vh-180px)]"> {/* Changed from fixed height to min-height */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row"> {/* Removed fixed height */}
            {/* Image Section - Reverted to original */}
            <div className="md:w-2/5 relative flex items-center justify-center p-4">
              {part.image ? (
                <img
                  src={part.image}
                  alt={part.name}
                  className="w-full h-[300px] object-cover"
                />
              ) : (
                <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center">
                  <Typography color="text.secondary">No image available</Typography>
                </div>
              )}
              {/* Edit Button */}
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditClick}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-lg backdrop-blur-md 
                    ${isEditing ? 'bg-green-500/90 hover:bg-green-600' : 'bg-blue-500/90 hover:bg-blue-600'} 
                    text-white transition-all duration-300`}
                >
                  {isEditing ? <FaSave className="text-xl" /> : <FaEdit className="text-xl" />}
                </motion.button>
              )}
            </div>

            {/* Content Section - Made scrollable if needed */}
            <div className="md:w-3/5 p-6 flex flex-col"> {/* Removed fixed height and overflow */}
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {part.name || "Unnamed Part"}
              </h1>

              {/* Info Grid - Made more flexible */}
              <div className="grid grid-cols-1 gap-6">
                {/* Quick Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Information</h2>
                  <div className="grid gap-2">
                    <InfoRow label="ID" value={part.model_id || "N/A"} />
                    <InfoRow label="Category" value={part.category.name || "Uncategorized"} />
                    <InfoRow 
                      label="Manufacturer" 
                      value={
                        part.manufacturer.website ? (
                          <a 
                            href={part.manufacturer.website}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                          >
                            {part.manufacturer.name || "Unknown"}
                            <LaunchIcon sx={{ fontSize: 16 }} />
                          </a>
                        ) : (
                          part.manufacturer.name || "Unknown"
                        )
                      } 
                    />
                    <InfoRow 
                      label="Product Link" 
                      value={
                        !isEditing ? (
                          formData.link ? (
                            <a 
                              href={formData.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 truncate"
                            >
                              {new URL(formData.link).hostname}
                              <LaunchIcon sx={{ fontSize: 16 }} />
                            </a>
                          ) : "N/A"
                        ) : (
                          <TextField
                            fullWidth
                            name="link"
                            value={formData.link}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            placeholder="Enter product URL"
                          />
                        )
                      }
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  {!isEditing ? (
                    <div className="max-h-[400px] overflow-y-auto"> {/* Added max-height with scroll */}
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {part.description || "No description available for this part."}
                      </p>
                    </div>
                  ) : (
                    <TextareaAutosize
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter part description"
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors min-h-[150px] max-h-[400px]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Add this helper component for consistent info rows
const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-900 text-right flex-1">{value}</span>
  </div>
);

const PartDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useUser();
  const { requests, sales, loadingStates } = useData();

  const [part, setPart] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onRequests, setOnRequests] = useState(true);
  const [salesDisplayLimit, setSalesDisplayLimit] = useState(12);
  const [requestsDisplayLimit, setRequestsDisplayLimit] = useState(12);
  const salesObserverTarget = useRef(null);
  const requestsObserverTarget = useRef(null);

  // Only fetch the part details, filter requests/sales from context
  useEffect(() => {
    const fetchPart = async () => {
      try {
        const response = await axiosInstance.get(`/parts/id/${id}`);
        setPart(response.data);
      } catch (error) {
        console.error("Error fetching part:", error);
        setError("Failed to load part data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPart();
  }, [id]);

  // Filter requests/sales from context instead of fetching
  const filteredRequests = requests.filter(request => request.part.id === id);
  const filteredSales = sales.filter(sale => sale.part.id === id);

  // Create intersection observers for both sections
  const salesObserverCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && filteredSales.length > salesDisplayLimit) {
        setSalesDisplayLimit(prev => prev + 12);
      }
    },
    [filteredSales?.length, salesDisplayLimit]
  );

  const requestsObserverCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && filteredRequests.length > requestsDisplayLimit) {
        setRequestsDisplayLimit(prev => prev + 12);
      }
    },
    [filteredRequests?.length, requestsDisplayLimit]
  );

  // Set up observers
  useEffect(() => {
    const salesObserver = new IntersectionObserver(salesObserverCallback, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    });

    const requestsObserver = new IntersectionObserver(requestsObserverCallback, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    });

    if (salesObserverTarget.current) {
      salesObserver.observe(salesObserverTarget.current);
    }

    if (requestsObserverTarget.current) {
      requestsObserver.observe(requestsObserverTarget.current);
    }

    return () => {
      if (salesObserverTarget.current) {
        salesObserver.unobserve(salesObserverTarget.current);
      }
      if (requestsObserverTarget.current) {
        requestsObserver.unobserve(requestsObserverTarget.current);
      }
    };
  }, [salesObserverCallback, requestsObserverCallback]);

  return (
    <>
      <HelmetComp title={part ? part.name : "Part Details"} />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <TopBar />
        <Box sx={{ flexGrow: 1, bgcolor: "grey.100", px: 3 }}>
          {!error && part ? (
            <PartDetailsComponent part={part} setPart={setPart} isAuthenticated={isAuthenticated} />
          ) : loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error: {error}
            </Alert>
          )}

          <Container maxWidth="lg" sx={{ mb: 5 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 4 }}>
              <Tabs
                value={onRequests ? 0 : 1}
                onChange={(_, value) => setOnRequests(value === 0)}
              >
                <Tab label="Part Requests" />
                <Tab label="View Sales" />
              </Tabs>
            </Box>

            <Box sx={{ mt: 3 }}>
              {onRequests ? (
                <Grid container spacing={2} className={`${loadingStates.requests ? "justify-center items-center" : ""}`}>
                  {filteredRequests.length > 0 ? (
                    <>
                      {filteredRequests.slice(0, requestsDisplayLimit).map((request) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={request.id}>
                          <ItemCard
                            item={request}
                            currentUser={user}
                            type="request"
                            itemDistance={isAuthenticated ? haversine(
                              user.formatted_address.latitude,
                              user.formatted_address.longitude,
                              request.user.formatted_address.latitude,
                              request.user.formatted_address.longitude
                            ).toFixed(1) : null}
                          />
                        </Grid>
                      ))}
                      {filteredRequests.length > requestsDisplayLimit && (
                        <div
                          ref={requestsObserverTarget}
                          className="col-span-full flex justify-center p-4 w-full"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : loadingStates.requests ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="ml-2">Loading Requests...</p>
                    </div>
                  ) : (
                    <Typography color="text.secondary">No requests found for this part.</Typography>
                  )}
                </Grid>
              ) : (
                <Grid container spacing={2} className={`${loadingStates.sales ? "justify-center items-center" : ""}`}>
                  {filteredSales.length > 0 ? (
                    <>
                      {filteredSales.slice(0, salesDisplayLimit).map((sale) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={sale.id}>
                          <ItemCard
                            item={sale}
                            currentUser={user}
                            type="sale"
                            itemDistance={isAuthenticated ? haversine(
                              user.formatted_address.latitude,
                              user.formatted_address.longitude,
                              sale.user.formatted_address.latitude,
                              sale.user.formatted_address.longitude
                            ).toFixed(1) : null}
                          />
                        </Grid>
                      ))}
                      {filteredSales.length > salesDisplayLimit && (
                        <div
                          ref={salesObserverTarget}
                          className="col-span-full flex justify-center p-4 w-full"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : loadingStates.sales ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="ml-2">Loading Sales...</p>
                    </div>
                  ) : (
                    <Typography color="text.secondary">No sales found for this part.</Typography>
                  )}
                </Grid>
              )}
            </Box>
          </Container>
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default PartDetailsPage;
