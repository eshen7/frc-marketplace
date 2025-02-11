import React, { createContext, useContext, useState, useEffect } from 'react';

const CompetitionsContext = createContext();

export const CompetitionsProvider = ({ children }) => {
  const [competitions, setCompetitions] = useState([]);
  const [regionals, setRegionals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtChamps, setDistrictChamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch("https://www.thebluealliance.com/api/v3/events/2025", {
          headers: {
            "X-TBA-Auth-Key": import.meta.env.VITE_TBA_API_KEY
          }
        });
        
        const data = await response.json();
        
        // Filter for valid week numbers (0-6) and sort by date
        const validData = data
          .filter(comp => comp.week >= 0 && comp.week <= 6)
          .sort((a, b) => a.start_date.localeCompare(b.start_date));

        // Set filtered competitions by type
        const regionals = validData.filter(comp => comp.event_type === 0);
        const districts = validData.filter(comp => comp.event_type === 1);
        const districtChamps = validData.filter(comp => comp.event_type === 2);
        const allComps = validData.filter(comp => 
          comp.event_type === 0 || comp.event_type === 1 || comp.event_type === 2
        );

        setRegionals(regionals);
        setDistricts(districts);
        setDistrictChamps(districtChamps);
        setCompetitions(allComps);
        setError(null);
      } catch (err) {
        setError("Failed to load competitions");
        console.error("Error fetching competitions:", err);
      } finally {
        setLoading(false);
        console.log("Competitions loaded");
      }
    };

    fetchCompetitions();
  }, []);

  const value = {
    competitions,
    regionals,
    districts,
    districtChamps,
    loading,
    error
  };

  return (
    <CompetitionsContext.Provider value={value}>
      {children}
    </CompetitionsContext.Provider>
  );
};

export const useCompetitions = () => {
  const context = useContext(CompetitionsContext);
  if (context === undefined) {
    throw new Error('useCompetitions must be used within a CompetitionsProvider');
  }
  return context;
};
