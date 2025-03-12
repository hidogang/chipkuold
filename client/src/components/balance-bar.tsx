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
  
  // Item config with colors and icons
  const items = [
    {
      name: "Water",
      value: resources.waterBuckets,
      icon: <Droplets className="h-5 w-5" />,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      borderColor: "border-blue-300",
      hoverColor: "group-hover:bg-blue-100"
    },
    {
      name: "Wheat",
      value: resources.wheatBags,
      icon: <Wheat className="h-5 w-5" />,
      color: "bg-amber-500",
      textColor: "text-amber-500",
      borderColor: "border-amber-300",
      hoverColor: "group-hover:bg-amber-100"
    },
    {
      name: "Eggs",
      value: resources.eggs,
      icon: <Egg className="h-5 w-5" />,
      color: "bg-orange-500",
      textColor: "text-orange-500",
      borderColor: "border-orange-300",
      hoverColor: "group-hover:bg-orange-100"
    },
    {
      name: "USDT",
      value: user.usdtBalance,
      prefix: "$",
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-green-500",
      textColor: "text-green-500",
      borderColor: "border-green-300",
      hoverColor: "group-hover:bg-green-100"
    },
  ];

  return (
    <div className="sticky top-0 z-20 backdrop-blur-md py-2">
      <motion.div 
        className="flex flex-nowrap gap-1 px-2 py-1 bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-md mx-auto max-w-5xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            className={`relative flex items-center justify-between flex-1 h-12 p-1 rounded-lg border ${item.borderColor} group cursor-pointer transition-all duration-200 hover:shadow-md`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className={`absolute inset-0 rounded-lg opacity-0 ${item.hoverColor} transition-opacity duration-200 group-hover:opacity-100`}></div>
            
            <div className="flex items-center z-10 pl-1">
              <div className={`p-1 rounded-full ${item.color} bg-opacity-20 ${item.textColor} mr-1`}>
                {item.icon}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[10px] leading-none text-muted-foreground font-medium">{item.name}</p>
                <p className="text-base font-bold leading-tight">
                  {item.prefix}{item.value}
                </p>
              </div>
            </div>
            
            <div className={`flex h-5 w-5 rounded-full ${item.color} items-center justify-center text-white text-xs font-bold mr-1`}>
              +
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}