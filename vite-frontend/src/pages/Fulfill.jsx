'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
} from '@mui/material'
import TopBar from './../components/TopBar.jsx'
import Footer from '../components/Footer.jsx'
import { useParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance.js'
import { haversine } from '../utils/utils.jsx'

// example data
const requestData = {
  "id": 1,
  "quantity": 1,
  "request_date": "2024-11-29",
  "needed_date": "2024-11-14",
  "needed_for": "asdfasdf",
  "additional_info": "jggjhb. hgiggkjhk",
  "part_id": 1,
  "part_name": ";lkj",
  "part_description": "hhkjh",
  "user": {
    "email": "ericgrun4@gmail.com",
    "full_name": "Eric Grun",
    "team_name": "The Aluminum Narwhals",
    "team_number": 3128,
    "formatted_address": {
      "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
      "latitude": 32.9582122,
      "longitude": -117.189548
    }
  }
}

// example urls
const imageUrls = [
  "https://cdn.andymark.com/product_images/35-inline-chain-tensioner/5cfa67d861a10d516785a4fb/zoom.jpg?c=1559914456",
  "https://cdn.shopify.com/s/files/1/0440/0326/2624/files/WCP-0963_5163c5ca-14bc-48ed-b9fb-40353dc11a36.png?v=1687826274"
]

export default function FulfillRequest() {
  const { request_id } = useParams();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    checkAuthStatus(); // Check on mount

    // Set up an event listener for storage changes
    window.addEventListener("storage", checkAuthStatus);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/users/self/");
        if (!response.data) {
          throw new Error('Address or coordinates not found');
        }

        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }
    fetchUser();
  }, [isAuthenticated])

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axiosInstance.get(`/requests/${request_id}/`)
        setRequest(response.data);
      } catch (err) {
        console.error("Error fetching Part Request:", err);
        setError(err);
      }
    };

    fetchRequest();
  }, [request_id]);


  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length)
  }
  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        {request && !error ? (

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: 2 }}>
            <Typography variant="h2" component="h1" gutterBottom className="font-paytone text-[#AE0000] font-extrabold text-shadow-md">
              Fulfill Request
            </Typography>
            <Grid container spacing={4} justifyContent="center" alignItems="flex-start" sx={{ maxWidth: 1200, mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden' }}>
                    <img
                      src={imageUrls[currentImageIndex]}
                      alt={`Image ${currentImageIndex + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button onClick={prevImage} variant="contained">Previous</Button>
                    <Button onClick={nextImage} variant="contained">Next</Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h4" component="h2" gutterBottom>
                    {request.part_name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Quantity:</strong> {request.quantity}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Need the Part by:</strong> {new Date(request.needed_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Needed for:</strong> {request.needed_for}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Additional info:</strong>
                  </Typography>
                  <Box sx={{ maxHeight: 100, overflowY: 'auto', mb: 2 }}>
                    <Typography variant="body2">
                      {request.additionalInfo}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ width: '100%', maxWidth: 600, mt: 2 }}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <div className='flex flex-col'>
                  <div className='flex flex-col items-center'>
                    <Typography variant="h4" component="h2" gutterBottom>
                      <strong>{request.user.team_name}</strong>
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      {request.user.team_number}
                    </Typography>
                  </div>
                  <Typography variant="body1" gutterBottom>
                    <strong>Distance:</strong> {user ? (
                      `${haversine(
                        request.user.formatted_address.latitude,
                        request.user.formatted_address.longitude,
                        user.formatted_address.latitude,
                        user.formatted_address.longitude
                      ).toFixed(1)} miles`
                    ) : ("Log in to view distance")}
                  </Typography>
                  <Button onClick={() => {
                    window.location.href = `/profile/frc/${request.user.team_number}`
                  }} variant="contained" color="primary" fullWidth>
                    View their profile
                  </Button>
                </div>
              </Paper>
            </Box>
          </Box>
        ) : !error ? (
          <>r
            <p>loading</p>
          </>
        ) : (
          <>
            <p>{error}</p>
          </>
        )}
        <Footer />
      </Box>
    </>
  )
}