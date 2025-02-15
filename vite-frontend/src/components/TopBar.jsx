import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  FaTimes,
  FaPlus,
  FaHandHolding,
  FaStore,
  FaWpforms,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdHome } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { LuMessageCircle } from "react-icons/lu";
import SearchBar from "./SearchBar";
import DropdownButton from "./DropdownButton.jsx";
import { useUser } from "../contexts/UserContext.jsx";
import ProfilePhoto from "./ProfilePhoto.jsx";
import { motion, AnimatePresence } from "framer-motion";

const NavButton = ({ name, link, navigate }) => {
  return (
    <button
      onClick={() => navigate(link)}
      className="px-4 py-2 text-white hover:underline-offset-1 hover:underline mx-1 whitespace-nowrap"
    >
      {name}
    </button>
  );
};

const InsideHamburgerButton = ({
  name,
  Logo,
  link,
  navigate,
  func = undefined,
}) => {
  return (
    <motion.button
      onClick={() => {
        if (func) {
          func();
        }
        navigate(link);
      }}
      className="flex place-items-center w-full hover:bg-gray-900 p-2 rounded-lg transition-colors"
      whileHover={{ x: 10 }}
      whileTap={{ scale: 0.95 }}
    >
      <Logo className="mr-5" />
      <div className="">{name}</div>
    </motion.button>
  );
};

const TopBar = () => {
  const {
    user,
    setUser,
    loadingUser,
    setLoadingUser,
    isAuthenticated,
    setIsAuthenticated,
  } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const [profileDropdownIsOpen, setProfileDropdownIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async (e) => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUser(null);
    try {
      const response = await axiosInstance.post(
        "/logout/",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        navigate("/", {
          state: { fromLogin: true, message: "You have been logged out" },
        });
        window.location.reload();
        return { success: true };
      } else {
        return { success: false, error: "An error occured" };
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return { success: false, error: "An error occured" };
    }
  };

  const handleProfileDropdown = () => {
    setProfileDropdownIsOpen(!profileDropdownIsOpen);
  };

  return (
    <div className="top-bar bg-black w-full border-b border-white max-w-[100vw] mx-auto px-2 md:px-4 lg:px-6 flex flex-row place-items-center justify-between py-3">
      {/* Left Buttons */}
      <div className="flex flex-row">
        {/* Logo */}
        <a href="/" className="w-[50px] mx-5">
          <img
            className="hover:cursor-pointer hover:scale-105 transition-translate duration-100 text-white"
            src="/millenniumMarket.svg"
            alt="3647 logo"
          />
        </a>

        {/* Nav Buttons */}
        <div
          className={`hidden ${isAuthenticated ? "xl:flex xl:flex-row" : "850:flex 850:flex-row"
            }`}
        >
          <NavButton name={"Requests"} link={"/requests"} navigate={navigate} />
          <NavButton name={"Sales"} link={"/sales"} navigate={navigate} />
          <NavButton
            name={"Parts Directory"}
            link={"/parts"}
            navigate={navigate}
          />
          {isAuthenticated && (
            <>
              <NavButton
                name={"Make a Request"}
                link={"/request"}
                navigate={navigate}
              />
              <NavButton
                name={"Post a Sale"}
                link={"/sale"}
                navigate={navigate}
              />
            </>
          )}
          <button
            onClick={() => navigate("/comp")}
            className="relative px-6 py-2 text-white rounded-lg font-semibold shadow-lg overflow-hidden group"
            style={{
              background: "linear-gradient(90deg, #9333ea 0%, #4f46e5 100%)"
            }}
          >
            <div className="absolute top-0 -left-[100%] w-[400%] h-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 16.66%, #4f46e5 33.33%, #9333ea 50%, #4f46e5 66.66%, #9333ea 83.33%, #4f46e5 100%)",
                animation: "gradientMove 3s linear infinite",
              }}
            />
            <span className="relative z-10 whitespace-nowrap">🏆 Comp Mode</span>
          </button>
        </div>
      </div>

      <div className="flex flex-row">
        {/* Search Bar */}
        <div className="mx-3">
          <SearchBar />
        </div>

        {/* Right Buttons */}
        <div
          className={`hidden ${isAuthenticated ? "sm:flex sm:flex-row" : "850:flex 850:flex-row"}`}
        >
          {/* Drop Down */}
          <div className="" ref={dropdownRef}>
            <div className="flex flex-row">
              {/* Chat Button if Logged In */}
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/chat")}
                  className="p-1 rounded-full bg-black hover:bg-gray-900 transition duration-200 mx-3"
                >
                  <LuMessageCircle className="text-white text-[24px]" />
                </button>
              )}
              <button onClick={handleProfileDropdown} className="mx-4">
                {/* Logo vs Profile Photo */}
                {isAuthenticated && user ? (
                  <>
                    <ProfilePhoto
                      src={user.profile_photo}
                      teamNumber={user.team_number}
                      alt={"Team Logo"}
                      className="w-[32px] h-[32px] rounded-sm"
                      containerClassName="p-1 min-w-[40px] rounded-lg bg-gray-100 hover:bg-gray-300 transition duration-100"
                    />
                  </>
                ) : (
                  <div className="p-2 rounded-full bg-black hover:bg-gray-900 transition duration-200">
                    <CgProfile className="text-white text-[24px]" />
                  </div>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            {profileDropdownIsOpen && (
              <div className="absolute top-[60px] right-[40px] bg-gray-100 whitespace-nowrap z-50 rounded-lg px-1 border border-gray-300 shadow-lg">
                {isAuthenticated && user ? (
                  <>
                    <DropdownButton
                      Logo={CgProfile}
                      name={"Profile"}
                      buttonLink={`/profile/frc/${user.team_number}`}
                      navigate={navigate}
                      hoverColor="hover:bg-gray-200"
                    />
                    <DropdownButton
                      Logo={FaSignOutAlt}
                      name={"Log Out"}
                      func={handleLogout}
                      navigate={navigate}
                      hoverColor="hover:bg-gray-200"
                    />
                  </>
                ) : (
                  <>
                    <DropdownButton
                      Logo={FaSignInAlt}
                      name={"Log In"}
                      buttonLink={`/login`}
                      navigate={navigate}
                      hoverColor="hover:bg-gray-200"
                    />
                    <DropdownButton
                      Logo={FaWpforms}
                      name={"Register Team"}
                      buttonLink={"/signup"}
                      navigate={navigate}
                      hoverColor="hover:bg-gray-200"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Hamburger Button */}
        <div className={`flex ${isAuthenticated ? "xl:hidden" : "850:hidden"}`}>
          <button onClick={() => setIsOpen(true)}>
            <RxHamburgerMenu className="w-[35px] h-[35px]" color={"#FFFFFF"} />
          </button>
        </div>
      </div>

      {/* The Hamburger Bar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed top-0 right-0 h-full w-full bg-black z-50 flex flex-row"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Menu Items */}
            <motion.div 
              className="p-4 pl-10 text-white space-y-3 flex flex-col text-[18px] mt-16 justify-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <InsideHamburgerButton
                name={"Home"}
                Logo={MdHome}
                link={"/"}
                navigate={navigate}
              />
              <InsideHamburgerButton
                name={"Requests"}
                Logo={FaHandHolding}
                link={"/requests"}
                navigate={navigate}
              />
              <InsideHamburgerButton
                name={"Sales"}
                Logo={FaStore}
                link={"/sales"}
                navigate={navigate}
              />
              <InsideHamburgerButton
                name={"Parts Directory"}
                Logo={FaWpforms}
                link={"/parts"}
                navigate={navigate}
              />

              {/* Add CompMode button here */}
              <motion.button
                onClick={() => navigate("/comp")}
                className="w-full p-3 rounded-lg font-semibold relative overflow-hidden group"
                style={{
                  background: "linear-gradient(90deg, #9333ea 0%, #4f46e5 100%)"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute top-0 -left-[100%] w-[400%] h-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 16.66%, #4f46e5 33.33%, #9333ea 50%, #4f46e5 66.66%, #9333ea 83.33%, #4f46e5 100%)",
                    animation: "gradientMove 3s linear infinite",
                  }}
                />
                <span className="relative z-10 flex items-center justify-center text-[20px]">
                  🏆 Competition Mode
                </span>
              </motion.button>

              {/* Rest of menu items */}
              {isAuthenticated ? (
                <>
                  <InsideHamburgerButton
                    name={"Make a Request"}
                    Logo={FaPlus}
                    link={"/request"}
                    navigate={navigate}
                  />
                  <InsideHamburgerButton
                    name={"Post a Sale"}
                    Logo={FaPlus}
                    link={"/sale"}
                    navigate={navigate}
                  />
                  <InsideHamburgerButton
                    name={"Messages"}
                    Logo={LuMessageCircle}
                    link={"/chat"}
                    navigate={navigate}
                  />
                  <InsideHamburgerButton
                    name={"Your Profile"}
                    Logo={CgProfile}
                    link={"/profile/frc/" + user.team_number}
                    navigate={navigate}
                  />
                  <InsideHamburgerButton
                    name={"Log Out"}
                    Logo={FaSignOutAlt}
                    func={handleLogout}
                    navigate={navigate}
                  />
                </>
              ) : (
                <>
                  <InsideHamburgerButton
                    name={"Sign In"}
                    Logo={FaSignInAlt}
                    link={"/login"}
                    navigate={navigate}
                  />
                  <InsideHamburgerButton
                    name={"Register Team"}
                    Logo={FaWpforms}
                    link={"/signup"}
                    navigate={navigate}
                  />
                </>
              )}
            </motion.div>

            {/* Header with Logo and Close Button */}
            <div className="absolute top-0 left-0 right-0 h-16 flex justify-between items-center px-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <img
                  onClick={() => navigate("/")}
                  className="h-[40px] hover:cursor-pointer hover:scale-105 transition-transform duration-100"
                  src="/millenniumMarket.svg"
                  alt="Millennium Market Logo"
                />
              </motion.div>
              
              <motion.button
                onClick={() => setIsOpen(false)}
                className="text-white text-2xl p-2"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FaTimes className="w-[28px] h-[28px]" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopBar;
