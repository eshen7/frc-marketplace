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

    // Use window.location to determine the WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = import.meta.env.PROD 
      ? `${protocol}//${host}` 
      : `${protocol}//${host}:8000`;

    console.log('Connecting to WebSocket URL:', `${wsUrl}/ws/user/${user.team_number}/`);
    
    const ws = new WebSocket(`${wsUrl}/ws/user/${user.team_number}/`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      // Try to reconnect after a delay
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          console.log('Attempting to reconnect...');
          socketRef.current = new WebSocket(`${wsUrl}/ws/user/${user.team_number}/`);
        }
      }, 5000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messageHandlersRef.current.forEach((handler) => {
        handler(data);
      });
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      // Try to reconnect after a delay
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          console.log('Attempting to reconnect...');
          socketRef.current = new WebSocket(`${wsUrl}/ws/user/${user.team_number}/`);
        }
      }, 5000);
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
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
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