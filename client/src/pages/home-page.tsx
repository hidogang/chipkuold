import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Chicken, Resource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import BalanceBar from "@/components/balance-bar";
import ChickenCard from "@/components/chicken-card";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');

  // Day-night cycle logic
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('sunset');
      } else {
        setTimeOfDay('night');
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const chickensQuery = useQuery<Chicken[]>({
    queryKey: ["/api/chickens"],
  });

  const resourcesQuery = useQuery<Resource>({
    queryKey: ["/api/resources"],
  });

  const hatchMutation = useMutation({
    mutationFn: async (chickenId: number) => {
      const res = await apiRequest("POST", `/api/chickens/${chickenId}/hatch`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      toast({
        title: "Success",
        description: "Successfully hatched eggs!",
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

  if (chickensQuery.isLoading || resourcesQuery.isLoading) {
    return (
      <div>
        <BalanceBar />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Create a proper Resource type object with required fields
  const resources: Resource = resourcesQuery.data 
    ? resourcesQuery.data 
    : { 
        id: 0, 
        userId: user?.id || 0, 
        waterBuckets: 0, 
        wheatBags: 0, 
        eggs: 0 
      };

  // Background styles based on time of day
  const getBgStyle = () => {
    switch (timeOfDay) {
      case 'day':
        return 'bg-gradient-to-b from-sky-200 to-sky-100';
      case 'sunset':
        return 'bg-gradient-to-b from-orange-300 to-amber-100';
      case 'night':
        return 'bg-gradient-to-b from-indigo-900 to-blue-900 text-white';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBgStyle()}`}>
      <BalanceBar />
      
      {/* Main Game Area */}
      <div className="mt-4 container mx-auto px-4 py-6">
        {!chickensQuery.data?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to your farm!</h2>
              <p className="text-muted-foreground mb-4">
                Start your farming journey by getting your first chicken from the shop.
              </p>
              <Button asChild className="bg-primary/90 hover:bg-primary">
                <Link href="/shop">Visit Shop</Link>
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div>
            <motion.h1 
              className="text-center text-2xl font-bold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {timeOfDay === 'day' 
                ? 'Good Morning! Time to collect eggs!' 
                : timeOfDay === 'sunset' 
                  ? 'Good Afternoon! Your chickens are active!' 
                  : 'Good Evening! Your chickens are resting.'}
            </motion.h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {chickensQuery.data.map((chicken, index) => (
                <motion.div
                  key={chicken.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ChickenCard 
                    chicken={chicken} 
                    resources={resources} 
                    onHatch={() => hatchMutation.mutate(chicken.id)} 
                  />
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm">
                Resources: {resources.waterBuckets} 🪣 Water, {resources.wheatBags} 🌾 Wheat, {resources.eggs} 🥚 Eggs
              </p>
              <Button asChild className="mt-4">
                <Link href="/shop">Visit Shop</Link>
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}