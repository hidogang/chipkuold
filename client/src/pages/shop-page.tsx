import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Price, Chicken, MysteryBoxReward, MysteryBoxContent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BalanceBar from "@/components/balance-bar";
import { motion } from "framer-motion";
import { Info, ShoppingCart, Droplets, Wheat, Egg, DollarSign, Gift, Package } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

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

const MYSTERY_BOX_TYPES = {
  basic: {
    name: "Basic Mystery Box",
    price: 5,
    description: "Contains 5-20 eggs with different drop rates",
    image: "/assets/basic-box.png",
    color: "purple",
    rewards: [
      "5-10 eggs (50% chance)",
      "11-15 eggs (40% chance)",
      "16-20 eggs (10% chance)"
    ]
  },
  advanced: {
    name: "Advanced Mystery Box",
    price: 10,
    description: "Higher egg counts and a chance for a Baby Chicken!",
    image: "/assets/advanced-box.png",
    color: "indigo",
    rewards: [
      "10-20 eggs (40% chance)",
      "21-35 eggs (35% chance)",
      "36-50 eggs (20% chance)",
      "Baby Chicken (5% chance)"
    ]
  },
  legendary: {
    name: "Legendary Mystery Box",
    price: 25,
    description: "Best rewards including Rare Chickens and USDT!",
    image: "/assets/legendary-box.png",
    color: "amber",
    rewards: [
      "50-100 eggs (35% chance)",
      "101-150 eggs (30% chance)",
      "151-200 eggs (22% chance)",
      "Rare Chicken (10% chance)",
      "5 USDT Cashback (3% chance)"
    ]
  }
};

export default function ShopPage() {
  const { toast } = useToast();
  const [isOpeningBox, setIsOpeningBox] = React.useState(false);
  const [mysteryBoxReward, setMysteryBoxReward] = React.useState<MysteryBoxReward | null>(null);

  const pricesQuery = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  // Query to get user's chickens
  const chickensQuery = useQuery<Chicken[]>({
    queryKey: ["/api/chickens"],
  });

  // Query to fetch chicken counts from all users
  const chickenCountsQuery = useQuery<{ type: string, count: number }[]>({
    queryKey: ["/api/chickens/counts"],
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

  const sellChickenMutation = useMutation({
    mutationFn: async (chickenId: number) => {
      const res = await apiRequest("POST", `/api/chickens/sell/${chickenId}`, {});
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate both chickens and user queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chickens/counts"] });
      toast({
        title: "Chicken Sold",
        description: `You received $${data.amount.toFixed(2)} for your chicken!`,
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

  // Mystery box queries and mutations
  const mysteryBoxRewardsQuery = useQuery<MysteryBoxReward[]>({
    queryKey: ["/api/mystery-box/rewards"],
  });

  const buyMysteryBoxMutation = useMutation({
    mutationFn: async (boxType: string) => {
      const res = await apiRequest("POST", "/api/mystery-box/buy", { boxType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Mystery box purchased! Check your rewards.",
      });
      // After purchase, we automatically open the box
      openMysteryBoxMutation.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openMysteryBoxMutation = useMutation({
    mutationFn: async () => {
      setIsOpeningBox(true);
      const res = await apiRequest("POST", "/api/mystery-box/open", {});
      return res.json();
    },
    onSuccess: (data: MysteryBoxReward) => {
      setMysteryBoxReward(data);
      queryClient.invalidateQueries({ queryKey: ["/api/mystery-box/rewards"] });
      setTimeout(() => {
        setIsOpeningBox(false);
      }, 2000); // Add a delay for animation effect
    },
    onError: (error: Error) => {
      setIsOpeningBox(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const res = await apiRequest("POST", `/api/mystery-box/claim/${rewardId}`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mystery-box/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setMysteryBoxReward(null);
      toast({
        title: "Reward Claimed!",
        description: "Your mystery box reward has been added to your account.",
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

  const getMysteryBoxPrice = () => {
    const price = pricesQuery.data?.find(p => p.itemType === "mystery_box");
    return price ? parseFloat(price.price) : 50; // Default to 50 if not found
  };

  // Helper to get the count of a specific chicken type
  const getChickenCount = (type: string) => {
    const countInfo = chickenCountsQuery.data?.find(c => c.type === type);
    return countInfo?.count || 0;
  };

  // Helper to get user's chickens of a specific type
  const getUserChickensByType = (type: string) => {
    return chickensQuery.data?.filter(c => c.type === type) || [];
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

        {/* Sell Chickens Section */}
        {chickensQuery.data && chickensQuery.data.length > 0 && (
          <motion.div
            className="bg-white rounded-lg border border-amber-200 shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white p-3">
              <div className="flex items-center">
                <DollarSign className="text-amber-500 mr-2" size={18} />
                <h2 className="font-bold text-amber-800">Sell Your Chickens</h2>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                You can sell your chickens for 75% of their purchase price. Sold chickens cannot be recovered.
              </p>
            </div>

            <div className="p-3 divide-y divide-amber-100">
              {chickensQuery.data.length === 0 ? (
                <p className="text-center py-4 text-gray-500">You don't have any chickens to sell yet.</p>
              ) : (
                chickensQuery.data.map((chicken) => (
                  <div key={chicken.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <img
                        src={chicken.type === 'golden'
                          ? '/assets/goldenchicken.png'
                          : chicken.type === 'regular'
                            ? '/assets/regularchicken.png'
                            : '/assets/babychicken.png'}
                        alt={`${chicken.type} Chicken`}
                        className="w-10 h-10 mr-3 object-contain"
                      />
                      <div>
                        <div className="font-medium capitalize">{chicken.type} Chicken</div>
                        <div className="text-xs text-gray-500">ID: #{chicken.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-green-600 font-semibold">
                        ${(getPrice(chicken.type) * 0.75).toFixed(2)}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => sellChickenMutation.mutate(chicken.id)}
                        disabled={sellChickenMutation.isPending}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

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

                  {/* Chicken Count Badge */}
                  <div className="bg-white p-2 rounded border border-gray-100 text-center">
                    <div className="text-amber-600 text-xs font-semibold mb-1">Farm Population</div>
                    <div className="flex justify-center items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50">
                        {chickenCountsQuery.isLoading ?
                          "Loading..." :
                          `${getChickenCount(chicken.type)} owned by all farmers`
                        }
                      </Badge>

                      {/* Show user's own chicken count */}
                      {chickensQuery.data && getUserChickensByType(chicken.type).length > 0 && (
                        <Badge variant="outline" className="bg-green-50 border-green-200">
                          You own: {getUserChickensByType(chicken.type).length}
                        </Badge>
                      )}
                    </div>
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

        {/* Mystery Box Section */}
        <motion.div
          className="space-y-6 sm:space-y-8 mt-4 sm:mt-6 px-3 sm:px-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Object.entries(MYSTERY_BOX_TYPES).map(([type, box], index) => (
              <motion.div
                key={type}
                className="chickfarms-shop-item"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + (index * 0.1), duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={`relative overflow-hidden rounded-lg shadow-md border border-${box.color}-200 bg-white`}>
                  <div className={`absolute top-0 left-0 right-0 h-28 z-0 bg-gradient-to-r from-${box.color}-100 to-${box.color}-50`} />

                  <div className="relative pt-6 pb-4 px-4 flex flex-col items-center z-10">
                    <motion.div
                      className={`w-24 h-24 mb-3 bg-${box.color}-100 rounded-full flex items-center justify-center shadow-inner`}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    >
                      <Package size={48} className={`text-${box.color}-500`} />
                    </motion.div>

                    <h3 className={`text-xl font-bold mb-2 text-center text-${box.color}-700`}>
                      {box.name}
                    </h3>

                    <div className={`text-sm px-4 py-1.5 rounded-full mb-1 font-semibold bg-${box.color}-100 text-${box.color}-800`}>
                      {box.description}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Possible Rewards:</h4>
                      <ul className="text-sm space-y-1">
                        {box.rewards.map((reward, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full bg-${box.color}-400`} />
                            <span className="text-gray-600">{reward}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-lg font-bold text-green-600">
                        ${box.price}
                      </div>

                      <motion.button
                        onClick={() => buyMysteryBoxMutation.mutate(type)}
                        disabled={buyMysteryBoxMutation.isPending}
                        className={`px-6 py-2 rounded-lg text-white font-semibold bg-gradient-to-br from-${box.color}-500 to-${box.color}-600 hover:from-${box.color}-600 hover:to-${box.color}-700 transition-all disabled:opacity-50`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {buyMysteryBoxMutation.isPending ? (
                          "Purchasing..."
                        ) : (
                          <>
                            <Gift className="mr-2 h-4 w-4 inline" />
                            Buy Box
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mystery box rewards section */}
        {mysteryBoxRewardsQuery.data && mysteryBoxRewardsQuery.data.length > 0 && (
          <div className="mt-6 border-t border-purple-100 pt-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Your Unclaimed Rewards</h3>
            <div className="space-y-3">
              {mysteryBoxRewardsQuery.data.map(reward => !reward.claimed && (
                <div key={reward.id} className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-purple-900">
                      {reward.rewardDetails.rewardType === 'usdt' && `${reward.rewardDetails.amount} USDT`}
                      {reward.rewardDetails.rewardType === 'chicken' && `${reward.rewardDetails.chickenType} Chicken`}
                      {reward.rewardDetails.rewardType === 'resources' && `${reward.rewardDetails.resourceAmount} ${reward.rewardDetails.resourceType}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Received on {new Date(reward.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => claimRewardMutation.mutate(reward.id)}
                    disabled={claimRewardMutation.isPending}
                  >
                    Claim
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Reward Dialog */}
      <Dialog open={mysteryBoxReward !== null} onOpenChange={() => setMysteryBoxReward(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-purple-800">
              Mystery Box Reward!
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              Congratulations! You've won:
            </DialogDescription>
          </DialogHeader>

          {mysteryBoxReward && (
            <div className="flex flex-col items-center py-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
                transition={{ duration: 0.6, y: { repeat: Infinity, duration: 1.5 } }}
                className="w-32 h-32 mb-4 flex items-center justify-center"
              >
                {mysteryBoxReward.rewardDetails.rewardType === 'usdt' && (
                  <DollarSign size={80} className="text-green-500" />
                )}
                {mysteryBoxReward.rewardDetails.rewardType === 'chicken' && (
                  <img
                    src={mysteryBoxReward.rewardDetails.chickenType === 'golden'
                      ? '/assets/goldenchicken.png'
                      : mysteryBoxReward.rewardDetails.chickenType === 'regular'
                        ? '/assets/regularchicken.png'
                        : '/assets/babychicken.png'}
                    alt="Chicken Reward"
                    className="h-full w-auto object-contain"
                  />
                )}
                {mysteryBoxReward.rewardDetails.rewardType === 'resources' && (
                  <>
                    {mysteryBoxReward.rewardDetails.resourceType === 'water' ? (
                      <img src="/assets/waterbucket.png" alt="Water Bucket" className="h-full w-auto object-contain" />
                    ) : mysteryBoxReward.rewardDetails.resourceType === 'wheat' ? (
                      <Wheat size={80} className="text-amber-500" />
                    ) : (
                      <Egg size={80} className="text-amber-200" />
                    )}
                  </>
                )}
              </motion.div>

              <h3 className="text-xl font-bold text-purple-900 mb-2">
                {mysteryBoxReward.rewardDetails.rewardType === 'usdt' && `${mysteryBoxReward.rewardDetails.amount} USDT`}
                {mysteryBoxReward.rewardDetails.rewardType === 'chicken' && `1 ${mysteryBoxReward.rewardDetails.chickenType} Chicken`}
                {mysteryBoxReward.rewardDetails.rewardType === 'resources' && (
                  `${mysteryBoxReward.rewardDetails.resourceAmount} ${
                    mysteryBoxReward.rewardDetails.resourceType.charAt(0).toUpperCase() +
                    mysteryBoxReward.rewardDetails.resourceType.slice(1)
                  }`
                )}
              </h3>

              <Button
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => claimRewardMutation.mutate(mysteryBoxReward.id)}
                disabled={claimRewardMutation.isPending}
              >
                {claimRewardMutation.isPending ? "Claiming..." : "Claim Your Reward"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}