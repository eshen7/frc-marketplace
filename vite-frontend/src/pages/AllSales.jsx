import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FiSearch, FiSliders } from "react-icons/fi";
import Fuse from "fuse.js";
import ItemCard from "../components/ItemCard";

// Fuse.js options
const fuseOptions = {
  keys: ["part.name"],
  threshold: 0.3,
  ignoreLocation: true,
};

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/sales/");
      setItems(Array.isArray(response.data) ? response.data : []);
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
        await fetchUser();
        await fetchData();
        await fetchCategories();
        if (user && items) calculateDistanceForAll(items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    setupPage();
  }, []);

  const fuse = useMemo(() => new Fuse(items, fuseOptions), [items]);

  const getFilteredResults = () => {
    let results = [...items];

    if (searchTerm) {
      results = fuse.search(searchTerm).map((result) => result.item);
    }

    if (distance && user) {
      results = results.filter((sale) => {
        const item = calculateDistanceForSingle(sale);
        return item.distance <= distance;
      });
    }

    if (selectedCategories.length > 0) {
      results = results.filter(
        (sale) => sale.category && selectedCategories.includes(sale.category)
      );
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
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

  const filteredSales = useMemo(
    () => getFilteredResults(),
    [items, searchTerm, distance, selectedCategories, sortBy, fuse]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="sticky top-0 z-10 bg-white shadow-md">
        {/* Search bar section - same structure as AllRequests */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* ...existing code... */}
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
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
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
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-grow bg-gray-100 font-sans p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!loading && !loadingUser ? (
            filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <ItemCard
                  key={sale.id}
                  currentUser={user}
                  item={sale}
                  type="sale"
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

export default SalesPage;
