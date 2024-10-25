import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Request from './pages/Request';
import Fulfill from './pages/Fulfill';
import './App.css'
import TopBar from './components/TopBar.jsx'

const App = () => {
	console.log("App component rendered");
	return (
		<>
			<TopBar />
			<Outlet />
		</>
	)
}

export default App;

