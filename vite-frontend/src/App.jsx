import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";

const App = () => {
  console.log("App component rendered");
  return (
    <>
      <Outlet />
    </>
  );
};

export default App;
