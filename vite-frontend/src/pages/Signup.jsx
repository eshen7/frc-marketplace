import React, { useState } from "react";
import TopBar from "./../components/TopBar.jsx";
import { Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import axiosInstance from "../utils/axiosInstance.js";

const handleChange = (e) => {};

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
    confirmationCode: "",
  });

  const [passwordError, setPasswordError] = useState("");

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
    if (passwordError) {
      return; // Don't submit if passwords don't match
    }

    axiosInstance
      .post("/users/", formData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <TopBar />
      <div className="flex justify-center bg-gray-100">
        <div className="flex flex-col bg-gray-200 min-h-fit container my-20 justify-center w-2/3 mx-auto py-20 rounded-3xl min-w-96 shadow-xl">
          <h1 className="text-5xl text-red-800 font-bold font-roboto text-center mb-[100px]">
            Sign up
          </h1>
          <div className="flex flex-col gap-5">
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
                required
                label="Head Mentor Full Name"
                variant="outlined"
                className="w-full"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
              />
            </div>
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
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
                id="outlined-basic"
                required
                type="text"
                label="Team Name"
                variant="outlined"
                className="w-full"
                value={formData.team_name}
                onChange={(e) => handleChange("team_name", e.target.value)}
              />
            </div>
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
                required
                label="Address"
                variant="outlined"
                className="w-full"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
                required
                label="Email"
                type="email" // need to figure out type validation
                variant="outlined"
                className="w-full"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
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
                id="outlined-basic"
                required
                label="Password"
                variant="outlined"
                className="w-full"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>

            {/* TODO: CHECK IF BOTH PASSWORDS ARE THE SAME */}
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
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
            <div className="w-2/3 mx-auto">
              <TextField
                id="outlined-basic"
                required
                label="Confirmation Code"
                variant="outlined"
                className="w-full"
                value={formData.confirmationCode}
                onChange={(e) =>
                  handleChange("confirmationCode", e.target.value)
                }
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
                  className="justify-end w-1/2 whitespace-nowrap"
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
