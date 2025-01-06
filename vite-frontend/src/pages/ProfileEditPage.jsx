import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import SuccessBanner from "../components/SuccessBanner";
import TextField from "@mui/material/TextField";
import ErrorBanner from "../components/ErrorBanner";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import ProfilePhoto from "../components/ProfilePhoto";

const UserProfile = () => {
  const { user, loadingUser, isAuthenticated } = useUser();
  const [profileChange, setProfileChange] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirmation: "",
  });

  const navigate = useNavigate();

  // Initialize form data when user data is available
  useEffect(() => {
    if (!loadingUser && user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        address: user.formatted_address?.raw || "",
        phone: user.phone || "",
      });
    }
  }, [user, loadingUser]);

  // Check authentication
  useEffect(() => {
    if (!loadingUser && !isAuthenticated) {
      navigate("/login");
    }
  }, [loadingUser, isAuthenticated, navigate]);

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
      if (window.google && window.google.maps) {
        // Get the actual input element from the Material-UI TextField
        const input = document.querySelector('#address-input');
        
        if (!input) {
          console.error('Address input element not found');
          return;
        }

        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          input,
          {
            types: ["address"],
          }
        );

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            setFormData((prevData) => ({
              ...prevData,
              address: place.formatted_address,
            }));
          }
        });

        setAutocomplete(autocompleteInstance);
      }
    };

    // Load Google Places script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
      // Small delay to ensure the TextField is mounted
      setTimeout(initAutocomplete, 100);
    }

    // Cleanup
    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  // Input changing on profile changing fields
  const handleInputChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  };

  // Password Validation
  const validatePasswords = (password, confirmation) => {
    if (!password || !confirmation) {
      return "";
    }
    return password !== confirmation ? "Passwords do not match" : "";
  };

  // Input Changing on password fields
  const handlePassInputChange = (name, value) => {
    setPasswordData({ ...passwordData, [name]: value });

    if (name === "new" || name === "confirmation") {
      const error = validatePasswords(
        name === "new" ? value : passwordData.new,
        name === "confirmation" ? value : passwordData.confirmation
      );
      setPasswordError(error);
    }
  };

  // Changing Profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.put("/users/self/", formData);
      setProfileChange("Profile Updated Successfully.");
    } catch (error) {
      console.error("Error updating profile:", error.response || error.message);
      setProfileChange("Failed to update profile. Please try again.");
    }
  };

  const closeProfileChangeBanner = () => {
    setProfileChange("");
  };

  // Changing Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (
      !passwordData.current ||
      !passwordData.new ||
      !passwordData.confirmation
    ) {
      setPasswordError("All fields are required.");
      return;
    }

    if (passwordData.new !== passwordData.confirmation) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const response = await axiosInstance.put(
        "/change-password/",
        passwordData
      );

      setPasswordData({ current: "", new: "", confirmation: "" }); // Clear the form
      setPasswordError(""); // Clear any errors
      setProfileChange("Password changed successfully.");
    } catch (error) {
      console.error("Error updating profile:", error.response || error.message);
      setPasswordError(
        error.response?.data?.error ||
          "Failed to change password. Please try again."
      );
    }
  };

  // Account Deletion handling
  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== CONFIRMATION_TEXT) {
      alert("Please type the confirmation text exactly as shown.");
      return;
    }

    try {
      const response = await axiosInstance.delete("/users/self/delete/");
      alert("Account deleted successfully.");
      localStorage.removeItem("authToken");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting account:", error.response || error.message);
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {profileChange == "Profile Updated Successfully." ||
      profileChange == "Password changed successfully." ? (
        <SuccessBanner
          message={profileChange}
          onClose={closeProfileChangeBanner}
        />
      ) : profileChange != "" ? (
        <ErrorBanner
          message={profileChange}
          onClose={closeProfileChangeBanner}
        />
      ) : (
        <></>
      )}
      <TopBar />
      <div className="flex flex-col flex-grow px-20 pt-10">
        <div className="container mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          {!isAuthenticated ? (
            <div>
              <h1>Please log in to view your profile</h1>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Editable Information */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  {loadingUser ? (
                    <Skeleton count={13} />
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-4">
                        Editable Information
                      </h2>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <TextField
                            type="text"
                            id="address-input"
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            onFocus={(e) =>
                              e.target.setAttribute("autocomplete", "none")
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div>
                          <TextField
                            type="text"
                            id="email-input"
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div>
                          <TextField
                            type="tel"
                            id="phoneNumber"
                            label="Phone Number"
                            name="phoneNumber"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div>
                          <TextField
                            type="text"
                            id="headCoachName"
                            label="Head Coach Name"
                            name="headCoachName"
                            value={formData.full_name}
                            onChange={(e) =>
                              handleInputChange("full_name", e.target.value)
                            }
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          Update Profile
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Password Change */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Change Password
                  </h2>
                  <form className="space-y-4">
                    <div>
                      <TextField
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        label="Current Password"
                        value={passwordData.current}
                        onChange={(e) =>
                          handlePassInputChange("current", e.target.value)
                        }
                        required
                        className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <TextField
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        value={passwordData.new}
                        onChange={(e) =>
                          handlePassInputChange("new", e.target.value)
                        }
                        required
                        error={!!passwordError}
                        helperText={passwordError}
                        className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <TextField
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm New Password"
                        value={passwordData.confirmation}
                        onChange={(e) =>
                          handlePassInputChange("confirmation", e.target.value)
                        }
                        required
                        error={!!passwordError}
                        helperText={passwordError}
                        className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handlePasswordChange}
                      disabled={!!passwordError}
                      className="w-full font-bold py-2 px-4 rounded"
                    >
                      Change Password
                    </Button>
                  </form>
                </div>

                {/* Uneditable Information */}
                <div className="bg-white shadow-md rounded-lg p-6 relative">
                  {loadingUser ? (
                    <Skeleton className="" />
                  ) : user && !loadingUser ? (
                    <>
                      <h2 className="text-xl font-semibold mb-4">
                        Uneditable Information
                      </h2>
                      <div className="absolute right-[20px] top-[20px] rounded-lg bg-gray-200">
                        <ProfilePhoto 
                          src={user.profile_photo}
                          teamNumber={user.team_number}
                          className="p-2 w-[60px] h-[60px] rounded-md"
                          alt={"Team Logo"}
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">
                            Team Name
                          </h3>
                          <p className="mt-1 py-2">{user.team_name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">
                            Team Number
                          </h3>
                          <p className="mt-1 py-2">{user.team_number}</p>
                        </div>
                      </div>
                    </>
                  ) : (<></>)}
                </div>

                {/* Delete Account */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
                  <p className="text-sm mb-4">Actions cannot be undone</p>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteAccount}
                    className="w-full py-2 px-4"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <p className="mb-4">
            This action cannot be undone. To confirm, please type:
          </p>
          <p className="font-bold mb-4">{CONFIRMATION_TEXT}</p>
          <TextField
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type confirmation text here"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteConfirmation !== CONFIRMATION_TEXT}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserProfile;
