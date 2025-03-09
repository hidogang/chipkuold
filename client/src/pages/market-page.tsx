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
    <div>
      <BalanceBar />
      
      <div className="space-y-6 mt-4">
        <h1 className="text-2xl font-bold">Market</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Water Buckets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
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
                <span className="text-lg font-semibold">
                  ${(getPrice("water_bucket") * (quantities.water_bucket || 0)).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full"
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Wheat Bags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
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
                <span className="text-lg font-semibold">
                  ${(getPrice("wheat_bag") * (quantities.wheat_bag || 0)).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full"
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sell Eggs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current eggs: {resourcesQuery.data?.eggs || 0}
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  max={resourcesQuery.data?.eggs || 0}
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
                <span className="text-lg font-semibold">
                  ${(getPrice("egg") * (quantities.eggs || 0)).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full"
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