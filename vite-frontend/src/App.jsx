import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import { GlobalSocketProvider } from "./contexts/GlobalSocketContext";
import axiosInstance from "./utils/axiosInstance";

const App = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoadingUser(false);
      return;
    }
    // Attempt to fetch the current user
    axiosInstance
      .get("/users/self/")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, []);
  console.log("App component rendered");
  return (
    <>
      <GlobalSocketProvider user={user}>
        <Outlet />
      </GlobalSocketProvider>
    </>
  );
};

export default App;
