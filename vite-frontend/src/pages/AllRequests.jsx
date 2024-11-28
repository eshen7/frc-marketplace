import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FiSearch, FiSliders } from "react-icons/fi";
import Fuse from "fuse.js";
import ItemCard from "../components/ItemCard";

// Helper function to calculate days until due date
const getDaysUntil = (dueDate) => {
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

axiosInstance
  .get("/requests/")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });

// Mock data for requests
const allRequests = [
  // { id: 1, title: "CIM Motor", team: { number: 1234, name: "Robo Wizards" }, distance: 2, dueDate: new Date(2024, 10, 30), coverPhoto: "/IMG_6769.jpg" },
  // { id: 2, title: "Pneumatic Cylinder", team: { number: 5678, name: "Tech Titans" }, distance: 5, dueDate: new Date(2024, 10, 28), coverPhoto: "/IMG_6769.jpg" },
  // { id: 3, title: "Talon SRX", team: { number: 9101, name: "Gear Guardians" }, distance: 10, dueDate: new Date(2024, 10, 27), coverPhoto: "/IMG_6769.jpg" },
  // { id: 4, title: "Encoder", team: { number: 2468, name: "Binary Builders" }, distance: 15, dueDate: new Date(2024, 11, 5), coverPhoto: "/IMG_6769.jpg" },
  // { id: 5, title: "Battery", team: { number: 1357, name: "Power Pioneers" }, distance: 8, dueDate: new Date(2024, 11, 2), coverPhoto: "/IMG_6769.jpg" },
  // { id: 6, title: "Wheels", team: { number: 3690, name: "Rolling Rangers" }, distance: 12, dueDate: new Date(2024, 11, 10), coverPhoto: "/IMG_6769.jpg" },
  // { id: 7, title: "Gearbox", team: { number: 4812, name: "Torque Troopers" }, distance: 18, dueDate: new Date(2024, 11, 15), coverPhoto: "/IMG_6769.jpg" },
  // { id: 8, title: "Camera", team: { number: 7531, name: "Vision Voyagers" }, distance: 7, dueDate: new Date(2024, 11, 8), coverPhoto: "/IMG_6769.jpg" },
  // { id: 9, title: "Servo Motor", team: { number: 9876, name: "Precision Pilots" }, distance: 3, dueDate: new Date(2024, 10, 29), coverPhoto: "/IMG_6769.jpg" },
  // { id: 10, title: "Limit Switch", team: { number: 2345, name: "Sensor Squad" }, distance: 20, dueDate: new Date(2024, 11, 20), coverPhoto: "/IMG_6769.jpg" },
];

// Fuse.js options
const fuseOptions = {
  keys: ["title", "team.name", "team.number"],
  threshold: 0.3,
  ignoreLocation: true,
};

const ItemList = () => {
  const [items, setItems] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/requests/");
        console.log(response.data); // Inspect the API response structure
        setItems(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ul>
      {Array.isArray(items) &&
        items.map((item) => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
};

const AllRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

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
  const fuse = useMemo(() => new Fuse(allRequests, fuseOptions), []);

  // Get filtered results based on search term and other filters
  const getFilteredResults = () => {
    let results = [...allRequests];

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
    <>
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
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedCategories.includes(category)
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

      <div className="min-h-screen bg-gray-100 font-sans p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRequests.map((request) => (
            <ItemCard key={request.id} item={request} type="request" />
          ))}
        </div>
      </div>
      {/* {ItemList()} */}
      <Footer />
    </>
  );
};

export default AllRequests;
