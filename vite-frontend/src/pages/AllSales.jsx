import React, { useState, useMemo } from 'react'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'
import { FiSearch, FiSliders } from 'react-icons/fi'
import Fuse from 'fuse.js'
import ItemCard from '../components/ItemCard'
import axiosInstance from '../utils/axiosInstance'

// id, title, team, price, condition, image, location?, category?



const salesItems = [
  { id: 1, title: "NEO Motor", team: "Team 2468", price: 50, condition: "like-new", image: "/IMG_6769.jpg" },
  { id: 2, title: "Falcon 500", team: "Team 1357", price: 75, condition: "broken", image: "/IMG_6769.jpg" },
  { id: 3, title: "Victor SPX", team: "Team 3690", price: 30, condition: "like-new", image: "/IMG_6769.jpg" },
  { id: 4, title: "PDP", team: "Team 9876", price: 60, condition: "ok", image: "/IMG_6769.jpg" },
  { id: 5, title: "Spark MAX", team: "Team 1234", price: 45, condition: "good", image: "/IMG_6769.jpg" },
  { id: 6, title: "Ultrasonic Sensor", team: "Team 5678", price: 25, condition: "poor", image: "/IMG_6769.jpg" },
  { id: 7, title: "Pneumatic Tubing", team: "Team 4321", price: 15, condition: "ok", image: "/IMG_6769.jpg" },
  { id: 8, title: "Joystick", team: "Team 8765", price: 35, condition: "bad", image: "/IMG_6769.jpg" },
  { id: 9, title: "Voltage Regulator", team: "Team 2109", price: 20, condition: "like-new", image: "/IMG_6769.jpg" },
  { id: 10, title: "Aluminum Extrusion", team: "Team 6543", price: 40, condition: "broken", image: "/IMG_6769.jpg" },
  
]

// Fuse.js options
const fuseOptions = {
  keys: ['title', 'team'],
  threshold: 0.3,
  ignoreLocation: true,
};

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // Add this

  const categories = [
    'Motors',
    'Electronics',
    'Pneumatics',
    'Mechanical',
    'Sensors',
    'Controls',
    'Batteries',
    'Other'
  ];

  // Create a memoized instance of Fuse
  const fuse = useMemo(() => new Fuse(salesItems, fuseOptions), []);

  // Get filtered results based on search term and other filters
  const getFilteredResults = () => {
    let results = [...salesItems];

    // Apply fuzzy search if search term exists
    if (searchTerm) {
      results = fuse.search(searchTerm).map(result => result.item);
    }

    // Apply condition filter
    if (filter !== 'all') {
      results = results.filter(item => item.condition.toLowerCase() === filter);
    }

    // Add category filtering
    if (selectedCategories.length > 0) {
      results = results.filter(item => 
        // Note: You'll need to add a category field to your salesItems
        selectedCategories.includes(item.category)
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return a.title.localeCompare(b.title);
    });

    return results;
  };

  const filteredAndSortedItems = useMemo(() => getFilteredResults(), [
    searchTerm,
    filter,
    sortBy,
    selectedCategories
  ]);

  return (
    <div className='min-h-screen flex flex-col'>
      <TopBar />
      <div className="bg-gray-100 font-sans">
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

              {/* Update Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Condition</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Conditions</option>
                      <option value="like-new">Like New</option>
                      <option value="good">Good</option>
                      <option value="ok">Ok</option>
                      <option value="poor">Poor</option>
                      <option value="broken">Broken</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="price">Sort by Price</option>
                      <option value="name">Sort by Name</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categories</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategories(prev =>
                              prev.includes(category)
                                ? prev.filter(c => c !== category)
                                : [...prev, category]
                            )
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedCategories.includes(category)
                              ? 'bg-red-800 text-white'
                              : 'bg-gray-100 text-gray-800'
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

        {/* Main content */}
        <div className="flex flex-col flex-grow p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {filteredAndSortedItems.map((item) => (
              <ItemCard 
                key={item.id}
                item={item}
                type="sale"
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SalesPage;