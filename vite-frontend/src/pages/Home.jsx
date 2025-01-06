import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Map from "../components/Map";
import SuccessBanner from "../components/SuccessBanner";
import ItemScrollBar from "../components/ItemScrollBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { motion } from "framer-motion"; 
import { useData } from "../contexts/DataContext";
import SectionHeader from "../components/SectionHeader";

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

  // Get data from context
  const { users: allTeams, requests, sales, loadingStates } = useData();

  const [showLoginSuccessBanner, setShowLoginSuccessBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {showLoginSuccessBanner && (
        <SuccessBanner message={bannerMessage} onClose={handleCloseBanner} />
      )}
      <TopBar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0">
              <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight text-blue-900">
                Where Teamwork
                <span className="block text-blue-600">Drives Innovation</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Connect, collaborate, and create with fellow robotics teams. 
                Find the parts you need or help others build their dreams.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all"
                  onClick={() => isAuthenticated ? navigate(isAuthenticated ? "/request" : "/login"): navigate("/login")}
                >
                  Make a Request
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:bg-gray-50 transition-all border-2 border-blue-600"
                  onClick={() => isAuthenticated ? navigate(isAuthenticated ? "/sale" : "/login"): navigate("/login")}
                >
                  Post a Sale
                </motion.button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 px-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Map zoom={8} locations={allTeams} className="h-[400px] w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Active Teams", value: allTeams.length },
              { title: "Open Sales", value: sales.length },
              { title: "Active Requests", value: requests.length },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center p-8 rounded-xl bg-gray-50 shadow-lg"
              >
                <h3 className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <SectionHeader title="Recent Part Requests" />
            <ItemScrollBar
              key={requests[0]?.id}
              items={requests}
              loadingItems={loadingStates.requests}
              user={user}
              isAuthenticated={isAuthenticated}
              loadingUser={loadingUser}
              type="request"
            />
            <div className="text-center mt-8">
              <button
                onClick={() => navigate("/requests")}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                View All Requests
              </button>
            </div>
          </div>

          <div>
            <SectionHeader title="Parts for Sale" />
            <ItemScrollBar
              key={sales[0]?.id}
              items={sales}
              loadingItems={loadingStates.sales}
              user={user}
              loadingUser={loadingUser}
              type="sale"
              isAuthenticated={isAuthenticated}
            />
            <div className="text-center mt-8">
              <button
                onClick={() => navigate("/sales")}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                View All Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
