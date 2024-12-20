import React, { useEffect, useState } from 'react'
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton'
import SuccessBanner from '../components/SuccessBanner';
import TextField from "@mui/material/TextField";
import ErrorBanner from '../components/ErrorBanner';
import { Button } from '@mui/material';


const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileChange, setProfileChange] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirmation: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
      if (window.google && window.google.maps) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          document.getElementById("address-input"),
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
      initAutocomplete();
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
  }

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
        name === "confirmation"
          ? value
          : passwordData.confirmation
      );
      setPasswordError(error);
    }
  }

  // Fetch self user
  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get("/users/self/");
      console.log('User Fetch Response:', response);
      const data = response.data;
      console.log('data', data);

      setProfileData(data);
      setFormData({
        full_name: data.full_name || "",
        address: data.formatted_address?.raw || "",
        phone: data.phone || "",
      });
      setLoading(false);
    }
    catch (error) {
      console.error('Error fetching User Data:', error);
      setError(error);
      setLoading(false);
    }
  }

  // Fetch user on mount
  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        navigate('/login');
        setError('User not logged in, please login to display profile editor'); // Display login message if no user
        setLoading(false);
        return;
      }

      try {
        await fetchUser(); // Fetch user data if a token exists
      } catch (error) {
        console.error('Error fetching User Data:', error);
        setError(error);
      }
    };

    checkUserAndFetchData();
  }, []);


  // Changing Profile
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    try {
      const response = await axiosInstance.put("/users/self/", formData);
      console.log("Profile updated successfully:", response.data);

      // Optionally, you can update the `profileData` state with the response
      setProfileData(response.data);

      setProfileChange("Profile Updated Successfully.");
    }
    catch (error) {
      console.error("Error updating profile:", error.response || error.message);
      setProfileChange("Failed to update profile. Please try again.");
    }
  };

  const closeProfileChangeBanner = () => {
    setProfileChange("");
  }

  // Changing Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.current || !passwordData.new || !passwordData.confirmation) {
      setPasswordError("All fields are required.");
      return;
    }

    if (passwordData.new !== passwordData.confirmation) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const response = await axiosInstance.put("/change-password/", passwordData)

      console.log("Password changed successfully:", response.data);
      setPasswordData({ current: "", new: "", confirmation: "" }); // Clear the form
      setPasswordError(""); // Clear any errors
      setProfileChange("Password changed successfully.");
    } catch (error) {
      console.error("Error updating profile:", error.response || error.message);
      setPasswordError(
        error.response?.data?.error || "Failed to change password. Please try again."
      );
    }
  }

  // Account Deletion handling
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      const response = await axiosInstance.delete("/users/self/delete/");
      console.log(response.data);

      // Notify the user of success
      alert("Account deleted successfully.");

      localStorage.removeItem("authToken");


      // Redirect to the home page
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error.response || error.message);
      alert("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      {profileChange == "Profile Updated Successfully." || profileChange == "Password changed successfully." ? (
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
      <div className='flex flex-col flex-grow px-20 pt-10'>
        <div className="container mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          {error ? (
            <>
              <div>
                <h1>Error message: </h1>
                <p>{error}</p>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Editable Information */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  {loading || !profileData ? (
                    <>
                      <Skeleton count={13} />
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Editable Information</h2>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <TextField
                            type="text"
                            id="address-input"
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
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
                            onChange={(e) => handleInputChange("phone", e.target.value)}
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
                            onChange={(e) => handleInputChange("full_name", e.target.value)}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                          Update Profile
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Uneditable Information */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  {loading || !profileData ? (
                    <>
                      <Skeleton className='' />
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Uneditable Information</h2>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Email</h3>
                          <p className="mt-1 py-2">{profileData.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Team Name</h3>
                          <p className="mt-1 py-2">{profileData.team_name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Team Number</h3>
                          <p className="mt-1 py-2">{profileData.team_number}</p>
                        </div>
                      </div>
                    </>
                  )}

                </div>

                {/* Password Change */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                  <form className="space-y-4">
                    <div>
                      <TextField
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        label="Current Password"
                        value={passwordData.current}
                        onChange={(e) => handlePassInputChange("current", e.target.value)}
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
                        onChange={(e) => handlePassInputChange("new", e.target.value)}
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
                        onChange={(e) => handlePassInputChange("confirmation", e.target.value)}
                        required
                        error={!!passwordError}
                        helperText={passwordError}
                        className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <Button
                      variant="contained"
                      color='success'
                      onClick={handlePasswordChange}
                      disabled={!!passwordError}
                      className="w-full font-bold py-2 px-4 rounded">
                      Change Password
                    </Button>
                  </form>
                </div>

                {/* Delete Account */}
                <div className='bg-white shadow-md rounded-lg p-6'>
                  <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
                  <p className='text-sm mb-4'>Actions cannot be undone</p>
                  <Button
                    variant='contained'
                    color='error'
                    onClick={handleDeleteAccount}
                    className='w-full py-2 px-4'>
                    Delete Account
                  </Button>
                </div>
              </div>
            </>
          )}
        </div >
      </div >
      <Footer />
    </div >
  );
};

export default UserProfile