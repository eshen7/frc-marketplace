import React, { useState, useEffect, useRef } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Map from "../components/Map";
import SuccessBanner from "../components/SuccessBanner";
import ItemCard from "../components/ItemCard";

import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { haversine, getDaysUntil } from "../utils/utils";

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

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginSuccessBanner, setShowLoginSuccessBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [allTeams, setAllTeams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sales, setSales] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const saleScrollContainerRef = useRef(null);
  const requestScrollContainerRef = useRef(null);

  const scrollLeft = (containerRef) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -272, // Adjust the scroll distance as needed
        behavior: "smooth",
      });
    }
  };

  const scrollRight = (containerRef) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 272, // Adjust the scroll distance as needed
        behavior: "smooth",
      });
    }
  };
  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const response = await axiosInstance.get("/users/self/");
      const data = response.data;

      if (!data || !data.formatted_address) {
        throw new Error("Address or coordinates not found");
      }

      setUser(data);
      setLoadingUser(false);
    } catch (error) {
      console.error("Error fetching User Data:", error);
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
      console.log(allTeams);
    } catch (error) {
      console.error("Error fetching User Data:", error);
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
              RoboExchange is an online marketplace designed specifically for high school robotics teams to buy,
              sell, and trade parts and components. Whether you're looking for motors, sensors, gears, or even
              custom-built parts, this platform connects teams across the region, making it easier to source specific
              materials and tools for your robotics projects. Users can list surplus components, negotiate prices, and
              offer bulk deals, fostering a collaborative ecosystem where teams help each other by sharing resources.
              It's a one-stop shop for teams to save on costs, access hard-to-find parts, and build stronger networks
              within the robotics community.
            </p>
          </div>
          {/* Buttons */}
          <div className="flex flex-row justify-center mt-5 max-w-screen border-b border-b-black pb-5">
            {/* Request */}
            <button className="py-3 px-5 bg-blue-800 text-white text-[14px] rounded-sm hover:bg-blue-900 mr-5"
            onClick={() => {
              window.location.href = `/request`
            }}>
              Make a Request
            </button>
            {/* Sale */}
            <button className="py-3 px-5 border border-blue-800 text-blue-800 text-[14px] rounded-sm hover:bg-white"
            onClick={() => {
              window.location.href = `/sale`
            }}>
              Post a Sale
            </button>
          </div>
        </div>
        <section className="mx-[30px] mb-[30px]">
          <div>
            <h2 className="text-2xl font-bold mb-[30px]">See Nearby Teams</h2>
            <Map zoom={10} locations={allTeams} />
          </div>
        </section>
        <section className="mb-12 mx-[30px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Part Requests Nearby</h2>
            <a href="requests">
              <button className="bg-blue-800 text-white py-3 px-5 rounded-[5px] hover:bg-blue-900 transition-translate duration-100">
                See All Requests
              </button>
            </a>
          </div>
          <div className="relative">
            <button
              onClick={() => scrollLeft(requestScrollContainerRef)}
              className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
            >
              &#8592;
            </button>
            <div
              ref={requestScrollContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4"
            >
              {!loadingRequests && !loadingUser && requests.length !== 0 ? (
                requests
                  .slice(-10)
                  .reverse()
                  .map((request) => (
                    <div key={request.id} className="flex-none w-[272px]">
                      <ItemCard
                        item={request}
                        currentUser={user}
                        type="request"
                      />
                    </div>
                  ))
              ) : requests.length === 0 ? (
                <p className="text-center">No teams need your help!</p>
              ) : (
                <></>
              )}
            </div>
            <button
              onClick={() => scrollRight(requestScrollContainerRef)}
              className="absolute right-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
            >
              &#8594;
            </button>
          </div>
        </section>
        <section className="pb-12 mx-[30px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Parts for Sale Nearby</h2>
            <a href="sales">
              <button className="bg-blue-800 text-white py-3 px-5 rounded-[5px] hover:bg-blue-900 transition-translate duration-100">
                See All Parts for Sale
              </button>
            </a>
          </div>
          <div className="relative">
            <button
              onClick={() => scrollLeft(saleScrollContainerRef)}
              className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
            >
              &#8592;
            </button>
            <div
              ref={saleScrollContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4"
            >
              {!loadingSales && !loadingUser && sales.length !== 0 ? (
                sales
                  .slice(-10)
                  .reverse()
                  .map((sale) => (
                    <div key={sale.id} className="flex-none w-[272px]">
                      <ItemCard
                        item={sale}
                        currentUser={user}
                        type="sale"
                      />
                    </div>
                  ))
              ) : sales.length === 0 ? (
                <p className="text-center">No parts for sale!</p>
              ) : (
                <></>
              )}
            </div>
            <button
              onClick={() => scrollRight(saleScrollContainerRef)}
              className="absolute right-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
            >
              &#8594;
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
