import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Price, Resource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function MarketPage() {
  const { toast } = useToast();
  const [quantities, setQuantities] = useState({
    water_bucket: 1,
    wheat_bag: 1,
    eggs: 1
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Market</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Water Buckets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                value={quantities.water_bucket}
                onChange={(e) => setQuantities({
                  ...quantities,
                  water_bucket: parseInt(e.target.value) || 1
                })}
              />
              <span className="text-lg font-semibold">
                ₹{getPrice("water_bucket") * quantities.water_bucket}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => buyResourceMutation.mutate({
                itemType: "water_bucket",
                quantity: quantities.water_bucket
              })}
              disabled={buyResourceMutation.isPending}
            >
              Buy Water Buckets
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wheat Bags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                value={quantities.wheat_bag}
                onChange={(e) => setQuantities({
                  ...quantities,
                  wheat_bag: parseInt(e.target.value) || 1
                })}
              />
              <span className="text-lg font-semibold">
                ₹{getPrice("wheat_bag") * quantities.wheat_bag}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => buyResourceMutation.mutate({
                itemType: "wheat_bag",
                quantity: quantities.wheat_bag
              })}
              disabled={buyResourceMutation.isPending}
            >
              Buy Wheat Bags
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
                value={quantities.eggs}
                onChange={(e) => setQuantities({
                  ...quantities,
                  eggs: parseInt(e.target.value) || 1
                })}
              />
              <span className="text-lg font-semibold">
                ₹{getPrice("egg") * quantities.eggs}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => sellEggsMutation.mutate(quantities.eggs)}
              disabled={sellEggsMutation.isPending}
            >
              Sell Eggs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
