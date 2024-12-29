import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { FaExternalLinkAlt } from 'react-icons/fa';

const PartDetailsComponent = ({ part }) => {
    return (
        <div className="h-full bg-gray-100 flex flex-col p-4">
            <div className='flex items-center justify-center'>
                <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl">
                    <div className="p-6 space-y-6">
                        {/* Part Image */}
                        <div className="flex items-center justify-center">
                            {part.image ? (
                                <img
                                    src={part.image}
                                    alt={part.name}
                                    className="w-full h-48 object-cover rounded-lg shadow-md"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                                    <span className="text-gray-500">No image available</span>
                                </div>
                            )}
                        </div>

                        {/* Part Details */}
                        <h1 className="text-3xl font-bold text-center text-gray-800">
                            {part.name || 'Unnamed Part'}
                        </h1>

                        <div className="bg-gray-200 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2 text-gray-700">
                                Part Information
                            </h2>
                            <div className="space-y-2">
                                <p className="flex justify-between">
                                    <span className="font-semibold text-gray-600">ID:</span>
                                    <span className="text-gray-800">{part.id || 'N/A'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Category:</span>
                                    <span className="text-gray-800">{part.category || 'Uncategorized'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Manufacturer:</span>
                                    <span className="text-gray-800">{part.manufacturer_name || 'Unknown'}</span>
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
        </div>
    );
};

const PartDetailsPage = () => {
    const { id } = useParams();
    const [part, setPart] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

        fetchPart();
    }, [id]);

    return (
        <div className='min-h-screen flex flex-col'>
            <TopBar />
            <div className='flex-grow bg-gray-100'>
                {!error && part ? (
                    <PartDetailsComponent part={part} />
                ) : loading ? (
                    <div className="flex justify-center items-center h-screen">Loading...</div>
                ) : (
                    <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default PartDetailsPage;