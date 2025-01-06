import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import Fuse from "fuse.js";
import ItemCard from "../components/ItemCard";
import SearchAndFilter from "../components/SearchAndFilter";
import { getDaysUntil, haversine } from "../utils/utils";
import { useUser } from "../contexts/UserContext";

const fuseOptions = {
  keys: ["part.name"],
  threshold: 0.3,
  ignoreLocation: true,
};

const AllRequests = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { user, isAuthenticated } = useUser();

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/requests/");
      setItems(response.data); // Ensure it's an array
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
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

      const distance = haversine(
        user_latitude,
        user_longitude,
        item_latitude,
        item_longitude
      );
      item.distance = distance;
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

    const distance = haversine(user_latitude, user_longitude, item_latitude, item_longitude);
    return { ...item, distance: Math.round(distance) };
  };

  useEffect(() => {
    const setupPage = async () => {
      try {
        await fetchData();
        await fetchCategories();
        if (user && items) calculateDistanceForAll(items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    setupPage();
  }, [isAuthenticated]);

  const fuse = useMemo(() => new Fuse(items, fuseOptions), [items]);

  const getFilteredResults = () => {
    let results = [...items];

    if (searchTerm) {
      results = fuse.search(searchTerm).map((result) => result.item);
    }

    if (distance && user) {
      results = results.filter((request) => {
        const item = calculateDistanceForSingle(request);
        return item.distance <= distance;
      });
    }

    if (selectedCategories.length > 0) {
      results = results.filter((request) =>
        request.part && request.part.category
          ? selectedCategories.some(
              (category) => category.id === request.part.category.id
            )
          : false
      );
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case "urgent":
          return getDaysUntil(a.needed_date) - getDaysUntil(b.needed_date);
        case "newest":
          return new Date(b.request_date) - new Date(a.request_date);
        case "closest":
          return (a.distance || Infinity) - (b.distance || Infinity);
        default:
          return 0;
      }
    });

    return results;
  };

  const filteredRequests = useMemo(
    () => getFilteredResults(),
    [items, searchTerm, distance, selectedCategories, sortBy, fuse]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <SearchAndFilter
        onSearchChange={setSearchTerm}
        onDistanceChange={setDistance}
        onSortChange={setSortBy}
        onCategoriesChange={setSelectedCategories}
        allCategories={allCategories}
        implementationType={"request"}
      />
      <div className="flex flex-col flex-grow bg-gray-100 font-sans p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center">Loading...</div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <ItemCard
                key={request.id}
                currentUser={user}
                item={request}
                type="request"
                itemDistance={haversine(
                  user.formatted_address.latitude,
                  user.formatted_address.longitude,
                  request.user.formatted_address.latitude,
                  request.user.formatted_address.longitude
                ).toFixed(1)}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllRequests;
