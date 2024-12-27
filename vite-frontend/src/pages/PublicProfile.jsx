import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { FaRobot, FaUser, FaExternalLinkAlt, FaComments } from 'react-icons/fa';
import ItemCard from '../components/ItemCard';
import { MdOutlineEdit } from "react-icons/md";

const PublicProfileComponent = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axiosInstance.get(`/requests/user/${user.team_number}`)
                const data = response.data;

                setRequests(data);
            } catch (err) {
                console.error("Error fetching user's requests:", err);
            } finally {
                setLoadingRequests(false);
            }
        };

        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Or wherever you store the token

                if (token) {
                    const response = await axiosInstance.get("/users/self");
                    const data = response.data;

                    setCurrentUser(data);
                }
            } catch (err) {
                console.error("Error fetching current user:", err);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
        fetchRequests();
    }, []);

    return (
        <>
            <div className="h-full bg-gray-100 flex flex-col p-4">
                <div className='flex items-center justify-center'>
                    <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl relative">
                        {/* Edit Button */}
                        {currentUser?.team_number === user.team_number && (
                            <a href='/profile'>
                                <div className='absolute top-[15px] right-[15px] rounded-full bg-gray-100 text-blue-500 text-[30px] w-fit p-2
                                        hover:scale-105 transition duration-100 hover:cursor-pointer'>
                                    <MdOutlineEdit />
                                </div>
                            </a>
                        )}

                        {/* Main Profile Content */}
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-center">
                                <img src={user.profile_photo} />
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

                            {/* Blue Alliance Link */}
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

                            {/* Chat Button */}
                            {currentUser?.team_number !== user.team_number && (
                                <div className="mt-4 flex justify-center">
                                    <a
                                        href={`/chat/${user.team_number}`}
                                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                                    >
                                        <FaComments className="mr-2" />
                                        Chat with {user.team_name}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='pt-5'>
                    <h1 className="text-3xl font-bold text-left text-gray-800">
                        Requests
                    </h1>
                    <div>
                        {requests && !loadingRequests ? (
                            <div className='flex justify-center'>
                                {requests.length !== 0 ? (
                                    <div className='grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 place-items-center'>
                                        {requests.map((request) => (
                                            <div className='p-3'>
                                                <ItemCard item={request} currentUser={currentUser} type='request' />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <p>Team {user.team_number} doesn't have any requests!</p>
                                    </>
                                )}
                            </div>
                        ) : loadingRequests ? (
                            <>
                                <p>Loading</p>
                            </>
                        ) : (
                            <>
                            </>
                        )}
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
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/users/frc${teamNumber}/`);
                setUser(response.data);
                console.log("Fetched User:", response.data);
            } catch (error) {
                console.error("Error fetching user:", error);
                setError("Failed to load user data.");
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [teamNumber])

    return (
        <div className='min-h-screen flex flex-col'>
            <TopBar />
            <div className='flex-grow bg-gray-100'>
                {!error && user ? (
                    <PublicProfileComponent user={user} />
                ) : loadingUser ? (
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