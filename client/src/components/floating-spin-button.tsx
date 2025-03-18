import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { SpinWheel } from "@/components/ui/spin-wheel";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { dailySpinRewards, superJackpotRewards } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function FloatingSpinButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const { toast } = useToast();

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
      <motion.button
        className="fixed left-4 bottom-24 md:bottom-20 z-50 w-16 h-16 rounded-full bg-primary shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <img src="/assets/spin-wheel-icon.png" className="w-10 h-10" alt="Spin" />
      </motion.button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Lucky Spin Wheel</h2>
                <p className="text-muted-foreground">
                  {spinStatusQuery.data?.canSpinDaily ? (
                    "Free spin available!"
                  ) : (
                    `Next free spin in: ${formatDistanceToNow(Date.now() + (spinStatusQuery.data?.timeUntilNextSpin || 0))}`
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "daily" ? "default" : "outline"}
                  onClick={() => setActiveTab("daily")}
                >
                  Daily Spin
                </Button>
                <Button
                  variant={activeTab === "super" ? "default" : "outline"}
                  onClick={() => setActiveTab("super")}
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
