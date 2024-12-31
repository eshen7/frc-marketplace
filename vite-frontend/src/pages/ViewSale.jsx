'use client'

import React, { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import Footer from '../components/Footer.jsx'
import { useParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance.js'
import { getDaysUntil, haversine } from '../utils/utils.jsx'
import { FaComments } from 'react-icons/fa'
import ItemCard from '../components/ItemCard.jsx'
import { Skeleton } from "@mui/material";
import { MdOutlineEdit } from 'react-icons/md'
import { LuSave } from 'react-icons/lu'
import SuccessBanner from '../components/SuccessBanner.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'

export default function ViewSale() {
    const { sale_id } = useParams();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sale, setSale] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const [partSales, setPartSales] = useState([]);
    const [loadingPartSales, setLoadingPartSales] = useState(true);

    const scrollContainerRef = useRef(null);

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const [isSaleOwner, setIsSaleOwner] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saleChange, setSaleChange] = useState("");

    const [formData, setFormData] = useState({
        quantity: { val: 0, edited: false },
        ask_price: { val: 0, edited: false },
        condition: { val: "", edited: false },
        additional_info: { val: "", edited: false },
    });

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -272,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 272,
                behavior: "smooth",
            });
        }
    };

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
        const fetchUser = async () => {
            try {
                if (isAuthenticated) {
                    const response = await axiosInstance.get("/users/self/");
                    if (!response.data) {
                        throw new Error('Address or coordinates not found');
                    }
                    setUser(response.data);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        }
        fetchUser();
    }, [isAuthenticated])

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const response = await axiosInstance.get(`/sales/id/${sale_id}/`)
                setSale(response.data);
                setFormData({
                    quantity: { val: response.data.quantity, edited: false },
                    ask_price: { val: response.data.ask_price, edited: false },
                    condition: { val: response.data.condition, edited: false },
                    additional_info: { val: response.data.additional_info, edited: false },
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
            const response = await axiosInstance.get(`/parts/id/${sale.part.id}/sales`);
            setPartSales(response.data);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoadingPartSales(false);
        }
    };

    useEffect(() => {
        if (sale) {
            fetchPartSales();
        }
    }, [sale])

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    }

    const handleSaveClick = async () => {
        try {
            const response = await axiosInstance.put(`/sales/id/${sale_id}/edit/`, formData);

            setFormData({
                quantity: { val: formData.quantity.val, edited: false },
                ask_price: { val: formData.ask_price.val, edited: false },
                condition: { val: formData.condition.val, edited: false },
                additional_info: { val: formData.additional_info.val, edited: false },
            });

            setSale(response.data);
            setIsEditing(false);
            setSaleChange("Sale Updated Successfully.");
        } catch (error) {
            console.error("Error saving sale:", error);
            setSaleChange("Error saving sale, please try again.");
        } finally {
        }
    }

    const closeSaleChangeBanner = () => {
        setSaleChange("");
    }

    return (
        <div className='flex flex-col min-h-screen'>
            {saleChange == "Sale Updated Successfully." ? (
                <SuccessBanner
                    message={saleChange}
                    onClose={closeSaleChangeBanner}
                />
            ) : saleChange != "" ? (
                <ErrorBanner
                    message={saleChange}
                    onClose={closeSaleChangeBanner}
                />
            ) : (
                <></>
            )}
            <TopBar />
            <div className='flex-grow flex flex-col bg-gray-100'>
                <div className='py-8 md:py-16'>
                    {sale && !error ? (
                        <div className='px-5 sm:px-12 md:px-20'>
                            {/* Main Content */}
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
                                {/* Name & Description */}
                                <div className='flex flex-col'>
                                    <div className='flex flex-row'>
                                        {/* Sale Creation Date */}
                                        <p className='text-gray-500 text-sm'>
                                            {(new Date(sale.sale_creation_date)).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Part Name */}
                                    <div className='flex flex-row justify-between place-items-center'>
                                        <h1 className='text-[30px] font-roboto'>
                                            {sale.part.name}
                                        </h1>
                                        {/* Edit Button */}
                                        {isSaleOwner && (
                                            <>
                                                {isEditing ? (
                                                    <button className='rounded-full bg-white text-green-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer'
                                                        onClick={() => handleSaveClick()}>
                                                        <LuSave />
                                                    </button>
                                                ) : (
                                                    <button className='rounded-full bg-white text-blue-500 text-[30px] w-fit p-2
                                                    hover:scale-105 transition duration-100 hover:cursor-pointer'
                                                        onClick={() => handleEditClick()}>
                                                        <MdOutlineEdit />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <h2 className='text-[20px]'>
                                        <a href={sale.part.manufacturer.website} target='_blank'>
                                            <span className='text-blue-600 hover:underline'>
                                                {sale.part.manufacturer.name}
                                            </span>
                                        </a>
                                    </h2>
                                    {/* Quantity & Price */}
                                    <div className='flex flex-row justify-between place-items-center'>
                                        {/* Editing Quantity */}
                                        {isEditing ? (
                                            <div className='flex flex-row justify-between place-items-center'>
                                                <span className=''>
                                                    Qty:
                                                </span>
                                                <input type='number' id='quantity' className={`w-12 ml-2 border-2 ${formData.quantity.edited ? "border-blue-800" : "border-gray-300"}`}
                                                    value={formData.quantity.val}
                                                    onChange={(e) => setFormData({ ...formData, quantity: { val: e.target.value, edited: true } })} />
                                            </div>
                                        ) : (
                                            <p>
                                                Qty: {sale.quantity}
                                            </p>
                                        )}
                                        {/* Editing Price */}
                                        {isEditing ? (
                                            <div className='flex flex-row justify-between place-items-center'>
                                                <span className='text-green-700 text-[24px]'>
                                                    $
                                                </span>
                                                <input type='number' id='ask_price' className={`text-green-700 text-[24px] w-28 border-2 ${formData.ask_price.edited ? "border-blue-800" : "border.gray.300"}`}
                                                    value={formData.ask_price.val}
                                                    onChange={(e) => setFormData({ ...formData, ask_price: { val: e.target.value, edited: true } })} />
                                            </div>
                                        ) : (
                                            // Displaying Price
                                            <p className='text-green-700 text-[24px]'>
                                                {sale.ask_price > 0 ? `$${sale.ask_price}` : sale.ask_price === 0 ? "FREE" : "Trade Wanted"}
                                            </p>
                                        )}

                                    </div>
                                    {/* Additional Info */}
                                    <div className='flex flex-col mt-6'>
                                        <p className='font-semibold'>
                                            Part Description
                                        </p>
                                        <p className='text-gray-500'>
                                            {sale.part.description ? sale.part.description : (
                                                "No description for the part available."
                                            )}
                                        </p>
                                        {/* Condition */}
                                        <div className='mt-4'>
                                            <span className='font-semibold'>Condition:</span> {isEditing ? (
                                                <select type='text' id='condition' className={`w-28 border-2 ${formData.condition.edited ? "border-blue-800" : "border-gray-300"}`}
                                                    value={formData.condition.val}
                                                    onChange={(e) => setFormData({ ...formData, condition: { val: e.target.value, edited: true } })}>
                                                    <option value="new">New</option>
                                                    <option value="like-new">Like New</option>
                                                    <option value="good">Good</option>
                                                    <option value="fair">Fair</option>
                                                    <option value="poor">Poor</option>
                                                </select>
                                            ) : (
                                                <span className='text-gray-500 font-normal'>{sale.condition === "new" ? "New" : sale.condition === "like-new" ? "Like New" : sale.condition === "good" ? "Good" : sale.condition === "fair" ? "Fair" : "Poor"}</span>
                                            )}
                                        </div>
                                        <p className='font-semibold mt-4'>
                                            Additional Info
                                        </p>
                                        <div className='text-gray-500'>
                                            {isEditing ? (
                                                <textarea type='text' id='additional_info'
                                                    rows={2}
                                                    className={`w-full border-2 ${formData.additional_info.edited ? "border-blue-800" : "border-gray-300"} min-h-[32px]`}
                                                    value={formData.additional_info.val}
                                                    onChange={(e) => setFormData({ ...formData, additional_info: { val: e.target.value, edited: true } })} />
                                            ) : (
                                                sale.additional_info ? sale.additional_info : (
                                                    "No additional info for the sale was provided by the user."
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Image */}
                                <div className="relative" style={{ paddingTop: "100%" }}>
                                    {!imageLoaded && (
                                        <Skeleton
                                            variant="rectangular"
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
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
                                        className="absolute top-0 left-0 w-full h-full object-contain"
                                        style={{
                                            display: imageLoaded ? "block" : "none"
                                        }}
                                    />
                                </div>

                                {/* User Stuff */}
                                <div className='col-span-1 md:col-span-2 xl:col-span-1'>
                                    <div className='flex flex-row justify-between place-items-center'>
                                        {/* Team Name */}
                                        <h3 className='text-[24px] text-left md:text-center lg:text-left'>
                                            {sale.user.team_number} | {sale.user.team_name}
                                        </h3>
                                        <div className='rounded-full p-1 bg-gray-300 mr-3 max-w-fit max-h-fit ml-2'>
                                            <img src={sale.user.profile_photo} className='w-[64px] h-[64px] rounded-full' />
                                        </div>
                                    </div>
                                    {/* Distance */}
                                    <div>
                                        <p className='text-sm'>
                                            {user ? (
                                                `${haversine(
                                                    sale.user.formatted_address.latitude,
                                                    sale.user.formatted_address.longitude,
                                                    user.formatted_address.latitude,
                                                    user.formatted_address.longitude
                                                ).toFixed(1)} miles`
                                            ) : ("Log in to view distance")}
                                        </p>
                                    </div>

                                    <div className='flex flex-col mt-3'>
                                        <button className='py-3 px-6 bg-black hover:bg-gray-800 transition duration-200 text-white rounded-md mb-4'>
                                            <a href={`/profile/frc/${sale.user.team_number}`}>
                                                <div className='flex flex-row justify-center place-items-center'>
                                                    <p>Profile Page</p>
                                                </div>
                                            </a>
                                        </button>
                                        <button className='py-3 px-6 bg-blue-700 hover:bg-blue-800 transition duration-200 text-white rounded-md'>
                                            <a href={`/chat/${sale.user.team_number}`}>
                                                <div className='flex flex-row justify-center place-items-center'>
                                                    <FaComments className='mr-3' />
                                                    <p>
                                                        Message
                                                    </p>
                                                </div>
                                            </a>
                                        </button>
                                    </div>

                                </div>
                            </div>

                            {/* Other Sales for the Same Part */}
                            {/* Part Sales Section */}
                            <div className="mt-10 relative">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                    Sales for the same part
                                </h2>
                                <button
                                    onClick={scrollLeft}
                                    className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
                                >
                                    &#8592;
                                </button>
                                {partSales.length > 0 && !loadingPartSales ? (
                                    <div
                                        ref={scrollContainerRef}
                                        className="flex overflow-x-auto space-x-4 pb-4"
                                    >
                                        {partSales
                                            .slice(-10)
                                            .reverse()
                                            .map((sale) => (
                                                <ItemCard
                                                    key={sale.id}
                                                    item={sale}
                                                    currentUser={user}
                                                    type="sale"
                                                />
                                            ))}
                                    </div>
                                ) : loadingPartSales ? (
                                    <>
                                        <p>Loading Part Sales</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">No sales found for this part.</p>
                                )}
                                <button
                                    onClick={scrollRight}
                                    className="absolute right-[-15px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900 z-10"
                                >
                                    &#8594;
                                </button>
                            </div>
                        </div>
                    ) : !error ? (
                        <p className='text-center'>
                            Loading Sale...
                        </p>
                    ) : (
                        <p className='text-center'>
                            Error loading sale, please try again.
                        </p>
                    )}
                </div>
            </div>
            <Footer />
        </div >
    )
}