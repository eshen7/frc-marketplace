import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FiSearch, FiSliders } from "react-icons/fi";
import Fuse from "fuse.js";
import ItemCard from "../components/ItemCard";
import { getDaysUntil } from "../utils/utils";

// Fuse.js options
const fuseOptions = {
  keys: ["part_name"],
  threshold: 0.3,
  ignoreLocation: true,
};

const AllRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [items, setItems] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get("/users/self/");
      const data = response.data;

      if (!data || !data.formatted_address) {
        throw new Error("Address or coordinates not found");
      }

      setUser(data);
      setLoadingUser(false);
    } catch (error) {
      console.error("Error fetching User Data:", error);
      setLoadingUser(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/parts/categories/");
      setAllCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAllCategories([]);
    }
  };

  const calculateDistanceForAll = (items) => {
    items.map((item) => {
      if (
        !item.user ||
        !item.user.formatted_address.latitude ||
        !item.user.formatted_address.longitude
      ) {
        return { ...item, distance: Infinity };
      }

      const user_latitude = user.formatted_address.latitude;
      const user_longitude = user.formatted_address.longitude;
      const item_latitude = item.user.formatted_address.latitude;
      const item_longitude = item.user.formatted_address.longitude;

      const distance = Math.sqrt(
        Math.pow(Math.abs(user_latitude - item_latitude), 2) +
          Math.pow(Math.abs(user_longitude - item_longitude), 2)
      );
      item.distance = Math.round(distance);
      setItems([...items]);
    });
  };

  const calculateDistanceForSingle = (item) => {
    if (
      !item.user ||
      !item.user.formatted_address.latitude ||
      !item.user.formatted_address.longitude
    ) {
      return { ...item, distance: Infinity };
    }
    const user_latitude = user.formatted_address.latitude;
    const user_longitude = user.formatted_address.longitude;
    const item_latitude = item.user.formatted_address.latitude;
    const item_longitude = item.user.formatted_address.longitude;

    const distance = Math.sqrt(
      Math.pow(Math.abs(user_latitude - item_latitude), 2) +
        Math.pow(Math.abs(user_longitude - item_longitude), 2)
    );
    return { ...item, distance: Math.round(distance) };
  };

  useEffect(() => {
    const setupPage = async () => {
      try {
        await fetchUser(); // Fetch user first
        await fetchData(); // Then fetch items
        await fetchCategories();
        if (user && items) calculateDistanceForAll(items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    setupPage();
  }, []); // Run once on component mount

  // Update Fuse instance to include new items when they change
  const fuse = useMemo(() => new Fuse(items, fuseOptions), [items]);

  // Get filtered results based on search term and other filters
  const getFilteredResults = () => {
    let results = [...items];

    // Apply fuzzy search if search term exists
    if (searchTerm) {
      results = fuse.search(searchTerm).map((result) => result.item);
    }

    // Apply distance filter if distance exists
    if (distance && user) {
      results = results.filter((request) => {
        const item = calculateDistanceForSingle(request);
        return item.distance <= distance;
      });
    }

    // Apply category filter if any categories are selected
    if (selectedCategories.length > 0) {
      results = results.filter(
        (request) =>
          request.category && selectedCategories.includes(request.category)
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case "urgent":
          return getDaysUntil(a.due_date) - getDaysUntil(b.due_date);
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "closest":
          return (a.distance || Infinity) - (b.distance || Infinity);
        default:
          return 0;
      }
    });

    return results;
  };

  // Update filteredRequests dependencies
  const filteredRequests = useMemo(
    () => getFilteredResults(),
    [items, searchTerm, distance, selectedCategories, sortBy, fuse]
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
                    {allCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategories((prev) =>
                            prev.includes(category)
                              ? prev.filter((c) => c !== category)
                              : [...prev, category]
                          );
                        }}
                        className={`px-3 py-1 text-sm ${
                          selectedCategories.includes(category)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.name}
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
          {!loading && !loadingUser ? (
            filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <ItemCard
                  key={request.id}
                  currentUser={user}
                  item={request}
                  type="request"
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No results found
              </div>
            )
          ) : (
            <div className="col-span-full text-center">Loading...</div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AllRequests;
