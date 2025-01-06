import React, { useState, useEffect } from 'react';
import { FiSearch, FiSliders } from "react-icons/fi";

const PartsSearchAndFilter = ({ 
  onSearchChange, 
  onCategoriesChange,
  onManufacturersChange,
  allCategories,
  allManufacturers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);

  useEffect(() => {
    onSearchChange(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    onCategoriesChange(selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    onManufacturersChange(selectedManufacturers);
  }, [selectedManufacturers]);

  return (
    <div className="sticky top-0 z-10 bg-white shadow-md mb-6">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col space-y-3">
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

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturers
                </label>
                <div className="flex flex-wrap gap-2">
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
                          ? "bg-blue-500 text-white"
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
    </div>
  );
};

export default PartsSearchAndFilter;
