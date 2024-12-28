import React, { createContext, useRef, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export const GlobalSocketContext = createContext(null);

/**
 * Provide a single global WebSocket for the entire app.
 */
export const GlobalSocketProvider = ({ children, user }) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const [globalSocket, setGlobalSocket] = useState(null);

    useEffect(() => {
        // Only open the global socket if the user is logged in
        if (!user) {
            // If user logs out, close the socket if open
            if (globalSocket) {
                globalSocket.close();
                setGlobalSocket(null);
            }
            return;
        }

        // If we already have an open socket, don't create a new one
        if (globalSocket) return;

        // Decide your WebSocket URL (dev vs production)
        // or use window.location.host logic
        const wsUrl = `ws://localhost:8000/ws/chat/all-messages/`;

        const ws = new WebSocket(wsUrl);
        setGlobalSocket(ws);

        ws.onopen = () => {
            console.log("Global socket connected");
            setIsConnected(true);
        };

        ws.onerror = (err) => {
            console.error("Global socket error:", err);
        };

        ws.onclose = (e) => {
            console.log("Global socket closed:", e);
            setIsConnected(false);
            setGlobalSocket(null);
        };

        // We don't set onmessage here if we only want to handle messages in the chat page.
        // We could set it here if we want a global approach. We'll do a minimal example for now.

        return () => {
            // Cleanup: if user changes or context unmounts, close the socket if open
            if (globalSocket) {
                globalSocket.close();
                setGlobalSocket(null);
            }
        };
    }, [user]);

    return (
        <GlobalSocketContext.Provider
            value={{
                socket: globalSocket,
                isConnected,
            }}
        >
            {children}
        </GlobalSocketContext.Provider>
    );
};