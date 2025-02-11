import React, { useState } from "react";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import CompCard from "../../components/CompCard";
import { motion } from "framer-motion";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useCompetitions } from "../../contexts/CompetitionsContext";

const Comp = () => {
  const { competitions, loading, error } = useCompetitions();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [showWeekFilter, setShowWeekFilter] = useState(false);

  // Get unique weeks from competitions
  const availableWeeks = [...new Set(competitions.map(comp => comp.week + 1))].sort((a, b) => a - b);

  const handleWeekToggle = (week) => {
    setSelectedWeeks(prev => 
      prev.includes(week)
        ? prev.filter(w => w !== week)
        : [...prev, week]
    );
  };

  // Updated filter function
  const filteredComps = competitions.filter(comp => 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopBar />
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopBar />
        <div className="container mx-auto px-4 py-16 text-center flex-grow">
          <h2 className="text-2xl text-red-600">{error}</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
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

      <div className="container mx-auto px-4 py-6 sm:py-8 flex-grow">
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