import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
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
import NotFound from "@/pages/not-found";

function LoadingScreen({ onFinishLoading }: { onFinishLoading: () => void }) {
  const [progress, setProgress] = useState(0);
  const [animationStage, setAnimationStage] = useState<'initial' | 'smallLogo' | 'transition' | 'largeLogo' | 'complete'>('initial');
  const smallLogoRef = useRef<HTMLImageElement>(null);
  const largeLogoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Backup safety timer to ensure we always exit the loading screen
    const safetyTimer = setTimeout(() => {
      console.log("Safety timer triggered - forcing completion");
      onFinishLoading();
    }, 8000);

    // Animation stages timing (shorter timings)
    const timelines = {
      smallLogo: setTimeout(() => setAnimationStage('smallLogo'), 100),
      transition: setTimeout(() => setAnimationStage('transition'), 900),
      largeLogo: setTimeout(() => setAnimationStage('largeLogo'), 1700),
      complete: setTimeout(() => {
        setAnimationStage('complete');
        // Shorter wait before finishing
        setTimeout(() => onFinishLoading(), 800);
      }, 2500)
    };

    // Progress bar animation - faster increments
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = 
          animationStage === 'initial' ? 10 :
          animationStage === 'smallLogo' ? 15 :
          animationStage === 'transition' ? 25 :
          animationStage === 'largeLogo' ? 30 : 35;
        
        const newProgress = prev + (Math.random() * increment * 0.5) + (increment * 0.5);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Ensure we complete loading when progress bar is full
          if (animationStage !== 'complete') {
            setTimeout(() => onFinishLoading(), 500);
          }
          return 100;
        }
        
        return newProgress;
      });
    }, 100); // Faster interval

    return () => {
      // Clear all timers on unmount
      clearTimeout(safetyTimer);
      Object.values(timelines).forEach(timer => clearTimeout(timer));
      clearInterval(interval);
    };
  }, [onFinishLoading]);

  // Get loading message based on animation stage
  const getLoadingMessage = () => {
    switch (animationStage) {
      case 'initial':
        return 'Initializing...';
      case 'smallLogo':
        return 'Preparing your chicken farm...';
      case 'transition':
        return 'Getting your chickens ready...';
      case 'largeLogo':
        return 'Almost there...';
      case 'complete':
        return 'Welcome to ChickFarms!';
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cloud-container">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="cloud cloud-4"></div>
        </div>
        
        {/* Extra decorative elements */}
        <motion.div
          className="absolute right-8 top-20 w-24 h-24 opacity-20"
          initial={{ rotate: 0, scale: 0.8 }}
          animate={{ 
            rotate: 360,
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <img src="/assets/cloud.svg" alt="" />
        </motion.div>
        
        <motion.div
          className="absolute left-12 bottom-32 w-20 h-20 opacity-15"
          initial={{ rotate: 0, scale: 0.7 }}
          animate={{ 
            rotate: -360,
            scale: [0.7, 1, 0.7]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <img src="/assets/cloud.svg" alt="" />
        </motion.div>
      </div>
      
      {/* Main animation container */}
      <div className="relative w-64 h-64 mb-6">
        {/* Small logo fades in first */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ 
            scale: animationStage === 'initial' ? 0.8 : 
                  animationStage === 'smallLogo' ? 1 : 
                  animationStage === 'transition' ? 0.9 : 0.8,
            opacity: animationStage === 'initial' ? 0 : 
                    animationStage === 'smallLogo' ? 1 : 
                    animationStage === 'transition' ? 0.5 : 0,
            y: animationStage === 'transition' ? -20 : 0
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <img
            ref={smallLogoRef}
            src="/assets/chickfarms-logo.png"
            alt="ChickFarms Small"
            className="w-32 h-32 object-contain"
          />
          
          {/* Glow effect around small logo during transition */}
          {animationStage === 'transition' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                scale: [1, 1.4, 1.8]
              }}
              transition={{ duration: 1.5, repeat: 1, ease: "easeOut" }}
              style={{ 
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0) 70%)',
                filter: 'blur(10px)'
              }}
            />
          )}
        </motion.div>
        
        {/* Large logo appears during transition */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ 
            scale: animationStage === 'transition' ? 1.2 : 
                  animationStage === 'largeLogo' || animationStage === 'complete' ? 1 : 1.5,
            opacity: animationStage === 'transition' ? 0.3 : 
                    animationStage === 'largeLogo' ? 1 :
                    animationStage === 'complete' ? 1 : 0
          }}
          transition={{ 
            duration: animationStage === 'transition' ? 1 : 0.8, 
            ease: "easeInOut"
          }}
        >
          <img
            ref={largeLogoRef}
            src="/assets/chickfarms-logo.png"
            alt="ChickFarms Large"
            className="w-48 h-48 object-contain"
          />
          
          {/* Subtle pulsing animation when large logo is active */}
          {(animationStage === 'largeLogo' || animationStage === 'complete') && (
            <motion.div
              className="absolute inset-0"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [1, 0.9, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
            >
              <img
                src="/assets/chickfarms-logo.png"
                alt=""
                className="w-48 h-48 object-contain"
                style={{ opacity: 0.2 }}
              />
            </motion.div>
          )}
        </motion.div>
        
        {/* Celebration particles when complete */}
        {animationStage === 'complete' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amber-400"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200, 
                  y: (Math.random() - 0.5) * 200,
                  scale: Math.random() * 2 + 0.5,
                  opacity: 0
                }}
                transition={{ 
                  duration: Math.random() * 1 + 0.5, 
                  ease: "easeOut"
                }}
                style={{
                  top: '50%',
                  left: '50%',
                  backgroundColor: `hsl(${Math.random() * 40 + 30}, ${Math.random() * 30 + 70}%, ${Math.random() * 30 + 50}%)`
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Loading text with animation */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-2xl font-bold text-amber-800"
          animate={{ 
            opacity: [0.9, 1, 0.9],
            y: [0, -2, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {getLoadingMessage()}
        </motion.h2>
      </motion.div>
      
      {/* Progress bar with animated gradient */}
      <div className="w-64 h-2.5 bg-amber-100 rounded-full overflow-hidden shadow-inner relative z-10">
        <motion.div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f59e0b, #ea580c, #f59e0b)',
            backgroundSize: '200% 100%'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
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
          {isPortrait && (
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
              <main className="flex-grow bg-gradient-to-b from-amber-50/50 to-white pt-20 pb-20 md:pb-16 overflow-x-hidden">
                <Router />
              </main>
              <Navigation />
              <Toaster />
            </motion.div>
          )}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;