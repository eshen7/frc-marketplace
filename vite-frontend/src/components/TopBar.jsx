import React, { useState, useEffect } from "react";
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

const NavButton = ({ name, link, navigate }) => {
  return (
    <button
      onClick={() => navigate(link)}
      className="px-4 py-2 text-white hover:underline-offset-1 hover:underline mx-2 whitespace-nowrap"
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
    <button
      onClick={() => {
        if (func) {
          func();
        }
        navigate(link);
      }}
      className="flex place-items-center"
    >
      <Logo className="mr-5" />
      <div className="">{name}</div>
    </button>
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
        console.log("Logout successful");
        navigate("/", {
          state: { fromLogin: true, message: "You have been logged out" },
        });
        window.location.reload();
        return { success: true };
      } else {
        console.log("Logout failed");
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
    <div className="top-bar bg-black w-full border-b border-white max-w-[100vw] mx-auto px-2 sm:px-4 lg:px-6 flex flex-row place-items-center justify-between py-3">
      {/* Left Buttons */}
      <div className="flex flex-row">
        {/* Logo */}
        <button onClick={() => navigate("/")}>
          <img
            className="h-[40px] min-w-[32px] px-5 hover:cursor-pointer hover:scale-105 transition-translate duration-100 text-white"
            src="/millenniumMarket.svg"
            alt="3647 logo"
          />
        </button>

        {/* Nav Buttons */}
        <div
          className={`hidden ${
            isAuthenticated ? "lg:flex lg:flex-row" : "sm:flex sm:flex-row"
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
        </div>
      </div>

      <div className="flex flex-row">
        {/* Search Bar */}
        <div className="mx-3">
          <SearchBar />
        </div>

        {/* Hamburger Button */}
        <div className={`flex ${isAuthenticated ? "lg:hidden" : "sm:hidden"}`}>
          <button onClick={() => setIsOpen(true)}>
            <RxHamburgerMenu className="w-[35px] h-[35px]" color={"#FFFFFF"} />
          </button>
        </div>

        {/* Right Buttons */}
        <div
          className={`hidden ${
            isAuthenticated ? "lg:flex lg:flex-row" : "sm:flex sm:flex-row"
          } relative`}
        >
          {/* Chat Button if Logged In */}
          {isAuthenticated && (
            <button
              onClick={() => navigate("/chat")}
              className="p-2 rounded-full bg-black hover:bg-gray-900 transition duration-200 mx-3"
            >
              <LuMessageCircle className="text-white text-[24px]" />
            </button>
          )}

          {/* Drop Down */}
          <button onClick={handleProfileDropdown} className="mx-4">
            {/* Logo vs Profile Photo */}
            {isAuthenticated && user ? (
              <div className="p-1 rounded-lg bg-gray-100 hover:bg-gray-300 transition duration-100">
                <ProfilePhoto
                  src={user.profile_photo}
                  teamNumber={user.team_number}
                  alt={"Team Logo"}
                  className="w-[32px] h-[32px] rounded-sm"
                />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-black hover:bg-gray-900 transition duration-200">
                <CgProfile className="text-white text-[24px]" />
              </div>
            )}
          </button>
          
          {/* Profile Dropdown */}
          {profileDropdownIsOpen && (
            <div className="absolute top-[50px] right-[16px] bg-gray-100 whitespace-nowrap z-50 rounded-lg px-1 border border-gray-300 shadow-lg">
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
                    name={"Register"}
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

      {/* The Hamburger Bar */}
      {isOpen ? (
        <div className="fixed top-0 right-0 h-full w-full bg-black z-50 transition-transform duration-300 flex flex-row">
          <div className="p-4 pl-10 text-white space-y-6 flex flex-col text-[18px] mt-16 justify-left">
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
                  name={"Register"}
                  Logo={FaWpforms}
                  link={"/signup"}
                  navigate={navigate}
                />
              </>
            )}
          </div>
          <div>
            <button onClick={() => navigate("/")}>
              <img
                className="absolute top-[12px] left-[8px] h-[40px] min-w-[32px] mr-3 hover:cursor-pointer hover:scale-105 transition-translate duration-100"
                src="/millenniumMarket.svg"
                alt="Millennium Market Logo"
              />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-[20px] right-[20px] text-white text-2xl"
            >
              <FaTimes className="w-[28px] h-[28px]" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TopBar;
