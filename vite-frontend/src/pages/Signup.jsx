import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import axiosInstance from "../utils/axiosInstance.js";
import ErrorBanner from "../components/ErrorBanner.jsx";

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    address: "",
    team_number: "",
    team_name: "",
    phone: "",
    passwordConfirmation: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
      const input = document.getElementById("address-input");
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ["address"],
          componentRestrictions: { country: "us" }, // Adjust as needed
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setFormData((prevData) => ({
              ...prevData,
              address: place.formatted_address,
            }));
          }
        });
      }
    };

    if (window.google && window.google.maps) {
      initAutocomplete();
    } else {
      const apiKey = import.meta.env.GOOGLE_API_KEY;
      if (!apiKey) {
        console.error("Google Maps API key is missing");
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    }
  }, []);

  const validatePasswords = (password, confirmation) => {
    if (!password || !confirmation) return "";
    return password !== confirmation ? "Passwords do not match" : "";
  };

  const handleChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (name === "password" || name === "passwordConfirmation") {
      const error = validatePasswords(
        name === "password" ? value : updatedFormData.password,
        name === "passwordConfirmation" ? value : updatedFormData.passwordConfirmation
      );
      setPasswordError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emptyFields = Object.entries(formData).filter(([key, value]) => value === "");

    if (emptyFields.length > 1) {
      setError(`Please fill in all required fields: ${emptyFields
        .map(([key]) => key.replace(/_/g, " "))
        .join(", ")}`);
      return;
    }

    if (passwordError) return;

    try {
      const response = await axiosInstance.post("/users/", formData);
      if (response.status === 201 || response.status === 200) {
        navigate("/landingPage");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      if (err.response?.data) {
        if (err.response.data.team_number) {
          setError("This team number is already registered");
        } else if (err.response.data.email) {
          setError("This email is already registered");
        } else if (err.response.data.phone) {
          setError("This phone number is already registered");
        } else {
          setError(err.response.data.message || "An error occurred during registration. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  return (
    <>
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}
      <div className="flex flex-col max-h-screen h-screen">
        <TopBar />
        <div className="flex flex-row">
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
          {/* <div className="flex justify-center bg-white sm:bg-gradient-to-b from-white to-gray-900"> */}
          <div className="flex flex-col bg-white min-h-fit container justify-center w-full overflow-y-auto sm:h-fit sm:w-[640px] mx-auto py-16 rounded-sm">
            <div className="text-black font-semibold flex flex-row justify-center items-center">
              <img
                src="/millenniumMarket_Black.svg"
                alt="Millennium Market"
                className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] z-50"
              />
              <div className="flex flex-col text-black font-semibold text-4xl sm:text-5xl">
                <p>Millennium</p>
                <p>Market</p>
              </div>
            </div>
            <h2 className="text-black font-semibold text-[24px] my-8 text-center">Sign Up</h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="w-10/12 mx-auto">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    onChange={(e) => handleChange("full_name", e.target.value)}
                  />
                </div>
                <div className="w-10/12 mx-auto">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="w-10/12 mx-auto">
                  <input
                    type="number"
                    placeholder="Team Number"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    onChange={(e) => handleChange("team_number", e.target.value)}
                  />
                </div>
                <div className="w-10/12 mx-auto">
                  <input
                    id="address-input"
                    type="text"
                    placeholder="Address"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div className="w-10/12 mx-auto">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                <div className="w-10/12 mx-auto">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>
                <div className="w-10/12 mx-auto">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    onChange={(e) => handleChange("passwordConfirmation", e.target.value)}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
                <div className="flex flex-col w-10/12 mx-auto justify-center">
                  <button
                    type="submit"
                    className="w-full whitespace-nowrap bg-black text-white p-3 rounded-sm hover:bg-gray-900 hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!!passwordError || formData.full_name === "" || formData.email === "" || formData.team_number === "" || formData.address === "" || formData.phone === "" || formData.password === "" || formData.passwordConfirmation === ""}
                  >
                    Sign Up
                  </button>
                  <div className="text-center flex flex-row justify-center mt-4">
                    <p className="text-gray-500 mr-1">Already have an account?</p>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Log In Instead
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {/* </div> */}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Signup;
