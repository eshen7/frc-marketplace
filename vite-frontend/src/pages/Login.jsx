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
  const [errorMessage, setErrorMessage] = useState("");

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
      const response = await axiosInstance.post("/login/", formData).catch((error) => {
        setShowErrorBanner(true);
        setErrorMessage(error.response.data.error || "Login failed");
        throw error;
      });

      // Extract tokens
      const { access, refresh } = response.data;

      const userID = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_id="))
        ?.split("=")[1];

      if (response.status === 200) {
        return { success: true, access, userID };
      } else {
        setShowErrorBanner(true);
        setErrorMessage("Login response missing required data");
        return {
          success: false,
          error: "Login response missing required data",
        };
      }
    } catch (error) {
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
      return
    }
  }

  return (
    <>
      {showErrorBanner && (
        <ErrorBanner
          message={errorMessage}
          onClose={handleCloseBanner}
        />
      )}
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex flex-row min-h-screen">
          {/* Left Side */}
          <div className="hidden h-screen lg:flex w-[55.5%] overflow-hidden bg-black sticky top-0">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
            </div>
            <div className="flex flex-col w-full items-center justify-center">
              <div className="flex flex-col items-center w-full">
                <h1 className="text-white text-4xl font-bold">Where Teamwork</h1>
                <h1 className="text-[#3d4df4] text-4xl font-bold">Drives Innovation</h1>
              </div>

              <div className="flex flex-col px-[15%] w-full mt-[50px] text-center">
                <p className="text-white text-[24px]">Unite with nearby teams for support when it matters most</p>
              </div>

              {/* Screenshot Container */}
              <div className="w-full px-[15%] mt-8">
                <div className="bg-[#3d4df4]/50 backdrop-blur-lg rounded-xl p-4 shadow-2xl transform -rotate-2">
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
                    <img
                      src="/ExampleScreenshot.png"
                      alt="Millennium Market Preview"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex-grow flex flex-col justify-center items-center bg-white">
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
                    className="w-full whitespace-nowrap bg-black text-white p-3 rounded-sm hover:bg-gray-900 hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
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
