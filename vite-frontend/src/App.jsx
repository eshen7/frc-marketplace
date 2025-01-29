import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { UserProvider } from "./contexts/UserContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { DataProvider } from "./contexts/DataContext";
import DefaultMeta from "./components/DefaultMeta";
import ScrollToTop from "./components/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";


const App = () => {
  console.log("App component rendered");
  return (
    <HelmetProvider>
      <UserProvider>
        <DataProvider>
          <WebSocketProvider>
            <DefaultMeta />
            <ScrollToTop /> {/* Scroll restoration */}
            <Outlet />
          </WebSocketProvider>
        </DataProvider>
      </UserProvider>
    </HelmetProvider>
  );
};

export default App;
