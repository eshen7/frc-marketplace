import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { UserProvider } from "./contexts/UserContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { DataProvider } from "./contexts/DataContext";
import DefaultMeta from "./components/DefaultMeta";
import ScrollToTop from "./components/ScrollToTop";
import { CompetitionsProvider } from './contexts/CompetitionsContext';

const App = () => {
  console.log("App component rendered");
  return (
    <UserProvider>
      <DataProvider>
        <WebSocketProvider>
          <CompetitionsProvider>
            <DefaultMeta />
            <ScrollToTop /> {/* Scroll restoration */}
            <Outlet />
          </CompetitionsProvider>
        </WebSocketProvider>
      </DataProvider>
    </UserProvider>
  );
};

export default App;
