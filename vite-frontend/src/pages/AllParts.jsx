import React, { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiSliders } from "react-icons/fi";
import Fuse from "fuse.js";
import PartItemCard from "../components/PartItemCard";
import { useData } from '../contexts/DataContext';
import SearchAndFilter from "../components/SearchAndFilter";
import PartsSearchAndFilter from "../components/PartsSearchAndFilter";

const fuseOptions = {
  keys: ["name", "category", "manufacturer"],
  threshold: 0.3,
  ignoreLocation: true,
};

const AllParts = () => {
  const { parts, categories, manufacturers, loadingStates } = useData();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(12);
  const observerTarget = useRef(null);

  const fuse = useMemo(() => new Fuse(parts, fuseOptions), [parts]);

  const getFilteredResults = () => {
    let results = [...parts];

    if (searchTerm) {
      results = fuse.search(searchTerm).map((result) => result.item);
    }

    if (selectedCategories.length > 0) {
      results = results.filter((part) =>
        part.category
          ? selectedCategories.some(
            (category) => category.id === part.category.id
          )
          : false
      );
    }

    if (selectedManufacturers.length > 0) {
      console.log(selectedManufacturers);
      results = results.filter((part) =>
        part.manufacturer
          ? selectedManufacturers.some(
            (manufacturer) => manufacturer.id === part.manufacturer.id
          )
          : false
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

  const observerCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && filteredParts.length > displayLimit) {
        setDisplayLimit(prev => prev + 12);
      }
    },
    [filteredParts.length, displayLimit]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
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

      <div className="flex flex-col flex-grow bg-gray-100 font-sans">
        <PartsSearchAndFilter
          onSearchChange={setSearchTerm}
          onCategoriesChange={setSelectedCategories}
          onManufacturersChange={setSelectedManufacturers}
          allCategories={categories}
          allManufacturers={manufacturers}
        />
        <div className="p-8">
          <div className={`${loadingStates.parts ? "flex items-center justify-center" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}`}>
            {!loadingStates.parts ? (
              filteredParts.length > 0 ? (
                <>
                  {filteredParts.slice(0, displayLimit).map((part) => (
                    <PartItemCard key={part.id} part={part} navigate={navigate} />
                  ))}
                  {filteredParts.length > displayLimit && (
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
              )
            ) : (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="ml-2">Loading Parts...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllParts;
