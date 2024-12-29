import React, { useState, useEffect, useRef } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Map from "../components/Map";
import SuccessBanner from "../components/SuccessBanner";

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

const renderRequest = (request, self_user) => {
  const daysUntil = getDaysUntil(new Date(request.needed_date));
  const isUrgent = daysUntil < 5 && daysUntil > 0;
  const isOverdue = daysUntil < 0;
  const isDueToday = daysUntil === 0;
  const absoluteDaysUntil = Math.abs(daysUntil);

  let distance_string = "Log in for distance";

  if (
    self_user &&
    self_user.formatted_address.latitude &&
    self_user.formatted_address.longitude
  ) {
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
            Need By: {new Date(request.needed_date).toLocaleDateString()} (
            {daysUntil} {daysUntil === 1 ? "day" : "days"})
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
      <h3 className="text-xl font-semibold mb-2">{request.part.name}</h3>
      <p className="text-gray-600 mb-2">{request.user.team_number}</p>
      {renderDueDate()}
      <p className="text-sm text-gray-500">
        {distance_string != "0.0 miles" ? distance_string : "Your Listing"}
      </p>
      {distance_string != "0.0 miles" && (
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={() => {
            window.location.href = `/requests/${request.id}`;
          }}
        >
          Offer Part
        </button>
      )}
    </div>
  );
};

const renderSale = (sale, self_user) => {
  const isOwnListing = sale.user.id === self_user?.id;
  const isFree = sale.ask_price === 0;
  const isTrade = sale.ask_price === -1;

  let distance_string = "Log in for distance";

  if (
    self_user &&
    self_user.formatted_address.latitude &&
    self_user.formatted_address.longitude
  ) {
    const dist = haversine(
      sale.user.formatted_address.latitude,
      sale.user.formatted_address.longitude,
      self_user.formatted_address.latitude,
      self_user.formatted_address.longitude
    );

    distance_string = dist.toFixed(1) + " miles";
  }

  const renderPrice = () => {
    if (isFree) {
      return <span className="text-green-600 font-bold">FREE</span>;
    } else if (isTrade) {
      return <span className="text-blue-600 font-bold">For Trade</span>;
    } else {
      return <span className="text-green-600 font-bold">${sale.ask_price}</span>;
    }
  };

  return (
    <div
      key={sale.id}
      className="flex-none w-[256px] bg-white rounded-lg shadow-md p-6 whitespace-nowrap"
    >
      <h3 className="text-xl font-semibold mb-2">{sale.part.name}</h3>
      <p className="text-gray-600 mb-2">{sale.user.team_number}</p>
      <p className="text-sm text-gray-500 mb-2">
        {distance_string != "0.0 miles" ? distance_string : "Your Listing"}
      </p>
      <p className="text-lg mb-2">{renderPrice()}</p>
      <p className="text-sm text-gray-600 mb-2">Quantity: {sale.quantity}</p>
      {sale.condition && (
        <p className="text-sm text-gray-600 mb-2">Condition: {sale.condition}</p>
      )}
      {!isOwnListing && (
        <button
          className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={() => {
            window.location.href = `/sales/${sale.id}`;
          }}
        >
          Make Offer
        </button>
      )}
    </div>
  );
};

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

  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -272, // Adjust the scroll distance as needed
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
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
        <h1 className="text-7xl text-center pt-[80px] mb-[80px] font-paytone text-[#AE0000] font-extrabold text-shadow-md">
          {" "}
          FRC MARKETPLACE
        </h1>
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
              <button className="bg-red-800 text-white py-3 px-5 rounded-[5px] hover:bg-red-900 transition-translate duration-100">
                See All Requests
              </button>
            </a>
          </div>
          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
            >
              &#8592;
            </button>
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4"
            >
              {!loadingRequests && !loadingUser && requests.length !== 0 ? (
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
              ) : requests.length === 0 ? (
                <p className="text-center">No teams need your help!</p>
              ) : (
                <></>
              )}
            </div>
            <button
              onClick={scrollRight}
              className="absolute right-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
            >
              &#8594;
            </button>
          </div>
        </section>
        <section className="mb-12 mx-[30px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Parts for Sale Nearby</h2>
            <a href="sales">
              <button className="bg-red-800 text-white py-3 px-5 rounded-[5px] hover:bg-red-900 transition-translate duration-100">
                See All Parts for Sale
              </button>
            </a>
          </div>
          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
            >
              &#8592;
            </button>
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4"
            >
              {!loadingSales && !loadingUser && sales.length !== 0 ? (
                sales
                  .slice(-10)
                  .reverse()
                  .map((sale) => {
                    return (
                      <React.Fragment key={sale.id}>
                        {renderSale(sale, user)}
                      </React.Fragment>
                    );
                  })
              ) : sales.length === 0 ? (
                <p className="text-center">No parts for sale!</p>
              ) : (
                <></>
              )}
            </div>
            <button
              onClick={scrollRight}
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
