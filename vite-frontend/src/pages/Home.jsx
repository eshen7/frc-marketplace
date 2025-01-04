import React, { useState, useEffect, useRef } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Map from "../components/Map";
import SuccessBanner from "../components/SuccessBanner";
import ItemCard from "../components/ItemCard";

import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { haversine, getDaysUntil } from "../utils/utils";
import ItemScrollBar from "../components/ItemScrollBar";
import { useUser } from "../contexts/UserContext";

const recentSales = [
  { id: 1, title: "NEO Motor", team: "Team 2468", price: 50, distance: 3 },
  { id: 2, title: "Falcon 500", team: "Team 1357", price: 75, distance: 7 },
  { id: 3, title: "Victor SPX", team: "Team 3690", price: 30, distance: 12 },
  { id: 4, title: "PDP", team: "Team 9876", price: 60, distance: 5 },
  { id: 5, title: "Spark MAX", team: "Team 3647", price: 45, distance: 9 },
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

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    setUser,
    loadingUser,
    setLoadingUser,
    isAuthenticated,
    setIsAuthenticated,
  } = useUser();

  const [showLoginSuccessBanner, setShowLoginSuccessBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [allTeams, setAllTeams] = useState([]);

  const [requests, setRequests] = useState([]);
  const [sales, setSales] = useState([]);

  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get("/requests/");
      const data = response.data;

      if (!data) {
        throw new Error("Error fetching Reqeusts");
      }

      setRequests(data);
      setLoadingRequests(false);
      console.log("Requests:", data);
    } catch (err) {
      console.error("Error fetching Requests:", err);
      setLoadingRequests(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axiosInstance.get("/sales/");
      const data = response.data;

      if (!data) {
        throw new Error("Error fetching Sales");
      }

      setSales(data);
      setLoadingSales(false);
      console.log("Sales:", data);
    } catch (err) {
      console.error("Error fetching Sales:", err);
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchSales();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get("/users/");
      let data = response.data;
      data = data.filter((user) => user.formatted_address != null);

      if (!data) {
        throw new Error("Error getting Teams");
      }

      setAllTeams(data);
    } catch (error) {
      console.error("Error fetching User Data:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

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
        <SuccessBanner message={bannerMessage} onClose={handleCloseBanner} />
      )}
      <TopBar />
      <div className="bg-gray-100">
        {/* Title Section */}
        <div className="flex flex-col place-items-center pt-[80px] mb-[80px] mx-[16px]">
          {/* Title */}
          <div className="text-5xl text-center text-black font-semibold text-shadow-md mb-10">
            <h1>Where Teamwork</h1>
            <h1 className="text-[#050A44]">Drives Innovation</h1>
          </div>
          {/* Description */}
          <div className="text-center border-b-white max-w-[600px]">
            <p className="text-sm">
              Millennium Market is an online marketplace designed specifically
              for high school robotics teams to buy, sell, and trade parts and
              components. Whether you're looking for motors, sensors, gears, or
              even custom-built parts, this platform connects teams across the
              region, making it easier to source specific materials and tools
              for your robotics projects. Users can list surplus components,
              negotiate prices, and offer bulk deals, fostering a collaborative
              ecosystem where teams help each other by sharing resources. It's a
              one-stop shop for teams to save on costs, access hard-to-find
              parts, and build stronger networks within the robotics community.
            </p>
          </div>
          {/* Buttons */}
          <div className="flex flex-row justify-center mt-5 max-w-screen border-b border-b-black pb-5">
            {/* Request */}
            <button
              className="py-3 px-5 bg-blue-800 text-white text-[14px] rounded-sm hover:bg-blue-900 mr-5"
              onClick={() => {
                navigate("/request");
              }}
            >
              Make a Request
            </button>
            {/* Sale */}
            <button
              className="py-3 px-5 border border-blue-800 text-blue-800 text-[14px] rounded-sm hover:bg-white"
              onClick={() => {
                navigate("/sale");
              }}
            >
              Post a Sale
            </button>
          </div>
        </div>
        <section className="mx-[30px] mb-[40px]">
          <div>
            <h2 className="text-2xl font-bold mb-[30px]">See Nearby Teams</h2>
            <Map zoom={10} locations={allTeams} />
          </div>
        </section>
        <section className="mb-12 mx-[30px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Part Requests Nearby</h2>
            <button
              onClick={() => navigate("/requests")}
              className="bg-blue-800 text-white py-3 px-5 rounded-[5px] hover:bg-blue-900 transition-translate duration-100"
            >
              See All Requests
            </button>
          </div>
          <ItemScrollBar
            key={requests[0]}
            items={requests}
            loadingItems={loadingRequests}
            user={user}
            loadingUser={loadingUser}
            type="request"
          />
        </section>
        <section className="pb-12 mx-[30px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Parts for Sale Nearby</h2>
            <button
              onClick={() => navigate("/sales")}
              className="bg-blue-800 text-white py-3 px-5 rounded-[5px] hover:bg-blue-900 transition-translate duration-100"
            >
              See All Parts for Sale
            </button>
          </div>
          <ItemScrollBar
            key={sales[0]}
            items={sales}
            loadingItems={loadingSales}
            user={user}
            loadingUser={loadingUser}
            type="sale"
          />
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
