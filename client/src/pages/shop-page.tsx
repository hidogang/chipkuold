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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import React from "react";
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

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
    description: "A starter box with eggs rewards",
    image: "/assets/basic-box.png",
    color: "purple",
    rewards: [
      "5-10 eggs (50% chance)",
      "11-15 eggs (40% chance)",
      "16-20 eggs (10% chance)"
    ]
  },
  standard: {
    name: "Standard Mystery Box",
    price: 10,
    description: "Better rewards with a chance for a Baby Chicken!",
    image: "/assets/standard-box.png",
    color: "blue",
    rewards: [
      "10-20 eggs (45% chance)",
      "21-30 eggs (35% chance)",
      "31-40 eggs (20% chance)",
      "Baby Chicken (5% chance)"
    ]
  },
  advanced: {
    name: "Advanced Mystery Box",
    price: 20,
    description: "High-value rewards including Chickens and USDT!",
    image: "/assets/advanced-box.png",
    color: "indigo",
    rewards: [
      "20-40 eggs (40% chance)",
      "41-60 eggs (35% chance)",
      "61-80 eggs (20% chance)",
      "Baby/Regular Chicken (8% chance)",
      "2 USDT (2% chance)"
    ]
  },
  legendary: {
    name: "Legendary Mystery Box",
    price: 50,
    description: "Best rewards including Golden Chickens and more USDT!",
    image: "/assets/legendary-box.png",
    color: "amber",
    rewards: [
      "50-100 eggs (35% chance)",
      "101-150 eggs (30% chance)",
      "151-200 eggs (22% chance)",
      "Regular/Golden Chicken (10% chance)",
      "5 USDT (3% chance)"
    ]
  }
};

export default function ShopPage() {
  const { toast } = useToast();
  const [isOpeningBox, setIsOpeningBox] = React.useState(false);
  const [mysteryBoxReward, setMysteryBoxReward] = React.useState<MysteryBoxReward | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const { width, height } = useWindowSize();

  const pricesQuery = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const chickensQuery = useQuery<Chicken[]>({
    queryKey: ["/api/chickens"],
  });

  const chickenCountsQuery = useQuery<{ type: string, count: number }[]>({
    queryKey: ["/api/chickens/counts"],
  });

  const buyChickenMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await apiRequest("POST", "/api/chickens/buy", { type });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
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

  const mysteryBoxRewardsQuery = useQuery<MysteryBoxReward[]>({
    queryKey: ["/api/mystery-box/rewards"],
  });

  const buyMysteryBoxMutation = useMutation({
    mutationFn: async (boxType: string) => {
      return await apiRequest("POST", "/api/mystery-box/buy", { boxType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Mystery box purchased! Check your rewards.",
      });
      handleOpenMysteryBox();
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
      return await apiRequest("POST", "/api/mystery-box/open", {});
    },
    onSuccess: (data: MysteryBoxReward) => {
      setMysteryBoxReward(data);
      queryClient.invalidateQueries({ queryKey: ["/api/mystery-box/rewards"] });
      setTimeout(() => {
        setIsOpeningBox(false);
      }, 2000);
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
      return await apiRequest("POST", `/api/mystery-box/claim/${rewardId}`, {});
    },
    onSuccess: () => {
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
    return price ? parseFloat(price.price) : 50;
  };

  const getChickenCount = (type: string) => {
    const countInfo = chickenCountsQuery.data?.find(c => c.type === type);
    return countInfo?.count || 0;
  };

  const getUserChickensByType = (type: string) => {
    return chickensQuery.data?.filter(c => c.type === type) || [];
  };

  React.useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleOpenMysteryBox = async () => {
    try {
      const result = await openMysteryBoxMutation.mutateAsync();
      if (result.boxType === 'legendary' &&
        (result.rewardType === 'chicken' || result.rewardValue.includes('USDT'))) {
        setShowConfetti(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open mystery box",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="pb-20 md:pb-6 bg-gradient-to-b from-amber-50/50 to-white min-h-screen">
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          colors={['#FFD700', '#FFA500', '#FF4500']}
        />
      )}
      <BalanceBar />

      <motion.div
        className="space-y-6 sm:space-y-8 mt-4 sm:mt-6 px-3 sm:px-6 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
                <div
                  className="absolute top-0 left-0 right-0 h-28 z-0"
                  style={{
                    background: `linear-gradient(135deg, ${chicken.color}30, ${chicken.accentColor}20)`
                  }}
                />

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

                  <div className="bg-white p-2 rounded border border-gray-100 text-center">
                    <div className="text-amber-600 text-xs font-semibold mb-1">Farm Population</div>
                    <div className="flex justify-center items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50">
                        {chickenCountsQuery.isLoading ?
                          "Loading..." :
                          `${getChickenCount(chicken.type)} owned by all farmers`
                        }
                      </Badge>

                      {chickensQuery.data && getUserChickensByType(chicken.type).length > 0 && (
                        <Badge variant="outline" className="bg-green-50 border-green-200">
                          You own: {getUserChickensByType(chicken.type).length}
                        </Badge>
                      )}
                    </div>
                  </div>

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

        <motion.div className="space-y-6 sm:space-y-8 mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
              Mystery Boxes
            </h2>
            <p className="text-gray-600">Unlock epic rewards and rare items!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(MYSTERY_BOX_TYPES).map(([type, box], index) => (
              <motion.div
                key={type}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-b from-white to-gray-50"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 opacity-75"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${
                        type === 'basic' ? '#9333ea40' :
                          type === 'standard' ? '#1c64f240' :
                            type === 'advanced' ? '#4f46e540' :
                              '#f59e0b40'
                      }, transparent)`
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />

                  <div className="relative p-6">
                    {/* Box icon with glow */}
                    <motion.div
                      className="w-32 h-32 mx-auto mb-4 relative"
                      animate={{
                        y: [0, -8, 0],
                        rotate: isOpeningBox ? [0, -5, 5, -5, 5, 0] : 0
                      }}
                      transition={{
                        y: { duration: 2, repeat: Infinity, repeatType: "reverse" },
                        rotate: { duration: 0.5, repeat: isOpeningBox ? 2 : 0 }
                      }}
                    >
                      <div className={`absolute inset-0 rounded-full ${
                        type === 'basic' ? 'bg-purple-500/20' :
                          type === 'standard' ? 'bg-blue-500/20' :
                            type === 'advanced' ? 'bg-indigo-500/20' :
                              'bg-amber-500/20'
                      } blur-xl`} />
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Gift
                          size={64}
                          className={`transform transition-transform ${
                            type === 'basic' ? 'text-purple-500' :
                              type === 'standard' ? 'text-blue-500' :
                                type === 'advanced' ? 'text-indigo-500' :
                                  'text-amber-500'
                          }`}
                        />
                      </div>
                    </motion.div>

                    {/* Box name and price tag */}
                    <div className="relative">
                      <h3 className={`text-2xl font-bold text-center mb-2 ${
                        type === 'basic' ? 'text-purple-700' :
                          type === 'standard' ? 'text-blue-700' :
                            type === 'advanced' ? 'text-indigo-700' :
                              'text-amber-700'
                      }`}>
                        {box.name}
                      </h3>
                      <div className="absolute -top-12 right-0">
                        <div className={`px-4 py-2 rounded-full font-bold text-white shadow-lg ${
                          type === 'basic' ? 'bg-purple-500' :
                            type === 'standard' ? 'bg-blue-500' :
                              type === 'advanced' ? 'bg-indigo-500' :
                                'bg-amber-500'
                        }`}>
                          ${box.price} USDT
                        </div>
                      </div>
                    </div>

                    {/* Box description */}
                    <p className="text-gray-600 text-center text-sm mb-4">
                      {box.description}
                    </p>

                    {/* Rewards list */}
                    <div className={`mt-4 p-4 rounded-lg ${
                      type === 'basic' ? 'bg-purple-50 border border-purple-100' :
                        type === 'standard' ? 'bg-blue-50 border border-blue-100' :
                          type === 'advanced' ? 'bg-indigo-50 border border-indigo-100' :
                            'bg-amber-50 border border-amber-100'
                    }`}>
                      <h4 className="font-semibold text-gray-700 mb-2">Possible Rewards:</h4>
                      <ul className="space-y-2">
                        {box.rewards.map((reward, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              type === 'basic' ? 'bg-purple-400' :
                                type === 'standard' ? 'bg-blue-400' :
                                  type === 'advanced' ? 'bg-indigo-400' :
                                    'bg-amber-400'
                            }`} />
                            {reward}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Buy button */}
                    <motion.button
                      onClick={() => buyMysteryBoxMutation.mutate(type)}
                      disabled={buyMysteryBoxMutation.isPending}
                      className={`
                        mt-6 w-full py-3 px-6 rounded-lg
                        text-white font-bold text-lg
                        disabled:opacity-50
                        flex items-center justify-center gap-2
                        transition-all duration-200
                        ${type === 'basic'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                          : type === 'standard'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                            : type === 'advanced'
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                        }
                        shadow-lg hover:shadow-xl
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {buyMysteryBoxMutation.isPending ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Package size={24} />
                          <span>Buy {box.name}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {mysteryBoxRewardsQuery.data && mysteryBoxRewardsQuery.data.length > 0 && (
          <div className="mt-6 border-t border-purple-100 pt-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Your Unclaimed Rewards</h3>
            <div className="space-y-3">
              {mysteryBoxRewardsQuery.data.map(reward => !reward.claimedAt && (
                <div key={reward.id} className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-purple900">
                      {reward.rewardType === 'usdt' && reward.rewardDetails && 
                        `${(reward.rewardDetails as any).amount} USDT`}
                      {reward.rewardType === 'chicken' && reward.rewardDetails && 
                        `${(reward.rewardDetails as any).chickenType} Chicken`}
                      {reward.rewardType === 'resources' && reward.rewardDetails &&
                        `${(reward.rewardDetails as any).resourceAmount} ${(reward.rewardDetails as any).resourceType}`
                      }
                      {reward.rewardType === 'eggs' && reward.rewardDetails &&
                        `${(reward.rewardDetails as any).minEggs} Eggs`
                      }
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
                    {claimRewardMutation.isPending ? "Claiming..." : "Claim"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <div className="py-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
                  transition={{ duration: 0.6, y: { repeat: Infinity, duration: 1.5 } }}
                  className="w-32 h-32 mx-auto mb-4 flex items-center justify-center"
                >
                  {mysteryBoxReward.rewardType === 'usdt' && (
                    <DollarSign size={80} className="text-green-500" />
                  )}
                  {mysteryBoxReward.rewardType === 'chicken' && mysteryBoxReward.rewardDetails && (
                    <img
                      src={(mysteryBoxReward.rewardDetails as any).chickenType === 'golden'
                        ? '/assets/goldenchicken.png'
                        : (mysteryBoxReward.rewardDetails as any).chickenType === 'regular'
                          ? '/assets/regularchicken.png'
                          : '/assets/babychicken.png'}
                      alt={`${(mysteryBoxReward.rewardDetails as any).chickenType} Chicken`}
                      className="w-full h-full object-contain"
                    />
                  )}
                  {mysteryBoxReward.rewardType === 'resources' && (
                    <img
                      src={(mysteryBoxReward.rewardDetails as any).resourceType === 'water_buckets'
                        ? '/assets/waterbucket.png'
                        : '/assets/wheatbag.png'}
                      alt={(mysteryBoxReward.rewardDetails as any).resourceType}
                      className="w-full h-full object-contain"
                    />
                  )}
                  {mysteryBoxReward.rewardType === 'eggs' && (
                    <img
                      src="/assets/egg.png"
                      alt="Eggs"
                      className="w-full h-full object-contain"
                    />
                  )}
                </motion.div>

                <div className="text-center space-y-4">
                  <div className="text-xl font-bold text-purple-900">
                    {mysteryBoxReward.rewardType === 'usdt' && mysteryBoxReward.rewardDetails &&
                      `${(mysteryBoxReward.rewardDetails as any).amount} USDT`}
                    {mysteryBoxReward.rewardType === 'chicken' && mysteryBoxReward.rewardDetails &&
                      `${(mysteryBoxReward.rewardDetails as any).chickenType} Chicken`}
                    {mysteryBoxReward.rewardType === 'resources' && mysteryBoxReward.rewardDetails &&
                      `${(mysteryBoxReward.rewardDetails as any).resourceAmount} ${(mysteryBoxReward.rewardDetails as any).resourceType}`
                    }
                    {mysteryBoxReward.rewardType === 'eggs' && mysteryBoxReward.rewardDetails &&
                      `${(mysteryBoxReward.rewardDetails as any).minEggs} Eggs`
                    }
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (mysteryBoxReward.id) {
                        claimRewardMutation.mutate(mysteryBoxReward.id);
                      }
                    }}
                    disabled={claimRewardMutation.isPending}
                  >
                    {claimRewardMutation.isPending ? "Claiming Reward..." : "Claim Reward"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}