import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpinWheel } from "@/components/ui/spin-wheel";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { dailySpinRewards, superJackpotRewards } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { X } from "lucide-react";
import BalanceBar from "@/components/balance-bar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function FloatingSpinButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

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
      {/* Floating Action Button - Lower z-index than navigation */}
      <motion.button
        className="fixed left-4 bottom-24 md:bottom-20 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
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

      {/* Full-page Spin View - Lower z-index than navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-background/95 z-40 overflow-y-auto"
          >
            <div className="container mx-auto py-8 px-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-amber-900">Lucky Spin Wheel</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full hover:bg-amber-100"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <BalanceBar />

              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Free Spin</CardTitle>
                      <CardDescription>Get your daily chance to win rewards!</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {spinStatusQuery.data?.canSpinDaily ? (
                        <p className="text-green-600 font-semibold">Free spin available!</p>
                      ) : (
                        <p className="text-muted-foreground">
                          Next free spin in: {formatDistanceToNow(Date.now() + (spinStatusQuery.data?.timeUntilNextSpin || 0))}
                        </p>
                      )}
                      <p className="mt-2">Extra spins available: {spinStatusQuery.data?.extraSpinsAvailable || 0}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Super Jackpot</CardTitle>
                      <CardDescription>Try your luck for amazing rewards!</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">Cost: 10 USDT per spin</p>
                      <p className="text-sm text-muted-foreground mt-2">Win Golden Chickens and big USDT prizes!</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Buy Extra Spins</CardTitle>
                      <CardDescription>Get more chances to win</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">2 USDT per extra spin</p>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => buySpinsMutation.mutate(1)} disabled={buySpinsMutation.isPending}>
                          Buy 1
                        </Button>
                        <Button onClick={() => buySpinsMutation.mutate(5)} disabled={buySpinsMutation.isPending}>
                          Buy 5
                        </Button>
                        <Button onClick={() => buySpinsMutation.mutate(10)} disabled={buySpinsMutation.isPending}>
                          Buy 10
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="daily" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 w-[400px] mx-auto mb-8">
                    <TabsTrigger value="daily">Daily Spin</TabsTrigger>
                    <TabsTrigger value="super">Super Jackpot</TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily" className="flex justify-center">
                    <SpinWheel
                      onSpin={dailySpinMutation.mutateAsync}
                      rewards={dailySpinRewards}
                      isSpinning={dailySpinMutation.isPending}
                      spinType="daily"
                    />
                  </TabsContent>

                  <TabsContent value="super" className="flex justify-center">
                    <SpinWheel
                      onSpin={superSpinMutation.mutateAsync}
                      rewards={superJackpotRewards}
                      isSpinning={superSpinMutation.isPending}
                      spinType="super"
                    />
                  </TabsContent>
                </Tabs>

                {/* Spin History */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Spin History</CardTitle>
                    <CardDescription>Your recent spins and rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}