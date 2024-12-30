'use client'

import React, { useEffect, useRef, useState } from 'react'
import TopBar from './../components/TopBar.jsx'
import Footer from '../components/Footer.jsx'
import { useParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance.js'
import { getDaysUntil, haversine } from '../utils/utils.jsx'
import { FaComments } from 'react-icons/fa'
import ItemCard from '../components/ItemCard.jsx'

// example data
const requestData = {
  "id": "ca98f634-ee17-481b-b131-a4f4bb13243c",
  "quantity": 1,
  "request_date": "2024-12-29",
  "needed_date": "2025-02-03",
  "needed_for": "",
  "additional_info": "",
  "part": {
    "id": "487c4770-edd1-4d33-a7fb-416bee235e88",
    "name": "Kraken X60 REAL",
    "manufacturer_id": "7fbe19b9-b7eb-45d5-828b-f16e7861fb29",
    "category_id": "cb60b85c-80c1-42be-b113-4d8b746bed64",
    "model_id": null,
    "image": "https://frcmresources.s3.us-west-1.amazonaws.com/parts/WCP/Motor/kraken.webp",
    "manufacturer": {
      "id": "7fbe19b9-b7eb-45d5-828b-f16e7861fb29",
      "name": "WCP",
      "website": "https://wcproducts.com/"
    },
    "category": "Motor"
  },
  "user": {
    "email": "andrewkkchen@gmail.com",
    "full_name": "Andrew Chen",
    "team_name": "The Holy Cows",
    "team_number": 1538,
    "profile_photo": "https://www.thebluealliance.com/avatar/2024/frc1538.png",
    "phone": "1234567890",
    "formatted_address": {
      "raw": "5331 Mt Alifan Dr, San Diego, CA 92111, USA",
      "latitude": 32.8156639,
      "longitude": -117.1808113
    }
  }
}

// example urls
const imageUrls = [
  "https://cdn.andymark.com/product_images/35-inline-chain-tensioner/5cfa67d861a10d516785a4fb/zoom.jpg?c=1559914456",
  "https://cdn.shopify.com/s/files/1/0440/0326/2624/files/WCP-0963_5163c5ca-14bc-48ed-b9fb-40353dc11a36.png?v=1687826274"
]

export default function FulfillRequest() {
  const { request_id } = useParams();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [partRequests, setPartRequests] = useState([]);
  const [loadingPartRequests, setLoadingPartRequests] = useState(true);

  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -272, // Adjust the scroll distance as needed
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 272, // Adjust the scroll distance as needed
        behavior: "smooth",
      });
    }
  };

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
      }
    }
    fetchUser();
  }, [isAuthenticated])

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axiosInstance.get(`/requests/id/${request_id}/`)
        setRequest(response.data);
      } catch (err) {
        console.error("Error fetching Part Request:", err);
        setError(err);
      }
    };

    fetchRequest();
  }, [request_id]);

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

  return (
    <div className='flex flex-col min-h-screen'>
      <TopBar />
      <div className='flex-grow flex flex-col'>
        <div className='py-8 md:py-16'>
          {request && !error ? (
            <div className='px-5 sm:px-12 md:px-20'>
              {/* Main Content */}
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
                {/* Name & Description */}
                <div className='flex flex-col'>
                  <div className='flex flex-row justify-between'>
                    {/* Request Date */}
                    <p className='text-gray-500 text-sm'>
                      {(new Date(request.request_date)).toLocaleDateString()}
                    </p>
                    {/* Needed By */}
                    <div>
                      {renderDueDate(request.needed_date)}
                    </div>
                  </div>

                  {/* Part Name */}
                  <h1 className='text-[30px] font-roboto'>
                    {request.part.name}
                  </h1>
                  <h2 className='text-[20px]'>
                    <a href={request.part.manufacturer.website} target='_blank'>
                      <span className='text-blue-600 hover:underline'>
                        {request.part.manufacturer.name}
                      </span>
                    </a>
                  </h2>
                  {/* Quantity */}
                  <div className='flex flex-row justify-between place-items-center'>
                    <p>
                      Qty: {request.quantity}
                    </p>
                    <p className='text-green-700 text-[24px]'>
                      $?
                    </p>
                  </div>
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
                    <p className='text-gray-500'>
                      {request.additional_info ? request.additional_info : (
                        "No additional info for the request was provided by the user."
                      )}
                    </p>
                  </div>
                </div>

                {/* Image */}
                <div className=''>
                  <img
                    src={request.part.image}
                  />
                </div>

                {/* User Stuff */}
                <div className='col-span-1 md:col-span-2 xl:col-span-1'>
                  <div className='flex flex-row justify-between place-items-center'>
                    {/* Team Name */}
                    <h3 className='text-[24px] text-left md:text-center lg:text-left'>
                      {request.user.team_number} | {request.user.team_name}
                    </h3>
                    <div className='rounded-md p-1 bg-gray-200 mr-3 max-w-fit max-h-fit ml-2'>
                      <img src={request.user.profile_photo} />
                    </div>
                  </div>
                  {/* Distance */}
                  <div>
                    <p className='text-sm'>
                      {user ? (
                        `${haversine(
                          request.user.formatted_address.latitude,
                          request.user.formatted_address.longitude,
                          user.formatted_address.latitude,
                          user.formatted_address.longitude
                        ).toFixed(1)} miles`
                      ) : ("Log in to view distance")}
                    </p>
                  </div>

                  <div className='flex flex-col mt-3'>
                    <button className='py-3 px-6 bg-black hover:bg-gray-800 transition duration-200 text-white rounded-md mb-4'>
                      <a href={`/profile/frc/${request.user.team_number}`}>
                        <div className='flex flex-row justify-center place-items-center'>
                          <p>Profile Page</p>
                        </div>
                      </a>
                    </button>
                    <button className='py-3 px-6 bg-blue-700 hover:bg-blue-800 transition duration-200 text-white rounded-md'>
                      <a href={`/chat/${request.user.team_number}`}>
                        <div className='flex flex-row justify-center place-items-center'>
                          <FaComments className='mr-3' />
                          <p>
                            Message
                          </p>
                        </div>
                      </a>
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
                <button
                  onClick={scrollLeft}
                  className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
                >
                  &#8592;
                </button>
                {partRequests.length > 0 && !loadingPartRequests ? (
                  <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto space-x-4 pb-4"
                  >
                    {partRequests
                      .slice(-10)
                      .reverse()
                      .map((request) => (
                        <ItemCard
                          key={request.id}
                          item={request}
                          currentUser={user}
                          type="request"
                        />
                      ))}
                  </div>
                ) : loadingPartRequests ? (
                  <>
                    <p>Loading Part Requests</p>
                  </>
                ) : (
                  <p className="text-gray-500">No requests found for this part.</p>
                )}
                <button
                  onClick={scrollRight}
                  className="absolute right-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
                >
                  &#8594;
                </button>
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