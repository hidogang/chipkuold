import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Price, Resource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import BalanceBar from "@/components/balance-bar";
import { motion } from "framer-motion";
import { ShoppingCart, Info, Droplet, Wheat, Egg } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MarketPage() {
  const { toast } = useToast();
  const [quantities, setQuantities] = useState({
    water_bucket: 1,
    wheat_bag: 1,
    eggs: 1
  });

  // Track if input field is currently being edited
  const [inputActive, setInputActive] = useState({
    water_bucket: false,
    wheat_bag: false,
    eggs: false
  });

  // Add scroll reset effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pricesQuery = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const resourcesQuery = useQuery<Resource>({
    queryKey: ["/api/resources"],
  });

  const buyResourceMutation = useMutation({
    mutationFn: async ({ itemType, quantity }: { itemType: string, quantity: number }) => {
      const res = await apiRequest("POST", "/api/market/buy", { itemType, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Success",
        description: "Resources purchased successfully!",
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

  const sellEggsMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const res = await apiRequest("POST", "/api/market/sell", { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Success",
        description: "Eggs sold successfully!",
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
    const price = pricesQuery.data?.find(p => p.itemType === type);
    return price ? parseFloat(price.price) : 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <BalanceBar />

      <motion.div
        className="flex-grow space-y-4 sm:space-y-6 px-2 sm:px-4 pb-20 md:pb-16 overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Market Title Section */}
        <div className="relative pt-4">
          <motion.div
            className="absolute inset-0 bg-blue-500/10 rounded-lg -z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
          <div className="flex items-center space-x-2 p-2 sm:p-3">
            <div className="bg-blue-500 rounded-full p-2 text-white">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-blue-800">ChickFarms Market</h1>
              <p className="text-sm text-blue-700">Buy resources and sell your eggs!</p>
            </div>
          </div>
        </div>

        {/* Market Information Banner */}
        <motion.div
          className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start">
            <Info className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" size={18} />
            <p className="text-sm text-blue-800">
              Buy water and wheat to feed your chickens. Sell eggs to earn money and invest in more chickens!
              Market prices update periodically, so check back often for the best deals.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Water Resource Card */}
          <motion.div
            className="chickfarms-shop-item"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md border border-gray-100 bg-white">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 right-0 h-28 z-0 bg-gradient-to-r from-blue-100 to-blue-50" />

              {/* Resource title & image */}
              <div className="relative pt-4 pb-2 px-4 flex flex-col items-center z-10">
                <motion.div
                  className="w-20 h-20 mb-2 bg-blue-100 rounded-full flex items-center justify-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                >
                  <Droplet size={40} className="text-blue-500" />
                </motion.div>

                <h3 className="text-lg font-bold mb-1 text-center text-blue-700">
                  Water Buckets
                </h3>

                <div className="text-xs px-3 py-1 rounded-full mb-1 font-semibold bg-blue-100 text-blue-800">
                  Essential for your chickens
                </div>
              </div>

              {/* Buy section */}
              <div className="bg-gray-50 p-3 space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-white p-2 rounded border border-gray-100 cursor-help">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Price:</span>
                          <span className="text-base font-bold text-blue-600">
                            ${getPrice("water_bucket").toFixed(2)} each
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current market price for water buckets</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className="h-10 text-center font-medium"
                    value={inputActive.water_bucket ? quantities.water_bucket : quantities.water_bucket || ""}
                    onFocus={() => setInputActive({...inputActive, water_bucket: true})}
                    onBlur={() => {
                      setInputActive({...inputActive, water_bucket: false});
                      if (!quantities.water_bucket) {
                        setQuantities({...quantities, water_bucket: 1});
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                      setQuantities({
                        ...quantities,
                        water_bucket: value
                      });
                    }}
                  />
                  <div className="bg-blue-50 px-3 py-2 rounded font-bold text-blue-700">
                    ${(getPrice("water_bucket") * (quantities.water_bucket || 0)).toFixed(2)}
                  </div>
                </div>

                <motion.button
                  onClick={() => buyResourceMutation.mutate({
                    itemType: "water_bucket",
                    quantity: quantities.water_bucket
                  })}
                  disabled={buyResourceMutation.isPending}
                  className="w-full py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={16} />
                  <span>Buy Water</span>
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
          </motion.div>

          {/* Wheat Resource Card */}
          <motion.div
            className="chickfarms-shop-item"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md border border-gray-100 bg-white">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 right-0 h-28 z-0 bg-gradient-to-r from-amber-100 to-amber-50" />

              {/* Resource title & image */}
              <div className="relative pt-4 pb-2 px-4 flex flex-col items-center z-10">
                <motion.div
                  className="w-20 h-20 mb-2 bg-amber-100 rounded-full flex items-center justify-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2.3, repeatType: "reverse" }}
                >
                  <Wheat size={40} className="text-amber-600" />
                </motion.div>

                <h3 className="text-lg font-bold mb-1 text-center text-amber-700">
                  Wheat Bags
                </h3>

                <div className="text-xs px-3 py-1 rounded-full mb-1 font-semibold bg-amber-100 text-amber-800">
                  Premium chicken feed
                </div>
              </div>

              {/* Buy section */}
              <div className="bg-gray-50 p-3 space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-white p-2 rounded border border-gray-100 cursor-help">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Price:</span>
                          <span className="text-base font-bold text-amber-600">
                            ${getPrice("wheat_bag").toFixed(2)} each
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current market price for wheat bags</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className="h-10 text-center font-medium"
                    value={inputActive.wheat_bag ? quantities.wheat_bag : quantities.wheat_bag || ""}
                    onFocus={() => setInputActive({...inputActive, wheat_bag: true})}
                    onBlur={() => {
                      setInputActive({...inputActive, wheat_bag: false});
                      if (!quantities.wheat_bag) {
                        setQuantities({...quantities, wheat_bag: 1});
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                      setQuantities({
                        ...quantities,
                        wheat_bag: value
                      });
                    }}
                  />
                  <div className="bg-amber-50 px-3 py-2 rounded font-bold text-amber-700">
                    ${(getPrice("wheat_bag") * (quantities.wheat_bag || 0)).toFixed(2)}
                  </div>
                </div>

                <motion.button
                  onClick={() => buyResourceMutation.mutate({
                    itemType: "wheat_bag",
                    quantity: quantities.wheat_bag
                  })}
                  disabled={buyResourceMutation.isPending}
                  className="w-full py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={16} />
                  <span>Buy Wheat</span>
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
          </motion.div>

          {/* Egg Selling Card */}
          <motion.div
            className="chickfarms-shop-item"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md border border-gray-100 bg-white">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 right-0 h-28 z-0 bg-gradient-to-r from-yellow-100 to-yellow-50" />

              {/* Resource title & image */}
              <div className="relative pt-4 pb-2 px-4 flex flex-col items-center z-10">
                <motion.div
                  className="w-20 h-20 mb-2 bg-yellow-100 rounded-full flex items-center justify-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, repeatType: "reverse" }}
                >
                  <Egg size={40} className="text-yellow-600" />
                </motion.div>

                <h3 className="text-lg font-bold mb-1 text-center text-yellow-700">
                  Sell Eggs
                </h3>

                <div className="text-xs px-3 py-1 rounded-full mb-1 font-semibold bg-yellow-100 text-yellow-800">
                  Market price: ${getPrice("egg").toFixed(2)} each
                </div>
              </div>

              {/* Sell section */}
              <div className="bg-gray-50 p-3 space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-white p-2 rounded border border-gray-100 cursor-help">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Available:</span>
                          <span className="text-base font-bold text-green-600">
                            {resourcesQuery.data?.eggs || 0} eggs
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of eggs available to sell</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max={resourcesQuery.data?.eggs || 0}
                    className="h-10 text-center font-medium"
                    value={inputActive.eggs ? quantities.eggs : quantities.eggs || ""}
                    onFocus={() => setInputActive({...inputActive, eggs: true})}
                    onBlur={() => {
                      setInputActive({...inputActive, eggs: false});
                      if (!quantities.eggs) {
                        setQuantities({...quantities, eggs: 1});
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                      setQuantities({
                        ...quantities,
                        eggs: value
                      });
                    }}
                  />
                  <div className="bg-green-50 px-3 py-2 rounded font-bold text-green-700">
                    ${(getPrice("egg") * (quantities.eggs || 0)).toFixed(2)}
                  </div>
                </div>

                <motion.button
                  onClick={() => sellEggsMutation.mutate(quantities.eggs)}
                  disabled={sellEggsMutation.isPending || !resourcesQuery.data?.eggs}
                  className="w-full py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={16} />
                  <span>Sell Eggs</span>
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}