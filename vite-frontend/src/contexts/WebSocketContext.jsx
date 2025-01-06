import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUser } from './UserContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const messageHandlersRef = useRef(new Map());

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.team_number) return;

    // Use the same base URL as your API
    const wsUrl = import.meta.env.PRODUCTION ? import.meta.env.PRODUCTION_URL?.replace('https', 'ws') : 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws/user/${user.team_number}/`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messageHandlersRef.current.forEach((handler) => {
        handler(data);
      });
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    socketRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.team_number]);

  // Register a message handler
  const registerHandler = (id, handler) => {
    messageHandlersRef.current.set(id, handler);
    return () => messageHandlersRef.current.delete(id);
  };

  // Send a message
  const sendMessage = (message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, registerHandler, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 