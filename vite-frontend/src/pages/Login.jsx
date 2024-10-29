import React, { useState } from 'react';
import TopBar from './../components/TopBar.jsx';
import Container from '@mui/material/Container';
import { Box, Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import axiosInstance from "../utils/axiosInstance.js";
import Footer from '../components/Footer.jsx';


const Login = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  };

  const login = async (e) => {
    try {
      const response = await axiosInstance.post('/login/', formData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFTOKEN': getCookie('csrftoken'),
        }
      });

      if (response.status === 200) {
        console.log("Login successful:", response.data);
        // Redirect or update state to reflect the user is logged in
      } else {
        console.log("Login failed:", response.data.error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  return (
    <>
      <TopBar />
      <div className='flex justify-center bg-gray-100'>
        <div className='flex flex-col bg-white min-h-fit container my-20 justify-center w-2/3 mx-auto py-20 rounded-3xl min-w-96 shadow-xl'>
          <h1 className='text-5xl text-red-800 font-bold font-roboto text-center mb-32'>Sign in</h1>
          <div className='flex flex-col gap-5'>
            <div className="w-2/3 mx-auto"><TextField id="outlined-basic" label="Email" variant="outlined" className='w-full' onChange={(e) => handleChange("email", e.target.value)} /></div>
            <div className="w-2/3 mx-auto"><TextField id="outlined-basic" label="Password" variant="outlined" className='w-full' onChange={(e) => handleChange("password", e.target.value)} /></div>
            <div className='flex flex-row mx-10 justify-center'>
              <div className='w-1/2 flex justify-center'>
                <a href='signup' className='text-blue-600 hover:text-blue-800'>Sign Up Instead</a>
              </div>
              <div className='w-1/2 flex justify-center'>
                <Button variant="contained" className='justify-end w-1/2 whitespace-nowrap' onClick={login} >Sign in</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default Login;