"use client";

import React, { useEffect, useRef, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { getDaysUntil } from "../utils/utils.jsx";
import { CircularProgress, Skeleton, Autocomplete, TextField } from "@mui/material";
import { LuSave } from "react-icons/lu";
import { MdDelete, MdOutlineEdit } from "react-icons/md";
import ItemScrollBar from "../components/ItemScrollBar.jsx";
import DropdownButton from "../components/DropdownButton.jsx";
import ItemProfileSection from "../components/ItemProfileSection.jsx";
import { useUser } from "../contexts/UserContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import AlertBanner from "../components/AlertBanner";
import HelmetComp from "../components/HelmetComp.jsx";
import { FaArrowLeft } from "react-icons/fa";

export const LoadingViewPage = () => {
  return (
    <div className="flex-grow py-6 px-4 md:px-10">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Title and Status */}
            <div className="space-y-2">
              <Skeleton variant="text" width="80%" height={40} animation="wave" />
              <Skeleton variant="text" width="40%" height={24} animation="wave" />
            </div>

            {/* Request Info */}
            <div className="space-y-2 mt-6">
              <Skeleton variant="rectangular" height={100} animation="wave" className="rounded-lg" />
              <Skeleton variant="text" width="60%" height={24} animation="wave" />
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Image Area */}
            <Skeleton
              variant="rectangular"
              height={400}
              animation="wave"
              className="rounded-lg mb-4"
            />

            {/* Details under image */}
            <div className="space-y-2">
              <Skeleton variant="text" width="70%" height={32} animation="wave" />
              <Skeleton variant="text" width="50%" height={24} animation="wave" />
            </div>
          </div>
        </div>

        {/* Similar Requests */}
        <div className="mt-8">
          <Skeleton variant="text" width="200px" height={32} animation="wave" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={200}
                animation="wave"
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </div>);
};

export default function ViewRequest() {
  const { request_id } = useParams();

  const navigate = useNavigate();

  const { refreshSingle, users } = useData();  // Add users to destructuring

  const { user, loadingUser, isAuthenticated } = useUser();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);

  const [partRequests, setPartRequests] = useState([]);
  const [loadingPartRequests, setLoadingPartRequests] = useState(true);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [isRequestOwner, setIsRequestOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [requestChange, setRequestChange] = useState("");

  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    quantity: { val: 0, edited: false },
    needed_date: { val: "", edited: false },
    additional_info: { val: "", edited: false },
  });

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [fulfillmentOpen, setFulfillmentOpen] = useState(false);
  const [requiresReturn, setRequiresReturn] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTeam, setSearchTeam] = useState('');
  const [filteredTeams, setFilteredTeams] = useState([]);
  
  // Replace teams state and searchTeams function with this effect
  useEffect(() => {
    if (searchTeam) {
      const filtered = users.filter(user => 
        (user.team_number.toString().includes(searchTeam) ||
        user.team_name.toLowerCase().includes(searchTeam.toLowerCase())) &&
        user.team_number !== request?.user.team_number
      ).slice(0, 10);
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams([]);
    }
  }, [searchTeam, users, request?.user.team_number]);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axiosInstance.get(`/requests/id/${request_id}/`);
        setRequest(response.data);
        setFormData({
          quantity: { val: response.data.quantity, edited: false },
          needed_date: { val: response.data.needed_date, edited: false },
          additional_info: {
            val: response.data.additional_info,
            edited: false,
          },
        });
      } catch (err) {
        console.error("Error fetching Part Request:", err);
        setError(err);
      }
    };

    fetchRequest();
  }, [request_id]);

  useEffect(() => {
    if (user && request) {
      setIsRequestOwner(user.team_number === request.user.team_number);
    }
  }, [user, request]);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get(
        `/parts/id/${request.part.id}/requests`
      );
      // Filter out fulfilled requests, competition requests, and current request
      setPartRequests(response.data.filter((req) => 
        !req.is_fulfilled && 
        !req.event_key && 
        req.id !== request_id
      ));
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingPartRequests(false);
    }
  };

  useEffect(() => {
    if (request && request_id) {
      fetchRequests();
    }
  }, [request, request_id]);

  const renderDueDate = (date) => {
    const date_obj = new Date(date);
    const daysUntil = getDaysUntil(date_obj);
    const isUrgent = daysUntil < 5 && daysUntil > 0;
    const isOverdue = daysUntil < 0;
    const isDueToday = daysUntil === 0;
    const absoluteDaysUntil = Math.abs(daysUntil);

    return (
      <p
        className={`text-sm ${isOverdue || isDueToday
          ? "text-red-600 font-bold"
          : isUrgent
            ? "text-orange-600 font-bold"
            : "text-gray-500"
          }`}
      >
        {isOverdue ? (
          <>
            OVERDUE! ({absoluteDaysUntil}{" "}
            {absoluteDaysUntil === 1 ? "day" : "days"} ago)
          </>
        ) : isDueToday ? (
          <>Need Today!</>
        ) : (
          <>
            Need By: {date_obj.toLocaleDateString()} ({daysUntil}{" "}
            {daysUntil === 1 ? "day" : "days"})
          </>
        )}
      </p>
    );
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (
      formData.quantity.edited ||
      formData.needed_date.edited ||
      formData.additional_info.edited
    ) {
      try {
        const response = await axiosInstance.put(
          `/requests/id/${request_id}/edit/`,
          formData
        );

        setFormData({
          quantity: { val: formData.quantity.val, edited: false },
          needed_date: { val: formData.needed_date.val, edited: false },
          additional_info: { val: formData.additional_info.val, edited: false },
        });

        setRequest(response.data);
        setIsEditing(false);
        setAlertState({
          open: true,
          message: "Request Updated Successfully.",
          severity: "success",
        });
      } catch (error) {
        console.error("Error saving request:", error);
        setAlertState({
          open: true,
          message: "Error saving request, please try again.",
          severity: "error",
        });
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/requests/id/${request_id}/delete/`);
      setAlertState({
        open: true,
        message: "Request deleted successfully. Navigating to requests page...",
        severity: "success",
      });
      refreshSingle("requests");
      setTimeout(() => navigate("/requests"), 3000);
    } catch (error) {
      console.error("Error deleting request:", error);
      setAlertState({
        open: true,
        message: "Error deleting request, please try again.",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleDeleteInitialClick = async () => {
    setDeleteConfirmOpen(true);
  };

  const closeRequestChangeBanner = () => {
    setRequestChange("");
  };

  const handleFulfill = async () => {
    try {
      const response = await axiosInstance.post(
        `/requests/id/${request_id}/fulfill/`,
        { 
          team_number: selectedTeam.team_number,
          requires_return: requiresReturn 
        }
      );
      
      setRequest(response.data);
      setAlertState({
        open: true,
        message: "Request marked as fulfilled successfully!",
        severity: "success",
      });
      setFulfillmentOpen(false);
      refreshSingle("requests");
    } catch (error) {
      setAlertState({
        open: true,
        message: error.response?.data?.error || "Error fulfilling request",
        severity: "error",
      });
    }
  };

  const handleMarkReturned = async () => {
    try {
      const response = await axiosInstance.post(
        `/requests/id/${request_id}/return/`
      );
      
      setRequest(response.data);
      setAlertState({
        open: true,
        message: "Request marked as returned successfully!",
        severity: "success",
      });
      refreshSingle("requests");
    } catch (error) {
      setAlertState({
        open: true,
        message: error.response?.data?.error || "Error marking request as returned",
        severity: "error",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Go back"
      >
        <FaArrowLeft className="text-xl text-gray-700" />
      </button>

      <AlertBanner
        {...alertState}
        onClose={() => setAlertState({ ...alertState, open: false })}
      />
      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl max-w-[320px]">
            <h2 className="text-xl font-bold mb-4">Confirmation</h2>
            <p className="mb-4">
              Are you sure you want to delete this request? This process is
              irreversible.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteConfirm();
                }}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <TopBar />
      <div className="flex-grow flex flex-col bg-gray-100">
        <div className="py-8 md:py-16">
          {request && !error ? (
            <div className="px-5 sm:px-12 md:px-20">
              {/* Main Content */}
              <HelmetComp
                title={`${request.part.name} - Request - Team ${request.user.team_number} ${request.user.team_name}`}
                keywords={`Team ${request.user.team_number}, ${request.user.team_name}, sale, ${request.part.name}, ${request.part.manufacturer.name}`}
                description={`Robotics part ${request.part.name} requested - needed by ${new Date(request.needed_date).toLocaleDateString()} - Team ${request.user.team_number} ${request.user.team_name}`}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column - Scrollable Content */}
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    {/* Request Date */}
                    <p className="text-gray-500 text-sm">
                      {new Date(request.request_date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Part Name */}
                  <div className="flex flex-row justify-between place-items-center relative">
                    <button
                      onClick={() => navigate(`/parts/${request.part.id}`)}
                      className="text-[30px] font-roboto hover:underline hover:cursor-pointer text-left"
                    >
                      <h1>{request.part.name}</h1>
                    </button>
                    {/* Edit Button */}
                    {isRequestOwner && (
                      <>
                        {isEditing ? (
                          <button
                            className="rounded-full bg-white text-green-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer"
                            onClick={() => handleSaveClick()}
                          >
                            <LuSave />
                          </button>
                        ) : (
                          <button
                            className="rounded-full bg-white text-blue-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer"
                            onClick={() =>
                              setEditDropdownOpen(!editDropdownOpen)
                            }
                          >
                            <MdOutlineEdit />
                          </button>
                        )}
                      </>
                    )}

                    {/* Edit Dropdown */}
                    {editDropdownOpen && (
                      <div className="absolute top-[50px] right-[-20px] bg-white whitespace-nowrap z-50 rounded-lg px-1">
                        <DropdownButton
                          Logo={MdOutlineEdit}
                          name={"Edit"}
                          func={() => {
                            setEditDropdownOpen(false);
                            handleEditClick();
                          }}
                          navigate={navigate}
                        />
                        <div className="text-red-600">
                          <DropdownButton
                            Logo={MdDelete}
                            name={"Delete"}
                            func={() => {
                              setEditDropdownOpen(false);
                              handleDeleteInitialClick();
                            }}
                            navigate={navigate}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-[20px]">
                    <a
                      href={
                        request.part.manufacturer.website
                          ? request.part.manufacturer.website
                          : request.part.link
                      }
                      target="_blank"
                    >
                      <span className="text-blue-600 hover:underline">
                        {request.part.manufacturer.name}
                      </span>
                    </a>
                  </h2>

                  {/* Quantity & Due Date */}
                  <div className="flex flex-row justify-between place-items-center">
                    {/* Editing Quantity */}
                    {isEditing ? (
                      <div className="flex flex-row place-items-center">
                        <span className="">Qty:</span>
                        <input
                          type="number"
                          id="quantity"
                          className={`w-12 ml-2 border-2 ${formData.quantity.edited
                            ? "border-blue-800"
                            : "border-gray-500"
                            }`}
                          value={formData.quantity.val}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantity: { val: e.target.value, edited: true },
                            })
                          }
                        />
                      </div>
                    ) : (
                      <p>Qty: {request.quantity}</p>
                    )}
                    {/* Due Date */}
                    {isEditing ? (
                      <div className="flex flex-row place-items-center">
                        <span className="text-sm text-gray-500">Need By:</span>
                        <input
                          type="date"
                          className={`${formData.needed_date.edited
                            ? "border-2 border-blue-800"
                            : "border-2 border-gray-500"
                            }`}
                          value={formData.needed_date.val}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              needed_date: {
                                val: e.target.value,
                                edited: true,
                              },
                            })
                          }
                        />
                      </div>
                    ) : (
                      renderDueDate(request.needed_date)
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-col mt-6">
                    <p className="font-semibold">Part Link</p>
                    <h3>
                      <a
                        href={request.part.link ? request.part.link : ""}
                        target="_blank"
                        className={`${request.part.link ? "text-blue-500 hover:underline" : "text-gray-500"}`}
                        title={request.part.link ? request.part.link : "No link provided"}
                      >
                        {request.part.link ? request.part.link : "No link provided"}
                      </a>
                    </h3>
                    <p className="font-semibold mt-4">Part Description</p>
                    <p className="text-gray-500">
                      {request.part.description
                        ? request.part.description
                        : "No description for the part available."}
                    </p>
                    <p className="font-semibold mt-4">Additional Info</p>
                    <div className="text-gray-500">
                      {isEditing ? (
                        <textarea
                          type="text"
                          id="additional_info"
                          rows={2}
                          className={`w-full border-2 ${formData.additional_info.edited ? "border-blue-800" : "border-gray-300"
                            } min-h-[32px]`}
                          value={formData.additional_info.val}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              additional_info: {
                                val: e.target.value,
                                edited: true,
                              },
                            })
                          }
                        />
                      ) : request.additional_info ? (
                        request.additional_info
                      ) : (
                        "No additional info for the request was provided by the user."
                      )}
                    </div>
                  </div>

                  {/* Add Fulfillment Status */}
                  <div className="mt-4">
                    {request?.is_fulfilled ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-green-700 font-semibold">
                            Fulfilled by Team {request.fulfilled_by?.team_number} - {request.fulfilled_by?.team_name}
                          </p>
                          <span className="text-sm text-gray-600">
                            {new Date(request.fulfillment_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {request.requires_return ? (
                          <div className={`mt-2 p-3 rounded-md ${
                            request.is_returned ? 'bg-green-100' : 'bg-yellow-50 border border-yellow-200'
                          }`}>
                            {request.is_returned ? (
                              <p className="text-green-700">
                                ✓ Returned on {new Date(request.return_date).toLocaleDateString()}
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-yellow-700 font-medium">⚠️ Return Required</p>
                                {user?.team_number === request.fulfilled_by?.team_number ? (
                                  <>
                                    <p className="text-sm text-gray-600">Team {request.user.team_number} needs to return this part to your team.</p>
                                    <button
                                      onClick={handleMarkReturned}
                                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                                    >
                                      Mark as Returned
                                    </button>
                                  </>
                                ) : isRequestOwner && (
                                  <p className="text-sm text-gray-600">
                                    Please return this part to Team {request.fulfilled_by?.team_number} when you're finished with it.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2 p-3 rounded-md bg-green-100">
                            <p className="text-green-700">
                              ✓ Completed - Return not needed
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      isRequestOwner && (
                        <button
                          onClick={() => setFulfillmentOpen(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                        >
                          Mark as Fulfilled
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Right Column - Sticky Content */}
                <div className="hidden md:block">
                  <div className="sticky top-8">
                    {/* Image Container with max height constraint */}
                    <div
                      className="relative w-full"
                      style={{
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      {!imageLoaded && (
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            width: "100%",
                            height: "100%",
                            minHeight: "400px",
                          }}
                          animation="wave"
                        />
                      )}
                      <img
                        src={request.part.image}
                        alt={request.part.name}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className="w-full h-full object-contain"
                        style={{
                          display: imageLoaded ? "block" : "none",
                        }}
                      />
                    </div>

                    {/* Profile Section */}
                    <div className="mt-10">
                      <ItemProfileSection
                        user={request.user}
                        selfUser={user}
                        isOwner={isRequestOwner}
                        navigate={navigate}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile version of right column */}
                <div className="md:hidden flex flex-col gap-10">
                  {/* Image */}
                  <div
                    className="relative w-full"
                    style={{
                      height: "400px",
                    }}
                  >
                    {!imageLoaded && (
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          width: "100%",
                          height: "100%",
                        }}
                        animation="wave"
                      />
                    )}
                    <img
                      src={request.part.image}
                      alt={request.part.name}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className="w-full h-full object-contain"
                      style={{
                        display: imageLoaded ? "block" : "none",
                      }}
                    />
                  </div>
                  <ItemProfileSection
                    user={request.user}
                    selfUser={user}
                    isOwner={isRequestOwner}
                    navigate={navigate}
                  />
                </div>
              </div>

              {/* Other Requests for the Same Part */}
              <div className="mt-10 md:mt-20 w-full">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Requests for the same part
                </h2>
                <ItemScrollBar
                  items={partRequests}
                  loadingItems={loadingPartRequests}
                  user={user}
                  loadingUser={loadingUser}
                  type="request"
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          ) : !error ? (
            // <div className="flex justify-center items-center min-h-[200px]">
            //   <CircularProgress style={{ color: '#000000' }} />
            // </div>
            <LoadingViewPage />
          ) : (
            <p className="text-center">
              Error loading request, please try again.
            </p>
          )}
        </div>
      </div>
      <Footer />

      {/* Fulfillment Dialog */}
      {fulfillmentOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl max-w-[400px]">
            <h2 className="text-xl font-bold mb-4">Mark Request as Fulfilled</h2>
            
            <div className="mb-4">
              <Autocomplete
                options={filteredTeams}
                getOptionLabel={(option) => `${option.team_number} - ${option.team_name}`}
                value={selectedTeam}
                onChange={(_, newValue) => setSelectedTeam(newValue)}
                onInputChange={(_, newInputValue) => setSearchTeam(newInputValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Team" 
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={requiresReturn}
                  onChange={(e) => setRequiresReturn(e.target.checked)}
                />
                <span>Requires Return?</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setFulfillmentOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFulfill}
                disabled={!selectedTeam}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
