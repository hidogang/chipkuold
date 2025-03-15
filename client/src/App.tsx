import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useState, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/navigation";
import ScrollToTop from "@/components/scroll-to-top";

// Import pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ShopPage from "@/pages/shop-page";
import MarketPage from "@/pages/market-page";
import WalletPage from "@/pages/wallet-page";
import AccountPage from "@/pages/account-page";
import AdminPage from "@/pages/admin-page";
import LandingPage from "@/pages/landing-page";
import NotFound from "@/pages/not-found";

function LoadingScreen({ onFinishLoading }: { onFinishLoading: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Backup safety timer to ensure we always exit the loading screen
    const safetyTimer = setTimeout(() => {
      console.log("Safety timer triggered - forcing completion");
      onFinishLoading();
    }, 5000);

    // Simple animation sequence
    const animation = {
      start: setTimeout(() => {
        // Start fade out when progress is nearly done
        if (progress > 90) {
          handleComplete();
        }
      }, 2200)
    };

    // Progress bar animation - faster increments
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 8 + 12; // Between 12-20 per tick
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          handleComplete();
          return 100;
        }
        
        return newProgress;
      });
    }, 200);

    // Handle animation completion
    const handleComplete = () => {
      setFadeOut(true);
      setTimeout(() => onFinishLoading(), 600);
    };

    return () => {
      // Clear all timers on unmount
      clearTimeout(safetyTimer);
      clearTimeout(animation.start);
      clearInterval(interval);
    };
  }, [onFinishLoading, progress]);

  return (
    <div className={`fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-b from-amber-50 to-orange-50 
      flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cloud-container">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="cloud cloud-4"></div>
        </div>
      </div>
      
      {/* Simple logo animation */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <img
          ref={logoRef}
          src="/assets/chickfarms-logo.png"
          alt="ChickFarms"
          className="w-32 h-32 object-contain"
        />
        
        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ 
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0) 70%)',
            filter: 'blur(8px)',
            zIndex: -1
          }}
        />
      </motion.div>
      
      {/* Loading text with animation */}
      <motion.h2
        className="text-xl font-bold text-amber-800 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Loading your chicken farm...
      </motion.h2>
      
      {/* Simple progress bar */}
      <div className="w-64 h-2.5 bg-amber-100 rounded-full overflow-hidden shadow-inner relative z-10">
        <motion.div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f59e0b, #ea580c)',
          }}
          transition={{ ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function Router() {
  // Get current location path to force remount of components when route changes
  const [locationPath] = useLocation();
  
  return (
    // Key the Switch with location path to force remounting of components when the route changes
    <Switch key={locationPath}>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/market" component={MarketPage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/account" component={AccountPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();
  const isLandingPage = location === "/";

  useEffect(() => {
    // Add an absolute maximum loading time
    const maxLoadingTime = setTimeout(() => {
      setIsLoading(false);
      console.log("Maximum loading time reached - forcing app to start");
    }, 10000);

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => {
      clearTimeout(maxLoadingTime);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const handleFinishLoading = () => {
    setIsLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="township-app min-h-screen bg-background text-foreground overflow-x-hidden">
          <ScrollToTop />
          {isPortrait && !isLandingPage && (
            <div className="rotate-device-message fixed inset-0 bg-amber-900/90 flex flex-col items-center justify-center z-[9000] text-white p-8">
              <RotateCcw className="w-12 h-12 mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
              <p className="text-center">ChickFarms works best in landscape mode. Please rotate your device for the best experience.</p>
            </div>
          )}

          {isLoading ? (
            <LoadingScreen onFinishLoading={handleFinishLoading} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col min-h-screen"
            >
              <main 
                id="main-content"
                className={`flex-grow bg-gradient-to-b from-amber-50/50 to-white overflow-x-hidden ${!isLandingPage ? "pt-20 pb-20 md:pb-16" : ""}`}
              >
                <Router />
              </main>
              {!isLandingPage && <Navigation />}
              <Toaster />
            </motion.div>
          )}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;