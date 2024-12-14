import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FiSearch, FiSliders } from "react-icons/fi";
import Fuse from "fuse.js";
import ItemCard from "../components/ItemCard";
import { getDaysUntil } from "../utils/utils";

// Mock data for requests
const allRequests = [
    // {
    //   id: 1, part_name: "CIM Motor", user: {
    //     team_number: 1234, team_name: "Robo Wizards", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 2, needed_date: new Date(2024, 10, 30), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 2, part_name: "Pneumatic Cylinder", user: {
    //     team_number: 5678, team_name: "Tech Titans", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 5, needed_date: new Date(2024, 10, 28), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 3, part_name: "Talon SRX", user: {
    //     team_number: 9101, team_name: "Gear Guardians", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 10, needed_date: new Date(2024, 10, 27), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 4, part_name: "Encoder", user: {
    //     team_number: 2468, team_name: "Binary Builders", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 15, needed_date: new Date(2024, 11, 5), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 5, part_name: "Battery", user: {
    //     team_number: 1357, team_name: "Power Pioneers", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 8, needed_date: new Date(2024, 11, 2), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 6, part_name: "Wheels", user: {
    //     team_number: 3690, team_name: "Rolling Rangers", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 12, needed_date: new Date(2024, 11, 10), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 7, part_name: "Gearbox", user: {
    //     team_number: 4812, team_name: "Torque Troopers", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 18, needed_date: new Date(2024, 11, 15), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 8, part_name: "Camera", user: {
    //     team_number: 7531, team_name: "Vision Voyagers", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 7, needed_date: new Date(2024, 11, 8), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 9, part_name: "Servo Motor", user: {
    //     team_number: 9876, team_name: "Precision Pilots", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 3, needed_date: new Date(2024, 10, 29), coverPhoto: "/IMG_6769.jpg"
    // },
    // {
    //   id: 10, part_name: "Limit Switch", user: {
    //     team_number: 2345, team_name: "Sensor Squad", "formatted_address": {
    //       "raw": "5951 Village Center Loop Rd, San Diego, CA 92130, USA",
    //       "latitude": 32.9582122,
    //       "longitude": -117.189548
    //     },
    //   }, distance: 20, needed_date: new Date(2024, 11, 20), coverPhoto: "/IMG_6769.jpg"
    // },
  ];

// Fuse.js options
const fuseOptions = {
  keys: ["part_name", "user.team_name", "user.team_number"],
  threshold: 0.3,
  ignoreLocation: true,
};

const AllRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [items, setItems] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/requests/");
        setItems(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/users/self/');
      const data = response.data;

      if (!data || !data.formatted_address) {
        throw new Error('Address or coordinates not found');
      }

      setUser(data);
      setLoadingUser(false);
    }
    catch (error) {
      console.error('Error fetching User Data:', error);
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const categories = [
    "Motors",
    "Electronics",
    "Pneumatics",
    "Mechanical",
    "Sensors",
    "Controls",
    "Batteries",
    "Other",
  ];

  // Create a memoized instance of Fuse
  const fuse = useMemo(() => new Fuse(items, fuseOptions), []);

  // Get filtered results based on search term and other filters
  const getFilteredResults = () => {
    let results = [...items];

    // Apply fuzzy search if search term exists
    if (searchTerm) {
      results = fuse.search(searchTerm).map((result) => result.item);
    }

    // Apply distance filter
    results = results.filter((request) => request.distance <= distance);

    // Apply category filter if any categories are selected
    if (selectedCategories.length > 0) {
      results = results.filter((request) =>
        // Note: You'll need to add a category field to your request objects
        selectedCategories.includes(request.category)
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.dueDate - a.dueDate;
        case "closest":
          return a.distance - b.distance;
        case "urgent":
          return getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate);
        default:
          return 0;
      }
    });

    return results;
  };

  const filteredRequests = useMemo(
    () => getFilteredResults(),
    [searchTerm, distance, selectedCategories, sortBy]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col space-y-3">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search parts..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <FiSliders className="mr-2" />
                Filters
              </button>
            </div>

            {/* Filter Options - Shown when showFilters is true */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Distance
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                  >
                    <option value={10}>Within 10 miles</option>
                    <option value={25}>Within 25 miles</option>
                    <option value={50}>Within 50 miles</option>
                    <option value={100}>Within 100 miles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sort By
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="closest">Closest First</option>
                    <option value="urgent">Most Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategories((prev) =>
                            prev.includes(category)
                              ? prev.filter((c) => c !== category)
                              : [...prev, category]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${selectedCategories.includes(category)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow bg-gray-100 font-sans p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRequests && !loadingUser ? (
            <>
              {filteredRequests.map((request) => (
                <ItemCard key={request.id} currentUser={user} item={request} type="request" />
              ))}
            </>
          ) : loadingUser ? (
            <p>Loading</p>
          ) : error ? (
            <p>Error... {error} </p>
          ) : (
            <p>blah blah ig</p>
          )
          }
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items && !loading && !loadingUser ? (
            <>
              {items.map((request) => (
                <ItemCard key={request.id} currentUser={user} item={request} type="request" />
              ))}
            </>
          ) : loadingUser || loading ? (
            <p>Loading</p>
          ) : error ? (
            <p>Error... {error} </p>
          ) : (
            <p>blah blah ig</p>
          )
          }

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRequests && !loading && !loadingUser ? (
            <>
              {filteredRequests.map((request) => (
                <ItemCard key={request.id} currentUser={user} item={request} type="request" />
              ))}
            </>
          ) : loadingUser || loading ? (
            <p>Loading</p>
          ) : error ? (
            <p>Error... {error} </p>
          ) : (
            <p>blah blah ig</p>
          )
          }

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllRequests;
