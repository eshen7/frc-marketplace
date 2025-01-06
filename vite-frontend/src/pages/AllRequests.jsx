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
import { useData } from "../contexts/DataContext";

const fuseOptions = {
  keys: ["part.name"],
  threshold: 0.3,
  ignoreLocation: true,
};

const AllRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState("urgent");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { user, loadingUser, isAuthenticated } = useUser();
  const { requests, categories: allCategories, loadingStates } = useData();

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
      item.distance = Math.round(distance);
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
        if (user && requests) calculateDistanceForAll(requests);
      } catch (error) {
        console.error("Error calculating distances:", error);
      }
    };

    setupPage();
  }, [isAuthenticated]);

  // Update Fuse instance to use requests from context
  const fuse = useMemo(() => new Fuse(requests, fuseOptions), [requests]);

  // Update getFilteredResults to use requests from context
  const getFilteredResults = () => {
    let results = [...requests];

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
    [requests, searchTerm, distance, selectedCategories, sortBy, fuse]
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
          {loadingStates.requests ? (
            <div className="col-span-full text-center">Loading...</div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => {
              const distanceTemp = isAuthenticated ? haversine(
                user.formatted_address.latitude,
                user.formatted_address.longitude,
                request.user.formatted_address.latitude,
                request.user.formatted_address.longitude
              ).toFixed(1) : null;

              return (
                <ItemCard
                  key={request.id}
                  currentUser={user}
                  item={request}
                  type="request"
                  itemDistance={distanceTemp}
                />
              );
            })
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
