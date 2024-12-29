import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Fuse from "fuse.js";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const fuseRef = useRef(null);
  const navigate = useNavigate();

  const fuseOptions = {
    threshold: 0.3,
    keys: [
      { name: "team_name", weight: 2 },
      { name: "team_number", weight: 2 },
      { name: "name", weight: 2 },
    ],
    includeScore: true,
    shouldSort: true,
  };

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const response = await axiosInstance.get("/search/all/");
        const searchData = response.data;

        const processedSearchData = [
          ...searchData.users.map((user) => ({ ...user, type: "team" })),
          ...searchData.parts.map((part) => ({ ...part, type: "part" })),
          ...searchData.requests.map((request) => ({ ...request, type: "request" })),
        ];

        console.log("processed search data", processedSearchData);

        fuseRef.current = new Fuse(processedSearchData, fuseOptions);
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    };

    fetchSearchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value || value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (fuseRef.current) {
      const results = fuseRef.current
        .search(value)
        .slice(0, 8)
        .map((result) => ({
          ...result.item,
          score: result.score,
          type: result.item.type,
        }));

      setSearchResults(results);
      setShowDropdown(true);
    }
  };

  const handleResultClick = (item) => {
    switch (item.type) {
      case "team":
        navigate(`/profile/frc/${item.team_number}`);
        break;
      case "part":
        navigate(`/part/${item.id}`);
        break;
      default:
        console.warn("Unknown result type:", item);
    }
    setShowDropdown(false);
    setSearchTerm("");
  };

  const renderResultItem = (item) => {
    switch (item.type) {
      case "team":
        return (
          <div className="flex items-center space-x-2">
            <img
              src={item.profile_photo}
              alt="Team Logo"
              className="w-6 h-6 rounded-full"
            />
            <div className="flex flex-col">
              <div className="font-medium">Team {item.team_number} | {item.team_name}</div>
            </div>
          </div>
        );
      case "part":
        return (
          <div className="flex items-center space-x-2">
            <img
              src={item.image}
              alt="Part Photo"
              className="w-6 h-6 rounded-full"
            />
            <div className="flex flex-col">
              <div className="font-medium">{item.name}</div>
            </div>
          </div>
        );
      default:
        return <div>Unknown Result Type</div>;
    }
  };

  const groupResultsByType = (results) => {
    return results.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {});
  };

  return (
    <div className="relative w-64" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search everything..."
          className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-red-500"
        />
        <FaSearch className="absolute right-3 top-3 text-gray-400" />
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {Object.entries(groupResultsByType(searchResults)).map(([type, results]) => (
            <div key={type}>
              <div className="px-3 py-2 font-semibold text-gray-600 bg-gray-100">
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </div>
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id || result.team_number}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
                >
                  {renderResultItem(result)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;