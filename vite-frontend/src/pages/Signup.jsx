import React, { useState, useEffect } from "react";
import TopBar from "./../components/TopBar.jsx";
import { Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import axiosInstance from "../utils/axiosInstance.js";
import Footer from "./../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner.jsx";

const Signup = () => {
  // States here have to be formatted according to the backend Model schema
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
  const [autocomplete, setAutocomplete] = useState(null);
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
    if (!password || !confirmation) {
      return "";
    }
    return password !== confirmation ? "Passwords do not match" : "";
  };

  const handleChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (name === "password" || name === "passwordConfirmation") {
      const error = validatePasswords(
        name === "password" ? value : updatedFormData.password,
        name === "passwordConfirmation"
          ? value
          : updatedFormData.passwordConfirmation
      );
      setPasswordError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emptyFields = Object.entries(formData).filter(
      ([key, value]) => value === ""
    );

    if (emptyFields.length > 1) {
      // Create an error message listing the empty fields
      const errorMessage = `Please fill in all required fields: ${emptyFields
        .map(([key]) => key.replace(/_/g, " "))
        .join(", ")}`;
      setError(errorMessage);
      return; // Stop form submission
    }

    if (passwordError) {
      return; // Don't submit if passwords don't match
    }
    await axiosInstance
      .post("/users/", formData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    navigate("/landingPage");
  };

  return (
    <>
      <TopBar />
      <div className="flex justify-center bg-gray-100">
        <div className="flex flex-col bg-white min-h-fit container my-20 justify-center w-2/3 mx-auto py-20 rounded-3xl min-w-96 shadow-xl">
          <h1 className="text-5xl text-red-800 font-bold font-roboto text-center mb-[100px]">
            Sign up
          </h1>
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="flex flex-col gap-5">
              <div className="w-2/3 mx-auto">
                <TextField
                  required
                  name="name"
                  autoComplete="name"
                  type="text"
                  label="Head Mentor Full Name"
                  variant="outlined"
                  className="w-full"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                />
              </div>
              <div className="w-2/3 mx-auto">
                <TextField
                  required
                  type="number"
                  label="Team Number"
                  variant="outlined"
                  className="w-full"
                  value={formData.team_number}
                  onChange={(e) => handleChange("team_number", e.target.value)}
                />
              </div>
              <div className="w-2/3 mx-auto">
                <TextField
                  id="address-input" // Important: This ID is used by Google Places
                  required
                  label="Address"
                  variant="outlined"
                  className="w-full"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Start typing your address..."
                />
              </div>
              <div className="w-2/3 mx-auto">
                <TextField
                  required
                  label="Email"
                  type="email"
                  variant="outlined"
                  className="w-full"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  autoComplete="username" // Add this line
                />
              </div>
              <div className="w-2/3 mx-auto">
                <TextField
                  required
                  label="Phone Number"
                  type="number"
                  variant="outlined"
                  className="w-full"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="w-2/3 mx-auto">
                <TextField
                  required
                  label="Password"
                  variant="outlined"
                  className="w-full"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                />
              </div>
              <div className="w-2/3 mx-auto">
                <TextField
                  required
                  label="Re-type Password"
                  variant="outlined"
                  className="w-full"
                  type="password"
                  autoComplete="current-password"
                  value={formData.passwordConfirmation}
                  onChange={(e) =>
                    handleChange("passwordConfirmation", e.target.value)
                  }
                  error={!!passwordError}
                  helperText={passwordError}
                />
              </div>
              <div className="flex flex-row mx-10 justify-center">
                <div className="w-1/2 flex justify-center">
                  <a href="login" className="text-blue-600 hover:text-blue-800">
                    Sign In Instead
                  </a>
                </div>
                <div className="w-1/2 flex justify-center">
                  <Button
                    variant="contained"
                    type="submit"
                    className="justify-end w-1/2 whitespace-nowrap"
                    onClick={handleSubmit}
                    disabled={!!passwordError}
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}
    </>
  );
};

export default Signup;
