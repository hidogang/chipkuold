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
  const [showFarm, setShowFarm] = useState(false);
  const farmLogo = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setShowFarm(true);
          setTimeout(() => {
            onFinishLoading();
          }, 1500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onFinishLoading]);

  return (
    <div className="loading-screen fixed inset-0 z-[9999] bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="cloud-container">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="cloud cloud-4"></div>
      </div>

      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="loading-logo relative z-10"
      >
        <img 
          ref={farmLogo}
          src="/assets/chickworld-logo.svg" 
          alt="ChickWorld" 
          className="w-32 h-32 object-contain"
        />
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="loading-text text-2xl font-bold text-amber-800 mt-4 text-center relative z-10"
      >
        {showFarm ? "Welcome to ChickWorld!" : "Loading your farm..."}
      </motion.h2>

      <div className="loading-progress mt-8 w-64 h-2 bg-amber-100 rounded-full overflow-hidden relative z-10">
        <motion.div 
          className="loading-progress-bar h-full bg-gradient-to-r from-amber-500 to-orange-500"
          style={{ width: `${progress}%` }}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence>
        {showFarm && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-64 h-64 relative">
              <img 
                src="/assets/farm-entrance.svg" 
                alt="Farm" 
                className="w-full h-full object-contain"
                onError={() => {
                  if (farmLogo.current) {
                    farmLogo.current.src = "/assets/chickworld-logo.svg";
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const handleFinishLoading = () => {
    setIsLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="township-app min-h-screen bg-background text-foreground">
          {isPortrait && (
            <div className="rotate-device-message fixed inset-0 bg-amber-900/90 flex flex-col items-center justify-center z-[9000] text-white p-8">
              <RotateCcw className="w-12 h-12 mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
              <p className="text-center">ChickWorld works best in landscape mode. Please rotate your device for the best experience.</p>
            </div>
          )}

          {isLoading ? (
            <LoadingScreen onFinishLoading={handleFinishLoading} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <main className="relative min-h-screen bg-gradient-to-b from-amber-50/50 to-white pt-20 pb-20 md:pb-16">
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