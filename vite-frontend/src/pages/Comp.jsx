import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import CompCard from "../components/CompCard";
import { motion } from "framer-motion";
import { FaSearch, FaFilter } from "react-icons/fa";

const Comp = () => {
  const comp_format = [{
    "key": "string",
    "name": "string",
    "event_code": "string",
    "event_type": 0,
    "district": {
      "abbreviation": "string",
      "display_name": "string",
      "key": "string",
      "year": 0
    },
    "city": "string",
    "state_prov": "string",
    "country": "string",
    "start_date": "2025-02-11",
    "end_date": "2025-02-11",
    "year": 0,
    "short_name": "string",
    "event_type_string": "string",
    "week": 0,
    "address": "string",
    "postal_code": "string",
    "gmaps_place_id": "string",
    "gmaps_url": "string",
    "lat": 0,
    "lng": 0,
    "location_name": "string",
    "timezone": "string",
    "website": "string",
    "first_event_id": "string",
    "first_event_code": "string",
    "webcasts": [
      {
        "type": "youtube",
        "channel": "string",
        "date": "string",
        "file": "string"
      }
    ],
    "division_keys": [
      "string"
    ],
    "parent_event_key": "string",
    "playoff_type": 0,
    "playoff_type_string": "string"
  }];

  const [comps, setComps] = useState(comp_format);
  const [regionals, setRegionals] = useState(comp_format);
  const [districts, setDistricts] = useState(comp_format);
  const [districtChamps, setDistrictChamps] = useState(comp_format);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [showWeekFilter, setShowWeekFilter] = useState(false);

  useEffect(() => {
    fetch("https://www.thebluealliance.com/api/v3/events/2025", {
      headers: {
        "X-TBA-Auth-Key": import.meta.env.VITE_TBA_API_KEY
      }
    })
      .then((response) => response.json())
      .then((data) => {
        // Filter for valid week numbers (0-6) before sorting
        const validData = data.filter(comp => comp.week >= 0 && comp.week <= 6);
        const sortedData = validData.sort((a, b) => a.start_date.localeCompare(b.start_date));

        setRegionals(sortedData.filter((comp) => comp.event_type === 0));
        setDistricts(sortedData.filter((comp) => comp.event_type === 1));
        setDistrictChamps(sortedData.filter((comp) => comp.event_type === 2));
        setComps(sortedData.filter((comp) => 
          (comp.event_type === 0 || comp.event_type === 1 || comp.event_type === 2)
        ));
      });
  }, []);

  // Get unique weeks from competitions
  const availableWeeks = [...new Set(comps.map(comp => comp.week + 1))].sort((a, b) => a - b);

  const handleWeekToggle = (week) => {
    setSelectedWeeks(prev => 
      prev.includes(week)
        ? prev.filter(w => w !== week)
        : [...prev, week]
    );
  };

  // Updated filter function
  const filteredComps = comps.filter(comp => 
    (searchTerm === '' || 
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.state_prov.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (selectedWeeks.length === 0 || selectedWeeks.includes(comp.week + 1))
  );

  const getDisplayedComps = () => {
    switch(activeTab) {
      case 'regionals':
        return filteredComps.filter(comp => comp.event_type === 0);
      case 'districts':
        return filteredComps.filter(comp => comp.event_type === 1);
      case 'championships':
        return filteredComps.filter(comp => comp.event_type === 2);
      default:
        return filteredComps;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <TopBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6 sm:mb-8">
            2025 FRC Competitions
          </h1>
          
          {/* Search and Filter Section */}
          <div className="max-w-xl mx-auto relative px-4">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search competitions..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowWeekFilter(!showWeekFilter)}
                className={`px-4 py-3 rounded-lg shadow-lg transition-colors ${
                  showWeekFilter || selectedWeeks.length > 0
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                <FaFilter />
              </button>
            </div>

            {/* Week Filter */}
            {showWeekFilter && (
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Filter by Week:</h3>
                <div className="flex flex-wrap gap-2">
                  {availableWeeks.map(week => (
                    <label
                      key={week}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWeeks.includes(week)}
                        onChange={() => handleWeekToggle(week)}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">Week {week}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { id: 'all', label: 'All' },
            { id: 'regionals', label: 'Regionals' },
            { id: 'districts', label: 'Districts' },
            { id: 'championships', label: 'Champs' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Competition Cards */}
        <div className="grid gap-4 sm:gap-6">
          {getDisplayedComps().map((comp) => (
            <CompCard key={comp.key} comp={comp} />
          ))}
        </div>

        {/* No Results Message */}
        {getDisplayedComps().length === 0 && (
          <div className="text-center text-gray-600 mt-8 px-4">
            No competitions found matching your search.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Comp;