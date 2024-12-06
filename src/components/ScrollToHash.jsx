import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHash = () => {
  const location = useLocation();

  const scrollToElement = (element) => {
    if (!element) return;

    // Calculate the target position so the element is 150px from the top
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - 150;

    // Scroll to the calculated position
    window.scrollTo({
      top: targetPosition + (window.scrollY < 1200 ? 150 : 0),
      behavior: "smooth", // Enable smooth scrolling
    });
  };

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.substring(1)); // Get the element by ID
      if (target) {
        // Add a small delay to ensure layout adjustments are complete
        setTimeout(() => {
          scrollToElement(target);
        }, 100);
      }
    }
  }, [location.hash]);

  return null; // No UI component is rendered
};

export default ScrollToHash;
