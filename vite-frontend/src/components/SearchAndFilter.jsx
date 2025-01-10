import React, { useState, useEffect } from 'react';
import { FiSearch, FiSliders } from "react-icons/fi";

const SearchAndFilter = ({ 
  onSearchChange, 
  onDistanceChange, 
  onSortChange, 
  onCategoriesChange,
  allCategories ,
  implementationType
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(Infinity);
  const [sortBy, setSortBy] = useState(implementationType == "request" ? "urgent" : "newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    onSearchChange(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    onDistanceChange(distance);
  }, [distance]);

  useEffect(() => {
    onSortChange(sortBy);
  }, [sortBy]);

  useEffect(() => {
    onCategoriesChange(selectedCategories);
  }, [selectedCategories]);

  return (
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

          {/* Filter Options */}
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
                  <option value={Infinity}>Any distance</option>
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
                  {implementationType == "request" && <option value="urgent">Most Urgent</option>}
                  {implementationType == "sale" && <option value="price-low">Price: Low to High</option>}
                  {implementationType == "sale" && <option value="price-high">Price: High to Low</option>}
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
  );
};

export default SearchAndFilter;
