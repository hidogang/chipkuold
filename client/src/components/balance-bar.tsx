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

  // Debug log for balance updates
  console.log('[BalanceBar] Current user balance:', user?.usdtBalance);
  console.log('[BalanceBar] Resources query data:', resourcesQuery.data);

  if (!user || resourcesQuery.isLoading) {
    console.log('[BalanceBar] Loading state or no user');
    return null;
  }

  if (resourcesQuery.error) {
    console.error('[BalanceBar] Resources query error:', resourcesQuery.error);
    return null;
  }

  const resources = resourcesQuery.data || { waterBuckets: 0, wheatBags: 0, eggs: 0 };

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
        <ResourceItem 
          name="Water"
          value={resources.waterBuckets}
          icon="/assets/waterbucket.png"
          color="#29B6F6"
          bgColor="rgba(3, 169, 244, 0.1)"
          borderColor="rgba(3, 169, 244, 0.3)"
          iconBg="rgba(41, 182, 246, 0.15)"
          textColor="#01579B"
          index={0}
          onClick={() => {
            console.log("Navigating to shop for water");
            navigate("/shop");
          }}
        />

        {/* Wheat */}
        <ResourceItem 
          name="Wheat"
          value={resources.wheatBags}
          icon="/assets/wheatbag.png"
          color="#FFC107"
          bgColor="rgba(255, 193, 7, 0.1)"
          borderColor="rgba(255, 193, 7, 0.3)"
          iconBg="rgba(255, 193, 7, 0.15)"
          textColor="#FF6F00"
          index={1}
          onClick={() => {
            console.log("Navigating to shop for wheat");
            navigate("/shop");
          }}
        />

        {/* Eggs */}
        <ResourceItem 
          name="Eggs"
          value={resources.eggs}
          icon="/assets/egg.png"
          color="#FFB74D"
          bgColor="rgba(255, 183, 77, 0.1)"
          borderColor="rgba(255, 183, 77, 0.3)"
          iconBg="rgba(255, 183, 77, 0.15)"
          textColor="#E65100"
          index={2}
          onClick={() => {
            console.log("Navigating to home for eggs");
            navigate("/home");
          }}
        />

        {/* USDT */}
        <ResourceItem 
          name="USDT"
          value={user.usdtBalance}
          icon="/assets/tether-usdt-logo.png"
          color="#26A17B"
          bgColor="rgba(38, 161, 123, 0.1)"
          borderColor="rgba(38, 161, 123, 0.3)"
          iconBg="rgba(38, 161, 123, 0.15)"
          textColor="#1A5E45"
          prefix="$"
          index={3}
          onClick={() => {
            console.log("Navigating to wallet for USDT");
            navigate("/wallet");
          }}
        />
      </motion.div>
    </div>
  );
}

interface ResourceItemProps {
  name: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  textColor: string;
  index: number;
  prefix?: string;
  onClick: () => void;
}

function ResourceItem({ 
  name, 
  value, 
  icon, 
  color, 
  bgColor, 
  borderColor, 
  iconBg, 
  textColor, 
  index, 
  prefix, 
  onClick 
}: ResourceItemProps) {
  return (
    <motion.div
      key={name}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="township-resource-item flex-1 mx-1 relative"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "10px",
        padding: "6px 10px",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
        minWidth: 0,
        zIndex: 1
      }}
    >
      <div className="flex items-center">
        <div
          className="flex-shrink-0 mr-2 p-1.5 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${iconBg}, rgba(255,255,255,0.7))`,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
          }}
        >
          <div>
            <img src={icon} alt={name} width="30" height="30" style={{ objectFit: "contain" }} />
          </div>
        </div>
        <div className="min-w-0 flex-grow">
          <div className="text-[10px] whitespace-nowrap font-semibold"
            style={{ color: textColor || "#555" }}
          >
            {name}
          </div>
          <div className="text-sm font-bold truncate"
            style={{ color: textColor || "#333" }}
          >
            {prefix}{value}
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="ml-1 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: `linear-gradient(to bottom, ${color}, ${color}dd)`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
          }}
          onClick={onClick}
        >
          <span className="text-white font-bold text-xs">+</span>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 rounded-lg opacity-50"
        animate={{
          boxShadow: ['0 0 0px rgba(255,255,255,0)', '0 0 5px rgba(255,255,255,0.5)', '0 0 0px rgba(255,255,255,0)']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.7
        }}
      />
    </motion.div>
  );
}