import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { FaRobot, FaUser, FaExternalLinkAlt } from 'react-icons/fa';

const PublicProfileComponent = ({ user }) => {

    return (
        <>
            <div className="h-full bg-gray-100 flex flex-col p-4">
                <div className='flex items-center justify-center'>
                    <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-center">
                                <FaRobot className="text-6xl text-blue-500" />
                            </div>

                            <h1 className="text-3xl font-bold text-center text-gray-800">
                                {user.team_name}
                            </h1>

                            <div className="bg-gray-200 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2 text-gray-700">
                                    Team Information
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <FaRobot className="mr-2 text-blue-500" />
                                        <span className="text-gray-700">Team Number: {user.team_number}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaUser className="mr-2 text-blue-500" />
                                        <span className="text-gray-700">Head Coach: {user.full_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <a
                                    href={`https://www.thebluealliance.com/team/${user.team_number}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                >
                                    <FaExternalLinkAlt className="mr-2" />
                                    View on The Blue Alliance
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='pt-5'>
                    <h1 className="text-3xl font-bold text-left text-gray-800">
                        Requests
                    </h1>
                    <div className=''>

                    </div>
                </div>
            </div>
        </>
    );
};

const PublicProfilePage = () => {
    const { teamNumber } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/users/frc${teamNumber}/`);
                setUser(response.data);
                console.log("Fetched User:", response.data);
            } catch (error) {
                console.error("Error fetching user:", error);
                setError("Failed to load user data.");
            }
        };

        fetchUser();
    }, [teamNumber])

    return (
        <div className='min-h-screen flex flex-col'>
            <TopBar />
            <div className='flex-grow'>
                {!error && user ? (
                    <PublicProfileComponent user={user} />
                ) : !error && !user ? (
                    <>
                        <p>Loading...</p>
                    </>
                ) : (
                    <>
                        <p>Error: {error}</p>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default PublicProfilePage;