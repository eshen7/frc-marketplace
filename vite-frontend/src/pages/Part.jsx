import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";

const PartDetailsComponent = ({ part }) => {
  return (
    <Box sx={{ bgcolor: "grey.100", p: 2, minWidth: 300 }}>
      <Container
        maxWidth="lg"
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Card sx={{ maxWidth: 600, width: "100%", p: 3 }}>
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
                {part.manufacturer.website ?<Link href = {part.manufacturer.website}>{part.manufacturer.name}</Link>:<Typography>{part.manufacturer.name || "Unknown"}</Typography>}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Link:
                </Typography>
                {part.link ? <Link href={part.link}>{part.link || "N/A"}</Link>: <Typography>N/A</Typography>}
              </Box>
            </Box>
          </Paper>

          {part.externalLink && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                href={part.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                View More Details
              </Button>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
};

const PartDetailsPage = () => {
  const { id } = useParams();

  const { user } = useUser();

  const [part, setPart] = useState(null);
  const [requests, setRequests] = useState([]);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  const [onRequests, setOnRequests] = useState(true);

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

    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get(`/parts/id/${id}/requests`);
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoadingRequests(false);
      }
    };

    const fetchSales = async () => {
      try {
        const response = await axiosInstance.get(`/parts/id/${id}/sales`);
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchPart();
    fetchRequests();
    fetchSales();
  }, [id]);

  const handleClickSales = () => {
    setOnRequests(false);
  };

  const handleClickRequests = () => {
    setOnRequests(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar />
      <Box sx={{ flexGrow: 1, bgcolor: "grey.100", px: 3 }}>
        {!error && part ? (
          <PartDetailsComponent part={part} />
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
              <Grid container spacing={2}>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={request.id}>
                      <ItemCard
                        item={request}
                        currentUser={user}
                        type="request"
                      />
                    </Grid>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No requests found for this part.
                  </Typography>
                )}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={sale.id}>
                      <ItemCard item={sale} currentUser={user} type="sale" />
                    </Grid>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No sales found for this part.
                  </Typography>
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
