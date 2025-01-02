import { useState, useEffect } from "react";

const useScreenSize = () => {
  const [isLargerThanSmall, setIsLargerThanSmall] = useState(false);

  useEffect(() => {
    const smallSizeThreshold = 640; // Example: Small size breakpoint for TailwindCSS (sm: 640px)
    // Function to check and set the screen size
    const checkScreenSize = () => {
      setIsLargerThanSmall(window.innerWidth > smallSizeThreshold);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isLargerThanSmall;
};

export default useScreenSize;