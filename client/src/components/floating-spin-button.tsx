import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { dailySpinRewards, superJackpotRewards } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { SpinWheelModal } from "@/components/ui/spin-wheel-modal";

export function FloatingSpinButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDailySpinOpen, setIsDailySpinOpen] = useState(false);
  const [isSuperSpinOpen, setIsSuperSpinOpen] = useState(false);

  // Get spin status
  const spinStatusQuery = useQuery({
    queryKey: ["/api/spin/status"],
    queryFn: () => apiRequest("GET", "/api/spin/status"),
    refetchInterval: 1000, // Update countdown every second
  });

  // Daily spin mutation
  const dailySpinMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/spin/daily"),
    onSuccess: (data) => {
      toast({
        title: "Spin successful!",
        description: `You won ${data.reward.amount} ${data.reward.type}${data.reward.chickenType ? ` ${data.reward.chickenType}` : ''}!`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/spin/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/spin/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      if (data.reward.type === "chicken") {
        queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      } else if (data.reward.type === "usdt") {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      }
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
    onSuccess: (data) => {
      toast({
        title: "Super Jackpot Spin successful!",
        description: `You won ${data.reward.amount} ${data.reward.type}${data.reward.chickenType ? ` ${data.reward.chickenType}` : ''}!`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/spin/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/spin/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      if (data.reward.type === "chicken") {
        queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      } else if (data.reward.type === "usdt") {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to spin",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed left-4 bottom-24 md:bottom-20 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          // If daily spin is available, show that dialog, otherwise show super spin
          if (spinStatusQuery.data?.canSpinDaily || spinStatusQuery.data?.extraSpinsAvailable > 0) {
            setIsDailySpinOpen(true);
          } else {
            setIsSuperSpinOpen(true);
          }
        }}
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

      {/* Daily Spin Modal */}
      <SpinWheelModal
        isOpen={isDailySpinOpen}
        onClose={() => setIsDailySpinOpen(false)}
        onSpin={dailySpinMutation.mutateAsync}
        rewards={dailySpinRewards}
        isSpinning={dailySpinMutation.isPending}
        spinType="daily"
      />

      {/* Super Jackpot Spin Modal */}
      <SpinWheelModal
        isOpen={isSuperSpinOpen}
        onClose={() => setIsSuperSpinOpen(false)}
        onSpin={superSpinMutation.mutateAsync}
        rewards={superJackpotRewards}
        isSpinning={superSpinMutation.isPending}
        spinType="super"
      />
    </>
  );
}