import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { FaRobot, FaUser, FaExternalLinkAlt, FaComments } from "react-icons/fa";
import ItemCard from "../components/ItemCard";
import { MdOutlineEdit } from "react-icons/md";
import { useUser } from "../contexts/UserContext";
import ProfilePhoto from "../components/ProfilePhoto";
import { haversine } from "../utils/utils";

const PublicProfileComponent = ({ user }) => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);

  const { user: currentUser, loadingUser, isAuthenticated } = useUser();

  const [onRequests, setOnRequests] = useState(true);

  const [salesDisplayLimit, setSalesDisplayLimit] = useState(12);
  const [requestsDisplayLimit, setRequestsDisplayLimit] = useState(12);
  const salesObserverTarget = useRef(null);
  const requestsObserverTarget = useRef(null);

  const salesObserverCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && sales.length > salesDisplayLimit) {
        setSalesDisplayLimit((prev) => prev + 12);
      }
    },
    [sales.length, salesDisplayLimit]
  );

  const requestsObserverCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && requests.length > requestsDisplayLimit) {
        setRequestsDisplayLimit((prev) => prev + 12);
      }
    },
    [requests.length, requestsDisplayLimit]
  );

  useEffect(() => {
    const salesObserver = new IntersectionObserver(salesObserverCallback, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    });

    const requestsObserver = new IntersectionObserver(
      requestsObserverCallback,
      {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      }
    );

    if (salesObserverTarget.current) {
      salesObserver.observe(salesObserverTarget.current);
    }

    if (requestsObserverTarget.current) {
      requestsObserver.observe(requestsObserverTarget.current);
    }

    return () => {
      if (salesObserverTarget.current) {
        salesObserver.unobserve(salesObserverTarget.current);
      }
      if (requestsObserverTarget.current) {
        requestsObserver.unobserve(requestsObserverTarget.current);
      }
    };
  }, [salesObserverCallback, requestsObserverCallback]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get(
          `/requests/user/${user.team_number}`
        );
        const data = response.data;

        setRequests(data);
      } catch (err) {
        console.error("Error fetching user's requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    const fetchSales = async () => {
      try {
        const response = await axiosInstance.get(
          `/sales/user/${user.team_number}`
        );
        const data = response.data;

        setSales(data);
      } catch (err) {
        console.error("Error fetching user's sales:", err);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchRequests();
    fetchSales();
  }, []);

  const handleClickRequests = () => {
    setOnRequests(true);
  };

  const handleClickSales = () => {
    setOnRequests(false);
  };

  return (
    <>
      <div className="h-full bg-gray-100 flex flex-col p-4">
        <div className="flex items-center justify-center">
          <div className="rounded-lg w-full max-w-2xl relative">
            {/* Edit Button */}
            {currentUser?.team_number === user.team_number && (
              <button onClick={() => navigate("/profile")}>
                <div
                  className="absolute top-[15px] right-[15px] rounded-full bg-gray-100 text-blue-500 text-[30px] w-fit p-2
                                        hover:scale-105 transition duration-100 hover:cursor-pointer"
                >
                  <MdOutlineEdit />
                </div>
              </button>
            )}

            {/* Main Profile Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center">
                <ProfilePhoto
                  src={user.profile_photo}
                  className="w-[64px] h-[64px] rounded-full bg-gray-400 p-1"
                  alt="Team Logo"
                />
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-800">
                {user.team_number} | {user.team_name}
              </h1>
              <h2 className="text-xl text-center text-gray-800">
                {user.formatted_address.city}, {user.formatted_address.state}
              </h2>

              {/* Blue Alliance Link */}
              <div className="flex justify-center">
                <a
                  href={`https://www.thebluealliance.com/team/${user.team_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  <FaExternalLinkAlt className="mr-2" />
                  View on The Blue Alliance
                </a>
              </div>

              {/* Chat Button */}
              {currentUser?.team_number !== user.team_number && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      navigate(`/chat/${user.team_number}`);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                  >
                    <FaComments className="mr-2" />
                    Chat with {user.team_name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-5">
          {/* Part Requests Section */}
          <div className="flex-grow mx-6 mb-10">
            <div className="flex flex-row justify-between">
              <button
                className={`text-xl font-semibold text-gray-700 mb-4 py-2 px-4 rounded-md hover:bg-gray-300 ${onRequests ? "bg-gray-200" : ""
                  }`}
                onClick={handleClickRequests}
              >
                Requests
              </button>
              <button
                className={`text-xl font-semibold text-gray-700 mb-4 py-2 px-4 rounded-md hover:bg-gray-300 ${onRequests ? "" : "bg-gray-200"
                  }`}
                onClick={handleClickSales}
              >
                Sales
              </button>
            </div>
            {/* Show Requests */}
            {onRequests ? (
              <div className="flex flex-col">
                {!loadingRequests && requests.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 min-w-[300px]">
                    {requests.slice(0, requestsDisplayLimit).map((request) => (
                      <ItemCard
                        key={request.id}
                        item={request}
                        currentUser={user}
                        type="request"
                        itemDistance={
                          isAuthenticated
                            ? haversine(
                              user.formatted_address.latitude,
                              user.formatted_address.longitude,
                              request.user.formatted_address.latitude,
                              request.user.formatted_address.longitude
                            ).toFixed(1)
                            : null
                        }
                      />
                    ))}
                    {requests.length > requestsDisplayLimit && (
                      <div
                        ref={requestsObserverTarget}
                        className="col-span-full flex justify-center p-4"
                      >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                ) : loadingRequests ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="ml-2">Loading Requests...</p>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    This user hasn't made any requests yet.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                {!loadingSales && sales.length > 0 ? (
                  <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 min-w-[300px]">
                    {sales.slice(0, salesDisplayLimit).map((sale) => (
                      <ItemCard
                        key={sale.id}
                        item={sale}
                        currentUser={user}
                        type="sale"
                        itemDistance={
                          isAuthenticated
                            ? haversine(
                              user.formatted_address.latitude,
                              user.formatted_address.longitude,
                              sale.user.formatted_address.latitude,
                              sale.user.formatted_address.longitude
                            ).toFixed(1)
                            : null
                        }
                      />
                    ))}
                    {sales.length > salesDisplayLimit && (
                      <div
                        ref={salesObserverTarget}
                        className="col-span-full flex justify-center p-4"
                      >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                ) : loadingSales ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="ml-2">Loading Sales...</p>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    This user hasn't made any sales yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const PublicProfilePage = () => {
  const { teamNumber } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/frc${teamNumber}/`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load user data.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [teamNumber]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-grow bg-gray-100 flex flex-col justify-center">
        {!error && user ? (
          <PublicProfileComponent user={user} />
        ) : loadingUser ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="ml-2">Loading User...</p>
          </div>
        ) : (
          <>
            <p>Error: {error}</p>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfilePage;
