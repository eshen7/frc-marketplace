import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { IoMdSend } from "react-icons/io";
import axiosInstance from '../utils/axiosInstance';

const MessageSent = ({ message }) => {
    return (
        <div className='text-right flex flex-col place-items-end px-[20px] py-[10px]'>
            <p className='text-xs px-[12px]'>{message.sender}</p>
            <div className='bg-red-800 rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words'>
                <p className='text-white px-[20px]'>{message.message}</p>
            </div>
        </div>
    );
};

const MessageReceived = ({ message }) => {
    return (
        <div className='text-left flex flex-col place-items-start px-[20px] py-[10px]'>
            <p className='text-xs px-[12px]'>{message.sender}</p>
            <div className='bg-gray-200 rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words'>
                <p className='text-red-800 px-[20px]'>{message.message}</p>
            </div>
        </div>
    );
};

const Chat = () => {
    const { roomName } = useParams(); // Get roomName from the URL
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null); // Ref to track the bottom of the messages container

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            }
        };

        checkUserAndFetchData();
    }, []);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);

            socketRef.current.onopen = () => console.log("WebSocket opened");
            socketRef.current.onclose = (e) => console.log("WebSocket closed", e);
            socketRef.current.onerror = (err) => console.error("WebSocket error", err);
        }

        socketRef.current.onmessage = (event) => {
            console.log('Received message:', event.data);
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, { sender: data.sender, receiver: data.receiver, message: data.message }]);
        };

        window.addEventListener("beforeunload", () => {
            // Cleanly close WebSocket before page reload
            socketRef.current.close(1000, "Page is unloading");
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [roomName]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages])

    const sendMessage = () => {
        if (socketRef.current) {
            socketRef.current.send(JSON.stringify({
                message: newMessage,
                sender_id: user.full_name,
                receiver_id: 2, // Replace with actual receiver ID
            }));
            setNewMessage('');
        }
    };

    return (
        <div className='flex flex-col h-screen max-h-screen'>
            <TopBar />
            <div className='p-5 flex-grow flex flex-row bg-gray-100'>
                {!loading && user ? (
                    <>
                        {/* Left Nav Bar */}
                        <div className='w-1/3 bg-white rounded-3xl shadow-md'>
                            <h1 className='text-3xl text-center p-3'>Open Chats</h1>
                        </div>

                        {/* Right Panel with messages */}
                        <div className='w-2/3 flex flex-col flex-grow'>
                            <div>
                                <h1 className='text-3xl text-center'>
                                    { }
                                </h1>
                            </div>
                            {/* Messages Section */}
                            <div className='overflow-y-auto flex-grow'>
                                {messages.map((msg, index) => (
                                    <>
                                        {msg.sender === user.full_name ? (
                                            <MessageSent key={index} message={msg} />
                                        ) : (
                                            <MessageReceived key={index} message={msg} />
                                        )}
                                    </>
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
                                <button disabled={!newMessage}
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
                ) : !user && loading ? (
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