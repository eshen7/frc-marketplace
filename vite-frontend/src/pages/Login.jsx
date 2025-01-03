import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./../components/TopBar.jsx";
import Container from "@mui/material/Container";
import { Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import axiosInstance from "../utils/axiosInstance.js";
import Footer from "../components/Footer.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const handleCloseBanner = () => {
    setShowErrorBanner(false);
  };

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

      const userID = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_id="))
        ?.split("=")[1];

      if (response.status === 200) {
        console.log("Login successful", response.data);
        return { success: true, access, userID };
      } else {
        setShowErrorBanner(true);
        return {
          success: false,
          error: "Login response missing required data",
        };
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setShowErrorBanner(true);
      return { success: false, error: error.message };
    }
  };

  async function handleSubmit() {
    const result = await login();
    if (result.success) {
      // Store tokens in localStorage
      localStorage.setItem("authToken", result.access);
      window.dispatchEvent(new Event("storage")); // Notify other tabs/windows
      navigate("/", {
        state: {
          fromLogin: true,
          message: "Logged in Successfully!",
        },
      });
    } else {
      console.error("An error occurred:", result.error);
    }
  }

  return (
    <>
      {showErrorBanner && (
        <ErrorBanner
          message="An error occurred during login"
          onClose={handleCloseBanner}
        />
      )}
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-grow flex justify-center bg-white sm:bg-gradient-to-b from-white to-gray-900">
          <div className="flex flex-col bg-white min-h-fit container sm:my-20 justify-center w-full h-full sm:h-fit sm:w-[450px] mx-auto py-16 rounded-sm sm:shadow-md">
            <div className="text-black font-semibold flex flex-row justify-center items-center">
              <img
                src="/millenniumMarket_Black.svg"
                alt="Millennium Market"
                className=" w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] z-50" />
              <div className="flex flex-col text-black font-semibold text-4xl sm:text-5xl">
                <p className="">Millennium</p>
                <p className="">Market</p>
              </div>
            </div>
            <h2 className="text-black font-semibold text-[24px] my-8 text-center">Log In</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission behavior
                handleSubmit(); // Call your handleSubmit function
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="w-10/12 mx-auto">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={true}
                    onChange={(e) => handleChange("email", e.target.value)} />
                </div>
                <div className="w-10/12 mx-auto">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={true}
                    onChange={(e) => handleChange("password", e.target.value)} />
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="flex flex-col mx-10 justify-center">
                  <button
                    type="submit"
                    className="w-full whitespace-nowrap bg-black text-white p-3 rounded-sm hover:bg-gray-900 hover:cursor-pointer"
                    disabled={formData.email === "" || formData.password === ""}
                  >
                    Log In
                  </button>

                  <div className="text-center flex flex-row justify-center mt-4">
                    <p className="text-gray-500 mr-1">Don't have an account?</p>
                    <button onClick={() => navigate("/signup")} className="text-blue-600 hover:text-blue-800 hover:underline">
                      Sign Up Instead
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};
export default Login;
