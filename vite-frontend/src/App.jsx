import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { GlobalSocketProvider } from "./contexts/GlobalSocketContext";
import { UserProvider } from "./contexts/UserContext";

const App = () => {

  console.log("App component rendered");
  return (
    <>
      <UserProvider>
        <GlobalSocketProvider>
          <Outlet />
        </GlobalSocketProvider>
      </UserProvider>
    </>
  );
};

export default App;
