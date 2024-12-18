import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { IoMdSend } from "react-icons/io";
import axiosInstance from '../utils/axiosInstance';
import { v4 as uuidv4 } from 'uuid'; // Add this at the top (install `uuid` if necessary)
import { formatTimestamp } from '../utils/utils';

const MessageSent = ({ message, allTeams }) => {
    const senderTeam = allTeams.find(team => team.team_number === message.sender);
    return (
        <div className='text-right flex flex-col place-items-end px-[20px] py-[10px]'>
            <p className='text-xs px-[2px]'>{senderTeam ? senderTeam.full_name : 'Unknown Team'}</p>
            <div className='bg-red-800 rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words'>
                <p className='text-white px-[20px]'>{message.message}</p>
            </div>
            <p className='text-xs text-gray-500'>{message.timestamp ? formatTimestamp(message.timestamp) : "..."}</p>
        </div>
    );
};

const MessageReceived = ({ message, allTeams }) => {
    const senderTeam = allTeams.find(team => team.team_number === message.sender);
    return (
        <div className='text-left flex flex-col place-items-start px-[20px] py-[10px]'>
            <p className='text-xs px-[2px]'>{senderTeam ? senderTeam.full_name : 'Unknown Team'}</p>
            <div className='bg-gray-200 rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words'>
                <p className='text-red-800 px-[20px]'>{message.message}</p>
            </div>
            <p className='text-xs text-gray-500'>{message.timestamp ? formatTimestamp(message.timestamp) : "..."}</p>
        </div>
    );
};

const Chat = () => {
    const navigate = useNavigate();

    const { roomName } = useParams(); // Get roomName from the URL
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

    const [currentOffset, setCurrentOffset] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const messagesContainerRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const handleScroll = () => {
        if (!hasMoreMessages || loadingMoreMessages) return;

        const container = messagesContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;

            // Check if user is at the bottom
            setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 5);

            // Fetch older messages if near the top
            if (scrollTop < 50) {
                fetchMessages(currentOffset); // Fetch older messages
            }
        }
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [hasMoreMessages, loadingMoreMessages, currentOffset, roomName]);

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

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axiosInstance.get('/users/');
                const data = response.data;

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

    const retryFetchFullMessage = async (messageId, maxRetries = 5, delay = 500) => {
        let retries = 0;

        while (retries < maxRetries) {
            try {
                const response = await axiosInstance.get(`/message/id/${messageId}/`);
                const fullMessage = response.data;

                // Update the state with the fetched message
                setMessagesByRoom((prevMessages) => {
                    const updatedMessages = { ...prevMessages };

                    // Find the messages array for the current room
                    const roomMessages = updatedMessages[roomName] || [];

                    // Find the index of the message that matches the ID
                    const messageIndex = roomMessages.findIndex((msg) => msg.id === messageId);

                    if (messageIndex !== -1) {
                        // Replace the message with the full message (including timestamp)
                        roomMessages[messageIndex] = fullMessage;
                    } else {
                        // Add the message if it's not already in the list
                        roomMessages.push(fullMessage);
                    }

                    // Update the messages for the current room
                    updatedMessages[roomName] = roomMessages;

                    return updatedMessages;
                });

                // If the fetch is successful, exit the retry loop
                return;
            } catch (err) {
                retries++;
                console.warn(`Retrying fetch for message ID ${messageId}... Attempt ${retries}`);
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        console.error(`Failed to fetch message ID ${messageId} after ${maxRetries} retries`);
    };

    useEffect(() => {
        const connectWebSocket = () => {
            if (!user || !roomName) return; // Ensure `user` and `roomName` are available

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

            socketRef.current.onmessage = async (event) => {
                console.log("Received message:", event.data);
                const data = JSON.parse(event.data);

                setMessagesByRoom((prevMessages) => {
                    const updatedMessages = { ...prevMessages };

                    if (!updatedMessages[roomName]) {
                        updatedMessages[roomName] = [];
                    }

                    const messageIndex = updatedMessages[roomName].findIndex(
                        (msg) => msg.id === data.id
                    );

                    if (messageIndex !== -1) {
                        // Message already exists - Check if timestamp is missing
                        if (!updatedMessages[roomName][messageIndex].timestamp) {
                            // Retry fetching full message if timestamp is missing
                            retryFetchFullMessage(data.id);
                        }
                    } else {
                        // Add new message
                        updatedMessages[roomName].push(data);
                        // If timestamp is missing, retry fetching full message
                        if (!data.timestamp) {
                            retryFetchFullMessage(data.id);
                        }
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

    // Autoscroll
    useEffect(() => {
        if (messagesEndRef.current && isAtBottom) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messagesByRoom, roomName])

    const fetchMessages = async (offset = 0, limit = 25) => {
        if (!roomName || loadingMoreMessages || !hasMoreMessages) return;

        setLoadingMoreMessages(true);

        try {
            const container = messagesContainerRef.current;

            // Save current scroll position and height
            const previousScrollHeight = container.scrollHeight;
            const previousScrollTop = container.scrollTop;


            const response = await axiosInstance.get(`/message/${roomName}/`, {
                params: { limit, offset },
            });
            const data = response.data;

            // Check if there are more messages to load
            if (data.length < limit) {
                setHasMoreMessages(false);
            }

            setMessagesByRoom((prevMessages) => {
                const updatedMessages = { ...prevMessages };
                const roomMessages = updatedMessages[roomName] || [];

                // Combine new and existing messages
                const combinedMessages = [...data.reverse(), ...roomMessages];

                // Sort messages by timestamp
                combinedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                // Update the state with sorted messages
                updatedMessages[roomName] = combinedMessages;

                return updatedMessages;
            });

            setCurrentOffset((prevOffset) => prevOffset + limit);

            setTimeout(() => {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
            }, 0); // Use a timeout to ensure DOM updates are applied before calculating the new scroll    
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoadingMoreMessages(false);
        }
    };

    // Fetch Messages
    // useEffect(() => {
    //     const fetchMessages = async () => {
    //         if (!roomName || !user) return;

    //         try {
    //             const response = await axiosInstance.get(`/message/${roomName}/`);
    //             const data = response.data;
    //             console.log(data);

    //             setMessagesByRoom((prevMessages) => ({
    //                 ...prevMessages,
    //                 [roomName]: data,
    //             }));
    //         } catch (err) {
    //             console.error("Error fetching messages:", err);
    //         }
    //     };

    //     fetchMessages();
    // }, [roomName, user]);

    useEffect(() => {
        const fetchInitialMessages = async () => {
            if (!roomName || !user) return;

            try {
                await fetchMessages(0); // Fetch only the most recent 25 messages
            } catch (err) {
                console.error("Error fetching initial messages:", err);
            }
        };

        fetchInitialMessages();
    }, [roomName, user]);

    const sendMessage = async () => {
        if (socketRef.current) {
            const newMessageObj = {
                id: uuidv4(),
                message: newMessage,
                sender: user.team_number,
                receiver: receiverUser.team_number, // Replace with actual receiver ID
            };

            // Send the message via websocket
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

            try {
                const response = await axiosInstance.post('/message/', newMessageObj);

                if (response.status === 200 && response.data.detail === "Message already exists") {
                    console.log("Message already exists in the database");
                } else if (response.status === 201) {
                    console.log("Message saved successfully");
                }

                const singleMessage = await axiosInstance.get(`/message/id/${newMessageObj.id}/`);
                setMessagesByRoom((prevMessages) => {
                    const updatedMessages = { ...prevMessages };

                    // Find the messages array for the current room
                    const roomMessages = updatedMessages[roomName] || [];

                    // Find the index of the message that matches the ID
                    const messageIndex = roomMessages.findIndex((msg) => msg.id === newMessageObj.id);

                    // If the message is found, replace it with the updated singleMessage
                    if (messageIndex !== -1) {
                        roomMessages[messageIndex] = singleMessage.data;
                    } else {
                        // If the message doesn't exist (new message), push it
                        roomMessages.push(singleMessage.data);
                    }


                    // Update the messages for the current room
                    updatedMessages[roomName] = roomMessages;

                    return updatedMessages;
                });
            } catch (err) {
                console.error("Error saving message to database:", err);
            }

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
                            <div className='overflow-y-auto flex-grow'
                                ref={messagesContainerRef}>
                                {!loadingTeams && allTeams ? (
                                    <>
                                        {(messagesByRoom[roomName] || []).map((msg, index) => (
                                            <div key={index}>
                                                {msg.sender === user.team_number ? (
                                                    <MessageSent message={msg} allTeams={allTeams} />
                                                ) : msg.receiver === user.team_number ? (
                                                    <MessageReceived message={msg} allTeams={allTeams} />
                                                ) : (
                                                    <>
                                                        <p>Loading...</p>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <p>Loading Messages</p>
                                    </>
                                )}

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