import React, { useEffect, useState } from 'react'
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton'
import SuccessBanner from '../components/SuccessBanner';


const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileChange, setProfileChange] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    phone: "",
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


  const handleInputChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  }

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



  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    try {
      const response = await axiosInstance.put("/users/self/", formData);
      console.log("Profile updated successfully:", response.data);

      // Optionally, you can update the `profileData` state with the response
      setProfileData(response.data);

      setProfileChange("Profile Updated Successfully.");
    } catch (error) {
      console.error("Error updating profile:", error.response || error.message);
      alert("Failed to update profile. Please try again.");
    }
  };

  const closeProfileChangeSuccessBanner = () => {
    setProfileChange("");
  }

  const handlePasswordChange = () => {

  }

  return (
    <div className='min-h-screen flex flex-col'>
      {profileChange != "" && (
				<SuccessBanner
					message={profileChange}
					onClose={closeProfileChangeSuccessBanner}
				/>
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
            <div className="grid gap-6 md:grid-cols-2">
              {/* Editable Information */}
              <div className="bg-white shadow-md rounded-lg p-6">
                {loading || !profileData ? (
                  <>
                    <Skeleton count={11} />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Editable Information</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="address-input" className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          id="address-input"
                          name="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="headCoachName" className="block text-sm font-medium text-gray-700">Head Coach Name</label>
                        <input
                          type="text"
                          id="headCoachName"
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
                    <Skeleton className='h-[324px]' />
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
              <div className="bg-white shadow-md rounded-lg p-6 md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input type="password" id="currentPassword" name="currentPassword" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" id="newPassword" name="newPassword" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                  <button type="submit" className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div >
      </div >

      <Footer />
    </div >
  );
};

export default UserProfile