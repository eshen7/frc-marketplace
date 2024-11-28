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


const TopBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

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

  return (
    <div className="bg-red-800 w-screen max-w-none mx-auto px-2 sm:px-4 lg:px-6 flex flex-row place-items-center justify-between py-3">
      <a href="/">
        <img
          className="h-[40px] min-w-[32px] mr-3 hover:cursor-pointer hover:scale-105 transition-translate duration-100"
          src="https://static.wixstatic.com/media/b46766_7bdb1070a7354b4393d1a759b3f81e71~mv2_d_1504_1860_s_2.png/v1/crop/x_8,y_0,w_1488,h_1860/fill/w_156,h_195,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/MillenniumFalconLogo3647.png"
          alt="3647 logo"
        />
      </a>
      <div className="gap-5 whitespace-nowrap hidden sm:flex">
        <Button href="requests" variant="contained" color="secondary">
          Requests
        </Button>
        <Button href="sales" variant="contained" color="secondary">
          Sales
        </Button>
        {isAuthenticated && (
          <Button
            href={isAuthenticated ? "request" : "login"}
            variant="contained"
            color="secondary"
          >
            Make a Request
          </Button>
        )}
      </div>
      <div className="hidden sm:flex items-center justify-end">
        <Stack className="justify-center" direction="row" spacing={2}>
          {isAuthenticated ? (
            <Stack direction="row" spacing={2} className="px-6">
              <Button
                href=""
                variant="contained"
                color="secondary"
                className="whitespace-nowrap"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} className="px-6">
              <Button href="login" variant="contained" color="secondary" className="whitespace-nowrap">
                Sign In
              </Button>
              <Button href="signup" variant="outlined" color="secondary">
                Register
              </Button>
            </Stack>
          )}
          {isAuthenticated && (
            <IconButton className="items-center">
              <CgProfile className='text-white' />
            </IconButton>
          )}
        </Stack>
      </div>

      <div className="flex sm:hidden">
        <button onClick={() => setIsOpen(true)}>
          <RxHamburgerMenu className='w-[35px] h-[35px]'
            color={"#FFFFFF"}
          />
        </button>
      </div>
      {/* The Hamburger Bar */}
      {isOpen ?
        <div className="fixed top-0 right-0 h-full w-full bg-red-800 z-50 transition-transform duration-300 flex flex-row">
          <div className="p-4 pl-10 text-white space-y-6 flex flex-col text-[18px] mt-16 justify-left">
            <a href='/' className="flex place-items-center">
              <MdHome className='mr-5' />
              <button className="">Home</button>
            </a>
            <a href='requests' className="flex place-items-center">
              <FaHandHolding className='mr-5' />
              <button className="">Requests</button>
            </a>
            <a href='sales' className="flex place-items-center">
              <FaStore className='mr-5' />
              <button className="">Sales</button>
            </a>
            {isAuthenticated ? (
              <>
                <a href='request' className="flex place-items-center">
                  <FaPlus className='mr-5' />
                  <button className="">Make a Request</button>
                </a>
                <div onClick={handleLogout} className="flex place-items-center">
                  <FaSignOutAlt className='mr-5' />
                  <button className="">Log Out</button>
                </div>
                <a href='' className="flex place-items-center">
                  <CgProfile className='mr-5' />
                  <button className="">Your Profile</button>
                </a>
              </>
            ) : (
              <>
                <a href='login' className="flex place-items-center">
                  <FaSignInAlt className='mr-5' />
                  <button className="">Sign In</button>
                </a>
                <a href='signup' className="flex place-items-center">
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
                src="https://static.wixstatic.com/media/b46766_7bdb1070a7354b4393d1a759b3f81e71~mv2_d_1504_1860_s_2.png/v1/crop/x_8,y_0,w_1488,h_1860/fill/w_156,h_195,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/MillenniumFalconLogo3647.png"
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
