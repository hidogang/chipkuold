import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Price } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BalanceBar from "@/components/balance-bar";
import { motion } from "framer-motion";
import { Info, ShoppingCart, Droplets, Wheat, Egg } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CHICKEN_TYPES = [
  {
    type: "baby",
    name: "Baby Chicken",
    description: "Produces 2 eggs every 6 hours. Perfect for beginners!",
    requirements: {
      water: 1,
      wheat: 1
    },
    roi: "40 days",
    hatchesPerDay: 4,
    eggsPerDay: 8,
    color: "#FFE082",
    accentColor: "#FFB74D"
  },
  {
    type: "regular",
    name: "Regular Chicken",
    description: "Produces 5 eggs every 5 hours. Balanced investment.",
    requirements: {
      water: 2,
      wheat: 2
    },
    roi: "30 days",
    hatchesPerDay: 4.8,
    eggsPerDay: 24,
    color: "#F5F5F5",
    accentColor: "#BDBDBD"
  },
  {
    type: "golden",
    name: "Golden Chicken",
    description: "Produces 20 eggs every 3 hours. For serious farmers!",
    requirements: {
      water: 10,
      wheat: 15
    },
    roi: "20 days",
    hatchesPerDay: 8,
    eggsPerDay: 160,
    color: "#FFD700",
    accentColor: "#FFC107"
  }
];

export default function ShopPage() {
  const { toast } = useToast();

  const pricesQuery = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const buyChickenMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await apiRequest("POST", "/api/chickens/buy", { type });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both chickens and user queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] }); // Add this line to update balance
      toast({
        title: "Success",
        description: "Chicken purchased successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPrice = (type: string) => {
    const price = pricesQuery.data?.find(p => p.itemType === `${type}_chicken`);
    return price ? parseFloat(price.price) : 0;
  };

  return (
    <div className="pb-20 md:pb-6 bg-gradient-to-b from-amber-50/50 to-white min-h-screen">
      <BalanceBar />

      <motion.div 
        className="space-y-6 sm:space-y-8 mt-4 sm:mt-6 px-3 sm:px-6 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Shop Title Section */}
        <div className="relative">
          <motion.div 
            className="absolute inset-0 bg-amber-500/10 rounded-lg -z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
          <div className="flex items-center space-x-2 p-2 sm:p-3">
            <div className="bg-amber-500 rounded-full p-2 text-white">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-amber-800">ChickFarms Chicken Shop</h1>
              <p className="text-sm text-amber-700">Build your farm with the perfect chickens!</p>
            </div>
          </div>
        </div>

        {/* Information Banner */}
        <motion.div 
          className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start">
            <Info className="text-amber-600 mt-0.5 mr-2 flex-shrink-0" size={18} />
            <p className="text-sm text-amber-800">
              Chickens are your primary source of income. Each chicken requires different resources to produce eggs, 
              which can be sold in the market. The more valuable chickens produce eggs faster, but require more resources.
            </p>
          </div>
        </motion.div>

        {/* Chicken Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CHICKEN_TYPES.map((chicken, index) => (
            <motion.div 
              key={chicken.type}
              className="chickfarms-shop-item"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + (index * 0.1), duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div 
                className="relative overflow-hidden rounded-lg shadow-md border border-gray-100"
                style={{ background: "white" }}
              >
                {/* Card Background */}
                <div 
                  className="absolute top-0 left-0 right-0 h-28 z-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${chicken.color}30, ${chicken.accentColor}20)`
                  }}
                />

                {/* Chicken Image & Name */}
                <div className="relative pt-4 pb-2 px-4 flex flex-col items-center z-10">
                  <motion.div 
                    className="w-24 h-24 mb-2"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2 + (index * 0.3), 
                      repeatType: "reverse"
                    }}
                  >
                    <img 
                      src={chicken.type === 'golden' 
                          ? '/assets/goldenchicken.png' 
                          : chicken.type === 'regular' 
                            ? '/assets/regularchicken.png' 
                            : '/assets/babychicken.png'} 
                      alt={chicken.name}
                      className="w-full h-full object-contain" 
                    />
                  </motion.div>

                  <h3 
                    className="text-lg font-bold mb-1 text-center"
                    style={{ color: chicken.type === 'golden' ? '#B07D00' : '#555' }}
                  >
                    {chicken.name}
                  </h3>

                  <div 
                    className="text-xs px-3 py-1 rounded-full mb-1 font-semibold"
                    style={{ 
                      background: `${chicken.accentColor}30`, 
                      color: chicken.type === 'golden' ? '#B07D00' : '#666' 
                    }}
                  >
                    {chicken.description}
                  </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gray-50 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="bg-white p-2 rounded border border-gray-100 text-center cursor-help">
                            <div className="text-amber-600 text-xs font-semibold mb-1">ROI Period</div>
                            <div className="text-amber-900 font-bold">{chicken.roi}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Time to recover your investment through egg sales</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="bg-white p-2 rounded border border-gray-100 text-center cursor-help">
                            <div className="text-amber-600 text-xs font-semibold mb-1">Eggs/Day</div>
                            <div className="text-amber-900 font-bold">{chicken.eggsPerDay}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Average number of eggs produced per day</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Resource Requirements */}
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <div className="text-amber-600 text-xs font-semibold mb-1 text-center">
                      Required Resources per Hatch
                    </div>
                    <div className="flex justify-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center cursor-help">
                              <img src="/assets/waterbucket.png" alt="Water Bucket" width="16" height="16" className="mr-1" style={{ objectFit: "contain" }} />
                              <span className="text-sm font-semibold">{chicken.requirements.water}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Water buckets needed per egg hatch</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center cursor-help">
                              <Wheat size={16} className="text-amber-500 mr-1" />
                              <span className="text-sm font-semibold">{chicken.requirements.wheat}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Wheat bags needed per egg hatch</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Price & Buy Button */}
                  <div className="flex justify-between items-center pt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-lg font-bold cursor-help" style={{ color: "#43a047" }}>
                            ${getPrice(chicken.type)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current market price for this chicken</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <motion.button
                      onClick={() => buyChickenMutation.mutate(chicken.type)}
                      disabled={buyChickenMutation.isPending}
                      className="chickfarms-buy-button px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-1 relative overflow-hidden"
                      style={{ 
                        background: "linear-gradient(to bottom, #ff9800, #ff7c2e)",
                        border: "1px solid #ffbc5b",
                        boxShadow: "0 2px 4px rgba(255, 159, 67, 0.4)"
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ShoppingCart size={16} />
                      <span>Buy Now</span>
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear"
                        }}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}