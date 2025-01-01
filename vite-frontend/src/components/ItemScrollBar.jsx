import React, { useRef } from 'react'
import ItemCard from './ItemCard';

const ItemScrollBar = ({ items, loadingItems, user, loadingUser, type }) => {
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
    return (
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
                {!loadingItems && !loadingUser && items.length !== 0 ? (
                    items
                        .slice(-10)
                        .reverse()
                        .map((item) => (
                            <div key={item.id} className="flex-none w-[272px]">
                                <ItemCard
                                    item={item}
                                    currentUser={user}
                                    type={type}
                                />
                            </div>
                        ))
                ) : items.length === 0 ? (
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
    )
}

export default ItemScrollBar