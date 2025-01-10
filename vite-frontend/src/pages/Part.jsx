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

      <Box sx={{ bgcolor: "grey.100", p: 2, minWidth: 300 }}>
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Card sx={{ maxWidth: 600, width: "100%", p: 3 }}>
            <div className="relative">
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                {part.image ? (
                  <CardMedia
                    component="img"
                    image={part.image}
                    alt={part.name}
                    sx={{
                      borderRadius: 1,
                      boxShadow: 1,
                      maxHeight: 400,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      bgcolor: "grey.200",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      No image available
                    </Typography>
                  </Box>
                )}
              </Box>
              {isAuthenticated && (
                <div className="absolute top-0 right-0">
                  <button
                    className={`text-white p-2 rounded-full hover:scale-105 transition-all duration-300 text-2xl text-center ${isEditing ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    onClick={handleEditClick}
                  >
                    {isEditing ? <FaSave /> : <FaEdit />}
                  </button>

                </div>
              )}
            </div>

            <Typography
              variant="h4"
              component="h1"
              sx={{ textAlign: "center", mt: 3, fontWeight: "bold" }}
            >
              {part.name || "Unnamed Part"}
            </Typography>

            <Paper sx={{ bgcolor: "grey.100", p: 2, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Part Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    ID:
                  </Typography>
                  <Typography>{part.model_id || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Category:
                  </Typography>
                  <Typography>{part.category.name || "Uncategorized"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Manufacturer:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {part.manufacturer.website ? (
                      <a href={part.manufacturer.website}
                        target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 hover:underline">
                        <Typography sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                          {part.manufacturer.name || "Unknown"}
                        </Typography>
                      </a>
                    ) : (
                      <Typography>{part.manufacturer.name || "Unknown"}</Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Link:
                  </Typography>
                  {!isEditing ? (
                    <a className="text-blue-500 hover:text-blue-600 hover:underline truncate ml-2"
                      href={formData.link} target="_blank" rel="noopener noreferrer">
                      {formData.link || "N/A"}
                    </a>
                  ) : (
                    <div className="w-full ml-5">
                      <TextField
                        fullWidth
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                      />
                    </div>
                  )}
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ bgcolor: "grey.100", p: 2, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Description
              </Typography>
              {!isEditing ? (
                <Typography variant="body1" color="text.secondary">
                  {part.description || "No description available for this part."}
                </Typography>
              ) : (
                <TextareaAutosize
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  className="w-full p-2 border border-gray-300 rounded-md bg-inherit hover:border-gray-500"
                />
              )}
            </Paper>
          </Card>
        </Container>
      </Box>
    </>
  );
};

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
  );
};

export default PartDetailsPage;
