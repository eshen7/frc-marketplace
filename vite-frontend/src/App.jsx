import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Request from './pages/Request';
import Fulfill from './pages/Fulfill';
import './App.css'

const App = () => {
	console.log("App component rendered");
	return (
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/login" element={<Login />} />
					<Route path="/request" element={<Request />} />
					<Route path="/fulfill" element={<Fulfill />} />
					<Route path="*" element={<p>Page not found</p>} />
				</Routes>
	);
};

export default App;

