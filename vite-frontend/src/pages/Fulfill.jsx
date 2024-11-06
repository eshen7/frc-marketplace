'use client'

import React, { useState } from 'react'
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

// example data
const requestData = {
  itemName: "#35 chain turnbuckle",
  quantity: 5,
  needByDate: "2025-1-15",
  neededFor: "pivot mechanism",
  additionalInfo: "make sure threads aren't stripped and idk",
  headMentorName: "ethan lemke"
}

// example urls
const imageUrls = [
  "https://cdn.andymark.com/product_images/35-inline-chain-tensioner/5cfa67d861a10d516785a4fb/zoom.jpg?c=1559914456",
  "https://cdn.shopify.com/s/files/1/0440/0326/2624/files/WCP-0963_5163c5ca-14bc-48ed-b9fb-40353dc11a36.png?v=1687826274"
]

export default function FulfillRequest() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
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
                {requestData.itemName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Quantity:</strong> {requestData.quantity}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Need the Part by:</strong> {new Date(requestData.needByDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Needed for:</strong> {requestData.neededFor}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Additional info:</strong>
              </Typography>
              <Box sx={{ maxHeight: 100, overflowY: 'auto', mb: 2 }}>
                <Typography variant="body2">
                  {requestData.additionalInfo}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ width: '100%', maxWidth: 600, mt: 2 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Head Mentor Name:</strong> {requestData.headMentorName}
            </Typography>
            <Button variant="contained" color="primary" fullWidth>
              Get in Contact - DMs
            </Button>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}