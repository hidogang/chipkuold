import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Resource } from "@shared/schema";
import { motion } from "framer-motion";
import React from "react";
import { useLocation } from "wouter";

export default function BalanceBar() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const resourcesQuery = useQuery<Resource>({
    queryKey: ["/api/resources"],
    staleTime: 0, // Always fetch fresh data
    retry: 2, // Retry failed requests twice
  });

  if (!user || resourcesQuery.isLoading) {
    return null;
  }

  if (resourcesQuery.error) {
    return null;
  }

  const resources = resourcesQuery.data || { waterBuckets: 0, wheatBags: 0, eggs: 0 };

  // Navigation handlers
  const goToShop = () => {
    window.location.href = "/shop";
  };

  const goToHome = () => {
    window.location.href = "/home";
  };

  const goToWallet = () => {
    window.location.href = "/wallet";
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-transparent">
      <motion.div
        className="township-resource-bar max-w-4xl mx-auto overflow-hidden my-2 px-3"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{
          background: "linear-gradient(to bottom, rgba(255, 165, 61, 0.95), rgba(255, 124, 46, 0.9))",
          borderRadius: "16px",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
          display: "flex",
          padding: "10px 12px",
          border: "2px solid rgba(255, 208, 91, 0.7)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-md" />
          <div className="absolute -left-2 -bottom-2 w-10 h-10 bg-white/10 rounded-full blur-md" />
          <div className="absolute top-1/2 -translate-y-1/2 right-6 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute top-1/3 -translate-y-1/2 left-10 w-2 h-2 bg-white/20 rounded-full" />
        </div>

        {/* Water */}
        <div className="township-resource-item flex-1 mx-1 relative"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "10px",
            padding: "6px 10px",
            border: "1px solid rgba(3, 169, 244, 0.3)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            minWidth: 0,
            zIndex: 1
          }}
        >
          <div className="flex items-center">
            <div
              className="flex-shrink-0 mr-2 p-1.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(41, 182, 246, 0.15), rgba(255,255,255,0.7))",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <img src="/assets/waterbucket.png" alt="Water" width="30" height="30" style={{ objectFit: "contain" }} />
              </div>
            </div>
            <div className="min-w-0 flex-grow">
              <div className="text-[10px] whitespace-nowrap font-semibold" style={{ color: "#01579B" }}>
                Water
              </div>
              <div className="text-sm font-bold truncate" style={{ color: "#01579B" }}>
                {resources.waterBuckets}
              </div>
            </div>
            <button
              onClick={goToShop}
              className="ml-1 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: "linear-gradient(to bottom, #29B6F6, #29B6F6dd)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                border: "none"
              }}
            >
              <span className="text-white font-bold text-xs">+</span>
            </button>
          </div>
        </div>

        {/* Wheat */}
        <div className="township-resource-item flex-1 mx-1 relative"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "10px",
            padding: "6px 10px",
            border: "1px solid rgba(255, 193, 7, 0.3)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            minWidth: 0,
            zIndex: 1
          }}
        >
          <div className="flex items-center">
            <div
              className="flex-shrink-0 mr-2 p-1.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255,255,255,0.7))",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <img src="/assets/wheatbag.png" alt="Wheat" width="30" height="30" style={{ objectFit: "contain" }} />
              </div>
            </div>
            <div className="min-w-0 flex-grow">
              <div className="text-[10px] whitespace-nowrap font-semibold" style={{ color: "#FF6F00" }}>
                Wheat
              </div>
              <div className="text-sm font-bold truncate" style={{ color: "#FF6F00" }}>
                {resources.wheatBags}
              </div>
            </div>
            <button
              onClick={goToShop}
              className="ml-1 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: "linear-gradient(to bottom, #FFC107, #FFC107dd)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                border: "none"
              }}
            >
              <span className="text-white font-bold text-xs">+</span>
            </button>
          </div>
        </div>

        {/* Eggs */}
        <div className="township-resource-item flex-1 mx-1 relative"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "10px",
            padding: "6px 10px",
            border: "1px solid rgba(255, 183, 77, 0.3)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            minWidth: 0,
            zIndex: 1
          }}
        >
          <div className="flex items-center">
            <div
              className="flex-shrink-0 mr-2 p-1.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(255, 183, 77, 0.15), rgba(255,255,255,0.7))",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <img src="/assets/egg.png" alt="Eggs" width="30" height="30" style={{ objectFit: "contain" }} />
              </div>
            </div>
            <div className="min-w-0 flex-grow">
              <div className="text-[10px] whitespace-nowrap font-semibold" style={{ color: "#E65100" }}>
                Eggs
              </div>
              <div className="text-sm font-bold truncate" style={{ color: "#E65100" }}>
                {resources.eggs}
              </div>
            </div>
            <button
              onClick={goToHome}
              className="ml-1 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: "linear-gradient(to bottom, #FFB74D, #FFB74Ddd)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                border: "none"
              }}
            >
              <span className="text-white font-bold text-xs">+</span>
            </button>
          </div>
        </div>

        {/* USDT */}
        <div className="township-resource-item flex-1 mx-1 relative"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "10px",
            padding: "6px 10px",
            border: "1px solid rgba(38, 161, 123, 0.3)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            minWidth: 0,
            zIndex: 1
          }}
        >
          <div className="flex items-center">
            <div
              className="flex-shrink-0 mr-2 p-1.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(38, 161, 123, 0.15), rgba(255,255,255,0.7))",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <img src="/assets/tether-usdt-logo.png" alt="USDT" width="30" height="30" style={{ objectFit: "contain" }} />
              </div>
            </div>
            <div className="min-w-0 flex-grow">
              <div className="text-[10px] whitespace-nowrap font-semibold" style={{ color: "#1A5E45" }}>
                USDT
              </div>
              <div className="text-sm font-bold truncate" style={{ color: "#1A5E45" }}>
                ${user.usdtBalance}
              </div>
            </div>
            <button
              onClick={goToWallet}
              className="ml-1 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: "linear-gradient(to bottom, #26A17B, #26A17Bdd)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                border: "none"
              }}
            >
              <span className="text-white font-bold text-xs">+</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}