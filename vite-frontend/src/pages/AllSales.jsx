import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import Fuse from "fuse.js";
import ItemCard from "../components/ItemCard";
import SearchAndFilter from "../components/SearchAndFilter";
import { haversine } from "../utils/utils";
import { useUser } from "../contexts/UserContext";
import { useData } from "../contexts/DataContext";

// Fuse.js options
const fuseOptions = {
  keys: ["part.name"],
  threshold: 0.3,
  ignoreLocation: true,
};

const SalesPage = () => {
  const { user, loadingUser, isAuthenticated } = useUser();
  const { sales, categories, loadingStates } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const calculateDistanceForAll = (items) => {
    items.map((item) => {
      if (
        !item.user ||
        !item.user.formatted_address.latitude ||
        !item.user.formatted_address.longitude
      ) {
        return { ...item, distance: Infinity };
      }

      const distance = haversine(
        user.formatted_address.latitude,
        user.formatted_address.longitude,
        item.user.formatted_address.latitude,
        item.user.formatted_address.longitude
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
    const distance = haversine(
      user.formatted_address.latitude,
      user.formatted_address.longitude,
      item.user.formatted_address.latitude,
      item.user.formatted_address.longitude
    );
    return { ...item, distance: Math.round(distance) };
  };

  useEffect(() => {
    const setupPage = async () => {
      try {
        if (user && sales) calculateDistanceForAll(sales);
      } catch (error) {
        console.error("Error calculating distances:", error);
      }
    };

    setupPage();
  }, []);

  const fuse = useMemo(() => new Fuse(sales, fuseOptions), [sales]);

  const getFilteredResults = () => {
    let results = [...sales];

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
      results = results.filter((sale) =>
        sale.part && sale.part.category
          ? selectedCategories.some(category => category.id === sale.part.category.id)
          : false
      );
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.ask_price - b.ask_price;
        case "price-high":
          return b.ask_price - a.ask_price;
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
    [sales, searchTerm, distance, selectedCategories, sortBy, fuse]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <SearchAndFilter
        onSearchChange={setSearchTerm}
        onDistanceChange={setDistance}
        onSortChange={setSortBy}
        onCategoriesChange={setSelectedCategories}
        allCategories={categories}
        implementationType={"sale"}
      />
      <div className="flex flex-col flex-grow bg-gray-100 font-sans p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingStates.sales ? (
            <div className="col-span-full text-center">Loading...</div>
          ) : filteredSales.length > 0 ? (
            filteredSales.map((sale) => {
              const distanceTemp = isAuthenticated ? haversine(
                user.formatted_address.latitude,
                user.formatted_address.longitude,
                sale.user.formatted_address.latitude,
                sale.user.formatted_address.longitude
              ).toFixed(1) : null;

              return (
                <ItemCard
                  key={sale.id}
                  currentUser={user}
                  item={sale}
                  type="sale"
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

export default SalesPage;
