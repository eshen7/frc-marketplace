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
import HelmetComp from "../components/HelmetComp";
import CompCard from "../components/CompCard";

const PublicProfileComponent = ({ user }) => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [loadingComps, setLoadingComps] = useState(true);

  const { user: currentUser, loadingUser, isAuthenticated } = useUser();

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
    setRequests([]);
    setSales([]);
    setLoadingRequests(true);
    setLoadingSales(true);
    
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
  }, [user.team_number]);

  useEffect(() => {
    const fetchTeamEvents = async () => {
      try {
        const response = await fetch(
          `https://www.thebluealliance.com/api/v3/team/frc${user.team_number}/events/2025`,
          {
            headers: {
              "X-TBA-Auth-Key": import.meta.env.VITE_TBA_API_KEY
            }
          }
        );
        const data = await response.json();
        // Filter for regular season events and sort by date
        const validEvents = data
          .filter(event => event.week >= 0 && event.week <= 6)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        setCompetitions(validEvents);
      } catch (err) {
        console.error("Error fetching team events:", err);
      } finally {
        setLoadingComps(false);
      }
    };

    fetchTeamEvents();
  }, [user.team_number]);

  const [activeTab, setActiveTab] = useState('requests'); // Changed from onRequests boolean

  return (
    <>
      <HelmetComp title={user ? `FRC ${user.team_number} | ${user.team_name}` : "Millennium Market"} />
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
                  className="w-[64px] h-[64px] rounded-lg bg-gray-300 p-1"
                  alt="Team Logo"
                  teamNumber={user.team_number}
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

        {/* Team's Competitions Section */}
        <div className="container mx-auto mt-12 mb-12 px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            2025 Competition Schedule
          </h2>
          {loadingComps ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : competitions.length > 0 ? (
            <div className="space-y-6">
              {competitions.map((comp) => (
                <CompCard key={comp.key} comp={comp} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8 bg-white rounded-lg shadow">
              No competitions scheduled for 2025 yet.
            </div>
          )}
        </div>

        <div className="container mx-auto px-6">
          <div className="flex-grow mb-12">
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex gap-4">
                <button
                  className={`py-4 px-6 font-medium transition-colors ${
                    activeTab === 'requests'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('requests')}
                >
                  Requests
                </button>
                <button
                  className={`py-4 px-6 font-medium transition-colors ${
                    activeTab === 'sales'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('sales')}
                >
                  Sales
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === 'requests' ? (
                <div className="flex flex-col">
                  {!loadingRequests && requests.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 min-w-[300px]">
                      {requests.slice(0, requestsDisplayLimit).map((request) => (
                        <ItemCard
                          key={request.id}
                          item={request}
                          currentUser={currentUser}
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
                          currentUser={currentUser}
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
    setUser(null);
    setError(null);
    setLoadingUser(true);
    
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
