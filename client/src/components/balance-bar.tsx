import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Resource } from "@shared/schema";
import { motion } from "framer-motion";
import { Droplets, Wheat, Egg, DollarSign } from "lucide-react";

export default function BalanceBar() {
  const { user } = useAuth();

  const resourcesQuery = useQuery<Resource>({
    queryKey: ["/api/resources"],
  });

  if (!user || resourcesQuery.isLoading) return null;

  const resources = resourcesQuery.data || { waterBuckets: 0, wheatBags: 0, eggs: 0 };
  
  // Item config with colors and icons for Township style
  const items = [
    {
      name: "Water",
      value: resources.waterBuckets,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.5 8 3 12.5 3 16.5C3 20.5 7 24 12 24C17 24 21 20.5 21 16.5C21 12.5 17.5 8 12 2Z" fill="#4FC3F7" />
          <path d="M12 22C8.13 22 5 19.5 5 16.5C5 13.87 7.61 10.44 12 6.25C16.39 10.44 19 13.87 19 16.5C19 19.5 15.87 22 12 22Z" fill="#81D4FA" />
          <path d="M12 19C10.35 19 9 17.65 9 16C9 14.35 10.35 13 12 13C13.65 13 15 14.35 15 16C15 17.65 13.65 19 12 19Z" fill="#E1F5FE" />
        </svg>
      ),
      color: "#29B6F6",
      bgColor: "rgba(3, 169, 244, 0.1)",
      borderColor: "rgba(3, 169, 244, 0.3)", 
      iconBg: "rgba(41, 182, 246, 0.15)",
      textColor: "#01579B"
    },
    {
      name: "Wheat",
      value: resources.wheatBags,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.5 5H10.5L12 2Z" fill="#FFA000" />
          <path d="M12 5V9M15 12H9M8 15L16 15M12 18V22" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" />
          <path d="M19.5 10C19.5 14.75 16.5 18.5 12 18.5C7.5 18.5 4.5 14.75 4.5 10C4.5 5.25 7.5 5 12 5C16.5 5 19.5 5.25 19.5 10Z" fill="#FFECB3" />
          <path d="M15 10C15 12.75 13.75 15 12 15C10.25 15 9 12.75 9 10C9 7.25 10.25 8.5 12 8.5C13.75 8.5 15 7.25 15 10Z" fill="#FFC107" />
        </svg>
      ),
      color: "#FFC107",
      bgColor: "rgba(255, 193, 7, 0.1)",
      borderColor: "rgba(255, 193, 7, 0.3)",
      iconBg: "rgba(255, 193, 7, 0.15)",
      textColor: "#FF6F00"
    },
    {
      name: "Eggs",
      value: resources.eggs,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="14" rx="9" ry="8" fill="#FFF9C4" />
          <ellipse cx="12" cy="14" rx="8" ry="7" fill="#FFFDE7" />
          <ellipse cx="12" cy="7" rx="6" ry="5" fill="#FAFAFA" />
          <path d="M12 4C15.866 4 19 8.032 19 13C19 17.968 15.866 22 12 22C8.13401 22 5 17.968 5 13C5 8.032 8.13401 4 12 4Z" stroke="#FFCC80" strokeWidth="1.5" />
        </svg>
      ),
      color: "#FFB74D",
      bgColor: "rgba(255, 183, 77, 0.1)",
      borderColor: "rgba(255, 183, 77, 0.3)",
      iconBg: "rgba(255, 183, 77, 0.15)",
      textColor: "#E65100"
    },
    {
      name: "USDT",
      value: user.usdtBalance,
      prefix: "$",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FFCA28" />
          <circle cx="12" cy="12" r="8" fill="#FFD54F" />
          <path d="M12 6V18M8 10H16M8 14H16" stroke="#FF6F00" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      color: "#FFB300",
      bgColor: "rgba(255, 179, 0, 0.1)",
      borderColor: "rgba(255, 179, 0, 0.3)",
      iconBg: "rgba(255, 179, 0, 0.15)",
      textColor: "#E65100"
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-30 py-2 px-3">
      <motion.div 
        className="township-resource-bar max-w-4xl mx-auto overflow-hidden"
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
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-md" />
          <div className="absolute -left-2 -bottom-2 w-10 h-10 bg-white/10 rounded-full blur-md" />
          <div className="absolute top-1/2 -translate-y-1/2 right-6 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute top-1/3 -translate-y-1/2 left-10 w-2 h-2 bg-white/20 rounded-full" />
        </div>
        
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="township-resource-item flex-1 mx-1 relative"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "10px",
              padding: "6px 10px",
              border: `1px solid ${item.borderColor}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
              minWidth: 0,
              zIndex: 1
            }}
          >
            <div className="flex items-center">
              <div 
                className="flex-shrink-0 mr-2 p-1.5 rounded-full"
                style={{ 
                  background: `linear-gradient(135deg, ${item.iconBg}, rgba(255,255,255,0.7))`,
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
                }}
              >
                <div>{item.icon}</div>
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-[10px] whitespace-nowrap font-semibold" 
                  style={{ color: item.textColor || "#555" }}
                >
                  {item.name}
                </div>
                <div className="text-sm font-bold truncate" 
                  style={{ color: item.textColor || "#333" }}
                >
                  {item.prefix}{item.value}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="ml-1 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
                style={{ 
                  background: `linear-gradient(to bottom, ${item.color}, ${item.color}dd)`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                }}
              >
                <span className="text-white font-bold text-xs">+</span>
              </motion.div>
            </div>
            
            {/* Subtle glowing effect */}
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
        ))}
      </motion.div>
    </div>
  );
}