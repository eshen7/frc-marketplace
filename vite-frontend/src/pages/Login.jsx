import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./../components/TopBar.jsx";
import Container from "@mui/material/Container";
import { Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import axiosInstance from "../utils/axiosInstance.js";
import Footer from "../components/Footer.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  };

  const login = async () => {
    try {
      const response = await axiosInstance.post("/login/", formData);

      // Extract tokens
      const { access, refresh } = response.data;

      const userUUID = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_uuid="))
        ?.split("=")[1];

      if (response.status === 200) {
        console.log("Login successful", response.data);
        return { success: true, access, userUUID };
      } else {
        return {
          success: false,
          error: "Login response missing required data",
        };
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };

  async function handleSubmit() {
    const result = await login();
    console.log(result);
    if (result.success) {
      // Store tokens in localStorage
      localStorage.setItem("authToken", result.access);
      window.dispatchEvent(new Event("storage")); // Notify other tabs/windows
      navigate("/"); // Redirect to homepage
    } else {
      console.error("An error occurred:", result.error);
    }
  }

  return (
    <>
      <TopBar />
      <div className="flex justify-center bg-gray-100">
        <div className="flex flex-col bg-white min-h-fit container my-20 justify-center w-2/3 mx-auto py-20 rounded-3xl min-w-96 shadow-xl">
          <h1 className="text-5xl text-red-800 font-bold font-roboto text-center mb-32">
            Sign in
          </h1>
          <div className="flex flex-col gap-5">
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
                label="Email"
                variant="outlined"
                className="w-full"
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
                label="Password"
                variant="outlined"
                className="w-full"
                type="password"
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
            <div className="flex flex-row mx-10 justify-center">
              <div className="w-1/2 flex justify-center">
                <a href="signup" className="text-blue-600 hover:text-blue-800">
                  Sign Up Instead
                </a>
              </div>
              <div className="w-1/2 flex justify-center">
                <Button
                  variant="contained"
                  className="justify-end w-1/2 whitespace-nowrap"
                  onClick={handleSubmit}
                >
                  Sign in
                </Button>
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
