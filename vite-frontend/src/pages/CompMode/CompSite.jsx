import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import ProfilePhoto from "../../components/ProfilePhoto";
import { FaMapMarkerAlt, FaCalendarAlt, FaLink, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";

const TeamCard = ({ team }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <ProfilePhoto
          imageUrl={`https://frcteamimages.en.galactictech.net/frc${team.team_number}.jpg`}
          size={60}
          name={`Team ${team.team_number}`}
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
  const [eventDetails, setEventDetails] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      {/* Event Header - Updated design */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
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

      {/* Event Details */}
      <div className="container mx-auto px-4 py-8">
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
              <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
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
      </div >

      <Footer />
    </div >
  );
};

export default CompSite;