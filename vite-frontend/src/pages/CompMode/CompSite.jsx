import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import ProfilePhoto from "../../components/ProfilePhoto";
import { FaMapMarkerAlt, FaCalendarAlt, FaLink, FaUsers, FaArrowLeft, FaPlay, FaPause, FaTh, FaExpand, FaCompress, FaListAlt, FaHandshake, FaExchangeAlt, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useData } from "../../contexts/DataContext";
import ItemCard from "../../components/ItemCard";
import { useUser } from "../../contexts/UserContext";
import LoanedPartCard from "../../components/LoanedPartCard";
import HelmetComp from "../../components/HelmetComp";
import { useWebSocket } from "../../contexts/WebSocketContext";
import axiosInstance from "../../utils/axiosInstance";

const TeamCard = ({ team, registeredTeams, navigate }) => {
  const isRegistered = registeredTeams.some(user => user.team_number === team.team_number);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/profile/frc/${team.team_number}`)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <ProfilePhoto
            src={`https://www.thebluealliance.com/avatar/2025/frc${team.team_number}.png`}
            teamNumber={team.team_number}
            alt={"Team Logo"}
            className={"h-[40px] w-[40px]"}
          />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg font-semibold whitespace-nowrap">Team {team.team_number}</h3>
            <span className="text-blue-600 truncate">{team.nickname}</span>
          </div>
          <div className="text-gray-600 text-sm">
            <p className="truncate">{team.city}, {team.state_prov}</p>
            {team.website && (
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
                onClick={e => e.stopPropagation()}
              >
                <FaLink size={12} />
                Team Website
              </a>
            )}
          </div>
          {!isRegistered && (
            <p className="text-xs text-orange-600 mt-2">Not registered on Millennium Market</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

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

const CompSite = () => {
  const { eventKey } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const { user, isAuthenticated } = useUser();
  const { requests, addItem, users: registeredTeams } = useData();  // Add addItem to destructuring
  const [eventDetails, setEventDetails] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamLoans, setTeamLoans] = useState([]);
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { connectToEvent, registerEventHandler } = useWebSocket();
  const [eventRequests, setEventRequests] = useState([]);
  const [fulfilledRequests, setFulfilledRequests] = useState([]);
  const [receivedParts, setReceivedParts] = useState([]);
  const [profileTab, setProfileTab] = useState('active');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (eventKey) {
          const [eventResponse, teamsResponse] = await Promise.all([
            fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}`, {
              headers: {
                "X-TBA-Auth-Key": import.meta.env.VITE_TBA_API_KEY
              }
            }),
            fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/teams`, {
              headers: {
                "X-TBA-Auth-Key": import.meta.env.VITE_TBA_API_KEY
              }
            })
          ]);

          const eventData = await eventResponse.json();
          const teamsData = await teamsResponse.json();

          // Sort teams by team number numerically
          const sortedTeams = teamsData.sort((a, b) => a.team_number - b.team_number);

          setEventDetails(eventData);
          setTeams(sortedTeams);
        }
      } catch (err) {
        setError("Failed to load competition data");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventKey]);

  useEffect(() => {
    const cleanup = connectToEvent(eventKey);
    
    const handleEventUpdate = (data) => {
      if (data.type === 'new_request' && data.request) {
        setEventRequests(prev => {
          const exists = prev.some(req => req.id === data.request.id);
          if (!exists) {
            return [data.request, ...prev];
          }
          return prev;
        });
      } else if (data.type === 'request_fulfilled' && data.request) {
        // Remove fulfilled requests from active list and add to fulfilled list if needed
        setEventRequests(prev => prev.filter(req => req.id !== data.request.id));
        if (data.request.fulfilled_by?.team_number === user?.team_number) {
          setFulfilledRequests(prev => [data.request, ...prev]);
        }
      } else if (data.type === 'request_returned' && data.request) {
        // Update both fulfilled and received lists
        setFulfilledRequests(prev => 
          prev.map(req => req.id === data.request.id ? data.request : req)
        );
        setReceivedParts(prev => 
          prev.filter(req => req.id !== data.request.id)
        );
      }
    };

    const unregister = registerEventHandler('eventUpdates', handleEventUpdate);

    return () => {
      cleanup();
      unregister();
    };
  }, [eventKey, connectToEvent, user?.team_number]);

  // Reset display mode when switching tabs
  useEffect(() => {
    setIsDisplayMode(false);
  }, [activeTab]);

  // Initialize eventRequests when teams or requests change
  useEffect(() => {
    const filteredRequests = requests.filter(request => 
      teams.some(team => team.team_number === request.user.team_number) && 
      request.event_key === eventKey &&
      !request.is_fulfilled  // Add this condition
    );
    
    // Filter fulfilled requests separately
    const fulfilledEventRequests = requests.filter(request =>
      teams.some(team => team.team_number === request.user.team_number) &&
      request.event_key === eventKey &&
      request.is_fulfilled &&
      request.fulfilled_by?.team_number === user?.team_number
    );
    
    // Remove duplicates and update state
    const uniqueRequests = filteredRequests.reduce((acc, current) => {
      const exists = acc.find(item => item.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
    setEventRequests(uniqueRequests);
    setFulfilledRequests(fulfilledEventRequests);
  }, [teams, requests, eventKey, user?.team_number]);

  // Check if current team is participating
  const isTeamParticipating = isAuthenticated && teams.some(
    team => team.team_number === user?.team_number
  );

  // Filter requests for the logged-in team
  const teamRequests = requests.filter(
    request => request.user.team_number === user?.team_number && 
               request.event_key === eventKey &&
               !request.is_fulfilled 
  );

  useEffect(() => {
    const fetchFulfilledRequests = async () => {
      try {
        const response = await axiosInstance.get(
          `/requests/fulfilled/${user.team_number}`
        );
        setFulfilledRequests(response.data);
      } catch (error) {
        console.error("Error fetching fulfilled requests:", error);
      }
    };

    if (user?.team_number) {
      fetchFulfilledRequests();
    }
  }, [user?.team_number]);

  useEffect(() => {
    const fetchReceivedParts = async () => {
      try {
        const response = await axiosInstance.get(
          `/requests/received/${user.team_number}`
        );
        // Filter for parts at this event
        const eventParts = response.data.filter(
          request => request.event_key === eventKey
        );
        setReceivedParts(eventParts);
      } catch (error) {
        console.error("Error fetching received parts:", error);
      }
    };

    if (user?.team_number) {
      fetchReceivedParts();
    }
  }, [user?.team_number, eventKey]);

  const renderRequestsContent = () => {
    if (eventRequests.length === 0) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-gray-600">
            No active requests from teams at this event.
          </div>
        </div>
      );
    }

    if (isFullscreen) {
      const repeatedRequests = () => {
        let multiplier;
        switch (eventRequests.length) {
          case 1:
            multiplier = 4;
            break;
          case 2: 
            multiplier = 3;
            break;
          default:
            multiplier = 2;
        }

        return Array(multiplier).fill().flatMap((_, arrayIndex) => 
          eventRequests.map((request, requestIndex) => ({
            ...request,
            tempId: `${request.id}-array${arrayIndex}-index${requestIndex}`
          }))
        );
      };

      return (
        <div className="fixed inset-0 bg-gray-900 z-50">
          <div className="absolute top-4 right-4 space-x-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-3 rounded-full bg-white text-gray-800 hover:bg-gray-100 transition-colors"
              title="Exit Fullscreen"
            >
              <FaCompress />
            </button>
          </div>
          <div className="h-full w-full overflow-hidden px-8">
            <div className="flex animate-scroll gap-8 py-12 items-center h-full">
              {repeatedRequests().map((request) => (
                <div 
                  key={request.tempId}  // Use tempId instead of combining id and index
                  className="flex-shrink-0 w-[300px]"
                >
                  <ItemCard
                    item={request}
                    currentUser={user}
                    type="request"
                    itemDistance={0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return isDisplayMode ? (
      <div className="relative w-full overflow-hidden bg-gray-50 rounded-lg p-4">
        <div className="flex animate-scroll gap-6 py-4">
          {eventRequests.map((request, index) => (
            <div key={`scroll-original-${request.id}-${index}`} className="flex-shrink-0 w-[350px]">
              <ItemCard
                item={request}
                currentUser={user}
                type="request"
                itemDistance={0}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {eventRequests.map((request, index) => (
            <div key={`scroll-duplicate-${request.id}-${index}`} className="flex-shrink-0 w-[350px]">
              <ItemCard
                item={request}
                currentUser={user}
                type="request"
                itemDistance={0}
              />
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventRequests.map((request) => (
          <ItemCard
            key={request.id}
            item={request}
            currentUser={user}
            type="request"
            itemDistance={0}
          />
        ))}
      </div>
    );
  };

  const renderProfileContent = () => {
    const teamInfo = teams.find(team => team.team_number === user?.team_number);
    const activeRequestsCount = teamRequests.length;
    const fulfilledCount = fulfilledRequests.length;
    const toReturnCount = receivedParts.length;
    const completedCount = requests.filter(req => 
      req.user.team_number === user?.team_number && 
      req.event_key === eventKey &&
      req.is_fulfilled &&
      (!req.requires_return || req.is_returned)
    ).length;

    return (
      <div className="h-full flex flex-col">
        {/* Team Summary Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <ProfilePhoto
                src={`https://www.thebluealliance.com/avatar/2025/frc${user?.team_number}.png`}
                teamNumber={user?.team_number}
                alt="Team Logo"
                className="h-16 w-16"
              />
              <div>
                <h2 className="text-2xl font-bold">Team {user?.team_number}</h2>
                <p className="text-gray-600">{teamInfo?.nickname}</p>
                <p className="text-sm text-gray-500">{teamInfo?.city}, {teamInfo?.state_prov}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TeamSummaryCard
              label="Active Requests"
              value={activeRequestsCount}
              icon={FaListAlt}
            />
            <TeamSummaryCard
              label="Parts Loaned Out"
              value={fulfilledCount}
              icon={FaHandshake}
            />
            <TeamSummaryCard
              label="Parts to Return"
              value={toReturnCount}
              icon={FaExchangeAlt}
            />
            <TeamSummaryCard
              label="Completed Requests"
              value={completedCount}
              icon={FaCheckCircle}
            />
          </div>
        </div>

        {/* Scrollable Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <div className="flex whitespace-nowrap min-w-full">
            <nav className="flex gap-4 px-1">
              <button
                className={`py-4 px-6 font-medium transition-colors ${
                  profileTab === 'active'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setProfileTab('active')}
              >
                Active Requests
              </button>
              <button
                className={`py-4 px-6 font-medium transition-colors ${
                  profileTab === 'fulfilled'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setProfileTab('fulfilled')}
              >
                Parts Loaned Out
              </button>
              <button
                className={`py-4 px-6 font-medium transition-colors ${
                  profileTab === 'toReturn'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setProfileTab('toReturn')}
              >
                Parts to Return
              </button>
              <button
                className={`py-4 px-6 font-medium transition-colors ${
                  profileTab === 'completed'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setProfileTab('completed')}
              >
                Completed Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    );
  };

  const renderTabContent = () => {
    switch(profileTab) {
      case 'active':
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">
              Your Active Requests ({teamRequests.length})
            </h2>
            {teamRequests.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamRequests.map((request) => (
                  <ItemCard
                    key={request.id}
                    item={request}
                    currentUser={user}
                    type="request"
                    itemDistance={0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                Your team has no active requests at this event.
              </div>
            )}
          </div>
        );
      
      case 'fulfilled':
        const nonReturnLoans = fulfilledRequests.filter(req => !req.requires_return);
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">
              Parts You've Loaned Out ({fulfilledRequests.length})
            </h2>
            {fulfilledRequests.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fulfilledRequests.map((request) => (
                  <ItemCard
                    key={request.id}
                    item={request}
                    currentUser={user}
                    type="request"
                    itemDistance={0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                Your team hasn't fulfilled any requests at this event.
              </div>
            )}
          </div>
        );
      
      case 'toReturn':
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">
              Parts to Return ({receivedParts.length})
            </h2>
            {receivedParts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {receivedParts.map((request) => (
                  <ItemCard
                    key={request.id}
                    item={request}
                    currentUser={user}
                    type="request"
                    itemDistance={0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                No parts to return at this event.
              </div>
            )}
          </div>
        );

      case 'completed':
        const completedRequests = requests.filter(req => 
          req.user.team_number === user?.team_number && 
          req.event_key === eventKey &&
          req.is_fulfilled &&
          (!req.requires_return || req.is_returned)
        );
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">
              Completed Requests ({completedRequests.length})
            </h2>
            {completedRequests.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedRequests.map((request) => (
                  <ItemCard
                    key={request.id}
                    item={request}
                    currentUser={user}
                    type="request"
                    itemDistance={0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                No completed requests at this event.
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopBar />
        <div className="flex items-center justify-center min-h-[60vh] flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !eventDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopBar />
        <div className="container mx-auto px-4 py-16 text-center flex-grow">
          <h2 className="text-2xl text-red-600">Error loading competition data for {eventKey}</h2>
        </div>
        <Footer />
      </div>
    );
  }

  const startDate = new Date(eventDetails.start_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const endDate = new Date(eventDetails.end_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col"> {/* Added flex-col */}
      <HelmetComp title={eventDetails?.name} />
      <TopBar />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-20 left-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Go back"
      >
        <FaArrowLeft className="text-xl text-gray-700" />
      </button>

      {/* Event Header - Updated design */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:py-12 pb-12 pt-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{eventDetails?.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-100">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-xl" />
              <span className="text-lg">{eventDetails?.city}, {eventDetails?.state_prov}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-xl" />
              <span className="text-lg">Week {eventDetails?.week + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-xl" />
              <span className="text-lg">{teams.length} Teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 flex-grow"> {/* Added flex-grow */}
        <div className="border-b border-gray-200 mt-8 overflow-x-auto">
          <div className="flex whitespace-nowrap min-w-full">
            <nav className="flex gap-4 px-1">
              <button
                className={`py-4 px-6 font-medium transition-colors ${activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setActiveTab('info')}
              >
                Event Information
              </button>
              <button
                className={`py-4 px-6 font-medium transition-colors ${activeTab === 'requests'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setActiveTab('requests')}
              >
                Team Requests
              </button>
              {isTeamParticipating && (
                <button
                  className={`py-4 px-6 font-medium transition-colors ${activeTab === 'profile'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('profile')}
                >
                  Team Profile
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8 h-full"> {/* Added h-full */}
          {activeTab === 'info' ? (
            <>
              {/* Event Details Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Event Information</h2>
                    <div className="space-y-4">
                      <p><strong>Dates:</strong> {startDate} - {endDate}</p>
                      <p><strong>Location:</strong> {eventDetails.address}</p>
                      {eventDetails.website && (
                        <p>
                          <strong>Website: </strong>
                          <a
                            href={eventDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Visit Event Website
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Details</h2>
                    <div className="space-y-2">
                      <p><strong>Event Type:</strong> {eventDetails.event_type_string}</p>
                      <p><strong>District:</strong> {eventDetails.district?.display_name || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teams List */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Participating Teams</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map(team => (
                    <TeamCard 
                      key={team.key} 
                      team={team} 
                      registeredTeams={registeredTeams}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === "requests" ? (
            <div className="h-full flex flex-col"> {/* Added flex container */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  Active Requests from Event Teams ({eventRequests.length})
                </h2>
                {eventRequests.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsDisplayMode(!isDisplayMode)}
                      className={`p-3 rounded-full transition-colors ${isDisplayMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      title={isDisplayMode ? "Grid View" : "Scroll View"}
                    >
                      {isDisplayMode ? <FaTh /> : <FaPlay />}
                    </button>
                    {isDisplayMode && (
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Fullscreen Mode"
                      >
                        <FaExpand />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {renderRequestsContent()}
            </div>
          ) : activeTab === 'profile' && isTeamParticipating ? (
            renderProfileContent()
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompSite;