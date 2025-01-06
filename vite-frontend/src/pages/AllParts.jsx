import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import Fuse from "fuse.js";
import PartItemCard from "../components/PartItemCard";
import SearchAndFilter from "../components/SearchAndFilter";
import PartsSearchAndFilter from "../components/PartsSearchAndFilter";

const fuseOptions = {
  keys: ["name", "category", "manufacturer"],
  threshold: 0.3,
  ignoreLocation: true,
};

const AllParts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
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

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <div className="flex flex-col flex-grow bg-gray-100 font-sans">
        <PartsSearchAndFilter
          onSearchChange={setSearchTerm}
          onCategoriesChange={setSelectedCategories}
          onManufacturersChange={setSelectedManufacturers}
          allCategories={allCategories}
          allManufacturers={allManufacturers}
        />
        <div className="p-8">
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
      </div>
      <Footer />
    </div>
  );
};

export default AllParts;
