import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import TopBar from "../components/TopBar";
import { IoMdSend } from "react-icons/io";
import axiosInstance from "../utils/axiosInstance";
import { v4 as uuidv4 } from "uuid";
import { formatTimestamp, timeSince } from "../utils/utils";
import useScreenSize from "../components/useScreenSize";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";
import ProfilePhoto from "../components/ProfilePhoto";
import { useWebSocket } from '../contexts/WebSocketContext';
import { useData } from "../contexts/DataContext";
import { Skeleton } from "@mui/material";
import HelmetComp from "../components/HelmetComp";

const convertUrlsToLinks = (text, isSentMessage = false) => {
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

  // Split the text into parts (URLs and non-URLs)
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Check if this part is a URL
    if (urlRegex.test(part)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`hover:underline ${isSentMessage
            ? 'text-white font-medium underline'
            : 'text-blue-500'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const MessageSent = ({ message, allTeams }) => {
  const senderTeam = allTeams.find(
    (team) => team.team_number === message.sender
  );
  return (
    <div className="text-right flex flex-col place-items-end px-[20px] py-[10px]">
      <p className="text-xs px-[2px]">
        {senderTeam ? senderTeam.full_name : "Unknown Team"}
      </p>
      <div className="bg-[#2A9EFC] rounded-3xl text-left w-fit shadow-md max-w-[50%]">
        <p className="text-white px-[20px] py-1 break-words whitespace-pre-line">
          {convertUrlsToLinks(message.message, true)}
        </p>
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
      <div className="bg-gray-200 rounded-3xl text-left w-fit shadow-md max-w-[50%]">
        <p className="text-gray-600 px-[20px] py-1 break-words whitespace-pre-line">
          {convertUrlsToLinks(message.message, false)}
        </p>
      </div>
      <p className="text-xs text-gray-500">
        {message.timestamp ? formatTimestamp(message.timestamp) : "..."}
      </p>
    </div>
  );
};

const UserInChat = ({ roomName, team, user, navigate, setSearchQuery }) => {
  return (
    <div
      onClick={() => {
        navigate(`/chat/${team.team_number}`);
        setSearchQuery("");
      }}
      className={`flex flex-row px-1 place-items-center ${roomName == team.team_number ? "bg-gray-100" : ""
        } hover:cursor-pointer hover:bg-gray-100 ${!team.is_read &&
        team.receiver == user.team_number &&
        "border-blue-400"
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
              {timeSince(team.timestamp) !== "NaN days" && timeSince(team.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Chat = () => {
  const navigate = useNavigate();

  const isLargerThanSmall = useScreenSize();

  const { roomName } = useParams(); // Get roomName from the URL
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // Ref to track the bottom of the messages container

  const { user, setUser, loadingUser, setLoadingUser, isAuthenticated, setIsAuthenticated } = useUser();

  const [receiverUser, setReceiverUser] = useState(null);

  const { users: allTeams, loadingStates } = useData();

  const [subsetTeams, setSubsetTeams] = useState([]);
  const [loadingSubsetTeams, setLoadingSubsetTeams] = useState(true);

  const [unmessagedTeams, setUnmessagedTeams] = useState([]);

  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const [isOnMessagePage, setIsOnMessagePage] = useState(false);

  const { registerHandler, sendMessage: sendWebSocketMessage } = useWebSocket();

  const [searchQuery, setSearchQuery] = useState("");

  const filterTeams = (teams) => {
    if (!searchQuery) return teams;

    const query = searchQuery.toLowerCase();
    return teams.filter(team =>
      team.team_number.toString().includes(query) ||
      team.team_name.toLowerCase().includes(query)
    );
  };

  useEffect(() => {
    if (roomName) {
      setIsOnMessagePage(true);
    } else {
      setIsOnMessagePage(false);
    }
  }, [roomName]);

  // Scroll handling for loading older messages
  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    let lastFetchTime = 0;
    const fetchCooldown = 1000; // 1 second cooldown between fetches

    const handleScroll = () => {
      if (loadingMoreMessages || !hasMoreMessages) return;

      const { scrollTop } = container;
      const scrollThreshold = 100;
      const { scrollHeight, clientHeight } = container;

      setIsAtBottom(Math.abs(scrollHeight - clientHeight - scrollTop) < 5);

      const now = Date.now();
      if (scrollTop < scrollThreshold && now - lastFetchTime > fetchCooldown) {
        lastFetchTime = now;
        fetchMessages(currentOffset);
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', throttledScroll);
    return () => container.removeEventListener('scroll', throttledScroll);
  }, [currentOffset, hasMoreMessages, loadingMoreMessages, roomName]);

  // Set Max Height for the Message container
  useEffect(() => {
    const messageMaxHeight = () => {
      if (loadingUser) return;
      const topBarHeight = document.querySelector(".top-bar").offsetHeight;
      const messagesSection = document.querySelector(".messages-section");

      const maxHeight = `calc(100vh - ${topBarHeight}px)`;
      messagesSection.style.maxHeight = maxHeight;
    };

    messageMaxHeight();
  }, [loadingUser]);

  // Fetch DMs only once at component mount
  useEffect(() => {
    const fetchInitialDMs = async () => {
      if (!user) return;

      try {
        const response = await axiosInstance.get("/dms/");
        const data = response.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setSubsetTeams(data);
      } catch (err) {
        console.error("Error fetching initial DMs:", err);
      } finally {
        setLoadingSubsetTeams(false);
      }
    };

    fetchInitialDMs();
  }, [user]); // Only run when user is loaded

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
  const markMessagesAsRead = async (teamNumber) => {
    try {
      const response = await axiosInstance.post("/messages/mark_as_read/", {
        team_number: teamNumber,
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Update the mark read effect
  useEffect(() => {
    if (!user || !roomName) return;

    const markRead = async () => {
      try {
        await markMessagesAsRead(roomName);

        // Update local state to mark messages as read
        setSubsetTeams(prevTeams => {
          return prevTeams.map(team => {
            if (team.team_number === Number(roomName)) {
              return { ...team, unread_count: 0, is_read: true };
            }
            return team;
          });
        });
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    markRead();
  }, [user, roomName]);

  // Add new effect to set receiver from allTeams
  useEffect(() => {
    if (!roomName || !allTeams.length) return;

    const receiver = allTeams.find(team => team.team_number === Number(roomName));
    if (receiver) {
      setReceiverUser(receiver);
    }
  }, [roomName, allTeams]);

  // Update the WebSocket message handler
  useEffect(() => {
    if (!roomName) return;

    const handleMessage = (data) => {
      if (data.type === 'chat_message') {
        const messageRoom = String(data.sender === user.team_number ? data.receiver : data.sender);
        const otherUser = data.sender === user.team_number ? data.receiver : data.sender;

        // Always update DM list for any message
        setSubsetTeams(prevTeams => {
          // Check if this is a new conversation
          const existingTeam = prevTeams.find(team => team.team_number === otherUser);
          const teamInfo = allTeams.find(team => team.team_number === otherUser);

          if (!existingTeam && teamInfo) {
            // This is a new conversation - add it to subsetTeams
            const newTeam = {
              ...teamInfo,
              last_message: data.message,
              most_recent_message: data.message,
              timestamp: data.timestamp,
              unread_count: data.sender !== user.team_number && messageRoom !== roomName ? 1 : 0,
              is_read: data.sender === user.team_number || messageRoom === roomName
            };

            // Add new conversation to the beginning of the list
            return [newTeam, ...prevTeams];
          }

          // Update existing conversations
          return prevTeams.map(team => {
            if (team.team_number === otherUser) {
              return {
                ...team,
                last_message: data.message,
                most_recent_message: data.message,
                timestamp: data.timestamp,
                unread_count: data.sender !== user.team_number && messageRoom !== roomName ?
                  (team.unread_count || 0) + 1 :
                  0,
                is_read: data.sender === user.team_number || messageRoom === roomName
              };
            }
            return team;
          }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });

        // Update messages if we're in the relevant room
        if (messageRoom === roomName) {
          setMessagesByRoom(prevMessages => {
            const updatedMessages = { ...prevMessages };
            const roomMessages = updatedMessages[roomName] || [];

            const isDuplicate = roomMessages.some(msg => msg.id === data.id);
            if (!isDuplicate) {
              updatedMessages[roomName] = [...roomMessages, data];
            }

            return updatedMessages;
          });

          // Mark messages as read since we're in the room
          markMessagesAsRead(roomName);
        }
      }
    };

    const cleanup = registerHandler(roomName, handleMessage);
    return cleanup;
  }, [roomName, user?.team_number, allTeams]);

  // Update send message function to avoid unnecessary sorting
  const sendMessage = async () => {
    if (!newMessage.trim() || !roomName) return;

    const newMessageObj = {
      type: 'chat_message',
      id: uuidv4(),
      message: newMessage,
      sender: user.team_number,
      receiver: receiverUser.team_number,
      timestamp: new Date().toISOString(),
    };

    // Add to end of messages since it's newest
    setMessagesByRoom(prev => ({
      ...prev,
      [roomName]: [...(prev[roomName] || []), newMessageObj]
    }));

    setNewMessage("");
    sendWebSocketMessage(newMessageObj);
  };

  // Keep only this optimized version that avoids unnecessary sorting
  const fetchMessages = async (offset = 0, limit = 25, initialFetch = false) => {
    if (!roomName || loadingMoreMessages || (!hasMoreMessages && !initialFetch)) return;

    setLoadingMoreMessages(true);
    const container = messagesContainerRef.current;
    const previousScrollHeight = container.scrollHeight;

    try {
      const response = await axiosInstance.get(`/message/${roomName}/`, {
        params: { limit, offset },
      });
      const messages = response.data;

      setHasMoreMessages(messages.length === limit);

      // Check for duplicates before updating state
      setMessagesByRoom(prev => {
        const currentMessages = prev[roomName] || [];
        const newMessages = messages.reverse().filter(newMsg =>
          !currentMessages.some(existingMsg => existingMsg.id === newMsg.id)
        );

        if (newMessages.length === 0) {
          // If all messages are duplicates, don't update state
          return prev;
        }

        return {
          ...prev,
          [roomName]: [...newMessages, ...currentMessages]
        };
      });

      setCurrentOffset(offset + limit);

      // Handle scrolling
      if (initialFetch) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      } else {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeight;
        });
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // Keep the reset and fetch effect
  useEffect(() => {
    const resetAndFetchMessages = async () => {
      if (!roomName || !user || !messagesContainerRef.current) return;

      // Reset states
      setHasMoreMessages(true);
      setCurrentOffset(0);
      setIsAtBottom(true); // Reset isAtBottom state

      // Clear messages for the new room
      setMessagesByRoom(prev => ({
        ...prev,
        [roomName]: []
      }));

      try {
        await fetchMessages(0, 25, true); // Pass initialFetch as true
      } catch (err) {
        console.error("Error fetching initial messages:", err);
      }
    };

    resetAndFetchMessages();
  }, [roomName, user]);

  // Keep autoscroll effect
  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messagesByRoom, roomName]);

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <HelmetComp title={`Messaging${roomName !== undefined ? ` - Team ${roomName}` : ""}`} />
      <div className="messages-section flex flex-grow justify-center flex-row bg-gray-100 relative">
        {!loadingUser && user ? (
          <>
            {/* Back Button */}
            <button className={`${(!isLargerThanSmall && isOnMessagePage) ? "absolute top-4 left-4" : "hidden"} hover:bg-gray-200 shadow-sm rounded-full p-[6px] transition duration-200`}
              onClick={() => {
                navigate("/chat");
                setIsOnMessagePage(!isOnMessagePage);
              }}>
              <FaArrowLeft className="text-2xl" />
            </button>

            {/* Left Nav Bar */}
            <div className={`${!isLargerThanSmall && isOnMessagePage ? "hidden" : "overflow-y-auto w-full sm:w-1/2 lg:w-1/3 bg-white"}`}>
              <h1 className="text-3xl text-center p-3">Chats</h1>

              {/* Add search bar */}
              <div className="px-3 mb-2">
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {!loadingStates.users && subsetTeams ? (
                <div className="flex flex-col">
                  <p className="mx-3 py-2 text-[20px] border-b border-gray-300">
                    Current Messages
                  </p>
                  {filterTeams(subsetTeams).map((team, index) => (
                    <div key={index}>
                      {team.team_number != user.team_number && (
                        <UserInChat
                          roomName={roomName}
                          team={team}
                          user={user}
                          navigate={navigate}
                          setSearchQuery={setSearchQuery}
                        />
                      )}
                    </div>
                  ))}
                  <p className="mx-3 py-2 text-[20px] border-t border-gray-300">
                    Other Teams
                  </p>
                  {filterTeams(unmessagedTeams).map((team, index) => (
                    <div key={index}>
                      {team.team_number != user.team_number && (
                        <UserInChat
                          roomName={roomName}
                          team={team}
                          user={user}
                          navigate={navigate}
                          setSearchQuery={setSearchQuery}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : loadingStates.users ? (
                <p>Loading Teams</p>
              ) : (
                <p>error loading teams</p>
              )}
            </div>

            {/* Right Panel with messages */}
            <div className={`${!isLargerThanSmall && !isOnMessagePage ? "hidden" : "flex"} w-full sm:w-1/2 lg:w-2/3 flex-col p-5`}>
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
                {!loadingStates.users && allTeams ? (
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
              <div className="flex flex-row w-full max-w-full justify-end">
                <input
                  type="text"
                  value={newMessage}
                  placeholder="Type a message..."
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newMessage.trim()) {
                      sendMessage();
                    }
                  }}
                  className="mr-3 border-2 border-gray-500 
                                focus:shadow-md focus:border-b-2 focus:ring-0 px-3 py-1 bg-inherit w-[87%] flex-shrink-0 rounded-md"
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
        ) : loadingUser ? (
          <>
            {/* Left Sidebar */}
            <div className="overflow-y-auto w-full sm:w-1/2 lg:w-1/3 bg-white">
              <div className="p-3">
                <Skeleton variant="text" width="40%" height={40} animation="wave" className="mx-auto mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton variant="circular" width={40} height={40} animation="wave" />
                      <div className="flex-grow">
                        <Skeleton variant="text" width="60%" height={24} animation="wave" />
                        <Skeleton variant="text" width="40%" height={20} animation="wave" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="hidden sm:flex flex-col flex-grow bg-white">
              {/* Chat Header */}
              <div className="p-4 border-b">
                <Skeleton variant="text" width="30%" height={32} animation="wave" />
              </div>

              {/* Messages Area */}
              <div className="flex-grow p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${i % 2 === 0 ? 'ml-12' : 'mr-12'} w-1/2`}>
                      <Skeleton variant="rounded" height={60} animation="wave" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <Skeleton variant="rounded" height={50} animation="wave" />
              </div>
            </div>
          </>
        ) : !user ? (
          <>
            <div className="rounded-lg p-8 max-w-md w-full text-center space-y-6">
              <div className="flex justify-center">
                <FaLock className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700">Login Required</h2>
              <p className="text-gray-500">Please sign in to view and send messages</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-150"
              >
                Login to Continue
              </button>
            </div>
          </>
        ) : (
          <p>___</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
