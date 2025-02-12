import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import ProfilePhoto from "../../components/ProfilePhoto";
import { FaMapMarkerAlt, FaCalendarAlt, FaLink, FaUsers, FaArrowLeft, FaPlay, FaPause, FaTh, FaExpand, FaCompress } from "react-icons/fa";
import { motion } from "framer-motion";
import { useData } from "../../contexts/DataContext";
import ItemCard from "../../components/ItemCard";
import { useUser } from "../../contexts/UserContext";
import LoanedPartCard from "../../components/LoanedPartCard";

const TeamCard = ({ team }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
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
            >
              <FaLink size={12} />
              Team Website
            </a>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const CompSite = () => {
  const { eventKey } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const { user, isAuthenticated } = useUser();
  const { requests } = useData();
  const [eventDetails, setEventDetails] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamLoans, setTeamLoans] = useState([]);
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Reset display mode when switching tabs
  useEffect(() => {
    setIsDisplayMode(false);
  }, [activeTab]);

  // Filter requests for teams at this competition
  const eventRequests = requests.filter(request =>
    teams.some(team => team.team_number === request.user.team_number)
  );

  // Check if current team is participating
  const isTeamParticipating = isAuthenticated && teams.some(
    team => team.team_number === user?.team_number
  );

  // Filter requests for the logged-in team
  const teamRequests = requests.filter(
    request => request.user.team_number === user?.team_number
  );

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
        switch (eventRequests.length) {
          case 1:
            return Array(4).fill(eventRequests).flat();
          case 2: 
            return Array(3).fill(eventRequests).flat();
          default:
            return Array(2).fill(eventRequests).flat();
        }
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
              {repeatedRequests().map((request, index) => (
                <div 
                  key={`${request.id}-${index}`} 
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
          {/* First set of cards */}
          {eventRequests.map((request) => (
            <div key={request.id} className="flex-shrink-0 w-[350px]">
              <ItemCard
                item={request}
                currentUser={user}
                type="request"
                itemDistance={0}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {eventRequests.map((request) => (
            <div key={`${request.id}-duplicate`} className="flex-shrink-0 w-[350px]">
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
        <div className="border-b border-gray-200 mt-8">
          <nav className="flex gap-4">
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
                    <TeamCard key={team.key} team={team} />
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
            <div className="h-full flex flex-col">
              {/* Team Requests Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">
                  Your Team's Active Requests ({teamRequests.length})
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

              {/* Loaned Parts Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">
                  Parts Loaned Out ({teamLoans.length})
                </h2>
                {teamLoans.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamLoans.map((loan) => (
                      <LoanedPartCard key={loan.id} loan={loan} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-600 py-8">
                    Your team hasn't loaned any parts at this event.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompSite;