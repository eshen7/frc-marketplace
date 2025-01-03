import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { IoMdSend } from "react-icons/io";
import axiosInstance from "../utils/axiosInstance";
import { v4 as uuidv4 } from "uuid";
import { formatTimestamp, timeSince } from "../utils/utils";
import { GlobalSocketContext } from "../contexts/GlobalSocketContext";
import useScreenSize from "../components/useScreenSize";
import { FaArrowLeft } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";
import ProfilePhoto from "../components/ProfilePhoto";

const MessageSent = ({ message, allTeams }) => {
  const senderTeam = allTeams.find(
    (team) => team.team_number === message.sender
  );
  return (
    <div className="text-right flex flex-col place-items-end px-[20px] py-[10px]">
      <p className="text-xs px-[2px]">
        {senderTeam ? senderTeam.full_name : "Unknown Team"}
      </p>
      <div className="bg-[#2A9EFC] rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words">
        <p className="text-white px-[20px]">{message.message}</p>
      </div>
      <p className="text-xs text-gray-500">
        {message.timestamp ? formatTimestamp(message.timestamp) : "..."}
      </p>
    </div>
  );
};

const MessageReceived = ({ message, allTeams }) => {
  const senderTeam = allTeams.find(
    (team) => team.team_number === message.sender
  );
  return (
    <div className="text-left flex flex-col place-items-start px-[20px] py-[10px]">
      <p className="text-xs px-[2px]">
        {senderTeam ? senderTeam.full_name : "Unknown Team"}
      </p>
      <div className="bg-gray-200 rounded-3xl text-left w-fit shadow-md max-w-[50%] overflow-hidden break-words">
        <p className="text-gray-600 px-[20px]">{message.message}</p>
      </div>
      <p className="text-xs text-gray-500">
        {message.timestamp ? formatTimestamp(message.timestamp) : "..."}
      </p>
    </div>
  );
};

const Chat = () => {
  const navigate = useNavigate();

  const isLargerThanSmall = useScreenSize();

  const { roomName } = useParams(); // Get roomName from the URL
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref to track the bottom of the messages container

  const { socket: globalSocket, isConnected } = useContext(GlobalSocketContext);

  const { user, setUser, loadingUser, setLoadingUser, isAuthenticated, setIsAuthenticated } = useUser();

  const [receiverUser, setReceiverUser] = useState(null);

  const [allTeams, setAllTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [subsetTeams, setSubsetTeams] = useState([]);
  const [loadingSubsetTeams, setLoadingSubsetTeams] = useState(true);

  const [messagedTeams, setMessagedTeams] = useState([]);
  const [unmessagedTeams, setUnmessagedTeams] = useState([]);

  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const [isOnMessagePage, setIsOnMessagePage] = useState(false);

  useEffect(() => {
    if (roomName) {
      setIsOnMessagePage(true);
    } else {
      setIsOnMessagePage(false);
    }
  }, [roomName]);

  // Auto Fetching by Scroll
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
  }, [hasMoreMessages, loadingMoreMessages, currentOffset, roomName, messagesContainerRef]);

  // Set Max Height for the Message container
  useEffect(() => {
    const messageMaxHeight = () => {
      if (loadingUser) return;
      const topBarHeight = document.querySelector(".top-bar").offsetHeight;
      const footerHeight = document.querySelector(".footer").offsetHeight;
      const messagesSection = document.querySelector(".messages-section");

      const maxHeight = `calc(100vh - ${topBarHeight}px - ${footerHeight}px)`;
      messagesSection.style.maxHeight = maxHeight;
    };

    messageMaxHeight();
  }, [loadingUser]);

  // Fetch List of current users you are messaging with
  const fetchList = async () => {
    if (user) {
      try {
        const response = await axiosInstance.get("/dms/");
        let data = response.data;

        data = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setSubsetTeams(data);
      } catch (err) {
        console.error("Error fetching list of messages:", err);
      } finally {
        setLoadingSubsetTeams(false);
      }
    }
  };
  useEffect(() => {
    fetchList();
  }, [user, roomName]);

  useEffect(() => {
    if (!globalSocket) return;

    const handleGlobalMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        // Optionally filter if it's relevant to me:
        // if (data.receiver_team === user.team_number || data.sender_team === user.team_number) {
        //   fetchList();
        // }

        // Or just always refetch
        fetchList();
      }
    };

    globalSocket.addEventListener("message", handleGlobalMessage);

    console.log("Attached listener to globalSocket");

    return () => {
      // Cleanup the event listener when we leave the chat page
      globalSocket.removeEventListener("message", handleGlobalMessage);
      console.log("Detached listener from globalSocket");
    };
  }, [globalSocket]);

  // Set complement of users currently messaging with - rest of users
  useEffect(() => {
    if (allTeams.length) {
      const messagedTeamNumbers = subsetTeams.map((team) => team.team_number);

      const unmessaged = allTeams.filter(
        (team) => !messagedTeamNumbers.includes(team.team_number)
      )

      setUnmessagedTeams(unmessaged);
    }
  }, [allTeams, subsetTeams]);

  // Mark Read Messages
  useEffect(() => {
    if (!user || !roomName) return;

    // Mark messages as read:
    markMessagesAsRead(roomName);
    fetchList();
  }, [user, roomName]);
  const markMessagesAsRead = async (teamNumber) => {
    try {
      const response = await axiosInstance.post("/messages/mark_as_read/", {
        team_number: teamNumber,
      });
      console.log(response.data); // "Messages marked as read."
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Fetch All Teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get("/users/");
        const data = response.data;

        if (!data) {
          throw new Error("Error getting Teams");
        }

        setAllTeams(data);
        // console.log(allTeams)
        setLoadingTeams(false);
      } catch (error) {
        console.error("Error fetching User Data:", error);
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // Fetch user data of the receiver user
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
  }, [roomName]);

  // Fetch Full Message retry for updated timestamp stuff
  const retryFetchFullMessage = async (
    messageId,
    maxRetries = 5,
    delay = 500
  ) => {
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
          const messageIndex = roomMessages.findIndex(
            (msg) => msg.id === messageId
          );

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
        console.warn(
          `Retrying fetch for message ID ${messageId}... Attempt ${retries}`
        );
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    console.error(
      `Failed to fetch message ID ${messageId} after ${maxRetries} retries`
    );
  };

  // Connect web socket, set websocket settings
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
      socketRef.current = new WebSocket(
        `ws://localhost:8000/ws/chat/${universalWS}/`
      );

      socketRef.current.onopen = () => console.log("WebSocket opened");

      socketRef.current.onmessage = async (event) => {
        fetchList();
        console.log("Received message:", event.data);
        const data = JSON.parse(event.data);

        markMessagesAsRead(roomName);

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
      socketRef.current.onerror = (err) =>
        console.error("WebSocket error", err);
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [roomName, user]); // Re-run effect when roomName or user changes

  // Autoscroll to bottom of messages at beginning
  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messagesByRoom, roomName]);

  // Fetch messages incrementally function
  const fetchMessages = async (
    offset = 0,
    limit = 25,
    initialFetch = false
  ) => {
    if (!roomName || loadingMoreMessages || (!hasMoreMessages && !initialFetch))
      return;

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
        combinedMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Update the state with sorted messages
        updatedMessages[roomName] = combinedMessages;

        return updatedMessages;
      });

      setCurrentOffset((prevOffset) => prevOffset + limit);

      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop =
          newScrollHeight - previousScrollHeight + previousScrollTop;
      }, 0); // Use a timeout to ensure DOM updates are applied before calculating the new scroll
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // Reset messages & fetch
  useEffect(() => {
    const resetAndFetchMessages = async () => {
      if (!messagesContainerRef.current) return;
      // Reset states
      setHasMoreMessages(true);
      setCurrentOffset(0);

      // Clear messages for the new room
      setMessagesByRoom((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        updatedMessages[roomName] = [];
        return updatedMessages;
      });

      // Wait for the reset to complete before fetching
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Fetch initial messages
      if (roomName && user) {
        try {
          await fetchMessages(0, 25, true); // Pass the initial state of `hasMoreMessages`
        } catch (err) {
          console.error("Error fetching initial messages:", err);
        }
      }
    };

    const interval = setInterval(() => {
      if (messagesContainerRef.current) {
        clearInterval(interval);
        resetAndFetchMessages();
      }
    }, 50); // Check every 50ms
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [roomName, user, messagesContainerRef]);

  // Send a message function
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

        const isDuplicate = updatedMessages[roomName].some(
          (msg) => msg.id === newMessageObj.id
        );
        if (!isDuplicate) {
          updatedMessages[roomName].push(newMessageObj);
        }
        return updatedMessages;
      });

      try {
        const response = await axiosInstance.post("/message/", newMessageObj);

        if (
          response.status === 200 &&
          response.data.detail === "Message already exists"
        ) {
          console.log("Message already exists in the database");
        } else if (response.status === 201) {
          console.log("Message saved successfully");
        }

        const singleMessage = await axiosInstance.get(
          `/message/id/${newMessageObj.id}/`
        );
        setMessagesByRoom((prevMessages) => {
          const updatedMessages = { ...prevMessages };

          // Find the messages array for the current room
          const roomMessages = updatedMessages[roomName] || [];

          // Find the index of the message that matches the ID
          const messageIndex = roomMessages.findIndex(
            (msg) => msg.id === newMessageObj.id
          );

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

      setNewMessage("");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="messages-section p-5 flex flex-grow flex-row bg-gray-100 relative">
        {!loadingUser && user ? (
          <>
            {!isLargerThanSmall && isOnMessagePage && (
              <>
                {/* Back Button */}
                <button className="absolute hover:bg-gray-200 shadow-sm rounded-full p-[6px] transition duration-200"
                  onClick={() => {
                    navigate("/chat");
                    setIsOnMessagePage(!isOnMessagePage);
                  }}>
                  <FaArrowLeft className="text-2xl" />
                </button>
              </>
            )}

            {((!isLargerThanSmall && !isOnMessagePage) || isLargerThanSmall) && (
              <>
                {/* Left Nav Bar */}
                <div className="w-full sm:w-1/2 lg:w-1/3 bg-white rounded-3xl shadow-md">
                  <h1 className="text-3xl text-center p-3">Chats</h1>
                  {!loadingTeams && subsetTeams ? (
                    <div className="flex flex-col overflow-y-auto">
                      <p className="mx-3 py-2 text-[20px] border-b border-gray-300">
                        Current Messages
                      </p>
                      {subsetTeams.map((team, index) => (
                        <div key={index}>
                          {team.team_number != user.team_number && (
                            <div
                              onClick={() => {
                                navigate(`/chat/${team.team_number}`);
                                fetchList();
                              }}
                              className={`flex flex-row px-1 place-items-center ${roomName == team.team_number ? "bg-gray-100" : ""
                                } hover:cursor-pointer hover:bg-gray-100 ${!team.is_read &&
                                team.receiver == user.team_number &&
                                "border-blue-300"
                                } border-2 border-white transition duration-200 my-2 mx-3 rounded-xl`}
                            >
                              <div className="flex w-full items-center">
                                {/* Image container with a fixed or min width */}
                                <div className="flex-shrink-0 p-1 my-1 bg-gray-300 rounded-full">
                                  <ProfilePhoto
                                    src={team.profile_photo}
                                    teamNumber={team.team_number}
                                    className="h-[40px] w-[40px] rounded-full"
                                    alt={`${team.team_number} logo`}
                                  />
                                </div>

                                {/* Text container that fills the remaining space */}
                                <div className="flex flex-col flex-grow overflow-hidden px-2">
                                  <div className="">
                                    <p className="truncate">
                                      {team.team_number} | {team.team_name}
                                    </p>
                                  </div>
                                  <div className="flex justify-between items-center w-full overflow-hidden">
                                    {/* Truncate the message if it’s too long */}
                                    <p className="truncate text-gray-400 text-sm">
                                      {team.most_recent_message}
                                    </p>
                                    <p className="ml-2 whitespace-nowrap text-[12px]">
                                      {timeSince(team.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <p className="mx-3 py-2 text-[20px] border-t border-gray-300">
                        Other Teams
                      </p>
                      {unmessagedTeams.map((team, index) => (
                        <div key={index}>
                          {team.team_number != user.team_number && (
                            <div
                              onClick={() => {
                                navigate(`/chat/${team.team_number}`);
                              }}
                              className={`flex flex-row place-items-center ${roomName == team.team_number ? "bg-gray-100" : ""
                                } hover:cursor-pointer hover:bg-gray-100 transition duration-200 my-2 mx-3 rounded-xl`}
                            >
                              <div className="rounded-lg p-1 bg-gray-300 my-1 ml-2">
                                <ProfilePhoto
                                  src={team.profile_photo}
                                  teamNumber={team.team_number}
                                  className="h-[40px] min-w-[40px] rounded-full"
                                  alt={"Team Logo"}
                                />
                              </div>
                              <div className="flex flex-col w-full px-2 py-2">
                                <div className="truncate">
                                  <p className="">{team.team_name}</p>
                                </div>
                                <div className="flex flex-row justify-between">
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
              </>
            )}
            {((!isLargerThanSmall && isOnMessagePage) || isLargerThanSmall) && (
              <>
                {/* Right Panel with messages */}
                <div className="w-full flex flex-col">
                  <div>
                    <h1 className="text-3xl text-center">
                      {roomName ? roomName : "Select a user to chat with!"}
                    </h1>
                  </div>
                  {/* Messages Section */}
                  <div
                    className="overflow-y-auto flex-grow"
                    ref={messagesContainerRef}
                  >
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
                  <div className="flex flex-row w-full justify-end">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMessage.trim()) {
                          sendMessage();
                        }
                      }}
                      className="mr-3 border-b border-b-[#2A9EFC] 
                                focus:shadow-md focus:border-b-2 focus:ring-0 px-3 py-1 bg-inherit w-[87%]"
                    />
                    <button
                      disabled={!newMessage || !roomName}
                      onClick={sendMessage}
                      className="p-2 rounded-full bg-[#2A9EFC] text-white disabled:bg-gray-200 disabled:text-[#2A9EFC] transition duration-200"
                    >
                      <div>
                        <IoMdSend className="text-xl" />
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : loadingUser ? (
          <p>loading</p>
        ) : !user ? (
          <p>Login to view messages</p>
        ) : (
          <p>___</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Chat;
