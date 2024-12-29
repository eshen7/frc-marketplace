import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FiSearch, FiSliders } from "react-icons/fi";
import Fuse from "fuse.js";
import PartItemCard from "../components/PartItemCard";

const fuseOptions = {
  keys: ["name", "category", "manufacturer"],
  threshold: 0.3,
  ignoreLocation: true,
};

const AllParts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allManufacturers, setAllManufacturers] = useState([]);

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParts = async () => {
    try {
      const response = await axiosInstance.get("/parts/");
      setParts(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch parts");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/parts/categories/");
      setAllCategories(response.data);
    } catch (error) {
      setAllCategories([]);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const response = await axiosInstance.get("/parts/manufacturers/");
      setAllManufacturers(response.data);
    } catch (error) {
      setAllManufacturers([]);
    }
  };

  useEffect(() => {
    const setupPage = async () => {
      try {
        await Promise.all([
          fetchParts(),
          fetchCategories(),
          fetchManufacturers(),
        ]);
      } catch (error) {}
    };

    setupPage();
  }, []);

  const fuse = useMemo(() => new Fuse(parts, fuseOptions), [parts]);

  const getFilteredResults = () => {
    let results = [...parts];
    console.log(results);

    if (searchTerm) {
      results = fuse.search(searchTerm).map((result) => result.item);
    }

    if (selectedCategories.length > 0) {
      results = results.filter((part) =>
        selectedCategories.includes(part.category)
      );
    }

    if (selectedManufacturers.length > 0) {
      results = results.filter((part) =>
        selectedManufacturers.includes(part.manufacturer.name)
      );
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return results;
  };

  const filteredParts = useMemo(
    () => getFilteredResults(),
    [parts, searchTerm, selectedCategories, selectedManufacturers, sortBy, fuse]
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
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name (A-Z)</option>
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
                          ? "bg-red-800 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Manufacturers
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {allManufacturers.map((manufacturer) => (
                    <button
                      key={manufacturer.id}
                      onClick={() => {
                        setSelectedManufacturers((prev) =>
                          prev.includes(manufacturer)
                            ? prev.filter((m) => m !== manufacturer)
                            : [...prev, manufacturer]
                        );
                      }}
                      className={`px-3 py-1 text-sm ${
                        selectedManufacturers.includes(manufacturer)
                          ? "bg-red-800 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {manufacturer.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-grow bg-gray-100 font-sans p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!loading ? (
            filteredParts.length > 0 ? (
              filteredParts.map((part) => (
                <PartItemCard key={part.id} part={part} />
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

export default AllParts;
