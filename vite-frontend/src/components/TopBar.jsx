import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import { IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import axiosInstance from "../utils/axiosInstance.js";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaTimes, FaPlus, FaHandHolding, FaStore, FaWpforms, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { MdHome } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { LuMessageCircle } from "react-icons/lu";
import SearchBar from "./SearchBar";

const NavButton = ({ name, link }) => {
  return (
    <a href={link}>
      <button className="px-4 py-2 text-white hover:underline-offset-1 hover:underline mx-2 whitespace-nowrap">
        {name}
      </button>
    </a>
  );
};

const ProfileDropdownButton = ({ Logo, name, buttonLink = undefined, func = undefined }) => {
  return (
    <div className="hover:bg-gray-300 transition duration-200 rounded-lg">
      <a href={buttonLink}>
        <button onClick={func} className="flex flex-row my-1 py-1 px-3 mx-1 place-items-center">
          <div className="mr-2">
            <Logo />
          </div>
          <div>
            {name}
          </div>
        </button>
      </a>
    </div>
  );
};

const TopBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();

  const [profileDropdownIsOpen, setProfileDropdownIsOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    checkAuthStatus(); // Check on mount

    // Set up an event listener for storage changes
    window.addEventListener("storage", checkAuthStatus);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    const fetchSelf = async () => {
      try {
        const response = await axiosInstance.get("/users/self/");
        const data = response.data;

        setUser(data);
      } catch (err) {
        console.error("Error fetching Self User Data:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchSelf();
  }, [isAuthenticated]);

  const handleLogout = async (e) => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
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
    <div className="top-bar bg-black w-screen border-b border-white max-w-none mx-auto px-2 sm:px-4 lg:px-6 flex flex-row place-items-center justify-between py-3">
      {/* Left Buttons */}
      <div className="flex flex-row">
        {/* Logo */}
        <a href="/">
          <img
            className="h-[40px] min-w-[32px] px-5 hover:cursor-pointer hover:scale-105 transition-translate duration-100"
            src="https://static.wixstatic.com/media/b46766_7bdb1070a7354b4393d1a759b3f81e71~mv2_d_1504_1860_s_2.png/v1/crop/x_8,y_0,w_1488,h_1860/fill/w_156,h_195,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/MillenniumFalconLogo3647.png"
            alt="3647 logo"
          />
        </a>

        {/* Nav Buttons */}
        <div className={`hidden ${isAuthenticated ? "lg:flex lg:flex-row" : "sm:flex sm:flex-row"}`}>
          <NavButton name={"Requests"} link={"/requests"} />
          <NavButton name={"Sales"} link={"/sales"} />
          {isAuthenticated && (
            <>
              <NavButton name={"Make a Request"} link={"/request"} />
              <NavButton name={"Post a Sale"} link={"/sale"} />
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
            <RxHamburgerMenu className='w-[35px] h-[35px]'
              color={"#FFFFFF"}
            />
          </button>
        </div>

        {/* Right Buttons */}
        <div className={`hidden ${isAuthenticated ? "lg:flex lg:flex-row" : "sm:flex sm:flex-row"} relative`}>
          {/* Chat Button if Logged In */}
          {isAuthenticated && (
            <a href="/chat">
              <button className="p-2 rounded-full bg-black hover:bg-gray-900 transition duration-200 mx-3">
                <LuMessageCircle className='text-white text-[24px]' />
              </button>
            </a>
          )}

          {/* Drop Down */}
          <button onClick={handleProfileDropdown} className="mx-4">
            {/* Logo vs Profile Photo */}
            {isAuthenticated && user ? (
              <div className="p-1 rounded-lg bg-gray-100 hover:bg-gray-300 transition duration-100">
                <img src={user.profile_photo} width={32} />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-black hover:bg-gray-900 transition duration-200">
                <CgProfile className='text-white text-[24px]' />
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {profileDropdownIsOpen && (
            <div className="absolute top-[48px] right-[0px] bg-gray-100 whitespace-nowrap z-50 rounded-lg px-1">
              {isAuthenticated && user ? (
                <>
                  <ProfileDropdownButton Logo={CgProfile} name={"Profile"} buttonLink={`/profile/frc/${user.team_number}`} />
                  <ProfileDropdownButton Logo={FaSignOutAlt} name={"Log Out"} func={handleLogout} />
                </>
              ) : (
                <>
                  <ProfileDropdownButton Logo={FaSignInAlt} name={"Log In"} buttonLink={`/login`} />
                  <ProfileDropdownButton Logo={FaWpforms} name={"Register"} buttonLink={'/signup'} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* The Hamburger Bar */}
      {isOpen ?
        <div className="fixed top-0 right-0 h-full w-full bg-black z-50 transition-transform duration-300 flex flex-row">
          <div className="p-4 pl-10 text-white space-y-6 flex flex-col text-[18px] mt-16 justify-left">
            <a href='/' className="flex place-items-center">
              <MdHome className='mr-5' />
              <button className="">Home</button>
            </a>
            <a href='/requests' className="flex place-items-center">
              <FaHandHolding className='mr-5' />
              <button className="">Requests</button>
            </a>
            <a href='/sales' className="flex place-items-center">
              <FaStore className='mr-5' />
              <button className="">Sales</button>
            </a>
            {isAuthenticated ? (
              <>
                <a href='/request' className="flex place-items-center">
                  <FaPlus className='mr-5' />
                  <button className="">Make a Request</button>
                </a>
                <a href='/sale' className="flex place-items-center">
                  <FaPlus className='mr-5' />
                  <button className="">Post a Sale</button>
                </a>
                <a href='/chat' className="flex place-items-center">
                  <LuMessageCircle className='mr-5' />
                  <button className="">Messages</button>
                </a>
                <a href='/profile' className="flex place-items-center">
                  <CgProfile className='mr-5' />
                  <button className="">Your Profile</button>
                </a>
                <div onClick={handleLogout} className="flex place-items-center">
                  <FaSignOutAlt className='mr-5' />
                  <button className="">Log Out</button>
                </div>
              </>
            ) : (
              <>
                <a href='/login' className="flex place-items-center">
                  <FaSignInAlt className='mr-5' />
                  <button className="">Sign In</button>
                </a>
                <a href='/signup' className="flex place-items-center">
                  <FaWpforms className='mr-5' />
                  <button className="">Register</button>
                </a>
              </>
            )}
          </div>
          <div>
            <a href="/">
              <img
                className="absolute top-[12px] left-[8px] h-[40px] min-w-[32px] mr-3 hover:cursor-pointer hover:scale-105 transition-translate duration-100"
                src="/MillenniumFalconLogo3647.png"
                alt="3647 logo"
              />
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-[20px] right-[20px] text-white text-2xl"
            >
              <FaTimes className='w-[28px] h-[28px]' />
            </button>
          </div>
        </div> : null
      }
    </div>
  );
};

export default TopBar;
