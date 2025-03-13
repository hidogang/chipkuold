import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Reset all possible scroll positions
    const resetAllScrollPositions = () => {
      // 1. Reset window scroll position
      window.scrollTo(0, 0);
      
      // 2. Reset the main content area
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
      
      // 3. Reset any scrollable containers
      const scrollableElements = document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-scroll');
      scrollableElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.scrollTop = 0;
        }
      });
      
      // 4. Reset flex containers that might be scrollable
      const flexContainers = document.querySelectorAll('.flex-1, .flex-grow');
      flexContainers.forEach(element => {
        if (element instanceof HTMLElement && element.scrollHeight > element.clientHeight) {
          element.scrollTop = 0;
        }
      });
    };
    
    // Execute immediately
    resetAllScrollPositions();
    
    // Also execute after a short delay to catch any dynamic content
    setTimeout(resetAllScrollPositions, 100);
  }, [location]);

  return null;
}
