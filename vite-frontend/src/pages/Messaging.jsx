import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { IoMdSend } from "react-icons/io";
import axiosInstance from '../utils/axiosInstance';
import { v4 as uuidv4 } from 'uuid'; // Add this at the top (install `uuid` if necessary)

const MessageSent = ({ message }) => {
    return (
        <div className='text-right flex flex-col place-items-end px-[20px] py-[10px]'>
            <p className='text-xs px-[12px]'>{message.sender.full_name}</p>
            <div className='bg-red-800 rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words'>
                <p className='text-white px-[20px]'>{message.message}</p>
            </div>
        </div>
    );
};

const MessageReceived = ({ message }) => {
    return (
        <div className='text-left flex flex-col place-items-start px-[20px] py-[10px]'>
            <p className='text-xs px-[12px]'>{message.sender.full_name}</p>
            <div className='bg-gray-200 rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words'>
                <p className='text-red-800 px-[20px]'>{message.message}</p>
            </div>
        </div>
    );
};

const Chat = () => {
    const navigate = useNavigate();

    const { roomName } = useParams(); // Get roomName from the URL
    const [messages, setMessages] = useState([]);
    const [messagesByRoom, setMessagesByRoom] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null); // Ref to track the bottom of the messages container

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [receiverUser, setReceiverUser] = useState(null);

    const [allTeams, setAllTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);

    useEffect(() => {
        const messageMaxHeight = () => {
            if (loading) return;
            const topBarHeight = document.querySelector('.top-bar').offsetHeight;
            const footerHeight = document.querySelector('.footer').offsetHeight;
            const messagesSection = document.querySelector('.messages-section');
        
            const maxHeight = `calc(100vh - ${topBarHeight}px - ${footerHeight}px)`;
            messagesSection.style.maxHeight = maxHeight;
        }
        
        messageMaxHeight();
    }, [loading]);

    const fetchTeams = async () => {
        try {
            const response = await axiosInstance.get('/users/');
            // console.log("response:", response)
            const data = response.data;
            // console.log("data:", data)

            if (!data) {
                throw new Error('Error getting Teams');
            }

            setAllTeams(data);
            // console.log(allTeams)
            setLoadingTeams(false);
        }
        catch (error) {
            console.error('Error fetching User Data:', error);
            setLoadingTeams(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get("/users/self/");
            // console.log('User Fetch Response:', response);
            const data = response.data;
            // console.log('data', data);

            setUser(data);
            setLoading(false);
        }
        catch (error) {
            console.error('Error fetching User Data:', error);
            setError(error);
            setLoading(false);
        }
    }

    // Fetch user on mount
    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const token = localStorage.getItem('authToken');

            if (!token) {
                navigate('/login');
                setError('User not logged in, please login to display profile editor'); // Display login message if no user
                setLoading(false);
                return;
            }

            try {
                await fetchUser(); // Fetch user data if a token exists
            } catch (error) {
                console.error('Error fetching User Data:', error);
                setError(error);
                setLoading(false);
            }
        };

        checkUserAndFetchData();
    }, []);

    useEffect(() => {
        const getReceiver = async () => {
            if (!roomName) return;

            try {
                const response = await axiosInstance.get(`/users/frc${roomName}`);
                const data = response.data;

                setReceiverUser(data);
            } catch (err) {
                console.error("Error fetching receiver:", err);
            }
        };

        getReceiver();
    }, [roomName])

    useEffect(() => {
        const connectWebSocket = () => {
            if (!user || !roomName || !receiverUser) return; // Ensure `user` and `roomName` are available

            // Generate the universal room name based on user and roomName
            let universalWS = "";
            if (Number(roomName) > Number(user.team_number)) {
                universalWS = `${user.team_number}_${roomName}`;
            } else {
                universalWS = `${roomName}_${user.team_number}`;
            }

            // Initialize WebSocket
            socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${universalWS}/`);

            socketRef.current.onopen = () => console.log("WebSocket opened");

            socketRef.current.onmessage = (event) => {
                console.log("Received message:", event.data);
                const data = JSON.parse(event.data);

                setMessagesByRoom((prevMessages) => {
                    const updatedMessages = { ...prevMessages };

                    if (!updatedMessages[roomName]) {
                        updatedMessages[roomName] = [];
                    }

                    const isDuplicate = updatedMessages[roomName].some((msg) => msg.id === data.id);
                    if (!isDuplicate) {
                        updatedMessages[roomName].push(data);
                    }
                    return updatedMessages;
                });
            };
            socketRef.current.onclose = (e) => console.log("WebSocket closed", e);
            socketRef.current.onerror = (err) => console.error("WebSocket error", err);
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [roomName, user]); // Re-run effect when roomName or user changes

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messagesByRoom, roomName])

    const sendMessage = () => {
        if (socketRef.current) {
            const newMessageObj = {
                id: uuidv4(),
                message: newMessage,
                sender: user,
                receiver: receiverUser, // Replace with actual receiver ID
            };

            socketRef.current.send(JSON.stringify(newMessageObj));

            // Add the message to the current room's messages
            setMessagesByRoom((prevMessages) => {
                const updatedMessages = { ...prevMessages };
                if (!updatedMessages[roomName]) {
                    updatedMessages[roomName] = [];
                }

                const isDuplicate = updatedMessages[roomName].some((msg) => msg.id === newMessageObj.id);
                if (!isDuplicate) {
                    updatedMessages[roomName].push(newMessageObj);
                }
                return updatedMessages;
            });

            setNewMessage('');
        }
    };

    return (
        <div className='h-screen flex flex-col'>
            <TopBar />
            <div className='messages-section p-5 flex flex-grow flex-row bg-gray-100'>
                {!loading && user ? (
                    <>
                        {/* Left Nav Bar */}
                        <div className='w-1/3 bg-white rounded-3xl shadow-md'>
                            <h1 className='text-3xl text-center p-3'>Chats</h1>
                            {!loadingTeams && allTeams ? (
                                <div className='flex flex-col overflow-y-auto'>
                                    {allTeams.map((team, index) => (
                                        <div key={index}>
                                            {team.team_number != user.team_number && (
                                                <div onClick={() => {
                                                    navigate(`/chat/${team.team_number}`);
                                                }}
                                                    className={`flex flex-row place-items-center ${roomName == team.team_number ? "bg-gray-100" : ""} hover:cursor-pointer hover:bg-gray-100 transition duration-200 my-2 mx-3 rounded-xl`}>
                                                    <div className='rounded-full px-1 '>
                                                        <img className='h-[40px] min-w-[32px]'
                                                            src="/MillenniumFalconLogo3647.png"
                                                            alt="3647 logo"
                                                        />
                                                    </div>
                                                    <div className='flex flex-col w-full px-2 py-2'>
                                                        <div className=''>
                                                            <p className=''>{team.team_name}</p>
                                                        </div>
                                                        <div className='flex flex-row justify-between'>
                                                            <p>{team.team_number}</p>
                                                            <p>{team.full_name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : loadingTeams ? (
                                <p>Loading Teams</p>
                            ) : (
                                <p>error loading teams</p>
                            )}
                        </div>

                        {/* Right Panel with messages */}
                        <div className='w-2/3 flex flex-col'>
                            <div>
                                <h1 className='text-3xl text-center'>
                                    {roomName ? roomName : "Select a user to chat with!"}
                                </h1>
                            </div>
                            {/* Messages Section */}
                            <div className='overflow-y-auto flex-grow'>
                                {(messagesByRoom[roomName] || []).map((msg, index) => (
                                    <div key={index}>
                                        {msg.sender.full_name === user.full_name ? (
                                            <MessageSent message={msg} />
                                        ) : msg.receiver.full_name === user.full_name ? (
                                            <MessageReceived message={msg} />
                                        ) : (
                                            <>
                                            </>
                                        )}
                                    </div>
                                ))}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Section */}
                            <div className='flex flex-row w-full justify-end'>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newMessage.trim()) {
                                            sendMessage();
                                        }
                                    }}
                                    className='mr-3 border-b border-b-red-800 
                                focus:shadow-md focus:border-b-2 focus:ring-0 px-3 py-1 bg-inherit w-[87%]'
                                />
                                <button disabled={!newMessage || !roomName}
                                    onClick={sendMessage}
                                    className='p-2 rounded-full bg-red-800 text-white disabled:bg-gray-200 disabled:text-red-800 transition duration-200'>
                                    <div>
                                        <IoMdSend className='text-xl' />
                                    </div>
                                </button>
                            </div>

                        </div>
                    </>
                ) : error ? (
                    <p>error: {error}</p>
                ) : loading ? (
                    <p>loading</p>
                ) : !user ? (
                    <p>Login to view messages</p>
                ) : (
                    <p>idk gang</p>
                )}

            </div>
            <Footer />
        </div >
    );
};

export default Chat;