import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useState, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/navigation";
import ScrollToTop from "@/components/scroll-to-top";
import { LoadingChickens } from "@/components/ui/loading-chickens";
import { FloatingSpinButton } from "@/components/floating-spin-button";

// Import pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ShopPage from "@/pages/shop-page";
import MarketPage from "@/pages/market-page";
import WalletPage from "@/pages/wallet-page";
import AccountPage from "@/pages/account-page";
import ReferralsPage from "@/pages/referrals-page";
import AdminPage from "@/pages/admin-page";
import LandingPage from "@/pages/landing-page";
import NotFound from "@/pages/not-found";
import ContactUsPage from "@/pages/contact-us";
import TermsOfServicePage from "@/pages/terms-of-service";
import PrivacyPolicyPage from "@/pages/privacy-policy";

function Router() {
  const [locationPath] = useLocation();
  const { isLoading, user } = useAuth();

  // Don't show loading state for public routes
  const isPublicRoute = ["/landing", "/auth", "/contact-us", "/terms-of-service", "/privacy-policy"].includes(locationPath);
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingChickens size="lg" message="Loading ChickFarms..." />
      </div>
    );
  }

  return (
    <Switch key={locationPath}>
      <Route path="/">
        {() => <Redirect to="/landing" />}
      </Route>
      <Route path="/landing" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/contact-us" component={ContactUsPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/chickens" component={ShopPage} />
      <Route path="/marketplace" component={MarketPage} />
      <Route path="/referral">
        {() => <Redirect to={user ? "/account?tab=referral" : "/auth?redirect=/account?tab=referral"} />}
      </Route>
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/market" component={MarketPage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/referrals" component={ReferralsPage} />
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
  const isLandingPage = location === "/" || location === "/landing";

  useEffect(() => {
    const maxLoadingTime = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

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
            <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center z-[9999]">
              <LoadingChickens size="lg" message="Loading ChickFarms..." />
            </div>
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
              {!isLandingPage && (
                <>
                  <Navigation />
                  <FloatingSpinButton />
                </>
              )}
              <Toaster />
            </motion.div>
          )}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;