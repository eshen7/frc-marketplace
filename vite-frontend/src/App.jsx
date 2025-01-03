import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { UserProvider } from "./contexts/UserContext";
import { WebSocketProvider } from './contexts/WebSocketContext';

const App = () => {
  console.log("App component rendered");
  return (
    <>
      <UserProvider>
        <WebSocketProvider>
          <Outlet />
        </WebSocketProvider>
      </UserProvider>
    </>
  );
};

export default App;
