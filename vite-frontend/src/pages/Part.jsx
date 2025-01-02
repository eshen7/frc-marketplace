import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import ItemCard from "../components/ItemCard";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";

const PartDetailsComponent = ({ part }) => {
  return (
    <div className="h-full bg-gray-100 flex flex-col p-4 min-w-[300px]">
      <div className="flex flex-row justify-center">
        {/* Part Details Section */}
        <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-6 space-y-6">
          {/* Part Image */}
          <div className="flex items-center justify-center">
            {part.image ? (
              <img
                src={part.image}
                alt={part.name}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          {/* Part Details */}
          <h1 className="text-3xl font-bold text-center text-gray-800">
            {part.name || "Unnamed Part"}
          </h1>

          <div className="bg-gray-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Part Information
            </h2>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="font-semibold text-gray-600">ID:</span>
                <span className="text-gray-800">{part.model_id || "N/A"}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-gray-600">Category:</span>
                <span className="text-gray-800">
                  {part.category.name || "Uncategorized"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-gray-600">
                  Manufacturer:
                </span>
                <span className="text-gray-800">
                  {part.manufacturer.name || "Unknown"}
                </span>
              </p>
            </div>
          </div>

          {/* External Link */}
          {part.externalLink && (
            <div className="flex justify-center mt-4">
              <a
                href={part.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <FaExternalLinkAlt className="mr-2" />
                View More Details
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PartDetailsPage = () => {
  const { id } = useParams();

  const { user } = useUser();

  const [part, setPart] = useState(null);
  const [requests, setRequests] = useState([]);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  const [onRequests, setOnRequests] = useState(true);

  useEffect(() => {
    const fetchPart = async () => {
      try {
        const response = await axiosInstance.get(`/parts/id/${id}`);
        setPart(response.data);
      } catch (error) {
        console.error("Error fetching part:", error);
        setError("Failed to load part data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get(`/parts/id/${id}/requests`);
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoadingRequests(false);
      }
    };

    const fetchSales = async () => {
      try {
        const response = await axiosInstance.get(`/parts/id/${id}/sales`);
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchPart();
    fetchRequests();
    fetchSales();
  }, [id]);

  const handleClickSales = () => {
    setOnRequests(false);
  };

  const handleClickRequests = () => {
    setOnRequests(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-grow flex flex-col bg-gray-100 px-5">
        <div>
          {!error && part ? (
            <PartDetailsComponent
              part={part}
            />
          ) : loading ? (
            <div className="flex justify-center items-center h-screen">
              Loading...
            </div>
          ) : (
            <div className="flex justify-center items-center h-screen text-red-500">
              Error: {error}
            </div>
          )}
        </div>
        {/* Part Requests Section */}
        <div className="flex-grow mx-6 mb-10">
          <div className="flex flex-row justify-between">
            <button className={`text-xl font-semibold text-gray-700 mb-4 py-2 px-4 rounded-md hover:bg-gray-300 ${onRequests ? "bg-gray-200" : ""}`} onClick={handleClickRequests}>
              Part Requests
            </button>
            <button className={`text-xl font-semibold text-gray-700 mb-4 py-2 px-4 rounded-md hover:bg-gray-300 ${onRequests ? "" : "bg-gray-200"}`} onClick={handleClickSales}>
              View Sales
            </button>
          </div>
          {onRequests ? (
            <div className="flex flex-col">
              {requests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[300px]">
                  {requests.map((request) => (
                    <ItemCard
                      key={request.id}
                      item={request}
                      currentUser={user}
                      type="request"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No requests found for this part.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {sales.length > 0 ? (
                <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[300px]">
                  {sales.map((sale) => (
                    <ItemCard
                      key={sale.id}
                      item={sale}
                      currentUser={user}
                      type="sale"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sales found for this part.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PartDetailsPage;
