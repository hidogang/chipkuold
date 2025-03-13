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
      icon: <Droplets className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "#3498db",
      bgColor: "rgba(52, 152, 219, 0.2)",
      borderColor: "rgba(52, 152, 219, 0.6)",
      iconBg: "rgba(52, 152, 219, 0.3)",
    },
    {
      name: "Wheat",
      value: resources.wheatBags,
      icon: <Wheat className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "#f39c12",
      bgColor: "rgba(243, 156, 18, 0.2)",
      borderColor: "rgba(243, 156, 18, 0.6)",
      iconBg: "rgba(243, 156, 18, 0.3)",
    },
    {
      name: "Eggs",
      value: resources.eggs,
      icon: <Egg className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "#e67e22",
      bgColor: "rgba(230, 126, 34, 0.2)",
      borderColor: "rgba(230, 126, 34, 0.6)",
      iconBg: "rgba(230, 126, 34, 0.3)",
    },
    {
      name: "USDT",
      value: user.usdtBalance,
      prefix: "$",
      icon: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "#2ecc71",
      bgColor: "rgba(46, 204, 113, 0.2)",
      borderColor: "rgba(46, 204, 113, 0.6)",
      iconBg: "rgba(46, 204, 113, 0.3)",
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-30 py-2 px-3">
      <motion.div 
        className="township-resource-bar mx-auto overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{
          background: "linear-gradient(to bottom, rgba(255, 165, 61, 0.95), rgba(255, 124, 46, 0.9))",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
          display: "flex",
          padding: "8px 12px",
          border: "2px solid rgba(255, 188, 91, 0.7)",
        }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="township-resource-item flex-1 mx-1 relative"
            style={{
              background: item.bgColor,
              borderRadius: "8px",
              padding: "6px 8px",
              border: `1px solid ${item.borderColor}`,
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.3)",
              minWidth: 0,
            }}
          >
            <div className="flex items-center">
              <div 
                className="flex-shrink-0 mr-2 p-1 rounded-full"
                style={{ background: item.iconBg }}
              >
                <div style={{ color: item.color }}>{item.icon}</div>
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-[10px] whitespace-nowrap font-semibold opacity-80" style={{ color: "#fff" }}>
                  {item.name}
                </div>
                <div className="text-sm font-bold truncate" style={{ color: "#fff" }}>
                  {item.prefix}{item.value}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                className="ml-1 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
                style={{ 
                  background: `linear-gradient(to bottom, ${item.color}, ${item.color}cc)`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                <span className="text-white font-bold text-xs">+</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}