'use client'

import React, { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import Footer from '../components/Footer.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance.js'
import { getDaysUntil, haversine } from '../utils/utils.jsx'
import { FaComments } from 'react-icons/fa'
import ItemCard from '../components/ItemCard.jsx'
import { Skeleton } from "@mui/material";
import { LuSave } from 'react-icons/lu'
import { MdOutlineEdit } from 'react-icons/md'
import ErrorBanner from '../components/ErrorBanner.jsx'
import SuccessBanner from '../components/SuccessBanner.jsx'
import ItemScrollBar from '../components/ItemScrollBar.jsx'

export default function FulfillRequest() {
  const { request_id } = useParams();

  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [partRequests, setPartRequests] = useState([]);
  const [loadingPartRequests, setLoadingPartRequests] = useState(true);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [isRequestOwner, setIsRequestOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [requestChange, setRequestChange] = useState("");

  const [formData, setFormData] = useState({
    quantity: { val: 0, edited: false },
    needed_date: { val: "", edited: false },
    additional_info: { val: "", edited: false },
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    checkAuthStatus(); // Check on mount

    // Set up an event listener for storage changes
    window.addEventListener("storage", checkAuthStatus);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (isAuthenticated) {
          const response = await axiosInstance.get("/users/self/");
          if (!response.data) {
            throw new Error('Address or coordinates not found');
          }

          setUser(response.data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, [isAuthenticated])

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axiosInstance.get(`/requests/id/${request_id}/`)
        setRequest(response.data);
        setFormData({
          quantity: { val: response.data.quantity, edited: false },
          needed_date: { val: response.data.needed_date, edited: false },
          additional_info: { val: response.data.additional_info, edited: false },
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
      const response = await axiosInstance.get(`/parts/id/${request.part.id}/requests`);
      setPartRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingPartRequests(false);
    }
  };

  useEffect(() => {
    if (request) {
      fetchRequests();
    }
  }, [request])

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
            Need By: {date_obj.toLocaleDateString()} (
            {daysUntil} {daysUntil === 1 ? "day" : "days"})
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
  }

  const handleSaveClick = async () => {
    if (formData.quantity.edited || formData.needed_date.edited || formData.additional_info.edited) {
      try {
        const response = await axiosInstance.put(`/requests/id/${request_id}/edit/`, formData);

        setFormData({
          quantity: { val: formData.quantity.val, edited: false },
          needed_date: { val: formData.needed_date.val, edited: false },
          additional_info: { val: formData.additional_info.val, edited: false },
        });

        setRequest(response.data);
        setIsEditing(false);
        setRequestChange("Request Updated Successfully.");
      } catch (error) {
        console.error("Error saving request:", error);
        setRequestChange("Error saving request, please try again.");
      }
    } else {
      setIsEditing(false);
      setRequestChange("No changes to save.");
    }
  }

  const closeRequestChangeBanner = () => {
    setRequestChange("");
  }

  return (
    <div className='flex flex-col min-h-screen'>
      {requestChange == "Request Updated Successfully." || requestChange == "No changes to save." ? (
        <SuccessBanner
          message={requestChange}
          onClose={closeRequestChangeBanner}
        />
      ) : requestChange != "" ? (
        <ErrorBanner
          message={requestChange}
          onClose={closeRequestChangeBanner}
        />
      ) : (
        <></>
      )}
      <TopBar />
      <div className='flex-grow flex flex-col bg-gray-100'>
        <div className='py-8 md:py-16'>
          {request && !error ? (
            <div className='px-5 sm:px-12 md:px-20'>
              {/* Main Content */}
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
                {/* Name & Description */}
                <div className='flex flex-col'>
                  <div className='flex flex-row justify-between place-items-center'>
                    {/* Request Date */}
                    <p className='text-gray-500 text-sm'>
                      {(new Date(request.request_date)).toLocaleDateString()}
                    </p>
                    {/* Needed By */}
                    <div className='flex flex-row place-items-center'>
                      {isEditing ? (
                        <div>
                          <span className='text-sm text-gray-500'>Need By:</span>
                          <input type="date"
                            className={`${formData.needed_date.edited ? "border-2 border-blue-800" : "border-2 border-gray-500"}`}
                            value={formData.needed_date.val} onChange={(e) => setFormData({ ...formData, needed_date: { val: e.target.value, edited: true } })} />
                        </div>
                      ) : (
                        renderDueDate(request.needed_date)
                      )}
                    </div>
                  </div>
                  <div className='flex flex-row justify-between place-items-center'>
                    {/* Part Name */}
                    <h1 className='text-[30px] font-roboto'>
                      {request.part.name}
                    </h1>
                    {/* Edit Button */}
                    {isRequestOwner && (
                      <>
                        {isEditing ? (
                          <button className='rounded-full bg-white text-green-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer'
                            onClick={() => handleSaveClick()}>
                            <LuSave />
                          </button>
                        ) : (
                          <button className='rounded-full bg-white text-blue-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer'
                            onClick={() => handleEditClick()}>
                            <MdOutlineEdit />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <h2 className='text-[20px]'>
                    <a href={request.part.manufacturer.website} target='_blank'>
                      <span className='text-blue-600 hover:underline'>
                        {request.part.manufacturer.name}
                      </span>
                    </a>
                  </h2>
                  {/* Editing Quantity */}
                  {isEditing ? (
                    <div className='flex flex-row place-items-center'>
                      <span className=''>
                        Qty:
                      </span>
                      <input type='number' id='quantity' className={`w-12 ml-2 border-2 ${formData.quantity.edited ? "border-blue-800" : "border-gray-500"}`}
                        value={formData.quantity.val}
                        onChange={(e) => setFormData({ ...formData, quantity: { val: e.target.value, edited: true } })} />
                    </div>
                  ) : (
                    <p>
                      Qty: {request.quantity}
                    </p>
                  )}
                  {/* Additional Info */}
                  <div className='flex flex-col mt-6'>
                    <p className='font-semibold'>
                      Part Description
                    </p>
                    <p className='text-gray-500'>
                      {request.part.description ? request.part.description : (
                        "No description for the part available."
                      )}
                    </p>
                    <p className='font-semibold mt-4'>
                      Additional Info
                    </p>
                    <div className='text-gray-500'>
                      {isEditing ? (
                        <textarea type='text' id='additional_info'
                          rows={2}
                          className={`w-full border-2 ${formData.additional_info.edited ? "border-blue-800" : "border-gray-300"} min-h-[32px]`}
                          value={formData.additional_info.val}
                          onChange={(e) => setFormData({ ...formData, additional_info: { val: e.target.value, edited: true } })} />
                      ) : (
                        request.additional_info ? request.additional_info : (
                          "No additional info for the request was provided by the user."
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="relative" style={{ paddingTop: "100%" }}>
                  {!imageLoaded && (
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
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
                    className="absolute top-0 left-0 w-full h-full object-contain"
                    style={{
                      display: imageLoaded ? "block" : "none"
                    }}
                  />
                </div>

                {/* User Stuff */}
                <div className='col-span-1 md:col-span-2 xl:col-span-1'>
                  <div className='flex flex-row justify-between place-items-center'>
                    {/* Team Name */}
                    <h3 className='text-[24px] text-left md:text-center lg:text-left'>
                      {request.user.team_number} | {request.user.team_name}
                    </h3>
                    <div className='rounded-full p-1 bg-gray-300 mr-3 max-w-fit max-h-fit ml-2'>
                      <img src={request.user.profile_photo} className='w-[64px] h-[64px] rounded-full' />
                    </div>
                  </div>
                  {/* Distance */}
                  <div>
                    <p className='text-sm'>
                      {user && !isRequestOwner ? (
                        `${haversine(
                          request.user.formatted_address.latitude,
                          request.user.formatted_address.longitude,
                          user.formatted_address.latitude,
                          user.formatted_address.longitude
                        ).toFixed(1)} miles`
                      ) : user && isRequestOwner ? (
                        "Your Listing"
                      ) : ("Log in to view distance")}
                    </p>
                  </div>

                  <div className='flex flex-col mt-3'>
                    <button className='py-3 px-6 bg-black hover:bg-gray-800 transition duration-200 text-white rounded-md mb-4'>
                      <button onClick={() => navigate(`/profile/frc/${request.user.team_number}`)}>
                        <div className='flex flex-row justify-center place-items-center'>
                          <p>Profile Page</p>
                        </div>
                      </button>
                    </button>
                    <button className='py-3 px-6 bg-blue-700 hover:bg-blue-800 transition duration-200 text-white rounded-md'>
                      <button onClick={() => navigate(`/chat/${request.user.team_number}`)}>
                        <div className='flex flex-row justify-center place-items-center'>
                          <FaComments className='mr-3' />
                          <p>
                            Message
                          </p>
                        </div>
                      </button>
                    </button>
                  </div>

                </div>
              </div>

              {/* Other Requests for the Same Part */}
              {/* Part Requests Section */}
              <div className="mt-10 relative">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Requests for the same part
                </h2>
                <ItemScrollBar items={partRequests} loadingItems={loadingPartRequests} user={user} loadingUser={loadingUser} type="request" />
              </div>
            </div>
          ) : !error ? (
            <p className='text-center'>
              Loading Request...
            </p>
          ) : (
            <p className='text-center'>
              Error loading request, please try again.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}