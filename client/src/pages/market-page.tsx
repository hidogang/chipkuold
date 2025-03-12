import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Price, Resource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import BalanceBar from "@/components/balance-bar";

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
    <div className="pb-20 md:pb-6">
      <BalanceBar />
      
      <div className="space-y-4 sm:space-y-6 mt-2 sm:mt-4 px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold">Market</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <span className="text-blue-600 mr-2">🪣</span>
                Water Buckets
              </CardTitle>
            </div>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  className="h-8 sm:h-10 text-sm"
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
                <span className="text-base sm:text-lg font-semibold text-blue-600">
                  ${(getPrice("water_bucket") * (quantities.water_bucket || 0)).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full h-8 sm:h-10 text-xs sm:text-sm"
                onClick={() => buyResourceMutation.mutate({
                  itemType: "water_bucket",
                  quantity: quantities.water_bucket || 1
                })}
                disabled={buyResourceMutation.isPending || quantities.water_bucket === 0}
              >
                Buy Water Buckets
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <span className="text-amber-600 mr-2">🌾</span>
                Wheat Bags
              </CardTitle>
            </div>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  className="h-8 sm:h-10 text-sm"
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
                <span className="text-base sm:text-lg font-semibold text-amber-600">
                  ${(getPrice("wheat_bag") * (quantities.wheat_bag || 0)).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full h-8 sm:h-10 text-xs sm:text-sm"
                onClick={() => buyResourceMutation.mutate({
                  itemType: "wheat_bag",
                  quantity: quantities.wheat_bag || 1
                })}
                disabled={buyResourceMutation.isPending || quantities.wheat_bag === 0}
              >
                Buy Wheat Bags
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <span className="text-yellow-600 mr-2">🥚</span>
                Sell Eggs
              </CardTitle>
            </div>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Available: <span className="font-medium">{resourcesQuery.data?.eggs || 0} eggs</span>
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  max={resourcesQuery.data?.eggs || 0}
                  className="h-8 sm:h-10 text-sm"
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
                <span className="text-base sm:text-lg font-semibold text-green-600">
                  ${(getPrice("egg") * (quantities.eggs || 0)).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full h-8 sm:h-10 text-xs sm:text-sm"
                onClick={() => sellEggsMutation.mutate(quantities.eggs || 1)}
                disabled={sellEggsMutation.isPending || quantities.eggs === 0 || (resourcesQuery.data?.eggs || 0) === 0}
              >
                Sell Eggs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}