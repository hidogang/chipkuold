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
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user) return null;

  // Get spin status
  const spinStatusQuery = useQuery({
    queryKey: ["/api/spin/status"],
    queryFn: ({ signal }) => apiRequest("GET", "/api/spin/status", undefined, { signal }),
    refetchInterval: 1000, // Update countdown every second
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}