import React, { useCallback, useRef } from "react";
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
import HelmetComp from "../components/HelmetComp";

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
  const [distance, setDistance] = useState(Infinity);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(12);
  const observerTarget = useRef(null);

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
      return { ...item, distance: 0 };
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

    // Calculate distances for all items first if user is authenticated
    if (user) {
      results = results.map(sale => {
        if (!sale.user?.formatted_address?.latitude || 
            !sale.user?.formatted_address?.longitude ||
            !user?.formatted_address?.latitude || 
            !user?.formatted_address?.longitude) {
          return { ...sale, distance: Infinity };
        }
        
        const distance = haversine(
          user.formatted_address.latitude,
          user.formatted_address.longitude,
          sale.user.formatted_address.latitude,
          sale.user.formatted_address.longitude
        );
        return { ...sale, distance: parseFloat(distance.toFixed(1)) };
      });
    }

    if (searchTerm) {
      results = fuse.search(searchTerm).map((result) => result.item);
    }

    if (distance && user) {
      results = results.filter((sale) => {
        return sale.distance <= distance;
      });
    }

    if (selectedCategories.length > 0) {
      results = results.filter((sale) =>
        sale.part && sale.part.category
          ? selectedCategories.some(
              (category) => category.id === sale.part.category.id
            )
          : false
      );
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.request_date) - new Date(a.request_date);
        case "closest":
          const distanceA = a.distance ?? Infinity;
          const distanceB = b.distance ?? Infinity;
          return distanceA - distanceB;
        case "price-low":
          return a.ask_price - b.ask_price;
        case "price-high":
          return b.ask_price - a.ask_price;
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

  // Create intersection observer
  const observerCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && filteredSales.length > displayLimit) {
        setDisplayLimit((prev) => prev + 12);
      }
    },
    [filteredSales.length, displayLimit]
  );

  // Set up observer
  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerCallback]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <HelmetComp title="All Sales" />
      <SearchAndFilter
        onSearchChange={setSearchTerm}
        onDistanceChange={setDistance}
        onSortChange={setSortBy}
        onCategoriesChange={setSelectedCategories}
        allCategories={categories}
        implementationType={"sale"}
      />
      <div className="flex flex-col flex-grow bg-gray-100 font-sans p-8">
        <div
          className={`${
            loadingStates.sales
              ? "flex items-center justify-center"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr"
          }`}
        >
          {loadingStates.sales ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="ml-2">Loading Sales...</p>
            </div>
          ) : filteredSales.length > 0 ? (
            <>
              {filteredSales.slice(0, displayLimit).map((sale) => {
                const distanceTemp = isAuthenticated
                  ? haversine(
                      user.formatted_address.latitude,
                      user.formatted_address.longitude,
                      sale.user.formatted_address.latitude,
                      sale.user.formatted_address.longitude
                    ).toFixed(1)
                  : null;

                return (
                  <ItemCard
                    key={sale.id}
                    currentUser={user}
                    item={sale}
                    type="sale"
                    itemDistance={distanceTemp}
                  />
                );
              })}
              {/* Observer target */}
              {filteredSales.length > displayLimit && (
                <div
                  ref={observerTarget}
                  className="col-span-full flex justify-center p-4"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </>
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
