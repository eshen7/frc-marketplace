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

  // Configure Fuse options for fuzzy search
  const fuseOptions = {
    threshold: 0.3,
    keys: [
      { name: "team_number", weight: 2 },
      { name: "part_name", weight: 2 },
    ],
    includeScore: true,
    shouldSort: true,
  };

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const response = await axiosInstance.get("/search/all/");
        const searchData = response.data;

        // Initialize Fuse with all searchable data
        fuseRef.current = new Fuse(searchData, fuseOptions);
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
        .slice(0, 8) // Limit to top 8 results
        .map((result) => ({
          ...result.item,
          score: result.score,
          type: determineResultType(result.item),
        }));

      setSearchResults(results);
      setShowDropdown(true);
    }
  };

  const determineResultType = (item) => {
    if (item.team_number) return "team";
    if (item.part_name) return "request";
    return "unknown";
  };

  const handleResultClick = (item) => {
    switch (item.type) {
      case "team":
        navigate(`/profile/frc/${item.team_number}`);
        break;
      case "request":
        navigate(`/requests/${item.id}`);
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
          <div className="flex flex-col">
            <div className="font-medium">Team {item.team_number}</div>
            <div className="text-sm text-gray-500">{item.location}</div>
          </div>
        );
      case "request":
        return (
          <div className="flex flex-col">
            <div className="font-medium">{item.part_name}</div>
            <div className="text-sm text-gray-500">
              Team {item.user?.team_number}
            </div>
          </div>
        );
      default:
        return <div>Unknown Result Type</div>;
    }
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
          {searchResults.map((result, index) => (
            <div
              key={`${result.type}-${result.id || result.team_number}-${index}`}
              onClick={() => handleResultClick(result)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
            >
              {renderResultItem(result)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
