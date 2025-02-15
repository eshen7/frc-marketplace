"use client";

import React, { useEffect, useRef, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { Skeleton, TextField, Autocomplete } from "@mui/material";
import { MdDelete, MdOutlineEdit } from "react-icons/md";
import { LuSave } from "react-icons/lu";
import ItemScrollBar from "../components/ItemScrollBar.jsx";
import DropdownButton from "../components/DropdownButton.jsx";
import ItemProfileSection from "../components/ItemProfileSection.jsx";
import { useUser } from "../contexts/UserContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import AlertBanner from "../components/AlertBanner";
import { LoadingViewPage } from "./ViewRequest.jsx";
import HelmetComp from "../components/HelmetComp.jsx";

export default function ViewSale() {
  const { sale_id } = useParams();
  const navigate = useNavigate();
  const { refreshSingle, users } = useData();  // Add users here
  const { user, loadingUser, isAuthenticated } = useUser();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sale, setSale] = useState(null);
  const [error, setError] = useState(null);

  const [partSales, setPartSales] = useState([]);
  const [loadingPartSales, setLoadingPartSales] = useState(true);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [isSaleOwner, setIsSaleOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saleChange, setSaleChange] = useState("");

  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    quantity: { val: 0, edited: false },
    ask_price: { val: 0, edited: false },
    condition: { val: "", edited: false },
    additional_info: { val: "", edited: false },
  });

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [saleOpen, setSaleOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTeam, setSearchTeam] = useState('');
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await axiosInstance.get(`/sales/id/${sale_id}/`);
        setSale(response.data);
        setFormData({
          quantity: { val: response.data.quantity, edited: false },
          ask_price: { val: response.data.ask_price, edited: false },
          condition: { val: response.data.condition, edited: false },
          additional_info: {
            val: response.data.additional_info,
            edited: false,
          },
        });
      } catch (err) {
        console.error("Error fetching Part Sale:", err);
        setError(err);
      }
    };

    fetchSale();
  }, [sale_id]);

  useEffect(() => {
    if (user && sale) {
      setIsSaleOwner(user.team_number === sale.user.team_number);
    }
  }, [user, sale]);

  const fetchPartSales = async () => {
    try {
      const response = await axiosInstance.get(
        `/parts/id/${sale.part.id}/sales`
      );
      // Filter out sold items and current sale
      setPartSales(response.data.filter((s) => !s.is_sold && s.id !== sale_id));
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoadingPartSales(false);
    }
  };

  useEffect(() => {
    if (sale && sale_id) {
      fetchPartSales();
    }
  }, [sale, sale_id]);

  useEffect(() => {
    if (searchTeam && users) {  // Add users check
      const filtered = users.filter(u => 
        (u.team_number.toString().includes(searchTeam) ||
        u.team_name.toLowerCase().includes(searchTeam.toLowerCase())) &&
        u.team_number !== sale?.user.team_number
      ).slice(0, 10);
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams([]);
    }
  }, [searchTeam, users, sale?.user.team_number]);  // Add users to dependencies

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (
      formData.quantity.edited ||
      formData.ask_price.edited ||
      formData.condition.edited ||
      formData.additional_info.edited
    ) {
      try {
        const response = await axiosInstance.put(
          `/sales/id/${sale_id}/edit/`,
          formData
        );

        setFormData({
          quantity: { val: formData.quantity.val, edited: false },
          ask_price: { val: formData.ask_price.val, edited: false },
          condition: { val: formData.condition.val, edited: false },
          additional_info: { val: formData.additional_info.val, edited: false },
        });

        setSale(response.data);
        setIsEditing(false);
        setAlertState({
          open: true,
          message: "Sale Updated Successfully.",
          severity: "success",
        });
      } catch (error) {
        console.error("Error saving sale:", error);
        setAlertState({
          open: true,
          message: "Error saving sale, please try again.",
          severity: "error",
        });
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/sales/id/${sale_id}/delete/`);
      setAlertState({
        open: true,
        message: "Sale deleted successfully. Navigating to sales page...",
        severity: "success",
      });
      refreshSingle("sales");
      setTimeout(() => navigate("/sales"), 3000);
    } catch (error) {
      console.error("Error deleting sale:", error);
      setAlertState({
        open: true,
        message: "Error deleting sale, please try again.",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleDeleteInitialClick = async () => {
    setDeleteConfirmOpen(true);
  };

  const closeSaleChangeBanner = () => {
    setSaleChange("");
  };

  const handleMarkSold = async () => {
    try {
      const response = await axiosInstance.post(
        `/sales/id/${sale_id}/complete/`,
        { 
          team_number: selectedTeam?.team_number || null
        }
      );
      
      setSale(response.data);
      setAlertState({
        open: true,
        message: "Sale marked as completed successfully!",
        severity: "success",
      });
      setSaleOpen(false);
      refreshSingle("sales");
    } catch (error) {
      setAlertState({
        open: true,
        message: error.response?.data?.error || "Error completing sale",
        severity: "error",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <AlertBanner
          {...alertState}
          onClose={() => setAlertState({ ...alertState, open: false })}
        />
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-xl max-w-[320px]">
              <h2 className="text-xl font-bold mb-4">Confirmation</h2>
              <p className="mb-4">
                Are you sure you want to delete this sale? This process is
                irreversible.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteConfirm();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        <TopBar />
        <div className="flex-grow flex flex-col bg-gray-100">
          <div className="py-8 md:py-16">
            {sale && !error ? (
              <div className="px-5 sm:px-12 md:px-20">
                <HelmetComp
                  title={`${sale.part.name} - Sale - Team ${sale.user.team_number} ${sale.user.team_name}`}
                  keywords={`Team ${sale.user.team_number}, ${sale.user.team_name}, sale, ${sale.part.name}, ${sale.part.manufacturer.name}`}
                  description={`Robotics part ${sale.part.name} for sale - Team ${sale.user.team_number} ${sale.user.team_name}`}
                />
                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column - Scrollable Content */}
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      {/* Sale Creation Date */}
                      <p className="text-gray-500 text-sm">
                        {new Date(sale.sale_creation_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Part Name */}
                    <div className="flex flex-row justify-between place-items-center relative">
                      <button
                        onClick={() => navigate(`/parts/${sale.part.id}`)}
                        className="text-[30px] font-roboto hover:underline hover:cursor-pointer"
                      >
                        {sale.part.name}
                      </button>
                      {/* Edit Button */}
                      {isSaleOwner && (
                        <>
                          {isEditing ? (
                            <button
                              className="rounded-full bg-white text-green-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer"
                              onClick={() => handleSaveClick()}
                            >
                              <LuSave />
                            </button>
                          ) : (
                            <button
                              className="rounded-full bg-white text-blue-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer"
                              onClick={() => {
                                setEditDropdownOpen(!editDropdownOpen);
                              }}
                            >
                              <MdOutlineEdit />
                            </button>
                          )}
                        </>
                      )}

                      {/* Edit Dropdown */}
                      {editDropdownOpen && (
                        <div className="absolute top-[50px] right-[-20px] bg-white whitespace-nowrap z-50 rounded-lg px-1">
                          <DropdownButton
                            Logo={MdOutlineEdit}
                            name={"Edit"}
                            func={() => {
                              setEditDropdownOpen(false);
                              handleEditClick();
                            }}
                            navigate={navigate}
                          />
                          <div className="text-red-600">
                            <DropdownButton
                              Logo={MdDelete}
                              name={"Delete"}
                              func={() => {
                                setEditDropdownOpen(false);
                                handleDeleteInitialClick();
                              }}
                              navigate={navigate}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <h2 className="text-[20px]">
                      <a
                        href={
                          sale.part.manufacturer.website
                            ? sale.part.manufacturer.website
                            : sale.part.link
                        }
                        target="_blank"
                      >
                        <span className="text-blue-600 hover:underline">
                          {sale.part.manufacturer.name}
                        </span>
                      </a>
                    </h2>
                    {/* Quantity & Price */}
                    <div className="flex flex-row justify-between place-items-center">
                      {/* Editing Quantity */}
                      {isEditing ? (
                        <div className="flex flex-row justify-between place-items-center">
                          <span className="">Qty:</span>
                          <input
                            type="number"
                            id="quantity"
                            className={`w-12 ml-2 border-2 ${formData.quantity.edited
                              ? "border-green-500"
                              : "border-gray-300"
                              }`}
                            value={formData.quantity.val}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                quantity: { val: e.target.value, edited: true },
                              })
                            }
                          />
                        </div>
                      ) : (
                        <p>Qty: {sale.quantity}</p>
                      )}
                      {/* Editing Price */}
                      {isEditing ? (
                        <div className="flex flex-col">
                          <p className="text-gray-400 text-xs text-right">each</p>

                          <div className="flex flex-row justify-between place-items-center">
                            <span className="text-green-700 text-[24px]">$</span>
                            <input
                              type="number"
                              id="ask_price"
                              className={`text-green-700 text-[24px] w-28 border-2 ${formData.ask_price.edited
                                ? "border-green-500"
                                : "border.gray.300"
                                }`}
                              value={formData.ask_price.val}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  ask_price: { val: e.target.value, edited: true },
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        // Displaying Price
                        <div className="flex flex-col">
                          <p className="text-gray-400 text-xs text-right -mb-1">each</p>
                          <p className="text-green-700 text-[24px]">
                            {sale.ask_price > 0
                              ? `$${sale.ask_price}`
                              : sale.ask_price == 0
                                ? "FREE"
                                : "Trade Wanted"}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Additional Info */}
                    <div className="flex flex-col mt-6">
                      <p className="font-semibold">Part Link</p>
                      <p>
                        <a
                          href={sale.part.link ? sale.part.link : ""}
                          target="_blank"
                          className={`${sale.part.link ? "text-blue-500 hover:underline" : "text-gray-500"}`}
                          title={
                            sale.part.link
                              ? sale.part.link
                              : "No link provided"
                          }
                        >
                          {sale.part.link
                            ? sale.part.link
                            : "No link provided"}
                        </a>
                      </p>
                      <p className="font-semibold">Part Description</p>
                      <p className="text-gray-500">
                        {sale.part.description
                          ? sale.part.description
                          : "No description for the part available."}
                      </p>
                      {/* Condition */}
                      <div className="mt-4">
                        <span className="font-semibold">Condition:</span>{" "}
                        {isEditing ? (
                          <select
                            type="text"
                            id="condition"
                            className={`w-28 border-2 ${formData.condition.edited
                              ? "border-green-500"
                              : "border-gray-300"
                              }`}
                            value={formData.condition.val}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                condition: { val: e.target.value, edited: true },
                              })
                            }
                          >
                            <option value="new">New</option>
                            <option value="like-new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        ) : (
                          <span className="text-gray-500 font-normal">
                            {sale.condition === "new"
                              ? "New"
                              : sale.condition === "like-new"
                                ? "Like New"
                                : sale.condition === "good"
                                  ? "Good"
                                  : sale.condition === "fair"
                                    ? "Fair"
                                    : "Poor"}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold mt-4">Additional Info</p>
                      <div className="text-gray-500">
                        {isEditing ? (
                          <textarea
                            type="text"
                            id="additional_info"
                            rows={2}
                            className={`w-full border-2 ${formData.additional_info.edited
                              ? "border-green-500"
                              : "border-gray-300"
                              } min-h-[32px]`}
                            value={formData.additional_info.val}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                additional_info: {
                                  val: e.target.value,
                                  edited: true,
                                },
                              })
                            }
                          />
                        ) : sale.additional_info ? (
                          sale.additional_info
                        ) : (
                          "No additional info for the sale was provided by the user."
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      {sale?.is_sold ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-green-700 font-semibold">
                              Sale Completed
                              {sale.sold_to && ` to Team ${sale.sold_to.team_number} - ${sale.sold_to.team_name}`}
                            </p>
                            <span className="text-sm text-gray-600">
                              {new Date(sale.sale_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        isSaleOwner && (
                          <button
                            onClick={() => setSaleOpen(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                          >
                            Mark as Sold
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Right Column - Sticky Content */}
                  <div className="hidden md:block">
                    <div className="sticky top-8">
                      {/* Image Container with max height constraint */}
                      <div
                        className="relative w-full"
                        style={{
                          height: "100%",
                          width: "100%",
                        }}
                      >
                        {!imageLoaded && (
                          <Skeleton
                            variant="rectangular"
                            sx={{
                              width: "100%",
                              height: "100%",
                              minHeight: "400px", // Minimum height while loading
                            }}
                            animation="wave"
                          />
                        )}
                        <img
                          src={sale.part.image}
                          alt={sale.part.name}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          className="w-full h-full object-contain"
                          style={{
                            display: imageLoaded ? "block" : "none",
                          }}
                        />
                      </div>

                      {/* Profile Section */}
                      <div className="mt-10">
                        <ItemProfileSection
                          user={sale.user}
                          selfUser={user}
                          isOwner={isSaleOwner}
                          navigate={navigate}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile version of right column */}
                  <div className="md:hidden flex flex-col gap-10">
                    {/* Image */}
                    <div
                      className="relative w-full"
                      style={{
                        height: "400px", // Fixed height for mobile
                      }}
                    >
                      {!imageLoaded && (
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            width: "100%",
                            height: "100%",
                          }}
                          animation="wave"
                        />
                      )}
                      <img
                        src={sale.part.image}
                        alt={sale.part.name}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className="w-full h-full object-contain"
                        style={{
                          display: imageLoaded ? "block" : "none",
                        }}
                      />
                    </div>
                    <ItemProfileSection
                      user={sale.user}
                      selfUser={user}
                      isOwner={isSaleOwner}
                      navigate={navigate}
                    />
                  </div>
                </div>
                {/* Other Sales for the Same Part */}
                <div className="mt-10 md:mt-20 w-full">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Sales for the same part
                  </h2>
                  <ItemScrollBar
                    items={partSales}
                    loadingItems={loadingPartSales}
                    user={user}
                    loadingUser={loadingUser}
                    type="sale"
                    isAuthenticated={isAuthenticated}
                  />
                </div>

                {/* Sale Completion Dialog */}
                {saleOpen && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg shadow-xl max-w-[400px]">
                      <h2 className="text-xl font-bold mb-4">Mark Sale as Complete</h2>
                      
                      <div className="mb-4">
                        <Autocomplete
                          options={filteredTeams}
                          getOptionLabel={(option) => `${option.team_number} - ${option.team_name}`}
                          value={selectedTeam}
                          onChange={(_, newValue) => setSelectedTeam(newValue)}
                          onInputChange={(_, newInputValue) => setSearchTeam(newInputValue)}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label="Select Team (Optional)" 
                              variant="outlined"
                              fullWidth
                            />
                          )}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Leave empty if sold outside of Millennium Market
                        </p>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSaleOpen(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleMarkSold}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                          Complete Sale
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !error ? (
              <LoadingViewPage />
            ) : (
              <p className="text-center">Error loading sale, please try again.</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
