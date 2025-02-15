import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { FaRobot, FaUser, FaExternalLinkAlt, FaComments, FaExclamationCircle, FaListAlt, FaHandshake, FaShoppingCart, FaTags, FaCheckCircle, FaTrophy } from "react-icons/fa";
import ItemCard from "../components/ItemCard";
import { MdOutlineEdit } from "react-icons/md";
import { useUser } from "../contexts/UserContext";
import ProfilePhoto from "../components/ProfilePhoto";
import { haversine } from "../utils/utils";
import HelmetComp from "../components/HelmetComp";
import CompCard from "../components/CompCard";

const TeamSummaryCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-blue-100 rounded-lg">
        <Icon className="text-blue-600 text-xl" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center w-full py-12">
    <div className="text-center text-gray-600 p-8 bg-white rounded-lg shadow-md">
      <p className="text-lg">{message}</p>
    </div>
  </div>
);

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
  const [activeProfileTab, setActiveProfileTab] = useState('active');
  
  // Add these stats calculations
  const activeRequestsCount = requests.filter(req => !req.is_fulfilled).length;
  const completedRequestsCount = requests.filter(req => 
    req.is_fulfilled && (!req.requires_return || req.is_returned)
  ).length;
  const loanedPartsCount = requests.filter(req => 
    req.is_fulfilled && req.fulfilled_by?.team_number === user.team_number
  ).length;
  const salesCompletedCount = sales.length;

  // Add new states for sales tracking
  const [boughtItems, setBoughtItems] = useState([]);
  const [loadingBoughtItems, setLoadingBoughtItems] = useState(true);

  // Calculate stats
  const activeSalesCount = sales.filter(sale => !sale.is_sold).length;
  const completedSalesCount = sales.filter(sale => sale.is_sold).length;
  const boughtItemsCount = boughtItems.length;

  // Add new useEffect for fetching bought items
  useEffect(() => {
    const fetchBoughtItems = async () => {
      try {
        const response = await axiosInstance.get(`/sales/bought/${user.team_number}`);
        setBoughtItems(response.data);
      } catch (err) {
        console.error("Error fetching bought items:", err);
      } finally {
        setLoadingBoughtItems(false);
      }
    };

    fetchBoughtItems();
  }, [user.team_number]);

  // Add state for fulfilled requests count
  const [fulfilledRequests, setFulfilledRequests] = useState([]);

  // Add useEffect to fetch fulfilled requests
  useEffect(() => {
    const fetchFulfilledRequests = async () => {
      try {
        const response = await axiosInstance.get(`/requests/fulfilled/${user.team_number}`);
        setFulfilledRequests(response.data);
      } catch (err) {
        console.error("Error fetching fulfilled requests:", err);
      }
    };

    fetchFulfilledRequests();
  }, [user.team_number]);

  // Update stats calculations
  // ...existing stats calculations...
  const requestsFulfilledCount = fulfilledRequests.length;

  const [receivedParts, setReceivedParts] = useState([]);
  const [loadingReceivedParts, setLoadingReceivedParts] = useState(true);

  // Add effect to fetch received parts
  useEffect(() => {
    const fetchReceivedParts = async () => {
      try {
        const response = await axiosInstance.get(
          `/requests/received/${user.team_number}`
        );
        setReceivedParts(response.data);
      } catch (err) {
        console.error("Error fetching received parts:", err);
      } finally {
        setLoadingReceivedParts(false);
      }
    };

    if (user?.team_number) {
      fetchReceivedParts();
    }
  }, [user?.team_number]);

  const isProfileOwner = currentUser?.team_number === user.team_number;

  const renderTabContent = () => {
    if (loadingRequests || loadingSales || loadingBoughtItems || loadingReceivedParts) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeProfileTab) {
      case 'active_requests':
        const activeRequests = requests.filter(req => !req.is_fulfilled);
        return activeRequests.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeRequests.map(request => (
              <ItemCard
                key={request.id}
                item={request}
                currentUser={currentUser}
                type="request"
                itemDistance={isAuthenticated ? haversine(
                  user.formatted_address.latitude,
                  user.formatted_address.longitude,
                  request.user.formatted_address.latitude,
                  request.user.formatted_address.longitude
                ).toFixed(1) : null}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No active requests" />
        );

      case 'active_sales':
        const activeSales = sales.filter(sale => !sale.is_sold);
        return activeSales.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeSales.map(sale => (
              <ItemCard
                key={sale.id}
                item={sale}
                currentUser={currentUser}
                type="sale"
                itemDistance={isAuthenticated ? haversine(
                  user.formatted_address.latitude,
                  user.formatted_address.longitude,
                  sale.user.formatted_address.latitude,
                  sale.user.formatted_address.longitude
                ).toFixed(1) : null}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No active sales" />
        );

      case 'completed_sales':
        const completedSales = sales.filter(sale => sale.is_sold);
        return completedSales.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {completedSales.map(sale => (
              <ItemCard key={sale.id} item={sale} currentUser={currentUser} type="sale" itemDistance={0} />
            ))}
          </div>
        ) : (
          <EmptyState message="No completed sales" />
        );

      case 'completed_requests':
        const completedRequests = requests.filter(req => req.is_fulfilled && (!req.requires_return || req.is_returned));
        return completedRequests.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {completedRequests.map(request => (
              <ItemCard key={request.id} item={request} currentUser={currentUser} type="request" itemDistance={0} />
            ))}
          </div>
        ) : (
          <EmptyState message="No completed requests" />
        );

      case 'parts_loaned':
        return fulfilledRequests.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fulfilledRequests.map(request => (
              <ItemCard key={request.id} item={request} currentUser={currentUser} type="request" itemDistance={0} />
            ))}
          </div>
        ) : (
          <EmptyState message="No parts currently loaned out" />
        );

      case 'parts_to_return':
        return receivedParts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {receivedParts.map(request => (
              <ItemCard key={request.id} item={request} currentUser={currentUser} type="request" itemDistance={0} />
            ))}
          </div>
        ) : (
          <EmptyState message="No parts to return" />
        );

      case 'bought_items':
        return boughtItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boughtItems.map(sale => (
              <ItemCard key={sale.id} item={sale} currentUser={currentUser} type="sale" itemDistance={0} />
            ))}
          </div>
        ) : (
          <EmptyState message="No items bought" />
        );

      default:
        return <EmptyState message="Select a tab to view content" />;
    }
  };

  return (
    <>
      <HelmetComp title={user ? `FRC ${user.team_number} | ${user.team_name}` : "Millennium Market"} />
      <div className="container mx-auto px-4 py-8">
        {/* Team Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <ProfilePhoto
              src={user.profile_photo}
              className="w-[64px] h-[64px] rounded-lg p-1"
              alt="Team Logo"
              teamNumber={user.team_number}
            />
            <div>
              <h1 className="text-2xl font-bold">{user.team_number} | {user.team_name}</h1>
              <p className="text-gray-600">{user.formatted_address.city}, {user.formatted_address.state}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <a
              href={`https://www.thebluealliance.com/team/${user.team_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <FaExternalLinkAlt className="mr-2" />
              View on The Blue Alliance
            </a>
            {currentUser?.team_number !== user.team_number && (
              <button
                onClick={() => navigate(`/chat/${user.team_number}`)}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <FaComments className="mr-2" />
                Chat with {user.team_name}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <TeamSummaryCard
            label="Active Requests"
            value={activeRequestsCount}
            icon={FaListAlt}
          />
          <TeamSummaryCard
            label="Completed Requests"
            value={completedRequestsCount}
            icon={FaCheckCircle}
          />
          <TeamSummaryCard
            label="Requests Fulfilled"
            value={requestsFulfilledCount}
            icon={FaTrophy}
          />
          <TeamSummaryCard
            label="Active Sales"
            value={activeSalesCount}
            icon={FaTags}
          />
          <TeamSummaryCard
            label="Completed Sales"
            value={completedSalesCount}
            icon={FaHandshake}
          />
          <TeamSummaryCard
            label="Items Bought"
            value={boughtItemsCount}
            icon={FaShoppingCart}
          />
        </div>

        {/* Main Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <div className="flex whitespace-nowrap min-w-full">
            <nav className="flex gap-4 px-1">
              <button
                className={`py-4 px-6 font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Team Activity
              </button>
              <button
                className={`py-4 px-6 font-medium transition-colors ${
                  activeTab === 'competitions'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('competitions')}
              >
                Competitions
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'activity' ? (
          <div>
            {/* Activity Sub-tabs */}
            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
              <div className="flex whitespace-nowrap min-w-full">
                <nav className="flex gap-4 px-1">
                  <button
                    className={`py-4 px-6 font-medium transition-colors ${
                      activeProfileTab === 'active_requests'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveProfileTab('active_requests')}
                  >
                    Active Requests
                  </button>
                  <button
                    className={`py-4 px-6 font-medium transition-colors ${
                      activeProfileTab === 'parts_loaned'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveProfileTab('parts_loaned')}
                  >
                    Parts Loaned Out
                  </button>
                  <button
                    className={`py-4 px-6 font-medium transition-colors ${
                      activeProfileTab === 'parts_to_return'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveProfileTab('parts_to_return')}
                  >
                    Parts to Return
                  </button>
                  <button
                    className={`py-4 px-6 font-medium transition-colors ${
                      activeProfileTab === 'active_sales'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveProfileTab('active_sales')}
                  >
                    Active Sales
                  </button>
                  {isProfileOwner && (
                    <>
                      <button
                        className={`py-4 px-6 font-medium transition-colors ${
                          activeProfileTab === 'completed_sales'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveProfileTab('completed_sales')}
                      >
                        Completed Sales
                      </button>
                      <button
                        className={`py-4 px-6 font-medium transition-colors ${
                          activeProfileTab === 'bought_items'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveProfileTab('bought_items')}
                      >
                        Items Bought
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </div>

            {/* Activity Content */}
            <div className="min-h-[300px]">
              {renderTabContent()}
            </div>
          </div>
        ) : (
          // Competitions tab content (existing code)
          <div className="space-y-6">
            {loadingComps ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : competitions.length > 0 ? (
              competitions.map((comp) => (
                <CompCard key={comp.key} comp={comp} />
              ))
            ) : (
              <div className="text-center text-gray-600 py-8 bg-white rounded-lg shadow">
                No competitions scheduled for 2025 yet.
              </div>
            )}
          </div>
        )}
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

  if (loadingUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-grow bg-gray-100 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

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
        ) : error === "Failed to load user data." ? (
          <div className="text-center py-12 px-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Team {teamNumber}</h2>
            <p className="text-gray-600 mb-6">
              This team hasn't signed up for Millennium Market yet.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up Your Team
            </button>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
              <FaExclamationCircle className="text-4xl text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while trying to load this profile.
            </p>
            <p className="text-sm text-gray-500 mb-6">Error: {error}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfilePage;
