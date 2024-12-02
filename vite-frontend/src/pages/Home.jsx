import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Map from "../components/Map";
import SuccessBanner from "../components/SuccessBanner";

import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axiosInstance';

const getDaysUntil = (dueDate) => {
	const now = new Date();
	const diffTime = dueDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
};

function haversine(lat1, lon1, lat2, lon2) {
	const R = 3958.8; // Radius of Earth in miles

	// Convert latitude and longitude from degrees to radians
	const toRadians = (degree) => (degree * Math.PI) / 180;
	lat1 = toRadians(lat1);
	lon1 = toRadians(lon1);
	lat2 = toRadians(lat2);
	lon2 = toRadians(lon2);

	// Differences in latitude and longitude
	const dlat = lat2 - lat1;
	const dlon = lon2 - lon1;

	// Haversine formula
	const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Distance in miles
}

const recentRequests = [
	{
		id: 1,
		title: "CIM Motor",
		team: "Team 1234",
		distance: 2,
		dueDate: new Date(2024, 9, 25),
	},
	{
		id: 2,
		title: "Pneumatic Cylinder",
		team: "Team 5678",
		distance: 5,
		dueDate: new Date(2024, 9, 28),
	},
	{
		id: 3,
		title: "Talon SRX",
		team: "Team 9101",
		distance: 10,
		dueDate: new Date(2024, 9, 27),
	},
	{
		id: 4,
		title: "Encoder",
		team: "Team 2468",
		distance: 15,
		dueDate: new Date(2024, 10, 5),
	},
	{
		id: 5,
		title: "Battery",
		team: "Team 1357",
		distance: 8,
		dueDate: new Date(2024, 10, 2),
	},
	{
		id: 6,
		title: "Wheels",
		team: "Team 3690",
		distance: 12,
		dueDate: new Date(2024, 10, 10),
	},
	{
		id: 7,
		title: "Gearbox",
		team: "Team 4812",
		distance: 18,
		dueDate: new Date(2024, 10, 15),
	},
	{
		id: 8,
		title: "Camera",
		team: "Team 7531",
		distance: 7,
		dueDate: new Date(2024, 10, 8),
	},
	{
		id: 9,
		title: "Servo Motor",
		team: "Team 9876",
		distance: 3,
		dueDate: new Date(2024, 9, 29),
	},
	{
		id: 10,
		title: "Limit Switch",
		team: "Team 2345",
		distance: 20,
		dueDate: new Date(2024, 10, 20),
	},
];

const recentSales = [
	{ id: 1, title: "NEO Motor", team: "Team 2468", price: 50, distance: 3 },
	{ id: 2, title: "Falcon 500", team: "Team 1357", price: 75, distance: 7 },
	{ id: 3, title: "Victor SPX", team: "Team 3690", price: 30, distance: 12 },
	{ id: 4, title: "PDP", team: "Team 9876", price: 60, distance: 5 },
	{ id: 5, title: "Spark MAX", team: "Team 1234", price: 45, distance: 9 },
	{
		id: 6,
		title: "Ultrasonic Sensor",
		team: "Team 5678",
		price: 25,
		distance: 14,
	},
	{
		id: 7,
		title: "Pneumatic Tubing",
		team: "Team 4321",
		price: 15,
		distance: 18,
	},
	{ id: 8, title: "Joystick", team: "Team 8765", price: 35, distance: 6 },
	{
		id: 9,
		title: "Voltage Regulator",
		team: "Team 2109",
		price: 20,
		distance: 11,
	},
	{
		id: 10,
		title: "Aluminum Extrusion",
		team: "Team 6543",
		price: 40,
		distance: 16,
	},
];

const renderRequest = (request, self_user) => {
	const daysUntil = getDaysUntil(new Date(request.needed_date));
	const isUrgent = daysUntil < 5 && daysUntil > 0;
	const isOverdue = daysUntil < 0;
	const isDueToday = daysUntil === 0;
	const absoluteDaysUntil = Math.abs(daysUntil);

	let distance_string = "Log in for distance";

	if (self_user && self_user.formatted_address.latitude && self_user.formatted_address.longitude) {
		const dist = haversine(
			request.user.formatted_address.latitude,
			request.user.formatted_address.longitude,
			self_user.formatted_address.latitude,
			self_user.formatted_address.longitude
		);

		distance_string = dist.toFixed(1) + " miles";
	}

	const renderDueDate = () => {
		return (
			<p
				className={`text-sm ${isOverdue || isDueToday
					? "text-red-600 font-bold"
					: isUrgent
						? "text-orange-600 font-bold"
						: "text-gray-500"
					}`}
			>
				{isOverdue ? (
					<>
						OVERDUE! ({absoluteDaysUntil}{" "}
						{absoluteDaysUntil === 1 ? "day" : "days"} ago)
					</>
				) : isDueToday ? (
					<>Need Today!</>
				) : (
					<>
						Need By: {new Date(request.needed_date).toLocaleDateString()} ({daysUntil}{" "}
						{daysUntil === 1 ? "day" : "days"})
					</>
				)}
			</p>
		);
	};

	return (
		<div
			key={request.id}
			className={`flex-none w-[256px] bg-white rounded-lg shadow-md p-6 whitespace-nowrap ${isUrgent
				? "border-2 border-orange-600"
				: isOverdue || isDueToday
					? "border-2 border-red-600"
					: ""
				}`}
		>
			<h3 className="text-xl font-semibold mb-2">{request.part_name}</h3>
			<p className="text-gray-600 mb-2">{request.user.team_number}</p>
			{renderDueDate()}
			<p className="text-sm text-gray-500">{distance_string != "0.0 miles" ? distance_string : "Your Listing"}</p>
			<button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
				Offer Part
			</button>
		</div>
	);
};

const renderSales = () => {
	return (
		<section className="mx-[30px]">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Recent Parts for Sale Nearby</h2>
				<a href="sales">
					<button className="bg-red-800 text-white py-3 px-5 rounded-[5px] hover:bg-red-900 transition-translate duration-100">
						See All Sales
					</button>
				</a>
			</div>
			<div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
				{recentSales.map((sale) => (
					<div
						key={sale.id}
						className="flex-none w-64 bg-white rounded-lg shadow-md p-6"
					>
						<h3 className="text-xl font-semibold mb-2">{sale.title}</h3>
						<p className="text-gray-600 mb-2">{sale.team}</p>
						<p className="text-green-600 font-bold mb-2">${sale.price}</p>
						<p className="text-sm text-gray-500">{sale.distance} miles away</p>
						<button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
							Buy Now
						</button>
					</div>
				))}
			</div>
		</section>
	);
};

const Home = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [showLoginSuccessBanner, setShowLoginSuccessBanner] = useState(false);
	const [bannerMessage, setBannerMessage] = useState("");
	const [allTeams, setAllTeams] = useState([]);
	const [requests, setRequests] = useState([]);
	const [user, setUser] = useState(null);
	const [loadingRequests, setLoadingRequests] = useState(true);
	const [loadingUser, setLoadingUser] = useState(true);

	const fetchUser = async () => {
		try {
			const response = await axiosInstance.get('/users/self/');
			console.log("response:", response)
			const data = response.data;
			console.log("data:", data)

			if (!data || !data.formatted_address) {
				throw new Error('Address or coordinates not found');
			}

			setUser(data);
			setLoadingUser(false);
		}
		catch (error) {
			console.error('Error fetching User Data:', error);
			setLoadingUser(false);
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	const fetchRequests = async () => {
		try {
			const response = await axiosInstance.get("/requests/");
			const data = response.data;

			if (!data) {
				throw new Error('Error fetching Reqeusts');
			}

			setRequests(data);
			setLoadingRequests(false);
			console.log("Requests:", data)
		} catch (err) {
			console.error("Error fetching Requests:", err);
			setLoadingRequests(false);
		}
	}

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchTeams = async () => {
		try {
			const response = await axiosInstance.get('/users/');
			console.log("response:", response)
			const data = response.data;
			console.log("data:", data)

			if (!data) {
				throw new Error('Error getting Teams');
			}

			setAllTeams(data);
			console.log(allTeams)
		}
		catch (error) {
			console.error('Error fetching User Data:', error);
		}
	};

	useEffect(() => {
		fetchTeams();
	}, []);

	useEffect(() => {
		console.log("Updated allTeams:", allTeams);
	}, [allTeams]); // Trigger this effect when allTeams changes

	useEffect(() => {
		if (location.state?.fromLogin) {
			setShowLoginSuccessBanner(true);
			setBannerMessage(location.state.message || "Login Successful!");
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location, navigate]);

	const handleCloseBanner = () => {
		setShowLoginSuccessBanner(false);
	};

	return (
		<>
			{showLoginSuccessBanner && (
				<SuccessBanner
					message={bannerMessage}
					onClose={handleCloseBanner}
				/>
			)}
			<TopBar />
			<div className="bg-gray-100">
				<h1 className="text-7xl text-center pt-[80px] mb-[80px] font-paytone text-[#AE0000] font-extrabold text-shadow-md">
					{" "}
					FRC MARKETPLACE
				</h1>
				<section className="mx-[30px] mb-[30px]">
					<div>
						<h2 className="text-2xl font-bold mb-[30px]">See Nearby Teams</h2>
						<Map
							zoom={10}
							locations={allTeams}
						/>
					</div>
				</section>
				<section className="mb-12 mx-[30px]">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-bold">Recent Part Requests Nearby</h2>
						<a href="requests">
							<button className="bg-red-800 text-white py-3 px-5 rounded-[5px] hover:bg-red-900 transition-translate duration-100">
								See All Requests
							</button>
						</a>
					</div>
					<div className="flex overflow-x-auto space-x-4 pb-4">
						{!loadingRequests && !loadingUser && user && requests ? (
							requests
								.slice(-10)
								.reverse()
								.map((request) => {
									return (
										<React.Fragment key={request.id}>
											{renderRequest(request, user)}
										</React.Fragment>
									);
								})
						) : (
							<p>hello</p>
						)
						}
					</div>
				</section>
				<>{renderSales()}</>
			</div>
			<Footer />
		</>
	);
};

export default Home;
