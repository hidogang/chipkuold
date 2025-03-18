import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { SpinWheel } from "@/components/ui/spin-wheel";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { dailySpinRewards, superJackpotRewards } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function FloatingSpinButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Get spin status
  const spinStatusQuery = useQuery({
    queryKey: ["/api/spin/status"],
    queryFn: ({ signal }) => apiRequest("GET", "/api/spin/status", undefined, { signal }),
    refetchInterval: 1000, // Update countdown every second
  });

  // Get spin history
  const spinHistoryQuery = useQuery({
    queryKey: ["/api/spin/history"],
    queryFn: ({ signal }) => apiRequest("GET", "/api/spin/history", undefined, { signal }),
  });

  // Daily spin mutation
  const dailySpinMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/spin/daily"),
    onSuccess: () => {
      toast({
        title: "Spin successful!",
        description: "Check your rewards below.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to spin",
        variant: "destructive",
      });
    },
  });

  // Super jackpot spin mutation
  const superSpinMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/spin/super"),
    onSuccess: () => {
      toast({
        title: "Super Jackpot Spin successful!",
        description: "Check your rewards below.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to spin",
        variant: "destructive",
      });
    },
  });

  // Buy extra spins mutation
  const buySpinsMutation = useMutation({
    mutationFn: (quantity: number) => apiRequest("POST", "/api/spin/buy", { quantity }),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Extra spins purchased successfully.",
      });
      setShowPurchaseModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase spins",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed left-4 bottom-24 md:bottom-20 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        <img 
          src="/assets/spin-wheel-icon.png" 
          className="w-10 h-10 relative z-10 transform group-hover:rotate-180 transition-transform duration-500" 
          alt="Spin" 
        />
      </motion.button>

      {/* Spin Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-b from-amber-50/90 to-white backdrop-blur-sm border-amber-200">
          <DialogTitle className="text-2xl font-bold text-amber-900 mb-2">Lucky Spin Wheel</DialogTitle>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-800 font-medium">
                  {spinStatusQuery.data?.canSpinDaily ? (
                    "🎉 Free spin available!"
                  ) : (
                    `⏳ Next free spin in: ${formatDistanceToNow(Date.now() + (spinStatusQuery.data?.timeUntilNextSpin || 0))}`
                  )}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Extra spins available: {spinStatusQuery.data?.extraSpinsAvailable || 0}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "daily" ? "default" : "outline"}
                  onClick={() => setActiveTab("daily")}
                  className={activeTab === "daily" ? "bg-amber-500 hover:bg-amber-600" : ""}
                >
                  Daily Spin
                </Button>
                <Button
                  variant={activeTab === "super" ? "default" : "outline"}
                  onClick={() => setActiveTab("super")}
                  className={activeTab === "super" ? "bg-amber-500 hover:bg-amber-600" : ""}
                >
                  Super Jackpot
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              {activeTab === "daily" ? (
                <SpinWheel
                  onSpin={dailySpinMutation.mutateAsync}
                  rewards={dailySpinRewards}
                  isSpinning={dailySpinMutation.isPending}
                  spinType="daily"
                />
              ) : (
                <SpinWheel
                  onSpin={superSpinMutation.mutateAsync}
                  rewards={superJackpotRewards}
                  isSpinning={superSpinMutation.isPending}
                  spinType="super"
                />
              )}
            </div>

            {/* Purchase Options */}
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                {activeTab === "daily" ? "Purchase Extra Spins" : "Super Jackpot Entry"}
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                {activeTab === "daily" 
                  ? "Get more chances to win with extra spins! Each spin costs 2 USDT."
                  : "Try your luck at amazing rewards! Each super jackpot spin costs 10 USDT."}
              </p>
              <div className="flex gap-2">
                {activeTab === "daily" && (
                  <>
                    <Button 
                      onClick={() => buySpinsMutation.mutate(1)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      disabled={buySpinsMutation.isPending}
                    >
                      Buy 1 Spin (2 USDT)
                    </Button>
                    <Button 
                      onClick={() => buySpinsMutation.mutate(5)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      disabled={buySpinsMutation.isPending}
                    >
                      Buy 5 Spins (10 USDT)
                    </Button>
                  </>
                )}
                {activeTab === "super" && (
                  <Button 
                    onClick={() => superSpinMutation.mutate()}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    disabled={superSpinMutation.isPending}
                  >
                    Try Super Jackpot (10 USDT)
                  </Button>
                )}
              </div>
            </div>

            {/* Spin History */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Recent Spins</h3>
              <div className="space-y-4">
                {spinHistoryQuery.data?.map((spin) => (
                  <div key={spin.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {spin.spinType === "daily" ? "Daily Spin" : "Super Jackpot"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(spin.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {spin.rewardType === "usdt" ? `$${spin.rewardAmount} USDT` :
                           spin.rewardType === "chicken" ? `${spin.chickenType} Chicken` :
                           `${spin.rewardAmount} ${spin.rewardType}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {!spinHistoryQuery.data?.length && (
                  <p className="text-center text-muted-foreground py-8">
                    No spins yet. Try your luck now!
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}